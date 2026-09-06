const express = require('express');
const seed = require('../db/dealflow360_seed');
const { calculateBlendedRiskScore } = require('../service/riskScoreEngine');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const DISCOUNT_RULES = [
  { id: 'disc_101', name: 'Hardware Max Discount', category_type: 'hardware', max_discount_pct: 15.0 },
  { id: 'disc_102', name: 'Services Max Discount', category_type: 'service', max_discount_pct: 10.0 },
  { id: 'disc_103', name: 'Subscriptions Max Discount', category_type: 'subscription', max_discount_pct: 20.0 },
];

let ROLE_DISCOUNT_LIMITS = [
  { role: 'sales_rep', role_label: 'Sales Representative', max_discount: 10, auto_approve: true, require_reason: false },
  { role: 'sales_manager', role_label: 'Sales Manager', max_discount: 25, auto_approve: false, require_reason: true },
  { role: 'finance_ops', role_label: 'Finance Operations', max_discount: 50, auto_approve: false, require_reason: true },
  { role: 'admin', role_label: 'Executive Admin', max_discount: 100, auto_approve: false, require_reason: true },
];

router.get('/role-limits', authenticateJWT, (req, res) => {
  res.json(ROLE_DISCOUNT_LIMITS);
});

router.put('/role-limits', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const { role, max_discount, auto_approve, require_reason } = req.body;
  const existing = ROLE_DISCOUNT_LIMITS.find((r) => r.role === role);
  if (existing) {
    if (max_discount !== undefined) existing.max_discount = Number(max_discount);
    if (auto_approve !== undefined) existing.auto_approve = Boolean(auto_approve);
    if (require_reason !== undefined) existing.require_reason = Boolean(require_reason);
    return res.json(existing);
  }
  res.status(404).json({ message: 'Role limit config not found' });
});

router.get('/rules', authenticateJWT, (req, res) => {
  res.json(DISCOUNT_RULES);
});

router.get('/rules/:id', authenticateJWT, (req, res) => {
  const rule = DISCOUNT_RULES.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ message: 'Discount rule not found' });
  res.json(rule);
});

router.post('/rules', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const newRule = {
    id: `disc_${Date.now()}`,
    name: req.body.name || 'New Discount Rule',
    category_type: req.body.category_type || 'hardware',
    max_discount_pct: Number(req.body.max_discount_pct || 15),
  };
  DISCOUNT_RULES.push(newRule);
  res.status(201).json(newRule);
});

router.put('/rules/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const rule = DISCOUNT_RULES.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ message: 'Discount rule not found' });
  Object.assign(rule, req.body);
  res.json(rule);
});

router.delete('/rules/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = DISCOUNT_RULES.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Discount rule not found' });
  const deleted = DISCOUNT_RULES.splice(idx, 1)[0];
  res.json({ message: 'Discount rule deleted', rule: deleted });
});

// POST /api/discount/calculate
router.post('/calculate', authenticateJWT, (req, res) => {
  const { customerTierCode, lineItems, orderDiscountPct } = req.body;
  const result = calculateBlendedRiskScore({
    customerTierCode: customerTierCode || 'silver',
    lineItems: lineItems || [],
    orderDiscountPct: Number(orderDiscountPct || 0),
  });
  res.json(result);
});

// POST /api/discount/validate
router.post('/validate', authenticateJWT, (req, res) => {
  const { categoryType, discountPct } = req.body;
  const rule = DISCOUNT_RULES.find((r) => r.category_type === categoryType) || DISCOUNT_RULES[0];
  const isValid = Number(discountPct) <= rule.max_discount_pct;

  res.json({
    allowed: isValid,
    requestedDiscountPct: Number(discountPct),
    ceilingDiscountPct: rule.max_discount_pct,
    message: isValid
      ? 'Requested discount is within permitted ceiling.'
      : `Discount ${discountPct}% exceeds ceiling of ${rule.max_discount_pct}% for ${categoryType}. Approval required.`,
  });
});

module.exports = router;
