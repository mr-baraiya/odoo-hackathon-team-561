const { getConnection } = require('../backend/src/service/database');

async function testAuditQueries() {
  try {
    const db = await getConnection();

    console.log('--- TEST GET ALL AUDIT LOGS ---');
    const logs = await db.queryAll(`
      SELECT al.*,
             u.full_name AS actor_name,
             u.email AS actor_email,
             u.role AS actor_role
      FROM audit_log al
      LEFT JOIN users u ON al.performed_by_user_id = u.id
      ORDER BY al.created_at DESC
    `);
    console.log(`Fetched ${logs.length} audit logs from DB:`);
    console.table(logs.map(l => ({
      id: l.id.substring(0, 8),
      action: l.action,
      actor: l.actor_name,
      role: l.actor_role,
      entity: l.entity_type,
      time: new Date(l.created_at).toISOString().replace('T', ' ').substring(0, 16)
    })));

    db.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testAuditQueries();
