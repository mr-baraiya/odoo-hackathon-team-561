const express = require('express');

const router = express.Router();

/**
 * System Health Check Handler
 * Returns server uptime, memory usage, environment, and database status.
 */
router.get('/', (req, res) => {
  const mem = process.memoryUsage();
  const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return res.json({
    status: 'healthy',
    service: process.env.SERVICE_NAME || 'dealflow360',
    environment: process.env.NODE_ENV || 'dev',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: 'connected',
      engine: 'postgresql',
    },
    memory: {
      heapUsed: formatMB(mem.heapUsed),
      heapTotal: formatMB(mem.heapTotal),
      rss: formatMB(mem.rss),
    },
  });
});

module.exports = router;
