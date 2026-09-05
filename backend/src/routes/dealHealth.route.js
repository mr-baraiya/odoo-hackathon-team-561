const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const DISCOUNT_HISTORY = [
  { id: 'dh_101', sales_rep_id: '101', sales_rep_name: 'Sales Representative', average_discount_pct: 11.4, quotation_count: 5, recorded_at: new Date().toISOString() },
];

// --- 23. DEAL HEALTH ALERTS ---
router.get('/deal-health/alerts', authenticateJWT, (req, res) => {
  res.json(seed.DEAL_HEALTH_ALERTS);
});

router.get('/deal-health/alerts/:id', authenticateJWT, (req, res) => {
  const alert = seed.DEAL_HEALTH_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.json(alert);
});

router.post('/deal-health/alerts/:id/acknowledge', authenticateJWT, (req, res) => {
  const alert = seed.DEAL_HEALTH_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  alert.status = 'acknowledged';
  res.json({ message: 'Alert acknowledged.', alert });
});

router.post('/deal-health/alerts/:id/escalate', authenticateJWT, (req, res) => {
  const alert = seed.DEAL_HEALTH_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  alert.status = 'escalated';
  alert.escalated_at = new Date().toISOString();
  alert.escalated_by_user_id = req.user.id;
  res.json({ message: 'Alert escalated to manager.', alert });
});

router.post('/deal-health/alerts/:id/resolve', authenticateJWT, (req, res) => {
  const alert = seed.DEAL_HEALTH_ALERTS.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  alert.status = 'resolved';
  alert.resolved_at = new Date().toISOString();
  res.json({ message: 'Alert resolved.', alert });
});

// --- 24. SALES REP DISCOUNT HISTORY ---
router.get('/discount-history', authenticateJWT, (req, res) => {
  res.json(DISCOUNT_HISTORY);
});

router.get('/discount-history/:salesRepId', authenticateJWT, (req, res) => {
  const history = DISCOUNT_HISTORY.filter((h) => h.sales_rep_id === req.params.salesRepId);
  res.json(history);
});

module.exports = router;
