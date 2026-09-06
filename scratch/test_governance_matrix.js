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

async function runTests() {
  console.log('--- TESTING DISCOUNT GOVERNANCE RULES WITH JWT AUTH ---');

  // Step 0: Login as Sales Rep
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'baraiyavishalbhai32@gmail.com', password: 'Darshan@1234' });

  const token = loginRes.body.token;
  console.log('Login Result:', loginRes.statusCode, token ? 'Token Acquired!' : 'No Token', loginRes.body.user?.email);

  if (!token) {
    console.error('Failed to log in:', loginRes.body);
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token
  };

  // Test 1: Discount 3% (<= 5%) -> Direct Send
  console.log('\n[Test 1] 3% Discount (<= 5%)');
  const res1 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/quotations',
    method: 'POST',
    headers: authHeaders
  }, {
    customer_id: '10000000-0000-0000-0000-000000000001',
    discount_pct: 3,
    status: 'sent_to_customer',
    items: [{ product_id: '20000000-0000-0000-0000-000000000001', quantity: 2, unit_price: 500 }]
  });
  console.log(`Status: ${res1.statusCode}, Quote Status: ${res1.body.data?.status || res1.body.status}`);

  // Test 2: Discount 15% (> 5% & <= 25%) -> Sales Manager Approval
  console.log('\n[Test 2] 15% Discount (> 5% & <= 25%)');
  const res2 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/quotations',
    method: 'POST',
    headers: authHeaders
  }, {
    customer_id: '10000000-0000-0000-0000-000000000001',
    discount_pct: 15,
    status: 'sent_to_customer',
    items: [{ product_id: '20000000-0000-0000-0000-000000000001', quantity: 2, unit_price: 500 }]
  });
  console.log(`Status: ${res2.statusCode}, Final Quote Status: ${res2.body.data?.status}`);

  // Test 3: Discount 35% (> 25% & <= 50%) -> Sales Manager + Finance/Ops Approval
  console.log('\n[Test 3] 35% Discount (> 25% & <= 50%)');
  const res3 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/quotations',
    method: 'POST',
    headers: authHeaders
  }, {
    customer_id: '10000000-0000-0000-0000-000000000001',
    discount_pct: 35,
    status: 'sent_to_customer',
    items: [{ product_id: '20000000-0000-0000-0000-000000000001', quantity: 2, unit_price: 500 }]
  });
  console.log(`Status: ${res3.statusCode}, Final Quote Status: ${res3.body.data?.status}`);

  // Test 4: Discount 60% (> 50%) -> Blocked
  console.log('\n[Test 4] 60% Discount (> 50%)');
  const res4 = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/quotations',
    method: 'POST',
    headers: authHeaders
  }, {
    customer_id: '10000000-0000-0000-0000-000000000001',
    discount_pct: 60,
    status: 'sent_to_customer',
    items: [{ product_id: '20000000-0000-0000-0000-000000000001', quantity: 2, unit_price: 500 }]
  });
  console.log(`Status: ${res4.statusCode}, Allowed: ${res4.body.success}, Message: ${res4.body.message}`);

  console.log('\n--- DISCOUNT GOVERNANCE TESTS COMPLETE ---');
}

runTests().catch(console.error);
