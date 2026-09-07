const path = require('path');
const moduleAlias = require('module-alias');

// Explicitly register alias '@' to point to 'src' directory
moduleAlias.addAlias('@', path.join(__dirname, '../src'));

const app = require('../src/app');

module.exports = app;
