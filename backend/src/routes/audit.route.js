const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/audit
router.get('/', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json(seed.AUDIT_LOGS);
});

// GET /api/audit/:id
router.get('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const log = seed.AUDIT_LOGS.find((a) => a.id === req.params.id);
  if (!log) return res.status(404).json({ message: 'Audit record not found' });
  res.json(log);
});

// GET /api/audit/:entityType/:entityId
router.get('/:entityType/:entityId', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const logs = seed.AUDIT_LOGS.filter((a) => a.entity_type === req.params.entityType && (a.entity_id === req.params.entityId || a.entity_id.includes(req.params.entityId)));
  res.json(logs);
});

module.exports = router;
