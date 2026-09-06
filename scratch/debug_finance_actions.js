const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: { raw: data } });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function debugFinanceActions() {
  console.log('--- DEBUGGING FINANCE ACTIONS (Approve, Return, Reject) ---');

  // Login as Sales Rep
  const repLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'baraiyavishalbhai32@gmail.com', password: 'Darshan@1234' });
  const repToken = repLogin.body.token;

  // Login as Sales Manager
  const mgrLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'singhsaurabh43431@gmail.com', password: 'Darshan@1234' });
  const mgrToken = mgrLogin.body.token;

  // Login as Finance Ops
  const finLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'baraiyavijaybhai32@gmail.com', password: 'Darshan@1234' });
  const finToken = finLogin.body.token;

  // TEST CASE 1: APPROVE
  console.log('\n[TEST 1: APPROVE BY FINANCE]');
  const q1 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': repToken }
  }, { customerId: '00000000-0000-0000-0000-000000000301', orderDiscountPct: 30, status: 'sent_to_customer', lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 1, unitPrice: 500 }] });
  
  await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${q1.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken } }, { action: 'approve' });
  
  const finApproveRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${q1.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': finToken } }, { action: 'approve', reason: 'Finance Approved' });
  console.log('Approve result:', finApproveRes.statusCode, finApproveRes.body);

  // TEST CASE 2: RETURN
  console.log('\n[TEST 2: RETURN BY FINANCE]');
  const q2 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': repToken }
  }, { customerId: '00000000-0000-0000-0000-000000000301', orderDiscountPct: 30, status: 'sent_to_customer', lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 1, unitPrice: 500 }] });
  
  await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${q2.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken } }, { action: 'approve' });
  
  const finReturnRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${q2.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': finToken } }, { action: 'return', reason: 'Discount too high' });
  console.log('Return result:', finReturnRes.statusCode, finReturnRes.body);

  // TEST CASE 3: REJECT
  console.log('\n[TEST 3: REJECT BY FINANCE]');
  const q3 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': repToken }
  }, { customerId: '00000000-0000-0000-0000-000000000301', orderDiscountPct: 30, status: 'sent_to_customer', lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 1, unitPrice: 500 }] });
  
  await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${q3.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken } }, { action: 'approve' });
  
  const finRejectRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${q3.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': finToken } }, { action: 'reject', reason: 'Rejected by Finance' });
  console.log('Reject result:', finRejectRes.statusCode, finRejectRes.body);
}

debugFinanceActions().catch(console.error);
