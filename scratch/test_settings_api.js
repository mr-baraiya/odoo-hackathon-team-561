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

  console.log('--- TESTING GET /api/settings ---');
  const resGet = await makeRequest('/settings', 'GET', null, token);
  console.log('GET Status:', resGet.status);
  console.log('Company Name:', resGet.body?.company?.company_name);
  console.log('Default Tax Rate:', resGet.body?.tax?.default_tax_rate);
  console.log('Base Currency:', resGet.body?.currency?.base_currency);
  console.log('Session Timeout:', resGet.body?.security?.session_timeout_minutes);

  console.log('\n--- TESTING POST /api/settings (UPDATE) ---');
  const resPost = await makeRequest('/settings', 'POST', {
    company: { company_name: 'DealFlow360 Global Inc.' },
    tax: { default_tax_rate: 20.0 }
  }, token);
  console.log('POST Status:', resPost.status, resPost.body?.message);
  console.log('Updated Company Name:', resPost.body?.settings?.company?.company_name);
  console.log('Updated Tax Rate:', resPost.body?.settings?.tax?.default_tax_rate);

  process.exit(0);
}

run();
