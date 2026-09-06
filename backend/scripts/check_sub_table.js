const { getConnection } = require('../src/service/database');

(async () => {
  let db;
  try {
    db = await getConnection();

    // Check table existence
    const tableExists = await db.queryAll(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='subscription_plans'"
    );
    console.log('TABLE EXISTS:', tableExists.length > 0);

    if (tableExists.length > 0) {
      const cols = await db.queryAll(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='subscription_plans' ORDER BY ordinal_position"
      );
      console.log('COLUMNS:', cols.map(c => c.column_name).join(', '));
      const rows = await db.queryAll('SELECT * FROM subscription_plans LIMIT 5');
      console.log('ROW COUNT:', rows.length);
      if (rows.length > 0) {
        console.log('SAMPLE:', JSON.stringify(rows[0], null, 2));
      } else {
        console.log('TABLE IS EMPTY - needs seeding');
      }
    } else {
      console.log('TABLE DOES NOT EXIST - needs CREATE TABLE');
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
