/**
 * Comprehensive Backend Security & Role-Based Access Control (RBAC) Verification Test
 */

const path = require('path');
const moduleAlias = require(path.join(__dirname, '../backend/node_modules/module-alias'));
moduleAlias.addAlias('@', path.join(__dirname, '../backend/src'));

const app = require('../backend/src/app');

async function runSecurityTests() {
  console.log('====================================================');
  console.log(' DealFlow360 — Backend Security & RBAC Suite Test');
  console.log('====================================================\n');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  async function checkSecurity(name, method, endpointPath, token, expectedStatus) {
    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      };

      const res = await fetch(`${baseUrl}${endpointPath}`, opts);
      const resData = await res.json().catch(() => null);

      if (res.status === expectedStatus) {
        console.log(`[PASS] ${name} (${method} ${endpointPath}) -> Got expected HTTP ${res.status}`);
        passed++;
      } else {
        console.log(`[FAIL] ${name} (${method} ${endpointPath}) -> Expected HTTP ${expectedStatus}, but got HTTP ${res.status}:`, resData);
        failed++;
      }
    } catch (err) {
      console.log(`[ERROR] ${name} (${method} ${endpointPath}):`, err.message);
      failed++;
    }
  }

  try {
    console.log('--- 1. Testing Unauthenticated Request Restrictions (HTTP 401 Expectation) ---');
    await checkSecurity('Unauthenticated Audit Access', 'GET', '/api/audit', null, 401);
    await checkSecurity('Unauthenticated Users Access', 'GET', '/api/users', null, 401);
    await checkSecurity('Unauthenticated Dashboard Access', 'GET', '/api/dashboard/summary', null, 401);
    await checkSecurity('Unauthenticated Reports Access', 'GET', '/api/reports/sales', null, 401);

    console.log('\n--- 2. Testing Role-Based Authorization Restrictions (HTTP 403 Expectation for Sales Rep) ---');
    // Token jwt_101 belongs to Sales Rep (Vishal) who should NOT access Admin Audit / Admin User Creation / Admin Reports
    await checkSecurity('Sales Rep Access to Audit Logs', 'GET', '/api/audit', 'jwt_101', 403);
    await checkSecurity('Sales Rep User Creation (Admin Only)', 'POST', '/api/users', 'jwt_101', 403);
    await checkSecurity('Sales Rep Tier Deletion (Admin Only)', 'DELETE', '/api/customer-tiers/201', 'jwt_101', 403);

    console.log('\n--- 3. Testing Authorized Role Access (HTTP 200/201 Expectation for Admin) ---');
    // Token jwt_105 belongs to Admin (vvbaraiya) who SHOULD access Audit Logs / Dashboard / Reports
    await checkSecurity('Admin Access to Audit Logs', 'GET', '/api/audit', 'jwt_105', 200);
    await checkSecurity('Admin Access to Users List', 'GET', '/api/users', 'jwt_105', 200);
    await checkSecurity('Admin Access to Dashboard Summary', 'GET', '/api/dashboard/summary', 'jwt_105', 200);
    await checkSecurity('Admin Access to Reports Sales', 'GET', '/api/reports/sales', 'jwt_105', 200);
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runSecurityTests().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
