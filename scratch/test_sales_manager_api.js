const http = require('http');

const token = 'jwt_102';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/sales-manager${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function run() {
  console.log('Testing Sales Manager APIs with jwt_102...');
  const paths = ['/dashboard', '/approvals', '/discounts', '/negotiations', '/team', '/customers', '/pipeline', '/fulfillment', '/analytics', '/notifications'];

  for (const path of paths) {
    try {
      const res = await makeRequest(path);
      console.log(`\n=== GET /api/sales-manager${path} ===`);
      console.log('Success:', res.success);
      console.log('Data Preview:', JSON.stringify(res.data).substring(0, 150) + '...');
    } catch (err) {
      console.error(`Error ${path}:`, err.message);
    }
  }
}

run();
