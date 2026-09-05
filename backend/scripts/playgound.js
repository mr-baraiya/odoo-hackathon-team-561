const fs = require('fs');
const path = require('path');
// const Constants = require('@/config/constant');

const files = fs.readdirSync(path.join(__dirname, './../tmp'));

console.log(files);
