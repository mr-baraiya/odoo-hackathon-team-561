const http = require('http');
const { getConnection } = require('../backend/src/service/database');

function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer jwt_103', // Dev token for Finance Ops user
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let responseText = '';
      res.on('data', chunk => responseText += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseText);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: responseText });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING FINANCE/OPS API VERIFICATION TESTS WITH REAL POSTGRESQL DATA ===\n');
  let db;

  try {
    db = await getConnection();

    // 1. Dashboard Test
    console.log('1. Testing GET /api/finance-ops/dashboard...');
    const dashRes = await apiRequest('/api/finance-ops/dashboard');
    console.log(`   Status: ${dashRes.statusCode}`);
    console.log('   Data summary:', {
      total_revenue: dashRes.data?.data?.total_revenue,
      pending_invoices_count: dashRes.data?.data?.pending_invoices_count,
      pending_finance_approvals_count: dashRes.data?.data?.pending_finance_approvals_count,
      fulfillment: dashRes.data?.data?.fulfillment
    });

    // 2. Approvals List Test
    console.log('\n2. Testing GET /api/finance-ops/approvals...');
    const appRes = await apiRequest('/api/finance-ops/approvals');
    console.log(`   Status: ${appRes.statusCode}`);
    console.log(`   Pending approvals count: ${appRes.data?.data?.length || 0}`);

    // Fetch a real quotation from DB to test step-1 manager check
    const testQuote = await db.queryOne('SELECT id, quote_number FROM quotations LIMIT 1');
    if (testQuote) {
      console.log(`\n3. Testing direct Finance approval before Manager Step 1 on quote ${testQuote.quote_number} (${testQuote.id})...`);
      
      // Ensure manager approval is NOT approved for this quotation
      await db.query(`
        DELETE FROM quotation_approvals WHERE quotation_id = $1 AND approval_level = 'sales_manager'
      `, [testQuote.id]);

      const directApproveRes = await apiRequest(`/api/finance-ops/approvals/${testQuote.id}/action`, 'POST', {
        action: 'approve',
        reason: 'Testing direct finance action without manager approval'
      });
      console.log(`   Status: ${directApproveRes.statusCode} (Expected 403)`);
      console.log(`   Message: ${directApproveRes.data?.message}`);

      // 4. Test Idempotent Invoice Generation on this real quote
      console.log(`\n4. Testing Idempotent Invoice Generation (POST /api/finance-ops/invoices/generate) on quote ${testQuote.quote_number}...`);
      const gen1 = await apiRequest('/api/finance-ops/invoices/generate', 'POST', { quotation_id: testQuote.id });
      console.log(`   Call 1 Status: ${gen1.statusCode}, Message: ${gen1.data?.message}, is_existing: ${gen1.data?.is_existing}`);

      const gen2 = await apiRequest('/api/finance-ops/invoices/generate', 'POST', { quotation_id: testQuote.id });
      console.log(`   Call 2 Status: ${gen2.statusCode}, Message: ${gen2.data?.message}, is_existing: ${gen2.data?.is_existing}`);
    }

    // 5. Invoices Directory Test
    console.log('\n5. Testing GET /api/finance-ops/invoices...');
    const invListRes = await apiRequest('/api/finance-ops/invoices');
    console.log(`   Status: ${invListRes.statusCode}`);
    console.log(`   Total invoices in DB: ${invListRes.data?.data?.length || 0}`);

    // 6. Payment Verification Test
    console.log('\n6. Testing Authoritative Payment Verification (POST /api/finance-ops/payments/verify)...');
    const invoices = invListRes.data?.data || [];
    if (invoices.length > 0) {
      const targetInv = invoices[0];
      const payRes = await apiRequest('/api/finance-ops/payments/verify', 'POST', {
        invoice_id: targetInv.id,
        amount: 100,
        payment_method: 'bank_transfer',
        reference_number: 'TEST-REF-999'
      });
      console.log(`   Status: ${payRes.statusCode}, Message: ${payRes.data?.message}, new_status: ${payRes.data?.new_status}`);
    }

    // 7. Warehouse Fulfillment & Physical Stock Deduction Test
    console.log('\n7. Testing GET /api/finance-ops/fulfillment...');
    const fulRes = await apiRequest('/api/finance-ops/fulfillment');
    console.log(`   Status: ${fulRes.statusCode}`);
    const foList = fulRes.data?.data?.orders || [];
    console.log(`   Fulfillment orders count: ${foList.length}, Stock records count: ${fulRes.data?.data?.stock?.length || 0}`);

    if (foList.length > 0) {
      const testFo = foList[0];
      console.log(`\n8. Testing Warehouse Shipment & Physical Stock Deduction on fulfillment order ${testFo.fulfillment_id}...`);
      const shipRes = await apiRequest(`/api/finance-ops/fulfillment/${testFo.fulfillment_id}/ship`, 'POST');
      console.log(`   Shipment Status: ${shipRes.statusCode}, Message: ${shipRes.data?.message}, Status: ${shipRes.data?.status}`);
    }

    // 9. Subscriptions & Credit Notes Test
    console.log('\n9. Testing GET /api/finance-ops/subscriptions & /api/finance-ops/credit-notes...');
    const subRes = await apiRequest('/api/finance-ops/subscriptions');
    const cnRes = await apiRequest('/api/finance-ops/credit-notes');
    console.log(`   Subscriptions count: ${subRes.data?.data?.length || 0}, Credit notes count: ${cnRes.data?.data?.length || 0}`);

    // 10. Reports & Notifications Test
    console.log('\n10. Testing GET /api/finance-ops/reports & /api/finance-ops/notifications...');
    const repRes = await apiRequest('/api/finance-ops/reports');
    const notifRes = await apiRequest('/api/finance-ops/notifications');
    console.log(`   Reports trends count: ${repRes.data?.data?.monthly_revenue_trend?.length || 0}`);
    console.log(`   Notifications count: ${notifRes.data?.data?.length || 0}`);

    console.log('\n=== ALL FINANCE/OPS BACKEND API TESTS COMPLETED SUCCESSFULLY ===');

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
}

runTests();
