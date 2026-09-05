/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const { Client } = require('pg');

// Load environment variables
require('dotenv').config({
  path: path.join(__dirname, '../.env'),
  override: true,
});

// PostgreSQL connection setup
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'c_manager',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

/**
 * Resolve product_category_id from category_name
 */
async function resolveCategoryId(dbClient, categoryName) {
  if (!categoryName) return null;

  const result = await dbClient.query(
    'SELECT id FROM product_categories WHERE name = $1',
    [categoryName.trim()],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0].id;
}

/**
 * Resolve product_metal_category_id from metal_category_name
 */
async function resolveMetalCategoryId(dbClient, metalCategoryName) {
  if (!metalCategoryName) return null;

  const result = await dbClient.query(
    'SELECT id FROM product_metal_categories WHERE name = $1',
    [metalCategoryName.trim()],
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0].id;
}

/**
 * Find product_id by matching name, finish, size, category_id, and metal_category_id
 * Returns { id: number | null, multipleFound: boolean }
 */
async function findProductId(dbClient, productName, finish, size, categoryId, metalCategoryId) {
  if (!productName) return { id: null, multipleFound: false };

  let query = `
    SELECT id 
    FROM products 
    WHERE name = $1 
      AND COALESCE(finish, '') = COALESCE($2, '')
      AND COALESCE(size, '') = COALESCE($3, '')
  `;
  const params = [
    productName,
    finish || null,
    size || null,
  ];

  let paramIndex = 4;

  if (categoryId) {
    query += ` AND product_category_id = $${paramIndex}`;
    params.push(categoryId);
    paramIndex += 1;
  }

  if (metalCategoryId) {
    query += ` AND product_metal_category_id = $${paramIndex}`;
    params.push(metalCategoryId);
    paramIndex += 1;
  }

  // Remove LIMIT to check for multiple matches
  const result = await dbClient.query(query, params);

  if (result.rowCount === 0) {
    return { id: null, multipleFound: false };
  }

  if (result.rowCount > 1) {
    return { id: null, multipleFound: true };
  }

  return { id: result.rows[0].id, multipleFound: false };
}

/**
 * Find party_id by matching party_name and party_number (phone_number)
 */
async function findPartyId(dbClient, partyName, partyNumber) {
  if (!partyName) return null;

  let query;
  let params;

  if (partyNumber) {
    // Match by both name and phone_number
    query = `
      SELECT id 
      FROM parties 
      WHERE phone_number = $1
      LIMIT 1
    `;
    params = [partyNumber.replace(/\s+/g, '').trim()];
  } else {
    // Match by name only
    query = `
      SELECT id 
      FROM parties 
      WHERE phone_number = $1
      LIMIT 1
    `;
    params = [partyNumber.replace(/\s+/g, '').trim()];
  }

  const result = await dbClient.query(query, params);

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0].id;
}

/**
 * Map CSV row to normalized format
 */
function handleRowMapping(row) {
  return {
    product_name: row.product_name || row.name || row.product?.trim(),
    finish: row.finish?.trim() || null,
    size: row.size?.trim() || null,
    category_name: row.category_name?.trim() || null,
    metal_category_name: row.metal_category_name?.trim() || null,
    party_name: row.party_name || row.supplier_name || row.party?.trim(),
    party_number: row.party_number || row.phone_number || row.supplier_phone?.trim(),
  };
}

/**
 * Insert mapping into supplier_product_mapping table
 */
async function handleRowInsertion(dbClient, row) {

  // Find product_id using name, finish, size, category_id, and metal_category_id
  const productResult = await findProductId(
    dbClient,
    row.product_name,
    row.finish,
    row.size,
  );

  // Skip if multiple products found
  if (productResult.multipleFound) {
    return { skipped: true, reason: 'multiple_products_found', productName: row.product_name };
  }

  // Skip if product not found
  if (!productResult.id) {
    return { skipped: true, reason: 'product_not_found', productName: row.product_name };
  }

  const productId = productResult.id;

  // Find party_id
  const partyId = await findPartyId(dbClient, row.party_name, row.party_number);
  if (!partyId) {
    throw new Error(
      `Party not found: name="${row.party_name}", number="${row.party_number || ''}"`,
    );
  }

  // Check if mapping already exists
  const existingMapping = await dbClient.query(
    'SELECT id FROM supplier_product_mapping WHERE party_id = $1 AND product_id = $2',
    [partyId, productId],
  );

  if (existingMapping.rowCount > 0) {
    console.log(
      `Mapping already exists for party_id=${partyId}, product_id=${productId}. Skipping...`,
    );
    return { skipped: true, reason: 'already_exists', partyId, productId };
  }

  // Insert the mapping
  await dbClient.query(
    `
    INSERT INTO supplier_product_mapping (party_id, product_id)
    VALUES ($1, $2)
    `,
    [partyId, productId],
  );

  return { inserted: true, partyId, productId };
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
      console.log('Total rows:', results.length);

      results = results.map(handleRowMapping);
      console.log('Sample rows:', results.slice(0, 5));

      let errorRowCount = 0;
      let successCount = 0;
      let skippedCount = 0;
      let indexCount = 1;
      const errors = [];
      const allErrors = [];
      const allSkipped = [];

      for (const row of results) {
        try {
          const result = await handleRowInsertion(client, row);
          if (result.skipped) {
            skippedCount += 1;
            let reason = 'ALREADY EXISTS';
            if (result.reason === 'multiple_products_found') {
              reason = 'MULTIPLE PRODUCTS FOUND';
            } else if (result.reason === 'product_not_found') {
              reason = 'PRODUCT NOT FOUND';
            }
            console.log(
              `${indexCount} of ${results.length} - SKIPPED (${reason}): ${row.party_name} -> ${row.product_name}`,
            );
            const skippedMsg = `Row ${indexCount}: SKIPPED (${reason})\n  Party: ${row.party_name}${row.party_number ? ` (${row.party_number})` : ''}\n  Product: ${row.product_name}${row.finish ? ` | Finish: ${row.finish}` : ''}${row.size ? ` | Size: ${row.size}` : ''}\n`;
            allSkipped.push(skippedMsg);
          } else {
            successCount += 1;
            console.log(
              `${indexCount} of ${results.length} - SUCCESS: ${row.party_name} -> ${row.product_name}`,
            );
          }
          indexCount += 1;
        } catch (err) {
          errorRowCount += 1;
          const errorMsg = `Row ${indexCount}: ERROR\n  Party: ${row.party_name}${row.party_number ? ` (${row.party_number})` : ''}\n  Product: ${row.product_name}${row.finish ? ` | Finish: ${row.finish}` : ''}${row.size ? ` | Size: ${row.size}` : ''}\n  Error: ${err.message}\n`;
          console.error('Error inserting data:', errorMsg);
          errors.push(errorMsg);
          allErrors.push(errorMsg);
          indexCount += 1;
        }
      }

      console.log('\n=== Summary ===');
      console.log(`Total rows processed: ${results.length}`);
      console.log(`Successfully inserted: ${successCount}`);
      console.log(`Skipped (already exists): ${skippedCount}`);
      console.log(`Errors: ${errorRowCount}`);

      // Write all errors and skipped records to file
      const reportFilePath = path.join(__dirname, 'insertProductSupplier_report.txt');
      const timestamp = new Date().toISOString();

      let fileContent = '';
      if (allErrors.length > 0 || allSkipped.length > 0) {
        const sections = [
          '='.repeat(80),
          `Product Supplier Import Report - ${timestamp}`,
          '='.repeat(80),
          '',
          `Total rows processed: ${results.length}`,
          `Successfully inserted: ${successCount}`,
          `Skipped: ${skippedCount}`,
          `Errors: ${errorRowCount}`,
          '',
        ];

        if (allSkipped.length > 0) {
          sections.push(
            '='.repeat(80),
            'SKIPPED RECORDS',
            '='.repeat(80),
            '',
            ...allSkipped,
            '',
          );
        }

        if (allErrors.length > 0) {
          sections.push(
            '='.repeat(80),
            'DETAILED ERRORS',
            '='.repeat(80),
            '',
            ...allErrors,
            '',
          );
        }

        sections.push(
          '='.repeat(80),
          'END OF REPORT',
          '='.repeat(80),
        );

        fileContent = sections.join('\n');

        fs.writeFileSync(reportFilePath, fileContent, 'utf8');
        console.log(`\nReport written to: ${reportFilePath}`);
      } else {
        console.log('\nNo errors or skipped records to write to file.');
      }

      if (errors.length > 0) {
        console.log('\n=== Error Details ===');
        errors.forEach((error) => console.error(error));
      }

      await client.end();
    });
}

// Run the function
// Update the file path to your CSV file
importCSV('/Users/utsavbusa/Downloads/product_with_no_supplier_29_12.csv');
