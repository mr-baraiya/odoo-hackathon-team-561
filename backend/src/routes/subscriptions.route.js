const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// --- 18. SUBSCRIPTIONS ---
router.get('/subscriptions', authenticateJWT, (req, res) => {
  const recurringLines = seed.QUOTATIONS.flatMap((q) => q.lines.filter((l) => l.is_recurring)).map((l) => ({
    id: `sub_${l.id}`,
    quotation_line_id: l.id,
    quotation_id: l.quotation_id,
    product_name: l.product_name,
    status: l.subscription_status || 'active',
    monthly_price: l.line_total,
    started_at: l.created_at || new Date().toISOString(),
  }));
  res.json(recurringLines);
});

router.get('/subscriptions/:id', authenticateJWT, (req, res) => {
  const recurringLines = seed.QUOTATIONS.flatMap((q) => q.lines.filter((l) => l.is_recurring));
  const sub = recurringLines.find((l) => `sub_${l.id}` === req.params.id || l.id === req.params.id);
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json({
    id: `sub_${sub.id}`,
    quotation_line_id: sub.id,
    product_name: sub.product_name,
    status: sub.subscription_status || 'active',
    monthly_price: sub.line_total,
  });
});

router.post('/subscriptions', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const newSub = {
    id: `sub_${Date.now()}`,
    product_name: req.body.product_name || 'Enterprise SaaS Plan',
    status: 'active',
    monthly_price: Number(req.body.monthly_price || 350),
    started_at: new Date().toISOString(),
  };
  res.status(201).json(newSub);
});

router.put('/subscriptions/:id', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription updated', id: req.params.id, ...req.body });
});

router.post('/subscriptions/:id/pause', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription paused.', id: req.params.id, status: 'paused' });
});

router.post('/subscriptions/:id/resume', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription resumed.', id: req.params.id, status: 'active' });
});

router.post('/subscriptions/:id/cancel', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription cancelled. Credit note generated.', id: req.params.id, status: 'cancelled' });
});

// --- 19. SUBSCRIPTION PLANS ---
router.get('/subscription-plans', authenticateJWT, (req, res) => {
  res.json(seed.SUBSCRIPTION_PLANS);
});

router.get('/subscription-plans/:id', authenticateJWT, (req, res) => {
  const plan = seed.SUBSCRIPTION_PLANS.find((p) => p.id === req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json(plan);
});

router.post('/subscription-plans', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const newPlan = {
    id: `60${seed.SUBSCRIPTION_PLANS.length + 1}`,
    product_id: req.body.product_id || '504',
    name: req.body.name || 'Custom Plan',
    cycle: req.body.cycle || 'monthly',
    price_per_cycle: Number(req.body.price_per_cycle || 350),
    proration_enabled: true,
    cancellation_notice_days: 7,
    partial_refund_allowed: true,
  };
  seed.SUBSCRIPTION_PLANS.push(newPlan);
  res.status(201).json(newPlan);
});

router.put('/subscription-plans/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const plan = seed.SUBSCRIPTION_PLANS.find((p) => p.id === req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  Object.assign(plan, req.body);
  res.json(plan);
});

router.delete('/subscription-plans/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.SUBSCRIPTION_PLANS.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Plan not found' });
  const deleted = seed.SUBSCRIPTION_PLANS.splice(idx, 1)[0];
  res.json({ message: 'Plan deleted', plan: deleted });
});

module.exports = router;
