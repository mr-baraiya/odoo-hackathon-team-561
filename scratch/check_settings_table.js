const { getConnection } = require('../backend/src/service/database');

async function test() {
  try {
    const db = await getConnection();
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
      ORDER BY table_name
    `);
    console.log(tables.rows.map(t => t.table_name));

    db.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
