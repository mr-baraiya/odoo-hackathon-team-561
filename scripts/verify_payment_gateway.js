const path = require('path');
const moduleAlias = require(path.join(__dirname, '../backend/node_modules/module-alias'));
moduleAlias.addAlias('@', path.join(__dirname, '../backend/src'));

const axios = require('../backend/node_modules/axios');
const jwt = require('../backend/node_modules/jsonwebtoken');
const app = require('../backend/src/app');

const JWT_SECRET = 'dealflow360_super_secret_jwt_key_2026';

function generateToken(role = 'admin', userId = '101') {
  return jwt.sign({ id: userId, username: 'testuser', role, email: 'test@dealflow360.com' }, JWT_SECRET, { expiresIn: '1h' });
}

async function runPaymentGatewayTests() {
  console.log('====================================================');
  console.log(' DealFlow360 — Payment Gateway APIs Verification ');
  console.log('====================================================\n');

  const server = app.listen(0);
  const port = server.address().port;
  const BASE_URL = `http://127.0.0.1:${port}`;

  let passed = 0;
  let failed = 0;

  const adminToken = generateToken('admin', '901');
  const customerToken = generateToken('customer', '104');
  const salesRepToken = generateToken('sales_rep', '101');
  const salesManagerToken = generateToken('sales_manager', '102');
  const financeOpsToken = generateToken('finance_ops', '103');


  try {
    // 1. Create Order (POST /api/payments/create-order)
    try {
      const res = await axios.post(
        `${BASE_URL}/api/payments/create-order`,
        { invoice_id: 'inv_1101', amount: 6390.0, currency: 'INR' },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (res.status === 201 && res.data.success && res.data.order_id) {
        console.log(`[PASS] 1. Create Payment Order (POST /api/payments/create-order) -> Order ID: ${res.data.order_id}`);
        passed++;
      } else {
        console.error(`[FAIL] 1. Create Payment Order -> Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] 1. Create Payment Order -> ${err.message}`);
      failed++;
    }

    // 2. Verify Payment (POST /api/payments/verify)
    let testPaymentId = 'pay_101';
    try {
      const res = await axios.post(
        `${BASE_URL}/api/payments/verify`,
        {
          invoice_id: 'inv_1101',
          razorpay_order_id: 'order_DF360_101',
          razorpay_payment_id: 'pay_rzp_test_998877',
          razorpay_signature: 'test_signature_valid',
        },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );

      if (res.status === 200 && res.data.success && res.data.status === 'completed') {
        testPaymentId = res.data.payment_id;
        console.log(`[PASS] 2. Verify Payment (POST /api/payments/verify) -> Payment Verified (${res.data.status})`);
        passed++;
      } else {
        console.error(`[FAIL] 2. Verify Payment -> Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] 2. Verify Payment -> ${err.message}`);
      failed++;
    }

    // 3. Webhook (POST /api/payments/webhook)
    try {
      const res = await axios.post(`${BASE_URL}/api/payments/webhook`, {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_rzp_webhook_123',
              order_id: 'order_DF360_101',
              amount: 639000,
              currency: 'INR',
            },
          },
        },
      });

      if (res.status === 200 && res.data.status === 'ok') {
        console.log(`[PASS] 3. Webhook Notification (POST /api/payments/webhook) -> Event Captured`);
        passed++;
      } else {
        console.error(`[FAIL] 3. Webhook Notification -> Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] 3. Webhook Notification -> ${err.message}`);
      failed++;
    }

    // 4. List Payments (GET /api/payments) - Sales Manager / Finance / Admin
    try {
      const res = await axios.get(`${BASE_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${salesManagerToken}` },
      });

      if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
        console.log(`[PASS] 4. List All Payments (GET /api/payments) -> Retrieved ${res.data.length} records`);
        passed++;
      } else {
        console.error(`[FAIL] 4. List All Payments -> Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] 4. List All Payments -> ${err.message}`);
      failed++;
    }

    // 5. Get Payment Details (GET /api/payments/:id) - Sales Rep / Manager / Finance / Admin
    try {
      const res = await axios.get(`${BASE_URL}/api/payments/${testPaymentId}`, {
        headers: { Authorization: `Bearer ${salesRepToken}` },
      });

      if (res.status === 200 && res.data.id === testPaymentId) {
        console.log(`[PASS] 5. Get Payment Details (GET /api/payments/:id) -> Details fetched for ${res.data.id}`);
        passed++;
      } else {
        console.error(`[FAIL] 5. Get Payment Details -> Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] 5. Get Payment Details -> ${err.message}`);
      failed++;
    }

    // 6. Check Payment Status (GET /api/payments/:id/status) - All Roles (Customer tested here)
    try {
      const res = await axios.get(`${BASE_URL}/api/payments/${testPaymentId}/status`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });

      if (res.status === 200 && res.data.status) {
        console.log(`[PASS] 6. Check Payment Status (GET /api/payments/:id/status) -> Status: ${res.data.status}`);
        passed++;
      } else {
        console.error(`[FAIL] 6. Check Payment Status -> Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] 6. Check Payment Status -> ${err.message}`);
      failed++;
    }

    // 7. Initiate Refund (POST /api/payments/:id/refund) - Finance Ops / Admin
    try {
      const res = await axios.post(
        `${BASE_URL}/api/payments/${testPaymentId}/refund`,
        { amount: 6390.0, reason: 'Customer requested cancellation' },
        { headers: { Authorization: `Bearer ${financeOpsToken}` } }
      );

      if (res.status === 200 && res.data.success && res.data.status === 'refunded') {
        console.log(`[PASS] 7. Initiate Refund (POST /api/payments/:id/refund) -> Refunded ${res.data.amount_refunded} (${res.data.status})`);
        passed++;
      } else {
        console.error(`[FAIL] 7. Initiate Refund -> Status ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] 7. Initiate Refund -> ${err.message}`);
      failed++;
    }

    // 8. RBAC Security Guard Test: Customer trying to issue refund (Should receive 403 Forbidden)
    try {
      await axios.post(
        `${BASE_URL}/api/payments/${testPaymentId}/refund`,
        { amount: 100 },
        { headers: { Authorization: `Bearer ${customerToken}` } }
      );
      console.error('[FAIL] 8. RBAC Guard -> Customer was allowed to refund (Expected 403)');
      failed++;
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log(`[PASS] 8. RBAC Guard (Customer Refund Attempt) -> Forbidden (HTTP 403 as expected)`);
        passed++;
      } else {
        console.error(`[FAIL] 8. RBAC Guard -> Got status ${err.response?.status}`);
        failed++;
      }
    }

    // 9. RBAC Security Guard Test: Sales Rep trying to list all payments (Should receive 403 Forbidden)
    try {
      await axios.get(`${BASE_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${salesRepToken}` },
      });
      console.error('[FAIL] 9. RBAC Guard -> Sales Rep was allowed to list all payments (Expected 403)');
      failed++;
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log(`[PASS] 9. RBAC Guard (Sales Rep List All Payments Attempt) -> Forbidden (HTTP 403 as expected)`);
        passed++;
      } else {
        console.error(`[FAIL] 9. RBAC Guard -> Got status ${err.response?.status}`);
        failed++;
      }
    }
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runPaymentGatewayTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
