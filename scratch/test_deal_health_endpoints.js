const http = require('http');

function makeRequest(path, method = 'GET', postData = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  const loginRes = await makeRequest('/auth/login', 'POST', {
    email: 'vvbaraiya32@gmail.com',
    password: 'password123'
  });

  const token = loginRes.body?.token;

  console.log('\n--- TESTING ALERTS ---');
  const resAlerts = await makeRequest('/deal-health/alerts', 'GET', null, token);
  console.log('Alerts Status:', resAlerts.status, 'Count:', resAlerts.body?.length);

  console.log('\n--- TESTING SUMMARY ---');
  const resSummary = await makeRequest('/deal-health/summary', 'GET', null, token);
  console.log('Summary Status:', resSummary.status, resSummary.body);

  console.log('\n--- TESTING STALLED DEALS ---');
  const resStalled = await makeRequest('/deal-health/stalled', 'GET', null, token);
  console.log('Stalled Status:', resStalled.status, 'Count:', resStalled.body?.length);

  console.log('\n--- TESTING SLIPPAGES ---');
  const resSlippages = await makeRequest('/deal-health/slippages', 'GET', null, token);
  console.log('Slippages Status:', resSlippages.status, 'Count:', resSlippages.body?.length);

  process.exit(0);
}

run();
