const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/negotiations
router.get('/', authenticateJWT, (req, res) => {
  res.json(seed.NEGOTIATION_REQUESTS);
});

// GET /api/quotations/:id/negotiations
router.get('/quotations/:id/negotiations', authenticateJWT, (req, res) => {
  const negotiations = seed.NEGOTIATION_REQUESTS.filter((n) => n.quotation_id === req.params.id);
  res.json(negotiations);
});

// POST /api/quotations/:id/negotiations
router.post('/quotations/:id/negotiations', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const { message, proposedDiscountPct, requestType } = req.body;
  const newNeg = {
    id: `neg_${Date.now()}`,
    quotation_id: quote.id,
    customer_user_id: req.user.id,
    request_type: requestType || 'counter_discount',
    message: message || '',
    proposed_discount_pct: proposedDiscountPct ? Number(proposedDiscountPct) : null,
    status: 'open',
    created_at: new Date().toISOString(),
  };

  seed.NEGOTIATION_REQUESTS.push(newNeg);
  quote.status = 'under_negotiation';
  quote.last_activity_at = new Date().toISOString();

  res.status(201).json({ message: 'Negotiation submitted.', negotiation: newNeg });
});

// GET /api/negotiations/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const neg = seed.NEGOTIATION_REQUESTS.find((n) => n.id === req.params.id);
  if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });
  res.json(neg);
});

// POST /api/negotiations/:id/respond
router.post('/:id/respond', authenticateJWT, (req, res) => {
  const neg = seed.NEGOTIATION_REQUESTS.find((n) => n.id === req.params.id);
  if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });

  const { responseMessage } = req.body;
  neg.responded_by_user_id = req.user.id;
  neg.response_message = responseMessage || '';
  neg.status = 'addressed';
  neg.resolved_at = new Date().toISOString();

  res.json({ message: 'Response sent to customer.', negotiation: neg });
});

// POST /api/negotiations/:id/accept
router.post('/:id/accept', authenticateJWT, (req, res) => {
  const neg = seed.NEGOTIATION_REQUESTS.find((n) => n.id === req.params.id);
  if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });

  neg.status = 'accepted';
  neg.resolved_at = new Date().toISOString();

  const quote = seed.QUOTATIONS.find((q) => q.id === neg.quotation_id);
  if (quote && neg.proposed_discount_pct !== null) {
    quote.order_level_discount_pct = neg.proposed_discount_pct;
    quote.status = 'approved';
  }

  res.json({ message: 'Negotiation counter-discount accepted.', negotiation: neg, quote });
});

// POST /api/negotiations/:id/reject
router.post('/:id/reject', authenticateJWT, (req, res) => {
  const neg = seed.NEGOTIATION_REQUESTS.find((n) => n.id === req.params.id);
  if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });

  neg.status = 'rejected';
  neg.resolved_at = new Date().toISOString();

  res.json({ message: 'Negotiation counter-discount rejected.', negotiation: neg });
});

module.exports = router;
