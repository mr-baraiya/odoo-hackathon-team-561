const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager',
  password: '709641231013386',
  port: 5432,
});

// Configuration
const CSV_FILE_PATH = '/Users/harshilvasoya/Documents/DISCOUNT_FILE_1.csv'; // Update this path to your CSV file
const CREATED_BY = 'c57f3785-5269-4fba-8bfc-99060d5b4ae5';

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
        // Log raw data to see what we're getting
        console.log('Raw CSV row data:', JSON.stringify(data, null, 2));
        console.log('Available keys:', Object.keys(data));

        // Map CSV columns to our expected format (try multiple variations)
        const rowData = {
          Category: (data.Category || data.category || data.CATEGORY || '').toString().trim(),
          metal_category: (data.metal_category || data.Metal_Category || data.Metal_Category || data.METAL_CATEGORY || data['Metal Category'] || '').toString().trim(),
          Discount: (data.Discount || data.discount || data.DISCOUNT || '').toString().trim(),
        };

        console.log('Parsed row data:', JSON.stringify(rowData, null, 2));
        console.log('---');

        results.push(rowData);
      })
      .on('end', () => {
        console.log(`\nTotal rows parsed: ${results.length}`);
        console.log('First row sample:', JSON.stringify(results[0] || {}, null, 2));
        resolve(results);
      })
      .on('error', reject);
  });
}

async function getCategoryId(client, categoryName) {
  if (!categoryName) return null;

  const result = await client.query(
    'SELECT id FROM product_categories WHERE name = $1',
    [categoryName],
  );

  if (result.rowCount > 0) {
    return result.rows[0].id;
  }

  return null;
}

async function getMetalCategoryId(client, metalCategoryName) {
  if (!metalCategoryName) return null;

  const result = await client.query(
    'SELECT id FROM product_metal_categories WHERE name = $1',
    [metalCategoryName],
  );

  if (result.rowCount > 0) {
    return result.rows[0].id;
  }

  return null;
}

async function checkDiscountExists(client, partyId, productMetalCategoryId, productCategoryId) {
  const result = await client.query(
    `SELECT id FROM party_combine_discount
     WHERE party_id = $1
       AND product_metal_category_id = $2
       AND product_category_id = $3`,
    [partyId, productMetalCategoryId, productCategoryId],
  );

  return result.rowCount > 0;
}

async function insertPartyCombineDiscount(client, partyId, productMetalCategoryId, productCategoryId, discount) {
  try {
    const result = await client.query(
      `INSERT INTO party_combine_discount
       (party_id, product_metal_category_id, product_category_id, discount, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $5)
       ON CONFLICT (party_id, product_metal_category_id, product_category_id) DO NOTHING`,
      [partyId, productMetalCategoryId, productCategoryId, parseFloat(discount), CREATED_BY],
    );

    // If rowCount is 0, it means the record already existed and was skipped
    if (result.rowCount === 0) {
      return { success: false, skipped: true };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getAllParties(client) {
  const result = await client.query(
    'SELECT id, name FROM parties ',
  );

  return result.rows;
}

async function validateDiscountData(discountRow) {
  const errors = [];

  console.log('Validating row data:', JSON.stringify(discountRow, null, 2));

  if (!discountRow.Category || discountRow.Category.trim() === '') {
    errors.push('Category is required');
  }

  if (!discountRow.metal_category || discountRow.metal_category.trim() === '') {
    errors.push('Metal category is required');
  }

  if (!discountRow.Discount || discountRow.Discount.trim() === '') {
    errors.push('Discount is required');
  } else if (Number.isNaN(parseFloat(discountRow.Discount))) {
    errors.push('Discount must be a valid number');
  } else {
    const discountValue = parseFloat(discountRow.Discount);
    if (discountValue < 0 || discountValue > 100) {
      errors.push('Discount must be between 0 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function writeErrorsToFile(errors, validationErrors = []) {
  const timestamp = new Date().toISOString();
  const errorContent = [
    `=== DISCOUNT INSERTION ERRORS - ${timestamp} ===`,
    `Total insertion errors: ${errors.length}`,
    `Total validation errors: ${validationErrors.length}`,
    '',
  ];

  if (validationErrors.length > 0) {
    errorContent.push('=== VALIDATION ERRORS ===');
    errorContent.push('');
    validationErrors.forEach((error) => {
      errorContent.push(`Row ${error.row}: ${error.errors.join(', ')}`);
    });
    errorContent.push('');
  }

  if (errors.length > 0) {
    errorContent.push('=== INSERTION ERRORS ===');
    errorContent.push('');
    errors.forEach((error) => {
      errorContent.push(`Party: ${error.party_name} (${error.party_id})`);
      errorContent.push(`Category: ${error.category}, Metal Category: ${error.metal_category}, Discount: ${error.discount}`);
      errorContent.push(`Error: ${error.error}`);
      errorContent.push('');
    });
  }

  const finalContent = errorContent.join('\n');

  fs.writeFileSync('insertdiscouontforparties.txt', finalContent);
  console.log('All errors written to insertdiscouontforparties.txt');
}

async function insertDiscountsForParties() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Starting discount insertion process from CSV...');

    // Parse CSV file
    const discountRows = await parseCsvFile(CSV_FILE_PATH);
    console.log(`Found ${discountRows.length} discount rows in CSV`);

    // Validate CSV data
    const validatedDiscounts = [];
    const validationErrors = [];

    for (let i = 0; i < discountRows.length; i += 1) {
      const discountRow = discountRows[i];
      const rowNumber = i + 1;

      // eslint-disable-next-line no-await-in-loop
      const validationResult = await validateDiscountData(discountRow);

      if (validationResult.isValid) {
        validatedDiscounts.push(discountRow);
        console.log(`✅ Validated row ${rowNumber}/${discountRows.length}`);
      } else {
        validationErrors.push({
          row: rowNumber,
          errors: validationResult.errors,
        });
        console.log(`❌ Validation failed row ${rowNumber}: ${validationResult.errors.join(', ')}`);
      }
    }

    if (validationErrors.length > 0) {
      console.log(`\n❌ Found ${validationErrors.length} validation errors.`);

      if (validatedDiscounts.length === 0) {
        console.log('No valid discounts to insert. Writing errors and rolling back...');
        writeErrorsToFile([], validationErrors);
        await client.query('ROLLBACK');
        return;
      }
    }

    // Get all parties
    const parties = await getAllParties(client);
    console.log(`\nFound ${parties.length} parties`);

    if (parties.length === 0) {
      console.log('No parties found. Rolling back...');
      await client.query('ROLLBACK');
      return;
    }

    console.log(`\n📦 Processing ${validatedDiscounts.length} discounts for ${parties.length} parties...`);
    console.log(`Total combinations: ${validatedDiscounts.length * parties.length}`);

    let successCount = 0;
    let skippedCount = 0;
    const insertionErrors = [];

    // Process each party and discount combination
    // eslint-disable-next-line no-restricted-syntax
    for (const party of parties) {
      // eslint-disable-next-line no-restricted-syntax
      for (const discountRow of validatedDiscounts) {
        try {
          // Get category and metal category IDs
          // eslint-disable-next-line no-await-in-loop
          const categoryId = await getCategoryId(client, discountRow.Category);
          // eslint-disable-next-line no-await-in-loop
          const metalCategoryId = await getMetalCategoryId(client, discountRow.metal_category);

          if (!categoryId) {
            insertionErrors.push({
              party_id: party.id,
              party_name: party.name,
              category: discountRow.Category,
              metal_category: discountRow.metal_category,
              discount: discountRow.Discount,
              error: `Category '${discountRow.Category}' not found`,
            });
            console.log(`❌ Category not found: ${discountRow.Category} for party ${party.name}`);
          } else if (!metalCategoryId) {
            insertionErrors.push({
              party_id: party.id,
              party_name: party.name,
              category: discountRow.Category,
              metal_category: discountRow.metal_category,
              discount: discountRow.Discount,
              error: `Metal category '${discountRow.metal_category}' not found`,
            });
            console.log(`❌ Metal category not found: ${discountRow.metal_category} for party ${party.name}`);
          } else {
            // Check if combination already exists (based on unique constraint: party_id, product_metal_category_id, product_category_id)
            // eslint-disable-next-line no-await-in-loop
            const exists = await checkDiscountExists(
              client,
              party.id,
              metalCategoryId,
              categoryId,
            );

            if (exists) {
              skippedCount += 1;
              console.log(`⏭️  Skipped (already exists): Party ${party.name}, Category: ${discountRow.Category}, Metal: ${discountRow.metal_category}, Discount: ${discountRow.Discount}`);
            } else {
              // Insert the discount
              // eslint-disable-next-line no-await-in-loop
              const result = await insertPartyCombineDiscount(
                client,
                party.id,
                metalCategoryId,
                categoryId,
                discountRow.Discount,
              );

              if (result.success) {
                successCount += 1;
                console.log(`✅ Inserted: Party ${party.name}, Category: ${discountRow.Category}, Metal: ${discountRow.metal_category}, Discount: ${discountRow.Discount}`);
              } else if (result.skipped) {
                // Record already existed (race condition or check missed it)
                skippedCount += 1;
                console.log(`⏭️  Skipped (already exists): Party ${party.name}, Category: ${discountRow.Category}, Metal: ${discountRow.metal_category}, Discount: ${discountRow.Discount}`);
              } else {
                insertionErrors.push({
                  party_id: party.id,
                  party_name: party.name,
                  category: discountRow.Category,
                  metal_category: discountRow.metal_category,
                  discount: discountRow.Discount,
                  error: result.error,
                });
                console.log(`❌ Failed to insert: Party ${party.name} - ${result.error}`);
              }
            }
          }
        } catch (error) {
          insertionErrors.push({
            party_id: party.id,
            party_name: party.name,
            category: discountRow.Category,
            metal_category: discountRow.metal_category,
            discount: discountRow.Discount,
            error: error.message,
          });
          console.log(`❌ Error processing: Party ${party.name} - ${error.message}`);
        }
      }
    }

    if (insertionErrors.length > 0 || validationErrors.length > 0) {
      console.log(`\n❌ Found ${insertionErrors.length} insertion errors and ${validationErrors.length} validation errors. Writing to error file...`);
      writeErrorsToFile(insertionErrors, validationErrors);
    }

    await client.query('COMMIT');

    console.log('\n🎉 Processing completed!');
    console.log(`✅ Successfully inserted: ${successCount} discounts`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount} discounts`);
    console.log(`❌ Validation errors: ${validationErrors.length}`);
    console.log(`❌ Insertion errors: ${insertionErrors.length}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Critical error during insertion process:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await insertDiscountsForParties();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { insertDiscountsForParties };
