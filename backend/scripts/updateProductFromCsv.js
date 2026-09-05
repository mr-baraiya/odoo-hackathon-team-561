/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const csv = require('csv-parser');
const fs = require('fs');

const { Client } = require('pg');

// PostgreSQL connection setup
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'c_manager',
  password: '9925913386',
  port: 5432,
});

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

      results = results.map((row) => ({
        id: row.id.trim(),
        name: row.name.trim(),
        finish: row.finish?.trim(),
        size: row.size?.trim(),
        purchase_price: Number(row.purchase_price),
        price: Number(row.price),
      }));

      console.log(results.slice(0, 10));

      let errorCount = 0; let indexCount = 1;

      for (const row of results) {
        try {

          await client.query(
            `
              UPDATE products
              SET
                name = $1,
                finish = $2,
                size = $3,
                purchase_price = $4,
                price = $5
              WHERE id = $6
              `,
            [
              row.name,
              row.finish,
              row.size,
              row.purchase_price,
              row.price,
              row.id,
            ],
          );
        } catch (err) {
          errorCount += 1;
          console.error('Error inserting data:', err.message, err.detail);
        }
        console.log(`${indexCount} / ${results.length} - ${row.id}`);
        indexCount += 1;
      }

      console.log(`CSV data imported successfully! ${errorCount} errors`);
      await client.end();

    });
}

// Run the function
importCSV('/Users/r.p.raiyani/Downloads/all_product_table_ALUMINIUM_purchase_price - all_product_table_ALUMINIUM_purchase_price.csv');
