const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTest() {
  console.log('Testing forgot password link generation logic...');
  
  // Test 1: Passing explicit frontendUrl in body
  const res1 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'baraiyavishalbhai32@gmail.com', frontendUrl: 'https://dealflow360.vercel.app' }
  );

  console.log('\n--- Test 1 (Payload frontendUrl = https://dealflow360.vercel.app) ---');
  console.log('Status:', res1.status);
  console.log('Reset URL:', res1.body.resetUrl);

  if (res1.body.resetUrl && res1.body.resetUrl.startsWith('https://dealflow360.vercel.app')) {
    console.log('SUCCESS: Reset URL starts with custom frontendUrl payload!');
  } else {
    console.error('FAILED: Reset URL does not match custom payload');
  }

  // Test 2: Passing Origin header
  const res2 = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://custom-domain.com',
      },
    },
    { email: 'baraiyavishalbhai32@gmail.com' }
  );

  console.log('\n--- Test 2 (Origin Header = https://custom-domain.com) ---');
  console.log('Status:', res2.status);
  console.log('Reset URL:', res2.body.resetUrl);

  if (res2.body.resetUrl && res2.body.resetUrl.startsWith('https://custom-domain.com')) {
    console.log('SUCCESS: Reset URL derived from Origin header!');
  } else {
    console.error('FAILED: Reset URL does not match Origin header');
  }
}

runTest().catch((err) => {
  console.error('Test error:', err.message);
});
