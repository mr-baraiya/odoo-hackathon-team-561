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
const COMPANY_ID = '24a40db5-781a-4dad-ab3e-8c748785c138';
const CSV_FILE_PATH = '/Users/harshilvasoya/Documents/new_1_2.csv'; // Update this path to your CSV file

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
        // Map CSV columns to our expected format (no ID needed)
        results.push({
          name: data.name,
          finish: data.finish,
          size: data.size,
          purchase_price: data.purchase_price,
          price: data.price,
          category_name: data.sub_category_name,
          metal_category_name: data.metal_category_name,
          supplier_contact: data.supplier_contact,
          supplier_name: data.supplier_name,
          hsn_code: data.HSN || '83024110',
          box_qty: data.box || '',
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function handleProductCategory(client, categoryName) {
  if (!categoryName) return null;

  // Check if category exists
  let result = await client.query(
    'SELECT id, name FROM product_categories WHERE name = $1',
    [categoryName],
  );

  if (result.rowCount > 0) {
    console.log('categoryName', result.rows[0].id, result.rows[0].name);
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

async function insertProduct(client, product, categoryId, metalCategoryId) {
  // Build insert query with all required fields (no ID - let database auto-generate)
  const insertFields = ['product_category_id', 'product_metal_category_id', 'name', 'hsn_code', 'finish', 'size', 'purchase_price', 'price', 'description', 'created_at', 'updated_at', 'gst_rate_id'];
  const values = [];
  const placeholders = [];
  let paramIndex = 1;

  // Add values for each field
  if (categoryId) {
    values.push(categoryId);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    // Use a default category if none provided
    values.push('default-category-id'); // You may want to set a proper default
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (metalCategoryId) {
    values.push(metalCategoryId);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    // Use a default metal category if none provided
    values.push('default-metal-category-id'); // You may want to set a proper default
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (product.name) {
    values.push(product.name);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    values.push('Unnamed Product');
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (product.hsn_code) {
    values.push(product.hsn_code);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    values.push(null);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (product.finish) {
    values.push(product.finish);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    values.push(null);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (product.size) {
    values.push(product.size);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    values.push(null);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (product.purchase_price) {
    values.push(parseFloat(product.purchase_price));
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    values.push(0);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (product.price) {
    values.push(parseFloat(product.price));
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    values.push(0);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  if (product.box_qty) {
    values.push(product.box_qty);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  } else {
    values.push(null);
    placeholders.push(`$${paramIndex}`);
    paramIndex += 1;
  }

  // Add timestamps
  values.push(new Date());
  placeholders.push(`$${paramIndex}`);
  paramIndex += 1;
  values.push(new Date());
  placeholders.push(`$${paramIndex}`);
  paramIndex += 1;

  // gst_rate_id = 'a1c06557-9e39-49db-924e-5b86e2ed851a'
  values.push('a1c06557-9e39-49db-924e-5b86e2ed851a');
  placeholders.push(`$${paramIndex}`);
  paramIndex += 1;

  const query = `
    INSERT INTO products (${insertFields.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING id, name
  `;

  const result = await client.query(query, values);
  console.log(`Inserted new product: ${result.rows[0].name} with ID: ${result.rows[0].id}`);

  // Return the inserted product with its new ID for use in other operations
  return { ...product, id: result.rows[0].id };
}

async function handleSupplierParty(client, product) {
  // Check if party exists
  const result = await client.query(
    'SELECT id FROM parties WHERE company_id = $1 AND name = $2',
    [COMPANY_ID, product.supplier_name],
  );

  let partyId;

  if (result.rowCount > 0) {
    partyId = result.rows[0].id;
    console.log(`Found existing supplier party: ${product.supplier_name}`);
  } else {
    // Create new supplier party if it doesn't exist
    const newPartyResult = await client.query(
      `INSERT INTO parties (company_id, type, name, phone_number)
       VALUES ($1, 'supplier', $2, $3) RETURNING id`,
      [COMPANY_ID, product.supplier_name, product.supplier_contact || ''],
    );
    partyId = newPartyResult.rows[0].id;
    console.log(`Created new supplier party: ${product.supplier_name}`);
  }

  if (product.purchase_price) {
    await client.query(`
      INSERT INTO party_product_prices (party_id, product_id, price, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $4)
      ON CONFLICT (party_id, product_id) DO UPDATE
      SET price = EXCLUDED.price, updated_at = CURRENT_TIMESTAMP
    `, [partyId, product.id, parseFloat(product.purchase_price), 'c57f3785-5269-4fba-8bfc-99060d5b4ae5']);

    console.log(`Updated party product price for supplier: ${product.supplier_name}`);
  }
}

async function processProduct(client, product) {
  try {
    // 1. Handle product category
    const categoryId = await handleProductCategory(client, product.category_name);

    // 2. Handle product metal category
    const metalCategoryId = await handleProductMetalCategory(client, product.metal_category_name);

    // 3. Insert new product and get the generated ID
    const insertedProduct = await insertProduct(client, product, categoryId, metalCategoryId);

    // 4. Handle supplier party (now using the generated product ID)
    if (product.supplier_name && product.supplier_contact) {
      await handleSupplierParty(client, insertedProduct);
    }

    return { success: true, product: product.name };
  } catch (error) {
    // write this error in a file
    fs.appendFileSync('error.txt', `${product.name}: ${error.message}\n`);
    console.error(`❌ Error processing product ${product.name}:`, error.message);
    return { success: false, product: product.name, error: error.message };
  }
}

async function validateProductData(client, product, rowNumber) {
  const errors = [];
  const validatedProduct = { ...product };

  // Validate required fields
  if (!product.name || product.name.trim() === '') {
    errors.push('Product name is required');
  }

  if (!product.category_name || product.category_name.trim() === '') {
    errors.push('Category name is required');
  }

  if (!product.metal_category_name || product.metal_category_name.trim() === '') {
    errors.push('Metal category name is required');
  }

  // Validate numeric fields
  if (product.purchase_price && isNaN(parseFloat(product.purchase_price))) {
    errors.push('Purchase price must be a valid number');
  } else if (product.purchase_price && parseFloat(product.purchase_price) < 0) {
    errors.push('Purchase price cannot be negative');
  }

  if (product.price && isNaN(parseFloat(product.price))) {
    errors.push('Price must be a valid number');
  } else if (product.price && parseFloat(product.price) < 0) {
    errors.push('Price cannot be negative');
  }

  // Validate category exists
  if (product.category_name) {
    try {
      const categoryResult = await client.query(
        'SELECT id FROM product_categories WHERE name = $1',
        [product.category_name.trim()],
      );
      if (categoryResult.rowCount === 0) {
        errors.push(`Category '${product.category_name}' does not exist`);
      } else {
        validatedProduct.category_id = categoryResult.rows[0].id;
      }
    } catch (error) {
      errors.push(`Error validating category: ${error.message}`);
    }
  }

  // Validate metal category exists
  if (product.metal_category_name) {
    try {
      const metalCategoryResult = await client.query(
        'SELECT id FROM product_metal_categories WHERE name = $1',
        [product.metal_category_name.trim()],
      );
      if (metalCategoryResult.rowCount === 0) {
        errors.push(`Metal category '${product.metal_category_name}' does not exist`);
      } else {
        validatedProduct.metal_category_id = metalCategoryResult.rows[0].id;
      }
    } catch (error) {
      errors.push(`Error validating metal category: ${error.message}`);
    }
  }

  // Validate HSN code if provided
  if (product.hsn_code && product.hsn_code.trim() !== '') {
    try {
      const hsnResult = await client.query(
        'SELECT id FROM gst_rates WHERE hsn_code = $1',
        [product.hsn_code.trim()],
      );
      if (hsnResult.rowCount === 0) {
        errors.push(`HSN code '${product.hsn_code}' does not exist`);
      } else {
        validatedProduct.gst_rate_id = hsnResult.rows[0].id;
      }
    } catch (error) {
      errors.push(`Error validating HSN code: ${error.message}`);
    }
  }

  // Check for duplicate products
  if (product.name) {
    try {
      const duplicateResult = await client.query(
        'SELECT id FROM products WHERE name = $1 AND size = $2 AND finish = $3',
        [product.name.trim(), product.size?.trim() || null, product.finish?.trim() || null],
      );
      if (duplicateResult.rowCount > 0) {
        errors.push(`Product with same name, size, and finish already exists (ID: ${duplicateResult.rows[0].id})`);
      }
    } catch (error) {
      errors.push(`Error checking for duplicates: ${error.message}`);
    }
  }

  return {
    isValid: errors.length === 0,
    product: validatedProduct,
    errors,
  };
}

function writeErrorsToFile(errors) {
  const timestamp = new Date().toISOString();
  const errorContent = [
    `=== VALIDATION ERRORS - ${timestamp} ===`,
    `Total errors: ${errors.length}`,
    '',
    ...errors.map((error) => `Row ${error.row}: ${error.product}\nErrors: ${error.errors.join(', ')}\n`),
  ].join('\n');

  fs.writeFileSync('validation_errors.txt', errorContent);
  console.log('Validation errors written to validation_errors.txt');
}

function writeInsertErrorsToFile(errors) {
  const timestamp = new Date().toISOString();
  const errorContent = [
    `=== INSERTION ERRORS - ${timestamp} ===`,
    `Total errors: ${errors.length}`,
    '',
    ...errors.map((error) => `Product: ${error.product}\nError: ${error.error}\n`),
  ].join('\n');

  fs.writeFileSync('insertion_errors.txt', errorContent);
  console.log('Insertion errors written to insertion_errors.txt');
}
async function insertProductsFromCsv() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Starting product insertion process from CSV...');

    const products = await parseCsvFile(CSV_FILE_PATH);
    console.log(`Found ${products.length} products in CSV`);

    const validatedProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const rowNumber = i + 1;

      try {
        console.log(`Validating product ${rowNumber}/${products.length}: ${product.name}`);

        const validationResult = await validateProductData(client, product, rowNumber);

        if (validationResult.isValid) {
          validatedProducts.push(validationResult.product);
          console.log(`✅ Validated: ${product.name}`);
        } else {
          errors.push({
            row: rowNumber,
            product: product.name,
            errors: validationResult.errors,
          });
          console.log(`❌ Validation failed: ${product.name} - ${validationResult.errors.join(', ')}`);
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          product: product.name,
          errors: [error.message],
        });
        console.log(`❌ Error validating: ${product.name} - ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.log(`\n❌ Found ${errors.length} validation errors. Writing to error file...`);
      writeErrorsToFile(errors);

      if (validatedProducts.length === 0) {
        console.log('No valid products to insert. Rolling back...');
        await client.query('ROLLBACK');
        return;
      }
    }

    console.log(`\n📦 Processing ${validatedProducts.length} valid products...`);

    let successCount = 0;
    const insertErrors = [];

    for (const product of validatedProducts) {
      try {
        await processProduct(client, product);
        successCount++;
        console.log(`✅ Inserted ${successCount}/${validatedProducts.length}: ${product.name}`);
      } catch (error) {
        insertErrors.push({
          product: product.name,
          error: error.message,
        });
        console.log(`❌ Failed to insert: ${product.name} - ${error.message}`);
      }
    }

    if (insertErrors.length > 0) {
      console.log(`\n❌ Found ${insertErrors.length} insertion errors. Writing to error file...`);
      writeInsertErrorsToFile(insertErrors);

      if (successCount === 0) {
        console.log('No products inserted successfully. Rolling back...');
        await client.query('ROLLBACK');
        return;
      }
    }

    await client.query('COMMIT');

    console.log('\n🎉 Processing completed!');
    console.log(`✅ Successfully inserted: ${successCount} products`);
    console.log(`❌ Validation errors: ${errors.length}`);
    console.log(`❌ Insertion errors: ${insertErrors.length}`);

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
    await insertProductsFromCsv();
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

module.exports = { insertProductsFromCsv };
