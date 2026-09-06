const { getConnection } = require('../src/service/database');

(async () => {
  let db;
  try {
    db = await getConnection();

    // Check quotation statuses available
    const statuses = await db.queryAll('SELECT DISTINCT status, COUNT(*) as count FROM quotations GROUP BY status ORDER BY count DESC');
    console.log('QUOTATION STATUSES:', JSON.stringify(statuses));

    // Quotation totals
    const qTotals = await db.queryOne('SELECT COUNT(*) as total, SUM(total_amount) as revenue, SUM(total_discount_amount) as discounts, AVG(total_amount) as avg_deal FROM quotations');
    console.log('TOTALS:', JSON.stringify(qTotals));

    // Check customers columns
    const custCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='customers' ORDER BY ordinal_position");
    console.log('CUSTOMERS COLS:', custCols.map(c=>c.column_name).join(', '));

    // Check quotations columns
    const qCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='quotations' ORDER BY ordinal_position");
    console.log('QUOTATIONS COLS:', qCols.map(c=>c.column_name).join(', '));

    // Check quotation_lines columns
    const qlCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='quotation_lines' ORDER BY ordinal_position");
    console.log('QUOTATION_LINES COLS:', qlCols.map(c=>c.column_name).join(', '));

    // Check payments columns
    const payCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='payments' ORDER BY ordinal_position");
    console.log('PAYMENTS COLS:', payCols.map(c=>c.column_name).join(', '));
    const payCount = await db.queryOne('SELECT COUNT(*) as count FROM payments');
    console.log('PAYMENTS COUNT:', payCount.count);

    // Check fulfillment_orders columns
    const fulfCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='fulfillment_orders' ORDER BY ordinal_position");
    console.log('FULFILLMENT_ORDERS COLS:', fulfCols.map(c=>c.column_name).join(', '));
    const fulfCount = await db.queryOne('SELECT COUNT(*) as count FROM fulfillment_orders');
    console.log('FULFILLMENT_ORDERS COUNT:', fulfCount.count);

    // Check rep_discount_history
    const rdCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='rep_discount_history' ORDER BY ordinal_position");
    console.log('REP_DISCOUNT_HISTORY COLS:', rdCols.map(c=>c.column_name).join(', '));
    const rdCount = await db.queryOne('SELECT COUNT(*) as count FROM rep_discount_history');
    console.log('REP_DISCOUNT_HISTORY COUNT:', rdCount.count);

    // View v_quotation_report
    const vqCols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='v_quotation_report' ORDER BY ordinal_position");
    console.log('v_quotation_report COLS:', vqCols.map(c=>c.column_name).join(', '));

  } catch(e) {
    console.error('ERR:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
