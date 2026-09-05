const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: '3.109.16.154',
  database: 'c_manager',
  password: '7096413386',
  port: 5432,
});

// Configuration
const CSV_FILE_PATH = '/Users/harshilvasoya/Documents/rate_dis.csv'; // CSV with metal_cat, Cat, Dis

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
        // Map CSV columns to discount data
        results.push({
          metal_category_name: data.metal_cat || data.metal_category,
          category_name: data.Cat || data.category,
          discount: data.Dis || data.discount,
        });
      })
      .on('end', () => resolve(results))
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

  console.log(`Category not found: ${categoryName}`);
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

  console.log(`Metal category not found: ${metalCategoryName}`);
  return null;
}

async function updateCombineDiscount(client, metalCategoryId, categoryId, discount) {
  try {
    // Update all records matching the metal category and product category
    const result = await client.query(`
      UPDATE party_combine_discount
      SET discount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE product_metal_category_id = $2 AND product_category_id = $3
    `, [discount, metalCategoryId, categoryId]);

    console.log(`Updated ${result.rowCount} records for metal_category_id: ${metalCategoryId}, category_id: ${categoryId}, discount: ${discount}`);
    return { success: true, updatedCount: result.rowCount };
  } catch (error) {
    const errorMsg = `Error updating discount for metal_category_id: ${metalCategoryId}, category_id: ${categoryId}: ${error.message}`;
    fs.appendFileSync('error.txt', `${new Date().toISOString()} | ${errorMsg}\n`);
    console.error(errorMsg);
    return { success: false, error: error.message };
  }
}

async function updateCombinePrice() {
  const client = await pool.connect();

  try {
    console.log('Starting party combine discount update process...');

    // Read and parse CSV file
    const discounts = await parseCsvFile(CSV_FILE_PATH);
    console.log(`Found ${discounts.length} discount records in CSV`);

    if (discounts.length === 0) {
      console.log('No discount records found. Exiting...');
      return;
    }

    // Start transaction
    await client.query('BEGIN');

    try {
      // Process all discounts in parallel
      const results = await Promise.allSettled(
        discounts.map(async (discount) => {
          console.log(`Processing: ${discount.metal_category_name} - ${discount.category_name} - ${discount.discount}`);

          // Get category and metal category IDs
          const categoryId = await getCategoryId(client, discount.category_name);
          const metalCategoryId = await getMetalCategoryId(client, discount.metal_category_name);

          if (!categoryId || !metalCategoryId) {
            const errorMsg = `Category or metal category not found - Category: ${discount.category_name}, Metal Category: ${discount.metal_category_name}`;
            fs.appendFileSync('error.txt', `${new Date().toISOString()} | ${errorMsg}\n`);
            console.log(`Skipping: ${errorMsg}`);
            return { success: false, error: errorMsg };
          }

          const result = await updateCombineDiscount(
            client,
            metalCategoryId,
            categoryId,
            parseFloat(discount.discount),
          );

          return result;
        }),
      );

      // If successful, commit transaction
      await client.query('COMMIT');

      // Process results
      const fulfilled = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
      const rejected = results.filter((r) => r.status === 'rejected');

      // Count successes and failures
      const successCount = fulfilled.filter((result) => result.success).length;
      const errorCount = fulfilled.filter((result) => !result.success).length + rejected.length;
      const totalUpdated = fulfilled.filter((result) => result.success).reduce((sum, result) => sum + result.updatedCount, 0);

      console.log('\n🎉 Party combine discount update completed!');
      console.log(`📊 Total records processed: ${discounts.length}`);
      console.log(`✅ Successful updates: ${successCount}`);
      console.log(`❌ Failed updates: ${errorCount}`);
      console.log(`📈 Total records updated: ${totalUpdated}`);

      if (errorCount > 0) {
        console.log('\nErrors encountered (see error.txt for details):');
        fulfilled.filter((r) => !r.success).forEach((r) => {
          console.log(`- ${r.error}`);
        });
        rejected.forEach((r) => {
          console.log(`- Rejected: ${r.reason?.message || 'Unknown error'}`);
        });
      }

    } catch (error) {
      // Rollback transaction on any error
      await client.query('ROLLBACK');
      console.error('❌ Transaction rolled back due to error:', error.message);

      fs.appendFileSync('error.txt', `${new Date().toISOString()} | Transaction Error: ${error.message}\n`);

      throw error;
    }

  } catch (error) {
    console.error('❌ Critical error during party combine discount update:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await updateCombinePrice();
  } catch (error) {
    const errorMsg = `Script failed: ${error.message}`;
    fs.appendFileSync('error.txt', `${new Date().toISOString()} | ${errorMsg}\n`);
    console.error(errorMsg);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateCombinePrice };
