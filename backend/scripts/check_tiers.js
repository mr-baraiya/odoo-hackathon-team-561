const { getConnection } = require('../src/service/database');
(async () => {
  let db = await getConnection();
  const cols = await db.queryAll("SELECT column_name FROM information_schema.columns WHERE table_name='customer_tiers' ORDER BY ordinal_position");
  console.log('TIER COLS:', cols.map(c => c.column_name).join(', '));
  const rows = await db.queryAll('SELECT * FROM customer_tiers');
  console.log('TIER ROWS:', JSON.stringify(rows));
  db.release();
  process.exit(0);
})();
