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

async function testForwardingFlow() {
  console.log('--- TESTING DUAL APPROVAL FORWARDING FLOW (>25%) ---');

  // 1. Login Sales Rep
  const repLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'baraiyavishalbhai32@gmail.com', password: 'Darshan@1234' });

  const repToken = repLogin.body.token;

  // 2. Submit Quotation with 30% discount
  console.log('\n[Step 1] Sales Rep submits quote with 30% discount...');
  const createRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/quotations', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': repToken }
  }, {
    customerId: '00000000-0000-0000-0000-000000000301',
    orderDiscountPct: 30,
    status: 'sent_to_customer',
    lineItems: [{ productId: '00000000-0000-0000-0000-000000000501', quantity: 2, unitPrice: 1000 }]
  });

  const quoteId = createRes.body.id;
  const quoteNumber = createRes.body.quote_number;
  console.log(`Created Quote ${quoteNumber} (ID: ${quoteId}) with 30% discount. Status in DB: ${createRes.body.status}`);

  // 3. Login Sales Manager
  const mgrLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'singhsaurabh43431@gmail.com', password: 'Darshan@1234' });

  const mgrToken = mgrLogin.body.token;

  // 4. Sales Manager approves Step 1 & forwards to Finance
  console.log('\n[Step 2] Sales Manager approves Step 1 & forwards to Finance...');
  const mgrActionRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/sales-manager/approvals/${quoteId}/action`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': mgrToken }
  }, { action: 'approve', comments: 'Approved Step 1. Forwarding to Finance.' });

  console.log(`Manager Action Status: ${mgrActionRes.statusCode}`);
  console.log(`Manager Message: ${mgrActionRes.body.message}`);
  console.log(`New Quotation Status: ${mgrActionRes.body.data?.status}`);

  // 5. Login Finance Ops
  const finLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'baraiyavijaybhai32@gmail.com', password: 'Darshan@1234' });

  const finToken = finLogin.body.token;

  // 6. Check Finance Ops pending approvals queue
  console.log('\n[Step 3] Finance Ops checks pending queue...');
  const finQueueRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/finance-ops/approvals', method: 'GET',
    headers: { 'Authorization': finToken }
  });

  const pendingInFin = (finQueueRes.body.data || []).find(q => q.quote_number === quoteNumber || q.quotation_id === quoteId);
  console.log(`Quote ${quoteNumber} found in Finance Queue? ${Boolean(pendingInFin)}`);

  // 7. Finance Ops executes Step 2 final approval
  if (pendingInFin) {
    console.log('\n[Step 4] Finance Ops executes Step 2 final approval...');
    const finActionRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/finance-ops/approvals/${quoteId}/action`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': finToken }
    }, { action: 'approve', reason: 'Finance sign-off complete. Approved.' });

    console.log(`Finance Action Status: ${finActionRes.statusCode}`);
    console.log(`Finance Message: ${finActionRes.body.message}`);

    // Verify Final Status via GET /api/quotations/:id
    const verifyRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/quotations/${quoteId}`, method: 'GET',
      headers: { 'Authorization': repToken }
    });
    console.log(`FINAL VERIFIED QUOTATION STATUS IN DB: ${verifyRes.body.status}`);
  }

  console.log('\n--- DUAL APPROVAL FORWARDING TEST COMPLETE ---');
}

testForwardingFlow().catch(console.error);
