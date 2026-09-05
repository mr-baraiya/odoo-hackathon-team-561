const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/customer-tiers
router.get('/', authenticateJWT, (req, res) => {
  res.json(seed.CUSTOMER_TIERS);
});

// GET /api/customer-tiers/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const tier = seed.CUSTOMER_TIERS.find((t) => t.id === req.params.id || t.code === req.params.id);
  if (!tier) return res.status(404).json({ message: 'Customer tier not found' });
  res.json(tier);
});

// POST /api/customer-tiers
router.post('/', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const { code, label, default_discount_ceiling_pct } = req.body;
  const newTier = {
    id: `20${seed.CUSTOMER_TIERS.length + 1}`,
    code: code.toLowerCase(),
    label,
    default_discount_ceiling_pct: Number(default_discount_ceiling_pct || 0),
  };

  seed.CUSTOMER_TIERS.push(newTier);
  res.status(201).json(newTier);
});

// PUT /api/customer-tiers/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const tier = seed.CUSTOMER_TIERS.find((t) => t.id === req.params.id || t.code === req.params.id);
  if (!tier) return res.status(404).json({ message: 'Customer tier not found' });

  Object.assign(tier, req.body);
  res.json(tier);
});

// DELETE /api/customer-tiers/:id
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.CUSTOMER_TIERS.findIndex((t) => t.id === req.params.id || t.code === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Customer tier not found' });

  const deleted = seed.CUSTOMER_TIERS.splice(idx, 1)[0];
  res.json({ message: 'Tier deleted successfully', tier: deleted });
});

module.exports = router;
