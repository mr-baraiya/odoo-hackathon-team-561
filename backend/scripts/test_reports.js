const { getConnection } = require('../src/service/database');

(async () => {
  let db;
  try {
    db = await getConnection();

    // Test Revenue query that's failing
    console.log('=== TESTING REVENUE QUERY ===');
    try {
      const rev = await db.queryOne(`
        SELECT
          COALESCE(SUM(q.total_amount), 0) AS gross_revenue,
          COALESCE(SUM(q.total_amount) FILTER (WHERE q.status='confirmed'), 0) AS confirmed_revenue,
          COALESCE(SUM(q.total_discount_amount), 0) AS total_discounts,
          COALESCE(SUM(q.total_amount) - SUM(q.total_discount_amount), 0) AS net_revenue
        FROM quotations q
      `);
      console.log('Revenue summary OK:', JSON.stringify(rev));
    } catch(e) { console.error('Revenue summary FAIL:', e.message); }

    // Test invoice query - THIS IS WHERE IT FAILS
    console.log('\n=== TESTING INVOICE QUERY ===');
    try {
      const inv = await db.queryAll('SELECT * FROM invoices LIMIT 2');
      console.log('Invoice columns:', Object.keys(inv[0] || {}));
      console.log('Invoice sample:', JSON.stringify(inv[0]));
    } catch(e) { console.error('Invoice query FAIL:', e.message); }

    // Test recentInvoices subquery (the broken one)
    console.log('\n=== TESTING RECENT INVOICES QUERY ===');
    try {
      const ri = await db.queryAll(`
        SELECT i.id, i.invoice_number, i.amount_due, i.amount_paid, i.status, i.due_date, i.created_at
        FROM invoices i
        LIMIT 3
      `);
      console.log('recentInvoices OK:', ri.length, 'rows');
    } catch(e) { console.error('recentInvoices FAIL:', e.message); }

    // Test fulfillment query
    console.log('\n=== TESTING FULFILLMENT QUERY ===');
    try {
      const ful = await db.queryAll('SELECT DISTINCT status FROM fulfillment_orders');
      console.log('Fulfillment statuses:', ful.map(f=>f.status));
      const fulSum = await db.queryOne(`
        SELECT
          COUNT(*) AS total_orders,
          COUNT(*) FILTER (WHERE status='fulfilled') AS delivered,
          COUNT(*) FILTER (WHERE status='partially_fulfilled') AS in_transit,
          COUNT(*) FILTER (WHERE status='pending') AS pending
        FROM fulfillment_orders
      `);
      console.log('Fulfillment summary (corrected):', JSON.stringify(fulSum));
    } catch(e) { console.error('Fulfillment FAIL:', e.message); }

    // Test byCustomer query
    console.log('\n=== TESTING BY CUSTOMER QUERY ===');
    try {
      const cust = await db.queryAll(`
        SELECT c.company_name, ct.name AS tier, COUNT(q.id) AS quote_count,
               COALESCE(SUM(q.total_amount), 0) AS total_revenue
        FROM customers c
        LEFT JOIN quotations q ON q.customer_id = c.id
        LEFT JOIN customer_tiers ct ON ct.id = c.tier_id
        GROUP BY c.id, c.company_name, ct.name
        HAVING COUNT(q.id) > 0
        ORDER BY total_revenue DESC LIMIT 5
      `);
      console.log('byCustomer OK:', cust.length, 'rows', JSON.stringify(cust[0]));
    } catch(e) { console.error('byCustomer FAIL:', e.message); }

  } catch(e) {
    console.error('MAIN ERR:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
