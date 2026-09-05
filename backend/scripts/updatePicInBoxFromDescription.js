/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
require('module-alias/register');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'c_manager',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

/**
 * Extract the number after 'x' from description
 * Format: "boxes x items_per_box" - we want items_per_box
 * Examples: "1x12" -> 12, "5x10" -> 10, "12x24" -> 24, "1X1" -> 1
 * @param {string} description - The description text
 * @returns {number|null} - The extracted number or null if not found
 */
function extractPicInBoxValue(description) {
  if (!description || typeof description !== 'string') {
    return null;
  }

  // Match pattern: number followed by 'x' followed by number (case insensitive)
  // Examples: "1x12" -> 12, "5x10" -> 10, "12x24" -> 24, "1X1" -> 1
  // We want the second number (after 'x')
  const match = description.match(/^\d+[xX](\d+)/);
  if (match && match[1]) {
    const value = parseInt(match[1], 10);
    return Number.isNaN(value) ? null : value;
  }

  return null;
}

/**
 * Main function to update pic_in_box from description
 * @param {string} [productId] - Optional: Process only a specific product
 */
async function updatePicInBoxFromDescription(productId = null) {
  try {
    await client.connect();
    console.log('Connected to database');

    // Build query to get products with description containing 'x' pattern
    // Pattern: number x number (e.g., "1x12", "5x10")
    let query = `
      SELECT id, name, description, pic_in_box
      FROM products
      WHERE description IS NOT NULL
        AND description != ''
        AND description ~* '^\\d+[xX]\\d+'
    `;
    const params = [];
    let paramIndex = 1;

    if (productId) {
      query += ` AND id = $${paramIndex}`;
      params.push(productId);
      paramIndex += 1;
    }

    // Get products
    const products = await client.query(query, params);
    console.log(`\nFound ${products.rows.length} products with description containing 'x' pattern\n`);

    if (products.rows.length === 0) {
      console.log('No products found with description containing "x" pattern');
      await client.end();
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];
    const skipped = [];

    // Process each product sequentially
    for (const product of products.rows) {
      try {
        const extractedValue = extractPicInBoxValue(product.description);

        if (extractedValue === null) {
          skippedCount += 1;
          skipped.push({
            id: product.id,
            name: product.name,
            description: product.description,
            reason: 'Could not extract value from description',
          });
          console.log(
            `⏭️  [${successCount + skippedCount + errorCount + 1}/${products.rows.length}] Skipped: ${product.name} (ID: ${product.id}) - Description: "${product.description}" - Could not extract value`,
          );
          continue;
        }

        // Only update if the value is different
        if (product.pic_in_box === extractedValue) {
          skippedCount += 1;
          skipped.push({
            id: product.id,
            name: product.name,
            description: product.description,
            currentValue: product.pic_in_box,
            reason: 'Value already matches',
          });
          console.log(
            `⏭️  [${successCount + skippedCount + errorCount + 1}/${products.rows.length}] Skipped: ${product.name} (ID: ${product.id}) - pic_in_box already set to ${extractedValue}`,
          );
          continue;
        }

        // Update pic_in_box
        await client.query(
          'UPDATE products SET pic_in_box = $1, updated_at = NOW() WHERE id = $2',
          [extractedValue, product.id],
        );

        successCount += 1;
        console.log(
          `✅ [${successCount + skippedCount + errorCount}/${products.rows.length}] Updated: ${product.name} (ID: ${product.id}) - Description: "${product.description}" -> pic_in_box: ${extractedValue} (was: ${product.pic_in_box})`,
        );
      } catch (err) {
        errorCount += 1;
        const errorMsg = `❌ Error processing product ${product.name} (ID: ${product.id}): ${err.message}`;
        console.error(errorMsg);
        errors.push({
          product: product.name,
          id: product.id,
          description: product.description,
          error: err.message,
        });
      }
    }

    console.log('\n📊 Summary:');
    console.log(`Total products found: ${products.rows.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${errorCount}`);

    if (skipped.length > 0) {
      console.log('\n⏭️  Skipped products:');
      skipped.forEach((s) => {
        console.log(`  - ${s.name} (${s.id}): ${s.reason}`);
        if (s.description) {
          console.log(`    Description: "${s.description}"`);
        }
        if (s.currentValue !== undefined) {
          console.log(`    Current pic_in_box: ${s.currentValue}`);
        }
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((err) => {
        console.log(`  - ${err.product} (${err.id}): ${err.error}`);
        if (err.description) {
          console.log(`    Description: "${err.description}"`);
        }
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
  // Allow command line argument for filtering by product ID
  // Usage: node updatePicInBoxFromDescription.js [productId]
  const args = process.argv.slice(2);
  const productId = args[0] || null;

  if (productId) {
    console.log(`Processing product: ${productId}`);
  } else {
    console.log('Processing all products with description containing "x" pattern');
  }

  updatePicInBoxFromDescription(productId);
}

module.exports = {
  updatePicInBoxFromDescription,
  extractPicInBoxValue,
};
