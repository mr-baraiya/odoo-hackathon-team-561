const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: '3.109.16.154',
  // host: 'localhost',
  database: 'c_manager',
  password: '99999999',
  // password: '123',
  port: 5432,
});

// Configuration
const COMPANY_ID = '6dad3753-6a7a-4b38-a21f-11248ea50186';
const CSV_FILE_PATH = '/Users/harshilvasoya/Documents/book_1_17.csv'; // Update this path to your CSV file

// UUID validation function
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

async function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let rowNumber = 1; // Start from row 1 (header is row 0)

    if (!fs.existsSync(filePath)) {
      reject(new Error(`CSV file not found: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Validate UUID first
        if (!data.id || !isValidUUID(data.id)) {
          errors.push(`Row ${rowNumber}: Invalid or missing UUID: ${data.id}`);
          rowNumber += 1;
          return;
        }

        // Map CSV columns to our expected format
        results.push({
          id: data.id,
          name: data.name,
          finish: data.finish,
          size: data.size,
          purchase_price: data.purchase_price,
          price: data.price,
          category_name: data.category_name,
          metal_category_name: data.metal_category,
          supplier_contact: data.suplier_contact,
          supplier_name: data.suplier_name,
          hsn_code: data.HSN,
          qty: data.QTY,
          box_qty: data['BOX QTY'],
        });

        rowNumber += 1;
      })
      .on('end', () => {
        if (errors.length > 0) {
          reject(new Error(`CSV validation errors:\n${errors.join('\n')}`));
          return;
        }
        resolve(results);
      })
      .on('error', reject);
  });
}

async function validateCategories(client, products) {
  const categoryNames = [...new Set(products.map((p) => p.category_name).filter((name) => name && name.trim() !== ''))];
  const metalCategoryNames = [...new Set(products.map((p) => p.metal_category_name).filter((name) => name && name.trim() !== ''))];
  const hsnCodes = [...new Set(products.map((p) => p.hsn_code).filter((code) => code && code.trim() !== ''))];

  const errors = [];

  // Validate product categories
  if (categoryNames.length > 0) {
    const placeholders = categoryNames.map((_, index) => `$${index + 1}`).join(',');
    const result = await client.query(`
      SELECT name FROM product_categories WHERE name IN (${placeholders})
    `, categoryNames);

    const existingCategories = new Set(result.rows.map((row) => row.name));
    const missingCategories = categoryNames.filter((name) => !existingCategories.has(name));

    if (missingCategories.length > 0) {
      errors.push(`Missing product categories: ${missingCategories.join(', ')}`);
    }
  }

  // Validate metal categories
  if (metalCategoryNames.length > 0) {
    const placeholders = metalCategoryNames.map((_, index) => `$${index + 1}`).join(',');
    const result = await client.query(`
      SELECT name FROM product_metal_categories WHERE name IN (${placeholders})
    `, metalCategoryNames);

    const existingMetalCategories = new Set(result.rows.map((row) => row.name));
    const missingMetalCategories = metalCategoryNames.filter((name) => !existingMetalCategories.has(name));

    if (missingMetalCategories.length > 0) {
      errors.push(`Missing metal categories: ${missingMetalCategories.join(', ')}`);
    }
  }

  // Handle HSN codes - create missing ones automatically
  if (hsnCodes.length > 0) {
    const placeholders = hsnCodes.map((_, index) => `$${index + 1}`).join(',');
    const result = await client.query(`
      SELECT hsn_code FROM gst_rates WHERE hsn_code IN (${placeholders})
    `, hsnCodes);

    const existingHsnCodes = new Set(result.rows.map((row) => row.hsn_code));
    const missingHsnCodes = hsnCodes.filter((code) => !existingHsnCodes.has(code));

    if (missingHsnCodes.length > 0) {
      console.log(`Creating ${missingHsnCodes.length} new HSN codes in gst_rates table...`);

      // Create missing HSN codes
      const createHsnResults = await Promise.allSettled(
        missingHsnCodes.map(async (hsnCode) => {
          try {
            await client.query(`
              INSERT INTO gst_rates (title, type, hsn_code, rate, description)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              `${hsnCode} GST 18%`, // title = hsn_code + " GST 18%"
              'goods', // type = "goods"
              hsnCode, // hsn_code = hsn_code
              18.00, // rate = 18%
              `Auto-generated GST rate for ${hsnCode}`, // description
            ]);

            console.log(`✅ Created new HSN code: ${hsnCode}`);
            return { success: true, hsnCode };
          } catch (error) {
            console.error(`❌ Failed to create HSN code ${hsnCode}: ${error.message}`);
            return { success: false, hsnCode, error: error.message };
          }
        }),
      );

      const failedHsnCodes = createHsnResults
        .filter((createResult) => createResult.status === 'rejected' || (createResult.status === 'fulfilled' && !createResult.value.success))
        .map((createResult) => (createResult.status === 'rejected' ? createResult.reason : createResult.value.error));

      if (failedHsnCodes.length > 0) {
        errors.push(`Failed to create HSN codes: ${failedHsnCodes.join(', ')}`);
      } else {
        console.log(`✅ Successfully created ${missingHsnCodes.length} new HSN codes`);
      }
    } else {
      console.log('✅ All HSN codes already exist in gst_rates table');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.join('\n')}`);
  }
}

async function filterExistingProducts(client, products) {
  const productIds = products.map((p) => p.id);
  console.log('productIds', productIds);
  const placeholders = productIds.map((_, index) => `$${index + 1}`).join(',');

  const result = await client.query(`
    SELECT id FROM products WHERE id IN (${placeholders})
  `, productIds);

  const existingIds = new Set(result.rows.map((row) => row.id));
  return products.filter((product) => existingIds.has(product.id));
}

async function handleProductCategory(client, categoryName) {
  console.log('categoryName', categoryName);
  if (!categoryName) return null;

  // Check if category exists
  let result = await client.query(
    'SELECT id , name FROM product_categories WHERE name = $1',
    [categoryName],
  );

  if (result.rowCount > 0) {
    return result.rows[0].id;
  }

  // Create new category
  result = await client.query(
    'INSERT INTO product_categories (name) VALUES ($1) RETURNING id',
    [categoryName],
  );

  console.log(`Created new product category: ${categoryName}`);
  return result.rows[0].id;
}

async function handleProductMetalCategory(client, metalCategoryName) {
  console.log('metalCategoryName', metalCategoryName);
  if (!metalCategoryName) return null;

  // Check if metal category exists
  let result = await client.query(
    'SELECT id FROM product_metal_categories WHERE name = $1',
    [metalCategoryName],
  );

  if (result.rowCount > 0) {
    return result.rows[0].id;
  }

  result = await client.query(
    'INSERT INTO product_metal_categories (name) VALUES ($1) RETURNING id',
    [metalCategoryName],
  );

  console.log(`Created new product metal category: ${metalCategoryName}`);
  return result.rows[0].id;
}

async function updateProduct(client, product, categoryId, metalCategoryId) {
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  // Build dynamic update query
  if (product.name) {
    updateFields.push(`name = $${paramIndex}`);
    values.push(product.name);
    paramIndex += 1;
  }

  if (product.size) {
    updateFields.push(`size = $${paramIndex}`);
    values.push(product.size);
    paramIndex += 1;
  }

  if (product.finish) {
    updateFields.push(`finish = $${paramIndex}`);
    values.push(product.finish);
    paramIndex += 1;
  }

  if (product.hsn_code) {
    updateFields.push(`hsn_code = $${paramIndex}`);
    values.push(product.hsn_code);
    paramIndex += 1;
  }

  if (categoryId) {
    updateFields.push(`product_category_id = $${paramIndex}`);
    values.push(categoryId);
    paramIndex += 1;
  }

  if (metalCategoryId) {
    updateFields.push(`product_metal_category_id = $${paramIndex}`);
    values.push(metalCategoryId);
    paramIndex += 1;
  }

  if (product.purchase_price) {
    updateFields.push(`purchase_price = $${paramIndex}`);
    values.push(parseFloat(product.purchase_price));
    paramIndex += 1;
  }

  if (product.price) {
    updateFields.push(`price = $${paramIndex}`);
    values.push(parseFloat(product.price));
    paramIndex += 1;
  }

  if (product.box_qty) {
    updateFields.push(`description = $${paramIndex}`);
    values.push((product.box_qty));
    paramIndex += 1;
  }

  // Find and update gst_rate_id based on HSN code
  if (product.hsn_code) {
    const gstRateResult = await client.query(
      'SELECT id FROM gst_rates WHERE hsn_code = $1',
      [product.hsn_code],
    );

    if (gstRateResult.rowCount > 0) {
      updateFields.push(`gst_rate_id = $${paramIndex}`);
      values.push(gstRateResult.rows[0].id);
      paramIndex += 1;
      console.log(`Found GST rate ID: ${gstRateResult.rows[0].id} for HSN code: ${product.hsn_code}`);
    } else {
      console.log(`Warning: No GST rate found for HSN code: ${product.hsn_code}`);
    }
  }

  // Add updated_at
  updateFields.push('updated_at = CURRENT_TIMESTAMP');

  if (updateFields.length === 0) {
    console.log('No fields to update for product');
    return;
  }

  values.push(product.id);

  const query = `
    UPDATE products
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
  `;

  await client.query(query, values);
  console.log(`Updated product fields: ${updateFields.join(', ')}`);
}

async function handleSupplierParty(client, product) {
  // Check if party exists
  const result = await client.query(
    'SELECT id FROM parties WHERE company_id = $1 AND name = $2  ;',
    [COMPANY_ID, product.supplier_name],
  );

  let partyId;

  if (result.rowCount > 0) {
    partyId = result.rows[0].id;
    console.log(`Found existing supplier party: ${product.supplier_name}`);
  }

  if (product.purchase_price && partyId) {
    await client.query(`
      INSERT INTO party_product_prices (party_id, product_id, price, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $4)
      ON CONFLICT (party_id, product_id) DO UPDATE
      SET price = EXCLUDED.price, updated_at = CURRENT_TIMESTAMP
    `, [partyId, product.id, parseFloat(product.purchase_price), 'c57f3785-5269-4fba-8bfc-99060d5b4ae5']);

    console.log(`Updated party product price for supplier: ${product.supplier_name}`);
  }
}

async function handleInventoryUpdate(client, product) {
  const quantity = parseFloat(product.qty);
  if (quantity <= 0) return;

  // Update existing inventory
  const currentStock = parseFloat(product.qty) || 0;
  const newStock = currentStock + quantity;

  await client.query(`
      UPDATE inventories SET stock = $1 WHERE company_id = $2 AND inventories.product_id = $3
    `, [currentStock, COMPANY_ID, product.id]);

  console.log(`Updated inventory stock from ${currentStock} to ${newStock}`);

  await client.query(`
    INSERT INTO inventory_transactions (company_id, product_id, type, quantity, created_by, remark)
    VALUES ($1, $2, 'in', $3, $4, $5)
  `, [COMPANY_ID, product.id, quantity, 'c57f3785-5269-4fba-8bfc-99060d5b4ae5', 'Stock update from CSV import']);

  console.log(`Created inventory transaction for quantity: ${quantity}`);
}

async function processProduct(client, product) {
  try {
    console.log('product', product);
    // 1. Handle product category
    const categoryId = await handleProductCategory(client, product.category_name);

    // 2. Handle product metal category
    const metalCategoryId = await handleProductMetalCategory(client, product.metal_category_name);
    // 3. Update product
    await updateProduct(client, product, categoryId, metalCategoryId);

    // 4. Handle supplier party
    // console.log('product', product.supplier_name, product.supplier_contact);
    if (product.supplier_name && product.supplier_contact) {
      await handleSupplierParty(client, product);
    }

    // // 5. Handle inventory update
    if (product.qty && parseFloat(product.qty) > 0) {
      await handleInventoryUpdate(client, product);
    }

    return { success: true, product: product.name };
  } catch (error) {
    fs.appendFileSync('error.txt', `${product.name} (${product.id}): ${error.message}\n`);
    console.error(`❌ Error processing product ${product.name} (${product.id}):`, error.message);
    return { success: false, product: product.name, error: error.message };
  }
}

async function updateProductsFromCsv() {
  const client = await pool.connect();

  try {
    console.log('Starting product update process from CSV...');

    // Read and parse CSV file
    const products = await parseCsvFile(CSV_FILE_PATH);
    console.log('products', products);
    console.log(`Found ${products.length} products in CSV`);

    // Validate all categories before starting any database operations
    console.log('Validating categories...');
    await validateCategories(client, products);
    console.log('✅ All categories validated successfully');

    // Filter products that exist in database
    const existingProducts = await filterExistingProducts(client, products);
    console.log(`${existingProducts.length} products exist in database and will be updated`);

    if (existingProducts.length === 0) {
      console.log('No existing products found. Exiting...');
      return;
    }

    // Begin transaction
    await client.query('BEGIN');
    console.log('🚀 Transaction started');

    try {
      // Process each product within the transaction
      await Promise.all(existingProducts.map(async (product) => {
        const result = await processProduct(client, product);
        if (!result.success) {
          throw new Error(`Failed to process product ${product.name}: ${result.error}`);
        }
      }));

      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Transaction committed successfully');

      console.log('\n🎉 Processing completed!');
      console.log(`✅ Successfully processed: ${existingProducts.length} products`);

    } catch (error) {
      // Rollback transaction on any error
      await client.query('ROLLBACK');
      console.log('🔄 Transaction rolled back due to error');
      throw error;
    }

  } catch (error) {
    console.error('❌ Critical error during update process:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await updateProductsFromCsv();
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

module.exports = { updateProductsFromCsv };
