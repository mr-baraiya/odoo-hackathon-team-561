/**
 * Comprehensive API Suite Integration Test for DealFlow360
 */

const path = require('path');
const moduleAlias = require(path.join(__dirname, '../backend/node_modules/module-alias'));
moduleAlias.addAlias('@', path.join(__dirname, '../backend/src'));

const app = require('../backend/src/app');

async function runApiSuiteTests() {
  console.log('====================================================');
  console.log(' DealFlow360 — 30 API Modules Real HTTP Test');
  console.log('====================================================\n');

  // Start temporary HTTP server on ephemeral port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  async function check(name, method, endpointPath, body = null, token = 'jwt_105') {
    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      };
      if (body) {
        opts.body = JSON.stringify(body);
      }

      const res = await fetch(`${baseUrl}${endpointPath}`, opts);
      const resData = await res.json().catch(() => null);

      if (res.status >= 200 && res.status < 400) {
        console.log(`[PASS] ${name} (${method} ${endpointPath}) -> HTTP ${res.status}`);
        passed++;
      } else {
        console.log(`[FAIL] ${name} (${method} ${endpointPath}) -> HTTP ${res.status}:`, resData);
        failed++;
      }
    } catch (err) {
      console.log(`[ERROR] ${name} (${method} ${endpointPath}):`, err.message);
      failed++;
    }
  }

  try {
    // 1. Auth
    await check('Auth - Login', 'POST', '/api/auth/login', { email: 'baraiyavishalbhai32@gmail.com', password: 'Darshan@1234' }, null);
    await check('Auth - Me', 'GET', '/api/auth/me');

    // 2. Users
    await check('Users - List', 'GET', '/api/users');

    // 3. Customers
    await check('Customers - List', 'GET', '/api/customers');

    // 4. Tiers
    await check('Customer Tiers - List', 'GET', '/api/customer-tiers');

    // 5. Catalog
    await check('Categories - List', 'GET', '/api/categories');
    await check('Products - List', 'GET', '/api/products');

    // 6. Price Lists
    await check('Price Lists - List', 'GET', '/api/price-lists');

    // 7. Discount Rules
    await check('Discount Rules - List', 'GET', '/api/discount/rules');

    // 8. Quotations
    await check('Quotations - List', 'GET', '/api/quotations');

    // 9. Approvals
    await check('Approvals - Pending', 'GET', '/api/approvals/pending');

    // 10. Negotiations
    await check('Negotiations - List', 'GET', '/api/negotiations');

    // 11. Upsell
    await check('Upsell - Rules', 'GET', '/api/upsell-rules');

    // 12. Warehouses
    await check('Warehouses - List', 'GET', '/api/warehouses');

    // 13. Inventory
    await check('Inventory - List', 'GET', '/api/inventory');

    // 14. Orders
    await check('Orders - List', 'GET', '/api/orders');

    // 15. Fulfillment
    await check('Fulfillment - Splits', 'GET', '/api/fulfillment/splits/1101');

    // 16. Subscriptions
    await check('Subscriptions - List', 'GET', '/api/subscriptions');
    await check('Subscription Plans - List', 'GET', '/api/subscription-plans');

    // 17. Billing / Invoices
    await check('Invoices - List', 'GET', '/api/invoices');
    await check('Payments - List', 'GET', '/api/payments');
    await check('Credit Notes - List', 'GET', '/api/credit-notes');

    // 18. Deal Health
    await check('Deal Health - Alerts', 'GET', '/api/deal-health/alerts');
    await check('Discount History - List', 'GET', '/api/discount-history');

    // 19. Dashboard
    await check('Dashboard - Summary', 'GET', '/api/dashboard/summary');

    // 20. Reports
    await check('Reports - Sales', 'GET', '/api/reports/sales');

    // 21. WhatsApp
    await check('WhatsApp - Menu', 'GET', '/api/whatsapp/menu');

    // 22. Email
    await check('Email - Send Quotation', 'POST', '/api/email/send-quotation', { quotationId: '1101', recipientEmail: 'test@example.com' });

    // 23. Notifications
    await check('Notifications - List', 'GET', '/api/notifications');

    // 24. Audit Log
    await check('Audit Log - List', 'GET', '/api/audit');
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runApiSuiteTests().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
