/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require('module-alias/register');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

const transactionService = require('../src/components/transaction/transaction.service');

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'c_manager',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

/**
 * Create a database adapter that wraps pg Client to work with service functions
 * This adapter provides the same interface as the database service
 */
function createDbAdapter(pgClient) {
  return {
    queryOne: async (sql, params) => {
      const result = await pgClient.query(sql, params);
      return result.rows[0];
    },
    queryAll: async (sql, params) => {
      const result = await pgClient.query(sql, params);
      return result.rows;
    },
    query: (sql, params) => pgClient.query(sql, params),
  };
}

/**
 * Main function to calculate and update all party due_day balances
 * @param {string} [partyId] - Optional: Process only a specific party
 * @param {string} [companyId] - Optional: Process only parties from a specific company
 */
async function calculateAndUpdateAllDueDayBalances(partyId = null, companyId = null) {
  try {
    await client.connect();
    console.log('Connected to database');

    // Build query to get parties with due_limit_days set
    let query = `
      SELECT id, name, company_id, due_limit_days
      FROM parties
      WHERE type = 'customer'
        AND due_limit_days IS NOT NULL
        AND due_limit_days > 0
    `;
    const params = [];
    let paramIndex = 1;

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
    console.log(query, params);
    // Get parties
    const parties = await client.query(query, params);
    console.log(parties.rows);

    if (parties.rows.length === 0) {
      console.log('No parties found with due_limit_days set');
      await client.end();
      return;
    }

    console.log(`Found ${parties.rows.length} parties to process\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Create database adapter for service functions
    const db = createDbAdapter(client);

    // Process each party sequentially to track progress correctly
    for (const party of parties.rows) {
      try {
        // Use the transaction service to calculate and update due_day balances
        await transactionService.updateDueDayBalances(db, party.id);

        // Get updated balances for logging
        const updatedParty = await client.query(
          'SELECT due_day_white_balance, due_day_black_balance FROM parties WHERE id = $1',
          [party.id],
        );

        const whiteBalance = parseFloat(updatedParty.rows[0]?.due_day_white_balance) || 0;
        const blackBalance = parseFloat(updatedParty.rows[0]?.due_day_black_balance) || 0;

        successCount += 1;
        console.log(
          `✅ [${successCount}/${parties.rows.length}] Updated party: ${party.name} (ID: ${party.id}) - Due Days: ${party.due_limit_days}, White: ${whiteBalance.toFixed(2)}, Black: ${blackBalance.toFixed(2)}`,
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
  // Usage: node calculateAndUpdateDueDayBalances.js [partyId] [companyId]
  const args = process.argv.slice(2);
  const partyId = args[0] || null;
  const companyId = args[1] || null;

  if (partyId) {
    console.log(`Processing party: ${partyId}`);
  }
  if (companyId) {
    console.log(`Processing company: ${companyId}`);
  }
  calculateAndUpdateAllDueDayBalances(partyId, companyId);
}

module.exports = {
  calculateAndUpdateAllDueDayBalances,
};
