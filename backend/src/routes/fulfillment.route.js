const express = require('express');
const seed = require('../db/dealflow360_seed');
const { calculateFulfillmentSplits } = require('../service/fulfillmentEngine');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/fulfillment
router.get('/', authenticateJWT, (req, res) => {
  const FULFILLMENTS = seed.QUOTATIONS.map((q) => ({
    id: `ful_${q.id}`,
    quotation_id: q.id,
    quote_number: q.quote_number,
    status: q.status === 'fulfilled' ? 'fulfilled' : 'pending',
    created_at: q.created_at,
  }));
  res.json(FULFILLMENTS);
});

// POST /api/fulfillment/calculate-split
router.post('/calculate-split', authenticateJWT, (req, res) => {
  const { lineItems, overrideSplits } = req.body;
  const warehousesWithStock = seed.WAREHOUSES.map((wh) => {
    const stockMap = {};
    seed.WAREHOUSE_STOCK.filter((s) => s.warehouse_id === wh.id).forEach((s) => {
      stockMap[s.product_id] = s.quantity_on_hand;
    });
    return { ...wh, stockMap };
  });

  const result = calculateFulfillmentSplits(lineItems || [], warehousesWithStock, overrideSplits);
  res.json(result);
});

// GET /api/fulfillment/splits/:orderId
router.get('/splits/:orderId', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ful_${q.id}` === req.params.orderId || q.id === req.params.orderId);
  if (!quote) return res.status(404).json({ message: 'Quotation/Order not found' });

  const lineItems = quote.lines.map((l) => ({
    lineId: l.id,
    productId: l.product_id,
    productName: l.product_name,
    quantity: l.quantity,
  }));

  const warehousesWithStock = seed.WAREHOUSES.map((wh) => {
    const stockMap = {};
    seed.WAREHOUSE_STOCK.filter((s) => s.warehouse_id === wh.id).forEach((s) => {
      stockMap[s.product_id] = s.quantity_on_hand;
    });
    return { ...wh, stockMap };
  });

  const result = calculateFulfillmentSplits(lineItems, warehousesWithStock);
  res.json(result.fulfillmentSplits);
});

// GET /api/fulfillment/:id/splits
router.get('/:id/splits', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ful_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const lineItems = quote.lines.map((l) => ({
    lineId: l.id,
    productId: l.product_id,
    productName: l.product_name,
    quantity: l.quantity,
  }));

  const warehousesWithStock = seed.WAREHOUSES.map((wh) => {
    const stockMap = {};
    seed.WAREHOUSE_STOCK.filter((s) => s.warehouse_id === wh.id).forEach((s) => {
      stockMap[s.product_id] = s.quantity_on_hand;
    });
    return { ...wh, stockMap };
  });

  const result = calculateFulfillmentSplits(lineItems, warehousesWithStock);
  res.json(result.fulfillmentSplits);
});

// GET /api/fulfillment/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ful_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Fulfillment record not found' });
  res.json({
    id: `ful_${quote.id}`,
    quotation_id: quote.id,
    quote_number: quote.quote_number,
    status: quote.status === 'fulfilled' ? 'fulfilled' : 'pending',
    lines: quote.lines,
  });
});

// POST /api/fulfillment
router.post('/', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const { quotationId } = req.body;
  const quote = seed.QUOTATIONS.find((q) => q.id === quotationId);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = 'in_fulfillment';
  res.status(201).json({
    id: `ful_${quote.id}`,
    quotation_id: quote.id,
    status: 'in_fulfillment',
    created_at: new Date().toISOString(),
  });
});

// PUT /api/fulfillment/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ful_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Fulfillment record not found' });
  Object.assign(quote, req.body);
  res.json({ id: `ful_${quote.id}`, status: quote.status });
});

// PATCH /api/fulfillment/:id/status
router.patch('/:id/status', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ful_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Fulfillment record not found' });

  quote.status = req.body.status || 'fulfilled';
  res.json({ message: `Fulfillment status updated to ${quote.status}`, status: quote.status });
});

// POST /api/fulfillment/:id/split
router.post('/:id/split', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `ful_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const lineItems = quote.lines.map((l) => ({
    lineId: l.id,
    productId: l.product_id,
    productName: l.product_name,
    quantity: l.quantity,
  }));

  const warehousesWithStock = seed.WAREHOUSES.map((wh) => {
    const stockMap = {};
    seed.WAREHOUSE_STOCK.filter((s) => s.warehouse_id === wh.id).forEach((s) => {
      stockMap[s.product_id] = s.quantity_on_hand;
    });
    return { ...wh, stockMap };
  });

  const result = calculateFulfillmentSplits(lineItems, warehousesWithStock, req.body.overrideSplits);
  res.json(result);
});

// PUT /api/fulfillment/:id/splits/:splitId
router.put('/:id/splits/:splitId', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  res.json({ message: 'Fulfillment split override updated.', splitId: req.params.splitId, override: req.body });
});

module.exports = router;
