const { getConnection } = require('../backend/src/service/database');

async function testLines() {
  const db = await getConnection();
  const res = await db.queryAll(`
    SELECT ql.*, q.quote_number, p.name as product_name
    FROM quotation_lines ql
    JOIN quotations q ON ql.quotation_id = q.id
    LEFT JOIN products p ON ql.product_id = p.id
    LIMIT 10
  `);
  console.log(`Found ${res.length} quotation lines in DB:`);
  console.table(res.map(l => ({
    quote: l.quote_number,
    product: l.product_name || l.product_id,
    qty: l.quantity,
    price: l.unit_price,
    total: l.line_total
  })));
  db.release();
  process.exit(0);
}

testLines();
