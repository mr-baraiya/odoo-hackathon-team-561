const { getConnection } = require('../backend/src/service/database');

async function check() {
  try {
    const db = await getConnection();
    const custs = await db.queryAll('SELECT id, company_name FROM customers LIMIT 5');
    console.log('Customers in DB:', custs);
    const reps = await db.queryAll("SELECT id, full_name, role FROM users WHERE role = 'sales_rep'");
    console.log('Reps in DB:', reps);
    const prods = await db.queryAll("SELECT id, name FROM products LIMIT 5");
    console.log('Products in DB:', prods);
    db.release();
  } catch (e) {
    console.error('Error:', e);
  }
}
check();
