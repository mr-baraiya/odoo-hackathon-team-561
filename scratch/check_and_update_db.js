const { getConnection } = require('../backend/src/service/database');

async function main() {
  let db;
  try {
    db = await getConnection();
    console.log('Connected to PostgreSQL successfully.');

    // 1. Check/Add quantity_reserved to warehouse_stock
    await db.query(`
      ALTER TABLE warehouse_stock 
      ADD COLUMN IF NOT EXISTS quantity_reserved INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('✓ Checked/Added quantity_reserved column to warehouse_stock');

    // 2. Check/Add subscriptions table if needed
    await db.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID REFERENCES customers(id),
        quotation_id UUID REFERENCES quotations(id),
        plan_name VARCHAR(150) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
        amount NUMERIC(14,2) NOT NULL DEFAULT 0,
        next_billing_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log('✓ Checked/Created subscriptions table');

    // 3. Verify counts in key tables
    const userCount = await db.queryOne('SELECT COUNT(*) FROM users');
    const quoteCount = await db.queryOne('SELECT COUNT(*) FROM quotations');
    const stockCount = await db.queryOne('SELECT COUNT(*) FROM warehouse_stock');
    console.log(`DB Stats: Users=${userCount.count}, Quotations=${quoteCount.count}, StockRecords=${stockCount.count}`);

  } catch (err) {
    console.error('DB Migration Error:', err.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
}

main();
