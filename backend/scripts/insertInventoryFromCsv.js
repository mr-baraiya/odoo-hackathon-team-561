/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
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
      console.log(results.slice(0, 10));

      const productMetalCategories = await listProductMetalCategories(client);
      const productCategories = await listProductCategories(client);
      console.log(productMetalCategories);
      console.log(productCategories);

      // validate record formate
      validateRecordFormate(results[0]);

      // validate product metal category and product category and sensitizing data
      results = results.map((row) => {
        if (
          !row.product_metal_category
            || !productMetalCategories.includes(row.product_metal_category.trim())
            || !row.product_category
            || !productCategories.includes(row.product_category.trim())
        ) {
          console.log(`Invalid product metal category: ${row.product_metal_category}`);
          process.exit(1);
        }

        if (Number(row.qty) < 0) {
          console.log(`Invalid quantity: ${row.qty} for product ${row.id}`);
          process.exit(1);
        }

        return {
          id: row.id,
          name: row.name?.trim(),
          qty: Number(row.qty),
          size: row.size?.trim(),
          finish: row.finish?.trim(),
          product_category: row.product_category?.trim(),
          product_metal_category: row.product_metal_category?.trim(),
        };
      });

      const totalResultsCount = results.length;

      results = results.filter((row) => row.qty > 0);

      let errorCount = 0; let insertCount = 1;

      for (const row of results) {

        try {

          if (!row.id) {
            row.id = await insertProduct(client, row);
          }

          await insertInventory(client, row);
          console.log(`${insertCount} of ${results.length} - ${row.name}`);

        } catch (err) {
          console.error('Error inserting data:', err.message, err.detail);
          errorCount += 1;
        }

        insertCount += 1;
      }

      console.log(`Uninserted count: ${errorCount}`);
      console.log(`Total results count: ${totalResultsCount}`);
      console.log('CSV data imported successfully!');
      await client.end();

    });
}

async function listProductMetalCategories(dbClient) {
  const result = await dbClient.query(`
    SELECT name FROM product_metal_categories
  `);

  return result.rows.map((row) => row.name);
}

async function listProductCategories(dbClient) {
  const result = await dbClient.query(`
    SELECT name FROM product_categories
  `);

  return result.rows.map((row) => row.name);
}

function validateRecordFormate(record) {
  const validKeys = ['id', 'name', 'qty', 'size', 'finish', 'product_category', 'product_metal_category'];

  const invalidKeys = Object.keys(record).filter((key) => !validKeys.includes(key));
  if (invalidKeys.length > 0) {
    console.log(`Invalid keys: ${invalidKeys.join(', ')}`);
    process.exit(1);
  }
}

async function insertProduct(dbClient, data) {
  const result = await dbClient.query(
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
    RETURNING id
    `,
    [
      data.name,
      data.product_metal_category,
      data.product_category,
      data.finish,
      data.size,
      '8302',
      '8302',
      0,
      0,
    ],
  );

  return result.rows[0].id;
}

async function insertInventory(dbClient, data) {

  const company_id = data.product_metal_category === 'BATHROOM ACCESSORIES' ? '6dad3753-6a7a-4b38-a21f-11248ea50186' : '24a40db5-781a-4dad-ab3e-8c748785c138';

  try {

    await dbClient.query('BEGIN');

    await dbClient.query(
      `
      INSERT INTO inventory_transactions (type, company_id, product_id, quantity, created_by)
      VALUES ($1, $2, $3, $4, $5)
      `,
      ['in', company_id, data.id, data.qty, 'c57f3785-5269-4fba-8bfc-99060d5b4ae5'],
    );

    await dbClient.query(
      `
        INSERT INTO inventories (company_id, product_id, stock)
        VALUES ($1, $2, $3)
        ON CONFLICT (company_id, product_id) DO UPDATE
        SET stock = inventories.stock + $3
      `,
      [company_id, data.id, data.qty],
    );

    await dbClient.query('COMMIT');
  } catch (err) {
    await dbClient.query('ROLLBACK');
    throw err;
  }

}

// Run the function
importCSV('/Users/r.p.raiyani/Downloads/products_TRIBOLT_ZINC.xlsx - products_TRIBOLT_ZINC.csv');
