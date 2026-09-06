const { getConnection } = require('../src/service/database');

(async () => {
  let db;
  try {
    db = await getConnection();

    // Get exact counts and sample data from all tables
    const tables = ['quotations', 'quotation_lines', 'customers', 'products', 'users',
                    'payments', 'fulfillment_orders', 'fulfillment_splits', 'invoices',
                    'customer_tiers', 'price_lists', 'warehouses', 'warehouse_stock',
                    'negotiation_requests', 'quotation_approvals', 'rep_discount_history',
                    'deal_health_alerts', 'credit_notes'];

    for (const t of tables) {
      try {
        const r = await db.queryOne(`SELECT COUNT(*) as count FROM ${t}`);
        console.log(`${t}: ${r.count}`);
      } catch (e) { console.log(`${t}: ERROR - ${e.message}`); }
    }

    // Get IDs we need for foreign keys
    const customers = await db.queryAll('SELECT id, company_name, tier_id FROM customers ORDER BY id LIMIT 10');
    console.log('\nCUSTOMERS:', JSON.stringify(customers.map(c => ({id: c.id, name: c.company_name}))));

    const users = await db.queryAll("SELECT id, full_name, role FROM users WHERE role IN ('sales_rep','sales_manager','admin') ORDER BY role");
    console.log('USERS:', JSON.stringify(users.map(u => ({id: u.id, name: u.full_name, role: u.role}))));

    const products = await db.queryAll('SELECT id, name, sku, base_price, cost_price FROM products ORDER BY id');
    console.log('PRODUCTS:', JSON.stringify(products.map(p => ({id: p.id, name: p.name, price: p.base_price, cost: p.cost_price}))));

    const priceLists = await db.queryAll('SELECT id, name FROM price_lists LIMIT 3');
    console.log('PRICE_LISTS:', JSON.stringify(priceLists));

    // Check quotations columns
    const qCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='quotations' ORDER BY ordinal_position");
    console.log('QUOTATION COLS:', qCols.map(c => c.column_name).join(', '));

    // Check invoice columns  
    const iCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='invoices' ORDER BY ordinal_position");
    console.log('INVOICE COLS:', iCols.map(c => c.column_name).join(', '));

    // Check fulfillment columns
    const fCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='fulfillment_orders' ORDER BY ordinal_position");
    console.log('FULFILLMENT COLS:', fCols.map(c => c.column_name).join(', '));

    // Check negotiation columns
    const nCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='negotiation_requests' ORDER BY ordinal_position");
    console.log('NEGOTIATION COLS:', nCols.map(c => c.column_name).join(', '));

    // Check deal_health_alerts columns
    const dhCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='deal_health_alerts' ORDER BY ordinal_position");
    console.log('DEAL_HEALTH COLS:', dhCols.map(c => c.column_name).join(', '));

    // Check quotation_approvals columns
    const qaCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='quotation_approvals' ORDER BY ordinal_position");
    console.log('QUOTATION_APPROVALS COLS:', qaCols.map(c => c.column_name).join(', '));

    // Check enums
    const enums = await db.queryAll("SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder");
    console.log('ENUMS:', JSON.stringify(enums.reduce((acc, e) => { if (!acc[e.typname]) acc[e.typname] = []; acc[e.typname].push(e.enumlabel); return acc; }, {})));

  } catch(e) {
    console.error('ERR:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
