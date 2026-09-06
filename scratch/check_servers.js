const http = require('http');

function checkServer(port, path) {
  return new Promise((resolve) => {
    http.get({ hostname: 'localhost', port, path }, (res) => {
      resolve({ port, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ port, error: err.message });
    });
  });
}

async function run() {
  console.log(await checkServer(5000, '/api/health'));
  console.log(await checkServer(5173, '/'));
}

run();
