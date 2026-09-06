const fs = require('fs');
const code = fs.readFileSync('frontend/src/pages/admin/AdminConfigPage.jsx', 'utf8');

try {
  // Simple check using Function constructor or basic check
  console.log('File size:', code.length);
  console.log('Line count:', code.split('\n').length);
} catch (e) {
  console.error(e);
}
