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
const PARTY_CSV_PATH = '/Users/harshilvasoya/Documents/rd_vk_1.csv'; // CSV with party IDs
const DISCOUNT_CSV_PATH = '/Users/harshilvasoya/Documents/rate_dis.csv'; // CSV with metal_cat, cat, dis

async function parsePartyCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`Party CSV file not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Map CSV columns to party IDs - no validation
        results.push({
          party_id: data.party_id || data.id,
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function parseDiscountCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`Discount CSV file not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Map CSV columns to discount data - no validation
        results.push({
          metal_category_name: data.metal_cat || data.metal_category,
          category_name: data.Cat || data.category,
          discount: data.Dis,
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

  // If category not found, create it
  const newCategory = await client.query(
    'INSERT INTO product_categories (name) VALUES ($1) RETURNING id',
    [categoryName],
  );

  console.log(`Created new category: ${categoryName}`);
  return newCategory.rows[0].id;
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

  // If metal category not found, create it
  const newMetalCategory = await client.query(
    'INSERT INTO product_metal_categories (name) VALUES ($1) RETURNING id',
    [metalCategoryName],
  );

  console.log(`Created new metal category: ${metalCategoryName}`);
  return newMetalCategory.rows[0].id;
}

async function insertPartyCombineDiscount(client, partyId, metalCategoryId, categoryId, discount) {
  try {
    // Direct upsert - insert if not exists, update if exists
    await client.query(`
      INSERT INTO party_combine_discount (party_id, product_metal_category_id, product_category_id, discount, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $5)
      ON CONFLICT (party_id, product_metal_category_id, product_category_id)
      DO UPDATE SET
        discount = EXCLUDED.discount,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = EXCLUDED.updated_by
    `, [partyId, metalCategoryId, categoryId, discount, 'c57f3785-5269-4fba-8bfc-99060d5b4ae5']);

    console.log(`Upserted discount for party ${partyId}`);
    return { success: true, action: 'upserted' };
  } catch (error) {
    const errorMsg = `Error upserting discount for party ${partyId}: ${error.message}`;
    fs.appendFileSync('error.txt', `${new Date().toISOString()} | ${errorMsg}\n`);
    console.error(errorMsg);
    return { success: false, error: error.message };
  }
}

async function processPartyDiscounts(client, parties, discounts) {
  // Create all combinations
  const combinations = [];
  parties.forEach((party) => {
    discounts.forEach((discount) => {
      combinations.push({ party, discount });
    });
  });

  console.log(`Processing ${combinations.length} total combinations...`);

  // Process all combinations in parallel
  const results = await Promise.allSettled(
    combinations.map(async ({ party, discount }) => {
      try {
        // Get category and metal category IDs
        const categoryId = await getCategoryId(client, discount.category_name);
        const metalCategoryId = await getMetalCategoryId(client, discount.metal_category_name);

        if (!categoryId || !metalCategoryId) {
          const errorMsg = `Category or metal category not found - Category: ${discount.category_name}, Metal Category: ${discount.metal_category_name}`;
          fs.appendFileSync('error.txt', `${new Date().toISOString()} | Party ${party.party_id} | ${errorMsg}\n`);
          return {
            success: false,
            party_id: party.party_id,
            metal_category: discount.metal_category_name,
            category: discount.category_name,
            discount: discount.discount,
            error: errorMsg,
          };
        }

        const result = await insertPartyCombineDiscount(
          client,
          party.party_id,
          metalCategoryId,
          categoryId,
          parseFloat(discount.discount),
        );

        if (result.success) {
          return { success: true, action: result.action };
        }

        const errorMsg = `Failed to insert/update discount: ${result.error}`;
        fs.appendFileSync('error.txt', `${new Date().toISOString()} | Party ${party.party_id} | ${errorMsg}\n`);

        return {
          success: false,
          party_id: party.party_id,
          metal_category: discount.metal_category_name,
          category: discount.category_name,
          discount: discount.discount,
          error: result.error,
        };
      } catch (error) {
        const errorMsg = `Unexpected error: ${error.message}`;
        fs.appendFileSync('error.txt', `${new Date().toISOString()} | Party ${party.party_id} | ${errorMsg}\n`);
        throw error;
      }
    }),
  );

  const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success);
  const errors = results.filter((r) => r.status === 'fulfilled' && !r.value.success).map((r) => r.value);
  const rejected = results.filter((r) => r.status === 'rejected');

  // Log rejected promises to error file
  rejected.forEach((r) => {
    fs.appendFileSync('error.txt', `${new Date().toISOString()} | Rejected Promise | ${r.reason?.message || 'Unknown error'}\n`);
  });

  return {
    totalProcessed: combinations.length,
    totalSuccess: successful.length,
    totalErrors: errors.length + rejected.length,
    errors: [...errors, ...rejected.map((r) => ({ error: r.reason?.message || 'Unknown error' }))],
  };
}

async function updatePartyCombineDiscounts() {
  const client = await pool.connect();

  try {
    console.log('Starting party combine discount update process...');

    // Read party IDs from first CSV
    const parties = await parsePartyCsv(PARTY_CSV_PATH);
    console.log(`Found ${parties.length} parties in party CSV`);

    // Read discount data from second CSV
    const discounts = await parseDiscountCsv(DISCOUNT_CSV_PATH);
    console.log(`Found ${discounts.length} discount records in discount CSV`);

    // Start transaction
    await client.query('BEGIN');

    try {
      console.log(`Processing ${parties.length} parties × ${discounts.length} discounts = ${parties.length * discounts.length} total combinations`);

      const result = await processPartyDiscounts(client, parties, discounts);

      // If successful, commit transaction
      await client.query('COMMIT');

      console.log('\n🎉 Party combine discount update completed!');
      console.log(`📊 Total combinations processed: ${result.totalProcessed}`);
      console.log(`✅ Successful operations: ${result.totalSuccess}`);
      console.log(`❌ Failed operations: ${result.totalErrors}`);

      if (result.errors.length > 0) {
        console.log('\nErrors encountered:');
        result.errors.slice(0, 10).forEach((error) => {
          console.log(`- Party ${error.party_id}: ${error.metal_category}/${error.category} - ${error.error}`);
        });

        if (result.errors.length > 10) {
          console.log(`... and ${result.errors.length - 10} more errors`);
        }
      }

    } catch (error) {
      // Rollback transaction on any error
      await client.query('ROLLBACK');
      console.error('❌ Transaction rolled back due to error:', error.message);

      fs.appendFileSync('error.txt', `${new Date().toISOString()} | Party Combine Discount Error: ${error.message}\n`);

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
    await updatePartyCombineDiscounts();
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

module.exports = { updatePartyCombineDiscounts };
