const { getConnection } = require('../backend/src/service/database');

async function seedSlippageAlerts() {
  try {
    const db = await getConnection();
    
    // Find fulfillment orders where promised_delivery_date < NOW() and status != 'fulfilled'
    const overdueRes = await db.query(`
      SELECT fo.id as fulfillment_id, fo.quotation_id, fo.promised_delivery_date, fo.status,
             q.quote_number, c.company_name
      FROM fulfillment_orders fo
      JOIN quotations q ON fo.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      WHERE fo.promised_delivery_date < NOW()
        AND fo.status IN ('pending', 'partially_fulfilled', 'backordered')
    `);

    console.log(`Found ${overdueRes.rows.length} overdue fulfillment orders.`);

    for (const row of overdueRes.rows) {
      // Check if alert already exists for this quotation and delivery_slippage type
      const existing = await db.query(`
        SELECT id FROM deal_health_alerts 
        WHERE quotation_id = $1 AND alert_type = 'delivery_slippage'
      `, [row.quotation_id]);

      if (existing.rows.length === 0) {
        const daysOverdue = Math.floor((new Date() - new Date(row.promised_delivery_date)) / (1000 * 60 * 60 * 24));
        const message = `Delivery for quote ${row.quote_number} (${row.company_name}) is overdue by ${daysOverdue} days. Promised date was ${new Date(row.promised_delivery_date).toLocaleDateString()}.`;
        
        await db.query(`
          INSERT INTO deal_health_alerts (quotation_id, alert_type, details, status, triggered_at)
          VALUES ($1, 'delivery_slippage', $2, 'open', NOW())
        `, [
          row.quotation_id,
          JSON.stringify({
            message,
            days_overdue: daysOverdue,
            promised_date: row.promised_delivery_date,
            fulfillment_status: row.status,
            customer_name: row.company_name,
            quote_number: row.quote_number
          })
        ]);
        console.log(`Created delivery_slippage alert for ${row.quote_number}`);
      }
    }

    const allAlerts = await db.query(`
      SELECT dha.*, q.quote_number, q.total_amount, c.company_name
      FROM deal_health_alerts dha
      JOIN quotations q ON dha.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      ORDER BY dha.triggered_at DESC
    `);
    console.log('\n--- ALL ALERTS NOW IN DB ---');
    console.table(allAlerts.rows.map(a => ({
      id: a.id.substring(0, 8),
      quote: a.quote_number,
      customer: a.company_name,
      type: a.alert_type,
      status: a.status,
      triggered: new Date(a.triggered_at).toISOString().split('T')[0]
    })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedSlippageAlerts();
