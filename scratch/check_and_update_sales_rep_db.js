const { getConnection } = require('../backend/src/service/database');

async function main() {
  let db;
  try {
    db = await getConnection();
    console.log('Connected to PostgreSQL database for Sales Rep schema check.');

    // 1. Add 'customer_request' to quotation_status enum if missing
    try {
      await db.query(`ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'customer_request';`);
      console.log("✓ Checked/Added 'customer_request' to quotation_status enum.");
    } catch (e) {
      console.log('Enum update note:', e.message);
    }

    // 2. Add customer_request column to quotations if needed
    await db.query(`
      ALTER TABLE quotations 
      ADD COLUMN IF NOT EXISTS is_customer_request BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    console.log('✓ Checked/Added is_customer_request column to quotations.');

    // 3. Verify counts in key tables
    const userCount = await db.queryOne('SELECT COUNT(*) FROM users');
    const quoteCount = await db.queryOne('SELECT COUNT(*) FROM quotations');
    const custCount = await db.queryOne('SELECT COUNT(*) FROM customers');
    const prodCount = await db.queryOne('SELECT COUNT(*) FROM products');
    console.log(`DB Stats: Users=${userCount.count}, Customers=${custCount.count}, Products=${prodCount.count}, Quotations=${quoteCount.count}`);

  } catch (err) {
    console.error('DB Migration Error:', err.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
}

main();
