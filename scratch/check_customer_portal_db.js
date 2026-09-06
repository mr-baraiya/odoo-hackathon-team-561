const { getConnection } = require('../backend/src/service/database');

async function testCustomerDB() {
  try {
    const db = await getConnection();

    console.log('--- CUSTOMERS IN DB ---');
    const custs = await db.queryAll(`
      SELECT c.id, c.company_name, c.primary_contact_name, c.primary_contact_email, c.tier_id, ct.label as tier_label
      FROM customers c
      LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
      LIMIT 5
    `);
    console.log(custs);

    console.log('\n--- QUOTATIONS COUNT PER CUSTOMER ---');
    const qCounts = await db.queryAll(`
      SELECT c.company_name, q.customer_id, q.status, COUNT(*) as count, SUM(q.total_amount) as total_value
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      GROUP BY c.company_name, q.customer_id, q.status
      LIMIT 15
    `);
    console.log(qCounts);

    console.log('\n--- SAMPLE QUOTATIONS FOR FIRST CUSTOMER ---');
    const targetCustId = custs[0]?.id;
    if (targetCustId) {
      const qList = await db.queryAll(`
        SELECT q.id, q.quote_number, q.status, q.total_amount, q.created_at, u.full_name as sales_rep_name
        FROM quotations q
        LEFT JOIN users u ON q.sales_rep_id = u.id
        WHERE q.customer_id = $1
        ORDER BY q.created_at DESC
      `, [targetCustId]);
      console.log(`Found ${qList.length} quotes for ${custs[0].company_name}`);
      console.log(qList.slice(0, 5));
    }

    db.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testCustomerDB();
