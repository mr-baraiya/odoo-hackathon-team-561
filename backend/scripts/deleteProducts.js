const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

const pool = new Pool({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager',
  password: '7096413386',
  port: 5432,
});

const CSV_FILE_PATH = '/Users/harshilvasoya/Documents/delete_karva_id_1.csv';

function handleRowMapping(row) {
  return {
    id: row.id?.trim(),
  };
}

async function handleRowDeletion(dbClient, row) {
  if (!row.id) throw new Error('Missing product id');

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(row.id)) throw new Error('Invalid UUID');

  // Ensure product exists
  const exists = await dbClient.query('SELECT 1 FROM products WHERE id = $1', [row.id]);
  if (exists.rowCount === 0) throw new Error('Product not found');

  // Cascade deletes (same order as before)
  await dbClient.query('DELETE FROM supplier_product_mapping WHERE product_id = $1', [row.id]);
  await dbClient.query('DELETE FROM transaction_items WHERE product_id = $1', [row.id]);
  await dbClient.query('DELETE FROM inventory_transactions WHERE product_id = $1', [row.id]);
  await dbClient.query('DELETE FROM inventories WHERE product_id = $1', [row.id]);
  await dbClient.query('DELETE FROM barcodes WHERE product_id = $1', [row.id]);
  await dbClient.query('DELETE FROM party_product_prices WHERE product_id = $1', [row.id]);
  await dbClient.query('DELETE FROM order_items WHERE product_id = $1', [row.id]);

  // Finally delete the product
  await dbClient.query('DELETE FROM products WHERE id = $1', [row.id]);
}

async function importCSV(filePath) {
  const client = await pool.connect();
  let results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      console.log('total rows', results.length);

      results = results.map(handleRowMapping).filter((r) => r.id);

      let errorCount = 0; let indexCount = 1;
      for (const row of results) {
        try {
          await handleRowDeletion(client, row);
          console.log(`${indexCount} of ${results.length} - deleted ${row.id}`);
          indexCount += 1;
        } catch (err) {
          console.error('Error deleting product:', row.id, err.message);
          errorCount += 1;
        }
      }
      console.log(`Error Row Count: ${errorCount}`);
      console.log('Deletion completed!');

      client.release();
    });
}

// Run the function
importCSV(CSV_FILE_PATH);
