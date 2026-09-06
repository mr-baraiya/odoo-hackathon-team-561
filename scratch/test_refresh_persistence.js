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
  console.log('--- TESTING REFRESH PERSISTENCE FOR SALES MANAGER & FINANCE APPROVAL QUEUES ---');

  // Login tokens
  const repToken = (await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'baraiyavishalbhai32@gmail.com', password: 'Darshan@1234' })).body.token;
  const mgrToken = (await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'singhsaurabh43431@gmail.com', password: 'Darshan@1234' })).body.token;
  const finToken = (await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { email: 'baraiyavijaybhai32@gmail.com', password: 'Darshan@1234' })).body.token;

  // 1. Sales Rep submits quotation with 30% discount
  console.log('\n[1] Submitting 30% discount quotation...');
  const createRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': repToken }
  }, { customerId: '00000000-0000-0000-0000-000000000301', orderDiscountPct: 30, status: 'sent_to_customer', lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 1, unitPrice: 1000 }] });
  
  const quoteId = createRes.body.id;
  const quoteNumber = createRes.body.quote_number;
  console.log(`Created Quote ${quoteNumber} (${quoteId}).`);

  // 2. Fetch Sales Manager Queue before approval
  const mgrQueue1 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/sales-manager/approvals', method: 'GET', headers: { 'Authorization': mgrToken } });
  const inMgrBefore = (mgrQueue1.body.data || []).some(q => q.quote_number === quoteNumber || q.quotation_id === quoteId);
  console.log(`[2] Quote ${quoteNumber} present in Manager Queue BEFORE approval? ${inMgrBefore}`);

  // 3. Sales Manager approves Step 1 & forwards to Finance
  console.log('\n[3] Sales Manager approves Step 1 & forwards to Finance...');
  const mgrActionRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${quoteId}/action`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken }
  }, { action: 'approve', comments: 'Approved Step 1' });
  console.log(`Manager action response: ${mgrActionRes.body.message}`);

  // 4. SIMULATE PAGE REFRESH: Fetch Sales Manager Queue AGAIN!
  console.log('\n[4] SIMULATING PAGE REFRESH in Sales Manager portal...');
  const mgrQueue2 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/sales-manager/approvals', method: 'GET', headers: { 'Authorization': mgrToken } });
  const inMgrAfter = (mgrQueue2.body.data || []).some(q => q.quote_number === quoteNumber || q.quotation_id === quoteId);
  console.log(`[VERIFICATION] Quote ${quoteNumber} present in Manager Queue AFTER REFRESH? ${inMgrAfter} (Expected: false)`);

  // 5. Fetch Finance Queue
  console.log('\n[5] Fetching Finance Ops Queue...');
  const finQueue1 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/finance-ops/approvals', method: 'GET', headers: { 'Authorization': finToken } });
  const inFinBefore = (finQueue1.body.data || []).some(q => q.quote_number === quoteNumber || q.quotation_id === quoteId);
  console.log(`[5] Quote ${quoteNumber} present in Finance Queue BEFORE Finance action? ${inFinBefore} (Expected: true)`);

  // 6. Finance Ops approves Step 2
  console.log('\n[6] Finance Ops approves Step 2...');
  const finActionRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${quoteId}/action`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': finToken }
  }, { action: 'approve', reason: 'Finance sign-off complete' });
  console.log(`Finance action response: ${finActionRes.body.message}`);

  // 7. SIMULATE PAGE REFRESH: Fetch Finance Queue AGAIN!
  console.log('\n[7] SIMULATING PAGE REFRESH in Finance portal...');
  const finQueue2 = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/finance-ops/approvals', method: 'GET', headers: { 'Authorization': finToken } });
  const inFinAfter = (finQueue2.body.data || []).some(q => q.quote_number === quoteNumber || q.quotation_id === quoteId);
  console.log(`[VERIFICATION] Quote ${quoteNumber} present in Finance Queue AFTER REFRESH? ${inFinAfter} (Expected: false)`);

  if (!inMgrAfter && inFinBefore && !inFinAfter) {
    console.log('\n✅ TEST PASSED 100%! REFRESH PERSISTENCE FIXED FOR ALL ROLES!');
  } else {
    console.error('\n❌ TEST FAILED! Check logic!');
  }
}

runTest().catch(console.error);
