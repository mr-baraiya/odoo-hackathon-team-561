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

  console.log('--- TESTING GET /api/audit ---');
  const resAudit = await makeRequest('/audit', 'GET', null, token);
  console.log('Audit Status:', resAudit.status, 'Count:', resAudit.body?.length);
  if (resAudit.body?.length > 0) {
    console.log('Sample audit record:', resAudit.body[0]);
  }

  console.log('\n--- TESTING GET /api/audit/summary ---');
  const resSummary = await makeRequest('/audit/summary', 'GET', null, token);
  console.log('Summary Status:', resSummary.status, resSummary.body);

  process.exit(0);
}

run();
