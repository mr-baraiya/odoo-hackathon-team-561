const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const APPROVAL_RULES = [
  { id: '1001', min_risk_score: 15.0, max_risk_score: 25.0, required_levels: ['sales_manager'] },
  { id: '1002', min_risk_score: 25.0, max_risk_score: null, required_levels: ['sales_manager', 'finance_ops'] },
];

// GET /api/approvals
router.get('/', authenticateJWT, (req, res) => {
  const allApprovals = seed.QUOTATIONS.flatMap((q) => q.approvals || []);
  res.json(allApprovals);
});

// GET /api/approvals/pending
router.get('/pending', authenticateJWT, (req, res) => {
  const pendingQuotes = seed.QUOTATIONS.filter((q) => q.status === 'pending_approval');
  res.json(pendingQuotes);
});

// --- APPROVAL RULES ---
router.get('/rules', authenticateJWT, (req, res) => {
  res.json(APPROVAL_RULES);
});

router.get('/rules/:id', authenticateJWT, (req, res) => {
  const rule = APPROVAL_RULES.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ message: 'Rule not found' });
  res.json(rule);
});

router.post('/rules', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const newRule = {
    id: `100${APPROVAL_RULES.length + 1}`,
    min_risk_score: Number(req.body.min_risk_score || 0),
    max_risk_score: req.body.max_risk_score ? Number(req.body.max_risk_score) : null,
    required_levels: req.body.required_levels || ['sales_manager'],
  };
  APPROVAL_RULES.push(newRule);
  res.status(201).json(newRule);
});

router.put('/rules/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const rule = APPROVAL_RULES.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ message: 'Rule not found' });
  Object.assign(rule, req.body);
  res.json(rule);
});

router.delete('/rules/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = APPROVAL_RULES.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Rule not found' });
  const deleted = APPROVAL_RULES.splice(idx, 1)[0];
  res.json({ message: 'Approval rule deleted', rule: deleted });
});

// GET /api/approvals/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const approval = seed.QUOTATIONS.flatMap((q) => q.approvals || []).find((a) => a.id === req.params.id);
  if (!approval) return res.status(404).json({ message: 'Approval step not found' });
  res.json(approval);
});

// POST /api/approvals/:id/approve
router.post('/:id/approve', authenticateJWT, authorizeRoles('sales_manager', 'finance_ops', 'admin'), (req, res) => {
  const { reason } = req.body;
  const quote = seed.QUOTATIONS.find((q) => (q.approvals || []).some((a) => a.id === req.params.id));
  if (!quote) return res.status(404).json({ message: 'Approval step not found' });

  const appStep = quote.approvals.find((a) => a.id === req.params.id);
  appStep.action = 'approved';
  appStep.acted_at = new Date().toISOString();
  appStep.reason = reason || 'Approved by manager';

  const allApproved = quote.approvals.every((a) => a.action === 'approved');
  if (allApproved) {
    quote.status = 'approved';
  }

  seed.AUDIT_LOGS.push({
    id: `audit_${Date.now()}`,
    entity_type: 'quotation',
    entity_id: quote.id,
    action: 'approval_approved',
    performed_by_user_id: req.user.id,
    reason: reason || 'Approved quotation step',
    created_at: new Date().toISOString(),
  });

  res.json({ message: `Approval step approved. Quote status: ${quote.status}`, quote });
});

// POST /api/approvals/:id/reject
router.post('/:id/reject', authenticateJWT, authorizeRoles('sales_manager', 'finance_ops', 'admin'), (req, res) => {
  const { reason } = req.body;
  const quote = seed.QUOTATIONS.find((q) => (q.approvals || []).some((a) => a.id === req.params.id));
  if (!quote) return res.status(404).json({ message: 'Approval step not found' });

  const appStep = quote.approvals.find((a) => a.id === req.params.id);
  appStep.action = 'rejected';
  appStep.acted_at = new Date().toISOString();
  appStep.reason = reason || 'Rejected by manager';

  quote.status = 'rejected';

  seed.AUDIT_LOGS.push({
    id: `audit_${Date.now()}`,
    entity_type: 'quotation',
    entity_id: quote.id,
    action: 'approval_rejected',
    performed_by_user_id: req.user.id,
    reason: reason || 'Rejected quotation step',
    created_at: new Date().toISOString(),
  });

  res.json({ message: 'Approval step rejected. Quote status: rejected', quote });
});

// POST /api/approvals/:id/return
router.post('/:id/return', authenticateJWT, authorizeRoles('sales_manager', 'finance_ops', 'admin'), (req, res) => {
  const { reason } = req.body;
  const quote = seed.QUOTATIONS.find((q) => (q.approvals || []).some((a) => a.id === req.params.id));
  if (!quote) return res.status(404).json({ message: 'Approval step not found' });

  const appStep = quote.approvals.find((a) => a.id === req.params.id);
  appStep.action = 'returned_for_revision';
  appStep.acted_at = new Date().toISOString();
  appStep.reason = reason || 'Returned for revision';

  quote.status = 'draft';

  res.json({ message: 'Quotation returned for revision. Status: draft', quote });
});

module.exports = router;
