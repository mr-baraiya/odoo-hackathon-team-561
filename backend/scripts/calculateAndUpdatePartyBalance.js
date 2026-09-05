const { Client } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

function pgSslOption() {
  if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
    return false;
  }
  const mode = (process.env.PGSSLMODE || '').toLowerCase();
  if (['require', 'verify-ca', 'verify-full'].includes(mode)) {
    return { rejectUnauthorized: false };
  }
  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    return { rejectUnauthorized: false };
  }
  const host = process.env.DB_HOST || 'localhost';
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
  if (!isLocal) {
    return { rejectUnauthorized: false };
  }
  return false;
}

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'c_manager',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: pgSslOption(),
});

/**
 * Calculate white balance for a party
 * White balance = opening_balance + transactions (is_black = false) + account_transactions (party_payment, is_black = false)
 */
async function calculateWhiteBalance(dbClient, partyId) {
  // Get opening balance
  const party = await dbClient.query(
    'SELECT opening_balance FROM parties WHERE id = $1',
    [partyId],
  );

  if (party.rows.length === 0) {
    throw new Error(`Party with ID ${partyId} not found`);
  }

  const openingBalance = parseFloat(party.rows[0].opening_balance) || 0;

  // Calculate transaction balance
  // sale, purchase_return, stock_send = -total (out)
  // purchase, sale_return, stock_receive = +total (in)
  const transactionBalance = await dbClient.query(
    `
      SELECT COALESCE(SUM(
        CASE
          WHEN type IN ('sale', 'purchase_return', 'stock_send') THEN -total
          WHEN type IN ('purchase', 'sale_return', 'stock_receive') THEN total
          ELSE 0
        END
      ), 0) as balance
      FROM transactions
      WHERE party_id = $1
        AND affect_account = true
        AND is_black = false
    `,
    [partyId],
  );

  const transactionAmount = parseFloat(transactionBalance.rows[0].balance) || 0;

  // Calculate account_transaction balance (party_payment only)
  // type = 'in' = +amount, type = 'out' = -amount
  const accountTransactionBalance = await dbClient.query(
    `
      SELECT COALESCE(SUM(
        CASE
          WHEN type = 'in' THEN amount
          WHEN type = 'out' THEN -amount
          ELSE 0
        END
      ), 0) as balance
      FROM account_transactions
      WHERE party_id = $1
        AND category = 'party_payment'
        AND is_black = false
    `,
    [partyId],
  );

  const accountTransactionAmount = parseFloat(accountTransactionBalance.rows[0].balance) || 0;

  return openingBalance + transactionAmount + accountTransactionAmount;
}

/**
 * Calculate black balance for a party
 * Black balance = black_opening_balance + transactions (is_black = true) + account_transactions (party_payment, is_black = true)
 */
async function calculateBlackBalance(dbClient, partyId) {
  // Get black opening balance
  const party = await dbClient.query(
    'SELECT black_opening_balance FROM parties WHERE id = $1',
    [partyId],
  );

  if (party.rows.length === 0) {
    throw new Error(`Party with ID ${partyId} not found`);
  }

  const blackOpeningBalance = parseFloat(party.rows[0].black_opening_balance) || 0;

  // Calculate transaction balance
  // sale, purchase_return, stock_send = -total (out)
  // purchase, sale_return, stock_receive = +total (in)
  const transactionBalance = await dbClient.query(
    `
      SELECT COALESCE(SUM(
        CASE
          WHEN type IN ('sale', 'purchase_return', 'stock_send') THEN -total
          WHEN type IN ('purchase', 'sale_return', 'stock_receive') THEN total
          ELSE 0
        END
      ), 0) as balance
      FROM transactions
      WHERE party_id = $1
        AND affect_account = true
        AND is_black = true
    `,
    [partyId],
  );

  const transactionAmount = parseFloat(transactionBalance.rows[0].balance) || 0;

  // Calculate account_transaction balance (party_payment only)
  // type = 'in' = +amount, type = 'out' = -amount
  const accountTransactionBalance = await dbClient.query(
    `
      SELECT COALESCE(SUM(
        CASE
          WHEN type = 'in' THEN amount
          WHEN type = 'out' THEN -amount
          ELSE 0
        END
      ), 0) as balance
      FROM account_transactions
      WHERE party_id = $1
        AND category = 'party_payment'
        AND is_black = true
    `,
    [partyId],
  );

  const accountTransactionAmount = parseFloat(accountTransactionBalance.rows[0].balance) || 0;

  return blackOpeningBalance + transactionAmount + accountTransactionAmount;
}

/**
 * Update party balance
 */
async function updatePartyBalance(dbClient, partyId, whiteBalance, blackBalance) {
  try {
    await dbClient.query('BEGIN');

    await dbClient.query(
      `
        UPDATE parties
        SET
          balance = $1,
          black_balance = $2,
          updated_at = NOW()
        WHERE id = $3
      `,
      [whiteBalance, blackBalance, partyId],
    );

    await dbClient.query('COMMIT');
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  }
}

/**
 * Main function to calculate and update all party balances
 * @param {string} [partyId] - Optional: Process only a specific party
 * @param {string} [companyId] - Optional: Process only parties from a specific company
 */
async function calculateAndUpdateAllPartyBalances(partyId = null, companyId = null) {
  try {
    await client.connect();
    console.log('Connected to database');

    // Build query based on filters
    let query = 'SELECT id, name, company_id FROM parties WHERE type != $1';
    const params = ['company'];
    let paramIndex = 2;

    if (partyId) {
      query += ` AND id = $${paramIndex}`;
      params.push(partyId);
      paramIndex += 1;
    }

    if (companyId) {
      query += ` AND company_id = $${paramIndex}`;
      params.push(companyId);
      paramIndex += 1;
    }

    // Get parties
    const parties = await client.query(query, params);

    if (parties.rows.length === 0) {
      console.log('No parties found matching the criteria');
      await client.end();
      return;
    }

    console.log(`Found ${parties.rows.length} parties to process\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each party
    for (const party of parties.rows) {
      try {
        const whiteBalance = await calculateWhiteBalance(client, party.id);
        const blackBalance = await calculateBlackBalance(client, party.id);

        await updatePartyBalance(client, party.id, whiteBalance, blackBalance);

        successCount += 1;
        console.log(
          `✅ [${successCount}/${parties.rows.length}] Updated party: ${party.name} (ID: ${party.id}) - White: ${whiteBalance.toFixed(2)}, Black: ${blackBalance.toFixed(2)}`,
        );
      } catch (err) {
        errorCount += 1;
        const errorMsg = `❌ Error processing party ${party.name} (ID: ${party.id}): ${err.message}`;
        console.error(errorMsg);
        errors.push({ party: party.name, id: party.id, error: err.message });
      }
    }

    console.log('\n📊 Summary:');
    console.log(`Total parties: ${parties.rows.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((err) => {
        console.log(`  - ${err.party} (${err.id}): ${err.error}`);
      });
    }

    await client.end();
    console.log('\n✅ Script completed');
  } catch (err) {
    console.error('Fatal error:', err);
    await client.end();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  // Allow command line arguments for filtering
  // Usage: node calculateAndUpdatePartyBalance.js [partyId] [companyId]
  const args = process.argv.slice(2);
  const partyId = args[0] || null;
  const companyId = args[1] || null;

  if (partyId) {
    console.log(`Processing party: ${partyId}`);
  }
  if (companyId) {
    console.log(`Processing company: ${companyId}`);
  }
  calculateAndUpdateAllPartyBalances(partyId, companyId);
}

module.exports = {
  calculateWhiteBalance,
  calculateBlackBalance,
  updatePartyBalance,
  calculateAndUpdateAllPartyBalances,
};
