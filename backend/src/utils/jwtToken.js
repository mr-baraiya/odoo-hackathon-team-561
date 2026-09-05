const jwt = require('jsonwebtoken');
const Vars = require('../config/var');

function decode(token) {
  let payload;
  try {
    payload = jwt.verify(token, Vars.jwtSecret);
  } catch (error) {
    payload = null;
  }
  return payload;
}

function encode(payload, options) {
  return jwt.sign(payload, Vars.jwtSecret, options);
}

module.exports = {
  encode,
  decode,
};
