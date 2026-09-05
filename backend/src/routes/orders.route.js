const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/orders
router.get('/', authenticateJWT, (req, res) => {
  const confirmedQuotes = seed.QUOTATIONS.filter((q) => ['confirmed', 'in_fulfillment', 'fulfilled'].includes(q.status)).map((q) => ({
    id: `ord_${q.id}`,
    quotation_id: q.id,
    order_number: `ORD-${q.quote_number}`,
    customer_id: q.customer_id,
    customer_name: q.customer_name,
    total_amount: q.total_amount,
    status: q.status === 'confirmed' ? 'pending_fulfillment' : q.status,
    created_at: q.created_at,
  }));
  res.json(confirmedQuotes);
});

// GET /api/orders/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ord_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Order not found' });
  res.json({
    id: `ord_${quote.id}`,
    quotation_id: quote.id,
    order_number: `ORD-${quote.quote_number}`,
    customer_id: quote.customer_id,
    customer_name: quote.customer_name,
    total_amount: quote.total_amount,
    status: quote.status === 'confirmed' ? 'pending_fulfillment' : quote.status,
    lines: quote.lines,
    created_at: quote.created_at,
  });
});

// POST /api/orders
router.post('/', authenticateJWT, (req, res) => {
  const { quotationId } = req.body;
  const quote = seed.QUOTATIONS.find((q) => q.id === quotationId);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = 'confirmed';
  quote.confirmed_at = new Date().toISOString();

  const newOrder = {
    id: `ord_${quote.id}`,
    quotation_id: quote.id,
    order_number: `ORD-${quote.quote_number}`,
    customer_id: quote.customer_id,
    customer_name: quote.customer_name,
    total_amount: quote.total_amount,
    status: 'pending_fulfillment',
    created_at: new Date().toISOString(),
  };

  res.status(201).json(newOrder);
});

// PUT /api/orders/:id
router.put('/:id', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ord_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Order not found' });
  Object.assign(quote, req.body);
  res.json({ id: `ord_${quote.id}`, status: quote.status });
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ord_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Order not found' });

  quote.status = req.body.status || 'in_fulfillment';
  res.json({ id: `ord_${quote.id}`, order_number: `ORD-${quote.quote_number}`, status: quote.status });
});

module.exports = router;
