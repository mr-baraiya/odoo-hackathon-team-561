const { getConnection } = require('../backend/src/service/database');

async function test() {
  try {
    const db = await getConnection();
    console.log('--- FULFILLMENT ORDERS COLUMNS ---');
    const cols = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'fulfillment_orders'`);
    console.log(cols.rows.map(c => c.column_name));

    console.log('\n--- FULFILLMENT ORDERS DATA ---');
    const fo = await db.query(`SELECT * FROM fulfillment_orders LIMIT 5`);
    console.log(fo.rows);

    console.log('\n--- USERS ---');
    const users = await db.query(`SELECT id, full_name, email, role FROM users LIMIT 5`);
    console.log(users.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
