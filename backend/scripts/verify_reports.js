const { getConnection } = require('../src/service/database');

(async () => {
  let db;
  try {
    db = await getConnection();

    // Test ALL fixed queries
    console.log('=== REVENUE: summary ===');
    const r1 = await db.queryOne(`
      SELECT COALESCE(SUM(q.total_amount),0) AS gross_revenue,
             COALESCE(SUM(q.total_amount) FILTER (WHERE q.status='confirmed'),0) AS confirmed_revenue,
             COALESCE(SUM(q.total_discount_amount),0) AS total_discounts,
             COALESCE(SUM(q.total_amount)-SUM(q.total_discount_amount),0) AS net_revenue
      FROM quotations q
    `);
    console.log('  gross:', r1.gross_revenue, '| confirmed:', r1.confirmed_revenue, '| discounts:', r1.total_discounts, '| net:', r1.net_revenue);

    console.log('\n=== REVENUE: byCustomer (ct.label fix) ===');
    const r2 = await db.queryAll(`
      SELECT c.company_name, ct.label AS tier, COUNT(q.id) AS quote_count,
             COALESCE(SUM(q.total_amount),0) AS total_revenue
      FROM customers c
      LEFT JOIN quotations q ON q.customer_id=c.id
      LEFT JOIN customer_tiers ct ON ct.id=c.tier_id
      GROUP BY c.id, c.company_name, ct.label
      HAVING COUNT(q.id)>0 ORDER BY total_revenue DESC LIMIT 5
    `);
    console.log('  rows:', r2.length, '| top:', r2[0]?.company_name, '$'+r2[0]?.total_revenue);

    console.log('\n=== REVENUE: invoices (amount_due fix) ===');
    const r3 = await db.queryAll(`
      SELECT i.id, i.invoice_number, i.amount_due, i.amount_paid, i.status, i.due_date
      FROM invoices i ORDER BY i.created_at DESC LIMIT 3
    `);
    console.log('  rows:', r3.length, '| sample:', JSON.stringify(r3[0]));

    console.log('\n=== CUSTOMERS: byTier (ct.label fix) ===');
    const r4 = await db.queryAll(`
      SELECT ct.label AS tier, COUNT(c.id) AS customer_count,
             COALESCE(SUM(q.total_amount),0) AS total_revenue
      FROM customer_tiers ct
      LEFT JOIN customers c ON c.tier_id=ct.id
      LEFT JOIN quotations q ON q.customer_id=c.id
      GROUP BY ct.id, ct.label ORDER BY total_revenue DESC
    `);
    console.log('  tiers:', r4.map(t => `${t.tier}($${t.total_revenue})`).join(', '));

    console.log('\n=== FULFILLMENT: summary (status enum fix) ===');
    const r5 = await db.queryOne(`
      SELECT COUNT(*) AS total_orders,
             COUNT(*) FILTER (WHERE status='fulfilled') AS delivered,
             COUNT(*) FILTER (WHERE status='partially_fulfilled') AS in_transit,
             COUNT(*) FILTER (WHERE status='pending') AS pending,
             COUNT(*) FILTER (WHERE actual_delivery_date IS NOT NULL AND actual_delivery_date>promised_delivery_date) AS late_deliveries
      FROM fulfillment_orders
    `);
    console.log('  total:', r5.total_orders, '| delivered:', r5.delivered, '| in_transit:', r5.in_transit, '| pending:', r5.pending, '| late:', r5.late_deliveries);

    console.log('\n=== FULFILLMENT: orders ===');
    const r6 = await db.queryAll(`
      SELECT fo.status, q.quote_number, c.company_name
      FROM fulfillment_orders fo
      LEFT JOIN quotations q ON q.id=fo.quotation_id
      LEFT JOIN customers c ON c.id=q.customer_id
      LIMIT 4
    `);
    console.log('  orders:', r6.map(o => `${o.status}:${o.quote_number}`).join(', '));

    console.log('\n✅ ALL QUERIES PASSED!\n');

  } catch(e) {
    console.error('FAIL:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
