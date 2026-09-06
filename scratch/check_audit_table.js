const { getConnection } = require('../backend/src/service/database');

async function test() {
  try {
    const db = await getConnection();
    console.log('--- AUDIT_LOG COLUMNS ---');
    const cols = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name='audit_log'`);
    console.log(cols.rows.map(c => c.column_name));

    console.log('\n--- AUDIT_LOG SAMPLE ROWS ---');
    const rows = await db.query(`SELECT * FROM audit_log LIMIT 10`);
    console.log(rows.rows);

    db.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
