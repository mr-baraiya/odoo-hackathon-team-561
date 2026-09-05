/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const csv = require('csv-parser');
const fs = require('fs');

const { Client } = require('pg');

// PostgreSQL connection setup
const client = new Client({
  user: 'postgres',
  host: '3.109.16.154',
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
        ...row,
        purchase_price: Number(row.purchase_price),
        price: Number(row.price),
        hsn_code: row.hsn_code.trim(),
        category: row.category.trim(),
        metal_category: row.metal_category.trim(),
      }));

      try {

        console.log(results[0]);

        for (const row of results) {
          try {

            await client.query(
              `
              INSERT INTO products
                (name, product_metal_category_id, product_category_id, finish, size, hsn_code, gst_rate_id, purchase_price, price)
              VALUES
                ($1,
                (select id from product_metal_categories where name = $2),
                (select id from product_categories where name = $3),
                $4,
                $5,
                $6,
                (select id from gst_rates where hsn_code = $7),
                $8,
                $9
              )
              `,
              [
                row.name,
                row.metal_category,
                row.category,
                row.finish,
                row.size,
                row.hsn_code,
                row.hsn_code,
                row.purchase_price,
                row.price,
              ],
            );
          } catch (err) {
            console.error('Error inserting data:', err.message, err.detail);
          }
          console.log(row.name);
        }

        console.log('CSV data imported successfully!');
      } catch (err) {
        console.error('Error inserting data:', err);
      } finally {
        await client.end();
      }

    });
}

// Run the function
importCSV('/Users/r.p.raiyani/Downloads/combain - zinc.csv');
