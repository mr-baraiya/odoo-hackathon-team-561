const csv = require('csv-parser');
const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager',
  password: '7096413386',
  //  password: '123',
  port: 5432,
});

function validateRecordFormat(record) {
  const requiredKeys = ['id', 'opening_balance', 'black_opening_balance'];

  const missingKeys = requiredKeys.filter((key) => !(key in record));
  if (missingKeys.length > 0) {
    console.error(`Missing required keys: ${missingKeys.join(', ')}`);
    process.exit(1);
  }
}

async function updatePartyOpeningBalance(dbClient, data) {
  try {
    await dbClient.query('BEGIN');

    // Get current balance, black_balance, and opening balances from parties table
    const getPartyQuery = `
      SELECT id, opening_balance, balance, black_opening_balance, black_balance FROM parties WHERE id = $1
    `;
    const partyResult = await dbClient.query(getPartyQuery, [data.id]);

    if (partyResult.rows.length === 0) {
      throw new Error(`Party with ID ${data.id} not found`);
    }

    const currentOpeningBalance = parseFloat(partyResult.rows[0].opening_balance) || 0;
    const currentBalance = parseFloat(partyResult.rows[0].balance) || 0;
    const currentBlackOpeningBalance = parseFloat(partyResult.rows[0].black_opening_balance) || 0;
    const currentBlackBalance = parseFloat(partyResult.rows[0].black_balance) || 0;

    console.log(currentOpeningBalance, currentBalance, currentBlackOpeningBalance, currentBlackBalance);

    // Calculate the difference between new opening balance and old opening balance
    // Then adjust the balance accordingly
    const openingBalanceDiff = data.opening_balance - currentOpeningBalance;
    const blackOpeningBalanceDiff = data.black_opening_balance - currentBlackOpeningBalance;

    const finalWhiteBalance = currentBalance + openingBalanceDiff;
    const finalBlackBalance = currentBlackBalance + blackOpeningBalanceDiff;

    const updateQuery = `
      UPDATE parties
      SET
        opening_balance = $1,
        balance = $2,
        black_opening_balance = $3,
        black_balance = $4,
        updated_at = NOW()
      WHERE id = $5
    `;

    await dbClient.query(updateQuery, [
      data.opening_balance,
      finalWhiteBalance,
      data.black_opening_balance,
      finalBlackBalance,
      data.id,
    ]);

    await dbClient.query('COMMIT');
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  }
}

async function importPartyOpeningBalances(filePath) {
  await client.connect();

  let results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {

      validateRecordFormat(results[0]);

      results = results.map((row) => ({
        id: row.id?.trim(),
        opening_balance: parseFloat(row.opening_balance) || 0,
        black_opening_balance: parseFloat(row.black_opening_balance) || 0,
      }));

      let successCount = 0;
      let errorCount = 0;

      console.log(`Total records to process: ${results.length}`);

      // eslint-disable-next-line no-restricted-syntax
      for (const row of results) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await updatePartyOpeningBalance(client, row);
          successCount += 1;
          console.log(`✅ Success ${successCount}/${results.length} - Party ID: ${row.id}`);
        } catch (err) {
          console.error(`❌ Error updating party ID ${row.id}:`, err.message);
          errorCount += 1;
        }
      }

      console.log('\n📊 Summary:');
      console.log(`Total records: ${results.length}`);
      console.log(`Successfully updated: ${successCount}`);
      console.log(`Failed to update: ${errorCount}`);

      await client.end();
    });
}

// Run the function
importPartyOpeningBalances('/Users/harshilvasoya/Documents/supplier_1/V K INDU-Table 1.csv');
