const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Database connection configuration (keep in sync with deleteProducts.js as needed)
const pool = new Pool({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager',
  password: 'passowrd',
  port: 5432,
});

// Configuration
const CSV_FILE_PATH = '/Users/harshilvasoya/Downloads/DELETE_2.csv'; // Update this path to your CSV file
const ERROR_LOG_PATH = path.resolve(__dirname, '../..', 'error.txt');

async function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`CSV file not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.id && data.id.trim() !== '' && data.id.trim().length > 0) {
          results.push({ id: data.id.trim() });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function filterExistingProducts(client, products) {
  const validProducts = products.filter((p) => p.id && p.id.trim() !== '' && p.id.trim().length > 0);
  if (validProducts.length === 0) {
    console.log('No valid product IDs found in CSV');
    return [];
  }

  const productIds = validProducts.map((p) => p.id);

  // Validate UUID format before querying database
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validUuids = productIds.filter((id) => uuidRegex.test(id));

  if (validUuids.length === 0) {
    console.log('No valid UUIDs found in CSV');
    return [];
  }

  const placeholders = validUuids.map((_, index) => `$${index + 1}`).join(',');
  const result = await client.query(`
    SELECT id FROM products WHERE id IN (${placeholders})
  `, validUuids);

  const existingIds = new Set(result.rows.map((row) => row.id));
  return validProducts.filter((product) => existingIds.has(product.id));
}

function logError(productId, message) {
  const line = `${new Date().toISOString()} | product:${productId} | ${message}\n`;
  try {
    fs.appendFileSync(ERROR_LOG_PATH, line);
  } catch (e) {
    // best-effort logging
    console.error('Failed to write to error.txt:', e.message);
  }
}

async function hardDeleteProduct(productId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete child/related rows first to satisfy FK constraints
    await client.query('DELETE FROM inventory_transactions WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM inventories WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM barcodes WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM party_product_prices WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM order_items WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM transaction_items WHERE product_id = $1', [productId]);

    // Finally delete product
    const productResult = await client.query(
      'DELETE FROM products WHERE id = $1 RETURNING id, name',
      [productId],
    );

    if (productResult.rowCount === 0) {
      throw new Error('Product not found when deleting');
    }

    await client.query('COMMIT');
    return { success: true, id: productId, name: productResult.rows[0].name };
  } catch (error) {
    await client.query('ROLLBACK');
    logError(productId, error.message);
    return { success: false, id: productId, error: error.message };
  } finally {
    client.release();
  }
}

async function main() {
  let client;
  try {
    console.log('Starting HARD DELETE from CSV...');

    client = await pool.connect();

    const products = await parseCsvFile(CSV_FILE_PATH);
    console.log(`Found ${products.length} products in CSV`);

    const existingProducts = await filterExistingProducts(client, products);
    console.log(`${existingProducts.length} products exist in database and will be processed`);

    if (existingProducts.length === 0) {
      console.log('No existing products found. Exiting...');
      return;
    }

    // Run per-product transactions in parallel (separate DB client per product inside hardDeleteProduct)
    const results = await Promise.allSettled(
      existingProducts.map((p) => hardDeleteProduct(p.id)),
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    const successes = fulfilled.filter((r) => r.success);
    const failures = fulfilled.filter((r) => !r.success);
    const rejected = results.filter((r) => r.status === 'rejected');

    // Log any unexpected rejections (should be rare)
    rejected.forEach((r, idx) => logError(existingProducts[idx]?.id || 'unknown', r.reason?.message || 'Unknown rejection'));

    console.log('\n===== HARD DELETE Summary =====');
    console.log(`Total in CSV: ${products.length}`);
    console.log(`Existing in DB: ${existingProducts.length}`);
    console.log(`Deleted successfully: ${successes.length}`);
    console.log(`Failed (rolled back): ${failures.length + rejected.length}`);

    if (failures.length > 0) {
      console.log('\nExamples of failed deletions (see error.txt for details):');
      failures.slice(0, 10).forEach((r) => console.log(`- ${r.id}: ${r.error}`));
    }

    if (successes.length > 0) {
      console.log('\nExamples of successful deletions:');
      successes.slice(0, 10).forEach((r) => console.log(`- ${r.id}: ${r.name || ''}`));
    }
  } catch (error) {
    console.error('❌ Critical error:', error.message);
    throw error;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  });
}

module.exports = { hardDeleteProduct, parseCsvFile, filterExistingProducts };
