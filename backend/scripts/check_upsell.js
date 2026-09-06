const { getConnection } = require('../src/service/database');

(async () => {
  let db;
  try {
    db = await getConnection();
    // Check upsell_rules table
    const t = await db.queryAll(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('upsell_rules', 'product_pairings', 'promotion_rules')"
    );
    console.log('UPSELL-RELATED TABLES:', t.map(r => r.table_name));

    for (const tbl of t) {
      const cols = await db.queryAll(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='${tbl.table_name}' ORDER BY ordinal_position`
      );
      console.log(`\n${tbl.table_name} COLUMNS:`, cols.map(c => c.column_name).join(', '));
      const rows = await db.queryAll(`SELECT * FROM ${tbl.table_name} LIMIT 3`);
      console.log(`${tbl.table_name} ROWS:`, rows.length, rows.length > 0 ? JSON.stringify(rows[0]) : 'empty');
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
