const express = require('express');
const seed = require('../db/dealflow360_seed');
const { getUpsellSuggestions } = require('../service/upsellEngine');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/recommendations
router.get('/recommendations', authenticateJWT, (req, res) => {
  const suggestions = getUpsellSuggestions({
    currentCartLines: [],
    availableProducts: seed.PRODUCTS,
    upsellRules: seed.UPSELL_RULES,
  });
  res.json(suggestions);
});

// GET /api/recommendations/:productId
router.get('/recommendations/:productId', authenticateJWT, (req, res) => {
  const suggestions = getUpsellSuggestions({
    currentCartLines: [{ productId: req.params.productId, quantity: 1, unitPrice: 1000, costPrice: 600, discountPct: 0 }],
    availableProducts: seed.PRODUCTS,
    upsellRules: seed.UPSELL_RULES,
  });
  res.json(suggestions);
});

// GET /api/upsell-rules
router.get('/upsell-rules', authenticateJWT, (req, res) => {
  res.json(seed.UPSELL_RULES);
});

// POST /api/upsell-rules
router.post('/upsell-rules', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const { base_product_id, suggested_product_id, co_purchase_score, min_margin_pct_required } = req.body;
  const newRule = {
    id: `90${seed.UPSELL_RULES.length + 1}`,
    base_product_id,
    suggested_product_id,
    co_purchase_score: Number(co_purchase_score || 0.8),
    min_margin_pct_required: Number(min_margin_pct_required || 15),
    is_active: true,
  };
  seed.UPSELL_RULES.push(newRule);
  res.status(201).json(newRule);
});

// PUT /api/upsell-rules/:id
router.put('/upsell-rules/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const rule = seed.UPSELL_RULES.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ message: 'Upsell rule not found' });
  Object.assign(rule, req.body);
  res.json(rule);
});

router.patch('/upsell-rules/:id/toggle', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const rule = seed.UPSELL_RULES.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ message: 'Upsell rule not found' });
  rule.is_active = req.body.is_active !== undefined ? Boolean(req.body.is_active) : !rule.is_active;
  res.json({ message: `Upsell rule ${rule.is_active ? 'activated' : 'deactivated'}`, rule });
});

// DELETE /api/upsell-rules/:id
router.delete('/upsell-rules/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.UPSELL_RULES.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Upsell rule not found' });
  const deleted = seed.UPSELL_RULES.splice(idx, 1)[0];
  res.json({ message: 'Upsell rule deleted', rule: deleted });
});

module.exports = router;
