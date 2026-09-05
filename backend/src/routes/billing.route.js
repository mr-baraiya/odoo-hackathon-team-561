const express = require('express');
const seed = require('../db/dealflow360_seed');
const { generateHybridBillingSchedule, triggerSubscriptionCreditNote } = require('../service/billingEngine');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const PAYMENTS = [
  { id: 'pay_101', invoice_id: 'inv_1101', amount: 6390.0, payment_method: 'bank_transfer', reference_number: 'REF-9921', paid_at: new Date().toISOString() },
];

const CREDIT_NOTES = [
  { id: 'cn_101', quotation_line_id: '1203', invoice_id: 'inv_1101', amount: 90.0, reason: 'partial_refund', notes: 'Mid-cycle proration credit', issued_at: new Date().toISOString() },
];

// --- 20. INVOICES ---
router.get('/invoices', authenticateJWT, (req, res) => {
  const invoices = seed.QUOTATIONS.map((q) => ({
    id: `inv_${q.id}`,
    quotation_id: q.id,
    invoice_number: `INV-${q.quote_number}`,
    customer_id: q.customer_id,
    customer_name: q.customer_name,
    amount_due: q.total_amount,
    amount_paid: q.status === 'fulfilled' ? q.total_amount : 0,
    status: q.status === 'fulfilled' ? 'paid' : 'sent',
    due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    issued_at: q.created_at,
  }));
  res.json(invoices);
});

router.get('/invoices/:id', authenticateJWT, (req, res) => {
  const quote = seed.QUOTATIONS.find((q) => `inv_${q.id}` === req.params.id || q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Invoice not found' });
  const schedule = generateHybridBillingSchedule(quote);
  res.json({
    id: `inv_${quote.id}`,
    quotation_id: quote.id,
    invoice_number: `INV-${quote.quote_number}`,
    customer_id: quote.customer_id,
    customer_name: quote.customer_name,
    amount_due: quote.total_amount,
    status: quote.status === 'fulfilled' ? 'paid' : 'sent',
    billing_schedule: schedule,
    issued_at: quote.created_at,
  });
});

router.post('/invoices', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const { quotationId } = req.body;
  const quote = seed.QUOTATIONS.find((q) => q.id === quotationId);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  const newInvoice = {
    id: `inv_${quote.id}`,
    quotation_id: quote.id,
    invoice_number: `INV-${quote.quote_number}`,
    customer_id: quote.customer_id,
    amount_due: quote.total_amount,
    status: 'draft',
    created_at: new Date().toISOString(),
  };
  res.status(201).json(newInvoice);
});

router.put('/invoices/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  res.json({ message: 'Invoice updated', id: req.params.id, ...req.body });
});

router.patch('/invoices/:id/status', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  res.json({ message: `Invoice status updated to ${req.body.status || 'paid'}`, id: req.params.id, status: req.body.status || 'paid' });
});

// --- 21. PAYMENTS ---
router.get('/invoices/:id/payments', authenticateJWT, (req, res) => {
  const payments = PAYMENTS.filter((p) => p.invoice_id === req.params.id || p.invoice_id === `inv_${req.params.id}`);
  res.json(payments);
});

router.post('/invoices/:id/payments', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const newPayment = {
    id: `pay_${Date.now()}`,
    invoice_id: req.params.id,
    amount: Number(req.body.amount || 0),
    payment_method: req.body.payment_method || 'credit_card',
    reference_number: req.body.reference_number || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    paid_at: new Date().toISOString(),
  };
  PAYMENTS.push(newPayment);
  res.status(201).json(newPayment);
});

router.get('/payments', authenticateJWT, (req, res) => {
  res.json(PAYMENTS);
});

router.get('/payments/:id', authenticateJWT, (req, res) => {
  const payment = PAYMENTS.find((p) => p.id === req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

// --- 22. CREDIT NOTES ---
router.get('/credit-notes', authenticateJWT, (req, res) => {
  res.json(CREDIT_NOTES);
});

router.get('/credit-notes/:id', authenticateJWT, (req, res) => {
  const note = CREDIT_NOTES.find((c) => c.id === req.params.id);
  if (!note) return res.status(404).json({ message: 'Credit note not found' });
  res.json(note);
});

router.post('/credit-notes', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const { quotationLineId, unearnedAmount, reason } = req.body;
  const result = triggerSubscriptionCreditNote({ quotationLineId, unearnedAmount, reason });
  CREDIT_NOTES.push(result);
  res.status(201).json(result);
});

module.exports = router;
