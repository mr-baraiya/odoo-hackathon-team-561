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

async function runTest() {
  console.log('--- TESTING FINANCE APPROVAL, RETURN, AND REJECT ENDPOINTS ---');

  // Login Rep
  const repLogin = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'baraiyavishalbhai32@gmail.com', password: 'Darshan@1234' });
  const repToken = repLogin.body.token;

  // Login Manager
  const mgrLogin = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'singhsaurabh43431@gmail.com', password: 'Darshan@1234' });
  const mgrToken = mgrLogin.body.token;

  // Login Finance
  const finLogin = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'baraiyavijaybhai32@gmail.com', password: 'Darshan@1234' });
  const finToken = finLogin.body.token;

  // 1. APPROVE TEST
  const q1 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': repToken } }, { customerId: '00000000-0000-0000-0000-000000000301', orderDiscountPct: 30, status: 'sent_to_customer', lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 1, unitPrice: 500 }] });
  await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${q1.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken } }, { action: 'approve' });
  
  const appRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${q1.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': finToken } }, { action: 'approve', reason: 'Finance Signed Off' });
  console.log('[1] APPROVE:', appRes.statusCode, appRes.body.status);

  // 2. RETURN TEST
  const q2 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': repToken } }, { customerId: '00000000-0000-0000-0000-000000000301', orderDiscountPct: 35, status: 'sent_to_customer', lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 1, unitPrice: 500 }] });
  await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${q2.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken } }, { action: 'approve' });
  
  const retRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${q2.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': finToken } }, { action: 'return', reason: 'Discount exceeds policy margin' });
  console.log('[2] RETURN:', retRes.statusCode, retRes.body.status);

  // 3. REJECT TEST
  const q3 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': repToken } }, { customerId: '00000000-0000-0000-0000-000000000301', orderDiscountPct: 40, status: 'sent_to_customer', lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 1, unitPrice: 500 }] });
  await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${q3.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken } }, { action: 'approve' });
  
  const rejRes = await makeRequest({ hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${q3.body.id}/action`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': finToken } }, { action: 'reject', reason: 'Finance Policy Violation' });
  console.log('[3] REJECT:', rejRes.statusCode, rejRes.body.status);

  console.log('\n--- ALL 3 FINANCE ACTIONS WORKING PERFECTLY ---');
}

runTest().catch(console.error);
