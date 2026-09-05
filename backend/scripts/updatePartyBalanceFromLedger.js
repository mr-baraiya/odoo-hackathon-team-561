const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

const client = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'c_manager',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Calculate party balance using the same logic as the ledger
 * defined in `src/components/party/account/listPartyTransactions.js`.
 *
 * For a given party and is_black flag:
 *   closing_balance =
 *     (is_black ? black_opening_balance : opening_balance)
 *     + sum(ledger transactions)
 *
 * Where ledger transactions are:
 *   - account_transactions for the party with category = 'party_payment'
 *   - transactions for the party where:
 *       affect_account = true
 *       type IN ('sale', 'purchase', 'sale_return', 'purchase_return', 'stock_send', 'stock_receive', 'fake_sale')
 *     and amounts are signed as:
 *       'in'  => +amount / total
 *       'out' => -amount / total
 */
async function calculateLedgerBalance(dbClient, partyId, isBlack) {
  // Get opening or black opening balance
  const partyRes = await dbClient.query(
    'SELECT opening_balance, black_opening_balance FROM parties WHERE id = $1',
    [partyId],
  );

  if (partyRes.rows.length === 0) {
    throw new Error(`Party with ID ${partyId} not found`);
  }

  const openingBalance = isBlack
    ? parseFloat(partyRes.rows[0].black_opening_balance) || 0
    : parseFloat(partyRes.rows[0].opening_balance) || 0;

  // Sum of transaction totals (matches ledger logic in listPartyTransactions)
  const transactionRes = await dbClient.query(
    `
      SELECT COALESCE(SUM(
        CASE
          WHEN type IN ('sale', 'purchase_return', 'stock_send', 'fake_sale')
            THEN -total
          WHEN type IN ('purchase', 'sale_return', 'stock_receive')
            THEN total
          ELSE 0
        END
      ), 0) AS balance
      FROM transactions
      WHERE party_id = $1
        AND is_black = $2
        AND affect_account = true
        AND type IN ('sale', 'purchase', 'sale_return', 'purchase_return', 'stock_send', 'stock_receive', 'fake_sale')
    `,
    [partyId, isBlack],
  );

  const transactionAmount = parseFloat(transactionRes.rows[0].balance) || 0;

  // Sum of party_payment account transactions (matches ledger logic)
  const paymentsRes = await dbClient.query(
    `
      SELECT COALESCE(SUM(
        CASE
          WHEN type = 'in' THEN amount
          WHEN type = 'out' THEN -amount
          ELSE 0
        END
      ), 0) AS balance
      FROM account_transactions
      WHERE party_id = $1
        AND is_black = $2
        AND category = 'party_payment'
    `,
    [partyId, isBlack],
  );

  const paymentsAmount = parseFloat(paymentsRes.rows[0].balance) || 0;

  // Final ledger-based closing balance
  return openingBalance + transactionAmount + paymentsAmount;
}

/**
 * Update a single party's white & black balances from ledger logic
 */
async function updatePartyBalancesFromLedger(dbClient, partyId) {
  // White (is_black = false)
  const whiteBalance = await calculateLedgerBalance(dbClient, partyId, false);
  // Black (is_black = true)
  const blackBalance = await calculateLedgerBalance(dbClient, partyId, true);

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

  return { whiteBalance, blackBalance };
}

/**
 * Main script:
 *   - Optionally filter by partyId and/or companyId
 *   - For each matching party, recompute balance and black_balance
 *     using the ledger-based calculation above.
 *
 * Usage:
 *   node scripts/updatePartyBalanceFromLedger.js              # all non-company parties
 *   node scripts/updatePartyBalanceFromLedger.js PARTY_ID     # specific party
 *   node scripts/updatePartyBalanceFromLedger.js null COMPANY  # all parties of a company
 *   node scripts/updatePartyBalanceFromLedger.js PARTY COMPANY # specific party + company check
 */
async function run(partyId = null, companyId = null) {
  try {
    await client.connect();
    console.log('Connected to database');

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

    const partiesRes = await client.query(query, params);

    if (partiesRes.rows.length === 0) {
      console.log('No parties found matching the criteria');
      await client.end();
      return;
    }

    console.log(`Found ${partiesRes.rows.length} parties to process\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const party of partiesRes.rows) {
      try {
        const { whiteBalance, blackBalance } = await updatePartyBalancesFromLedger(
          client,
          party.id,
        );

        successCount += 1;
        console.log(
          `✅ [${successCount}/${partiesRes.rows.length}] Updated party: ${party.name} (ID: ${party.id}) - White: ${whiteBalance.toFixed(2)}, Black: ${blackBalance.toFixed(2)}`,
        );
      } catch (err) {
        errorCount += 1;
        const msg = `❌ Error processing party ${party.name} (ID: ${party.id}): ${err.message}`;
        console.error(msg);
        errors.push({ party: party.name, id: party.id, error: err.message });
      }
    }

    console.log('\n📊 Summary:');
    console.log(`Total parties: ${partiesRes.rows.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((e) => {
        console.log(`  - ${e.party} (${e.id}): ${e.error}`);
      });
    }

    await client.end();
    console.log('\n✅ Script completed');
  } catch (err) {
    console.error('Fatal error:', err);
    try {
      await client.end();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

// Run when executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const partyId = args[0] && args[0] !== 'null' ? args[0] : null;
  const companyId = args[1] && args[1] !== 'null' ? args[1] : null;

  if (partyId) {
    console.log(`Processing party: ${partyId}`);
  }
  if (companyId) {
    console.log(`Processing company: ${companyId}`);
  }

  run(partyId, companyId);
}

module.exports = {
  calculateLedgerBalance,
  updatePartyBalancesFromLedger,
  run,
};

