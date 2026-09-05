/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const csv = require('csv-parser');
const fs = require('fs');

const { Client } = require('pg');

// PostgreSQL connection setup
const client = new Client({
  user: 'postgres',
  host: '3.109.16.154',
  // host: 'localhost',
  database: 'c_manager',
  password: '9925913386',
  port: 5432,
});

function handleRowMapping(row) {

  return {
    name: row.name.trim(),
    phone_number: row.phone_number?.replace(/\s+/g, '').trim(),
    type: row.type?.trim(),
    opening_balance: 0,
    black_opening_balance: 0,
    gst_number: row.gst_number?.trim(),
    address: row.address?.trim(),
  };
}

async function handleRowInsertion(dbClient, row) {
  await dbClient.query(
    `
    INSERT INTO parties (company_id, name, phone_number, type, opening_balance, black_opening_balance, gst_number, address)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    ['24a40db5-781a-4dad-ab3e-8c748785c138', row.name, row.phone_number, row.type, row.opening_balance, row.black_opening_balance, row.gst_number, row.address],
  );
}

async function importCSV(filePath) {
  await client.connect();

  let results = [];

  // Read CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      console.log('total rows', results.length);

      results = results.map(handleRowMapping);
      console.log(results.slice(0, 10));

      let ErrorRowCount = 0; let indexCount = 1;
      for (const row of results) {
        try {
          await handleRowInsertion(client, row);
          console.log(`${indexCount} of ${results.length} - ${row.name}`);
          indexCount += 1;
        } catch (err) {
          console.error('Error inserting data:', row.name, ' ', row.phone_number, err.message);
          ErrorRowCount += 1;
        }
      }
      console.log(`Error Row Count: ${ErrorRowCount}`);
      console.log('CSV data imported successfully!');

      await client.end();
    });
}

// Run the function
importCSV('/Users/r.p.raiyani/Downloads/WITHOUT PARTY NAME.xlsx - Sheet1.csv');
