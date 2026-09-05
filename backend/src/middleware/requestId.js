const { v4: uuidv4 } = require('uuid');

const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

module.exports = requestId;
