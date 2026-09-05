const express = require('express');
const seed = require('../db/dealflow360_seed');
const { calculateBlendedRiskScore } = require('../service/riskScoreEngine');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/quotations
router.get('/', authenticateJWT, (req, res) => {
  const { status, salesRepId } = req.query;
  let filtered = [...seed.QUOTATIONS];

  if (status) filtered = filtered.filter((q) => q.status === status);
  if (salesRepId) filtered = filtered.filter((q) => q.sales_rep_id === salesRepId);

  res.json(filtered);
});

// GET /api/quotations/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id || q.quote_number === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });
  res.json(quote);
});

// POST /api/quotations
router.post('/', authenticateJWT, (req, res) => {
  const { customerId, salesRepId, lineItems, orderDiscountPct } = req.body;
  const customer = seed.CUSTOMERS.find((c) => c.id === customerId) || seed.CUSTOMERS[0];
  const rep = seed.USERS.find((u) => u.id === salesRepId) || req.user || seed.USERS[0];

  const riskResult = calculateBlendedRiskScore({
    customerTierCode: customer.tier_code || 'silver',
    lineItems: lineItems || [],
    orderDiscountPct: Number(orderDiscountPct || 0),
  });

  const quoteId = `110${seed.QUOTATIONS.length + 1}`;
  const quoteNumber = `Q-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newQuote = {
    id: quoteId,
    quote_number: quoteNumber,
    customer_id: customer.id,
    customer_name: customer.company_name,
    customer_tier_code: customer.tier_code || 'silver',
    sales_rep_id: rep.id,
    sales_rep_name: rep.full_name,
    status: riskResult.suggestedStatus,
    blended_risk_score: riskResult.blendedRiskScore,
    order_level_discount_pct: Number(orderDiscountPct || 0),
    subtotal: riskResult.subtotal,
    total_discount_amount: riskResult.totalDiscountAmount,
    total_amount: riskResult.totalAmount,
    currency_code: 'USD',
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    lines: riskResult.processedLines.map((line, idx) => ({
      id: `120${idx + 1}`,
      quotation_id: quoteId,
      product_id: line.productId || line.id,
      product_name: line.productName || line.name,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      cost_price: line.costPrice,
      discount_pct: line.discountPct,
      line_discount_ceiling_pct: line.categoryCeilingPct,
      line_total: line.lineTotal,
      margin_pct: line.marginPct,
      is_recurring: Boolean(line.is_recurring || line.categoryType === 'subscription'),
      subscription_status: line.categoryType === 'subscription' ? 'active' : null,
      added_via_upsell: Boolean(line.addedViaUpsell),
    })),
    approvals: riskResult.approvalLevels.map((lvl, i) => ({
      id: `130${i + 1}`,
      quotation_id: quoteId,
      approval_level: lvl,
      sequence_order: i + 1,
      action: null,
    })),
  };

  seed.QUOTATIONS.unshift(newQuote);
  seed.AUDIT_LOGS.push({
    id: `audit_${Date.now()}`,
    entity_type: 'quotation',
    entity_id: quoteId,
    action: 'created',
    performed_by_user_id: rep.id,
    reason: 'Initial quotation creation',
    created_at: new Date().toISOString(),
  });

  res.status(201).json(newQuote);
});

// PUT /api/quotations/:id
router.put('/:id', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  Object.assign(quote, req.body, { last_activity_at: new Date().toISOString() });
  res.json(quote);
});

// DELETE /api/quotations/:id
router.delete('/:id', authenticateJWT, (req, res) => {
  const idx = seed.QUOTATIONS.findIndex((q) => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Quotation not found' });

  const deleted = seed.QUOTATIONS.splice(idx, 1)[0];
  res.json({ message: 'Quotation deleted successfully', quotation: deleted });
});

// Quotation Actions
router.post('/:id/submit', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = quote.blended_risk_score > 15 ? 'pending_approval' : 'approved';
  quote.last_activity_at = new Date().toISOString();
  res.json({ message: `Quotation submitted for review. Status: ${quote.status}`, quote });
});

router.post('/:id/send', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = 'sent_to_customer';
  quote.last_activity_at = new Date().toISOString();
  res.json({ message: 'Quotation sent to customer via portal/email/WhatsApp.', quote });
});

router.post('/:id/confirm', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = 'confirmed';
  quote.confirmed_at = new Date().toISOString();
  quote.confirmed_by_user_id = req.user.id;
  quote.last_activity_at = new Date().toISOString();
  res.json({ message: 'Quotation confirmed! Order generated.', quote });
});

router.post('/:id/cancel', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = 'cancelled';
  quote.last_activity_at = new Date().toISOString();
  res.json({ message: 'Quotation cancelled.', quote });
});

// Status Routes
router.get('/:id/status', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });
  res.json({ id: quote.id, quote_number: quote.quote_number, status: quote.status, last_activity_at: quote.last_activity_at });
});

router.patch('/:id/status', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = req.body.status || quote.status;
  quote.last_activity_at = new Date().toISOString();
  res.json({ message: `Status updated to ${quote.status}`, quote });
});

// Module 10: Quotation Lines
router.get('/:id/lines', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });
  res.json(quote.lines || []);
});

router.post('/:id/lines', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const { productId, quantity, unitPrice, costPrice, discountPct } = req.body;
  const prod = seed.PRODUCTS.find((p) => p.id === productId) || seed.PRODUCTS[0];

  const qty = Number(quantity || 1);
  const price = Number(unitPrice || prod.base_price);
  const cost = Number(costPrice || prod.cost_price);
  const disc = Number(discountPct || 0);

  const subtotal = qty * price;
  const lineTotal = subtotal * (1 - disc / 100);
  const marginPct = lineTotal > 0 ? (((lineTotal - qty * cost) / lineTotal) * 100).toFixed(2) : 0;

  const newLine = {
    id: `120${(quote.lines?.length || 0) + 1}`,
    quotation_id: quote.id,
    product_id: prod.id,
    product_name: prod.name,
    quantity: qty,
    unit_price: price,
    cost_price: cost,
    discount_pct: disc,
    line_discount_ceiling_pct: 15.0,
    line_total: lineTotal,
    margin_pct: Number(marginPct),
    is_recurring: prod.category_type === 'subscription',
  };

  quote.lines.push(newLine);
  res.status(201).json(newLine);
});

router.put('/:id/lines/:lineId', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });
  const line = quote.lines.find((l) => l.id === req.params.lineId);
  if (!line) return res.status(404).json({ message: 'Quotation line not found' });

  Object.assign(line, req.body);
  res.json(line);
});

router.delete('/:id/lines/:lineId', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });
  const idx = quote.lines.findIndex((l) => l.id === req.params.lineId);
  if (idx === -1) return res.status(404).json({ message: 'Line not found' });

  const deleted = quote.lines.splice(idx, 1)[0];
  res.json({ message: 'Line removed', line: deleted });
});

// Calculate quotation total
router.post('/:id/calculate', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const subtotal = quote.lines.reduce((acc, l) => acc + l.unit_price * l.quantity, 0);
  const totalDiscount = quote.lines.reduce((acc, l) => acc + (l.unit_price * l.quantity - l.line_total), 0);
  const taxAmount = (subtotal - totalDiscount) * 0.18;
  const totalAmount = subtotal - totalDiscount + taxAmount;

  res.json({
    quotation_id: quote.id,
    subtotal,
    totalDiscount,
    taxAmount,
    totalAmount,
  });
});

module.exports = router;
