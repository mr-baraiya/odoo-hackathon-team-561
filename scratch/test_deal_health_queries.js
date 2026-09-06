const { getConnection } = require('../backend/src/service/database');

async function testQueries() {
  try {
    const db = await getConnection();

    console.log('--- TEST GET ALERTS ---');
    const alerts = await db.queryAll(`
      SELECT dha.*,
             q.quote_number,
             q.total_amount,
             q.status AS quotation_status,
             c.company_name AS customer_name,
             u1.full_name AS escalated_by_name,
             u2.full_name AS escalated_to_name
      FROM deal_health_alerts dha
      JOIN quotations q ON dha.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u1 ON dha.escalated_by_user_id = u1.id
      LEFT JOIN users u2 ON dha.escalated_to_user_id = u2.id
      ORDER BY dha.triggered_at DESC
    `);
    console.log(`Fetched ${alerts.length} alerts from DB.`);

    console.log('\n--- TEST STALLED QUERY ---');
    const stalled = await db.queryAll(`
      SELECT q.id, q.quote_number, q.status, q.total_amount, q.created_at, q.updated_at,
             c.company_name AS customer_name,
             u.full_name AS sales_rep_name,
             GREATEST(1, EXTRACT(DAY FROM (NOW() - q.updated_at))::int) AS days_stalled
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.sales_rep_id = u.id
      WHERE q.status IN ('draft', 'pending_approval', 'under_negotiation')
      ORDER BY q.updated_at ASC
    `);
    console.log(`Fetched ${stalled.length} stalled quotes.`);

    console.log('\n--- TEST SLIPPAGES QUERY ---');
    const slippages = await db.queryAll(`
      SELECT fo.id AS fulfillment_id, fo.status AS fulfillment_status, fo.promised_delivery_date, fo.actual_delivery_date,
             q.id AS quotation_id, q.quote_number, q.total_amount,
             c.company_name AS customer_name,
             GREATEST(1, EXTRACT(DAY FROM (NOW() - fo.promised_delivery_date))::int) AS days_overdue
      FROM fulfillment_orders fo
      JOIN quotations q ON fo.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      WHERE fo.promised_delivery_date < NOW()
        AND fo.status IN ('pending', 'partially_fulfilled', 'backordered')
      ORDER BY fo.promised_delivery_date ASC
    `);
    console.log(`Fetched ${slippages.length} slippage records.`);

    db.release();
    process.exit(0);
  } catch (err) {
    console.error('SQL Error:', err);
    process.exit(1);
  }
}

testQueries();
