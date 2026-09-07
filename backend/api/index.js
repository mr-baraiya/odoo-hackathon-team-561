const app = require('../src/app');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Invocation Error]', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
  }
};

