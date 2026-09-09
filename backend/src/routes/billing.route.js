const express = require('express');
const { generateHybridBillingSchedule, triggerSubscriptionCreditNote } = require('../service/billingEngine');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

const PAYMENTS = [
  { id: 'pay_101', invoice_id: 'inv_1101', amount: 6390.0, payment_method: 'bank_transfer', reference_number: 'REF-9921', paid_at: new Date().toISOString() },
];

const CREDIT_NOTES = [
  { id: 'cn_101', quotation_line_id: '1203', invoice_id: 'inv_1101', amount: 90.0, reason: 'partial_refund', notes: 'Mid-cycle proration credit', issued_at: new Date().toISOString() },
];

// --- 20. INVOICES ---
router.get('/invoices', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT q.id as quotation_id, ('inv_' || q.id::text) as id, ('INV-' || q.quote_number) as invoice_number,
             q.customer_id, c.company_name as customer_name, q.total_amount as amount_due,
             CASE WHEN q.status::text = 'fulfilled' THEN q.total_amount ELSE 0 END as amount_paid,
             CASE WHEN q.status::text = 'fulfilled' THEN 'paid' ELSE 'sent' END as status,
             q.created_at as issued_at
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      ORDER BY q.created_at DESC
    `);
    db.release();
    return res.json(
      (rows || []).map((i) => ({
        ...i,
        amount_due: Number(i.amount_due || 0),
        amount_paid: Number(i.amount_paid || 0),
        due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      }))
    );
  } catch (err) {
    console.warn('[billing.route] DB query error:', err.message);
    return res.json([]);
  }
});

router.get('/invoices/:id', authenticateJWT, async (req, res) => {
  const cleanId = req.params.id.replace('inv_', '');
  try {
    const db = await getConnection();
    const quote = await db.queryOne(`
      SELECT q.*, c.company_name as customer_name
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.id::text = $1 OR q.quote_number = $1
    `, [cleanId]);

    if (quote) {
      const lines = await db.queryAll('SELECT * FROM quotation_lines WHERE quotation_id = $1', [quote.id]);
      db.release();
      quote.lines = lines || [];
      const schedule = generateHybridBillingSchedule(quote);
      return res.json({
        id: `inv_${quote.id}`,
        quotation_id: quote.id,
        invoice_number: `INV-${quote.quote_number}`,
        customer_id: quote.customer_id,
        customer_name: quote.customer_name,
        amount_due: Number(quote.total_amount || 0),
        status: quote.status === 'fulfilled' ? 'paid' : 'sent',
        billing_schedule: schedule,
        issued_at: quote.created_at,
      });
    }
    db.release();
  } catch (err) {
    console.warn('[billing.route] DB query error:', err.message);
  }
  return res.status(404).json({ message: 'Invoice not found' });
});

router.post('/invoices', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const { quotationId } = req.body;
  try {
    const db = await getConnection();
    const quote = await db.queryOne('SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1', [quotationId]);
    db.release();
    if (quote) {
      return res.status(201).json({
        id: `inv_${quote.id}`,
        quotation_id: quote.id,
        invoice_number: `INV-${quote.quote_number}`,
        customer_id: quote.customer_id,
        amount_due: Number(quote.total_amount || 0),
        status: 'draft',
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[billing.route] DB error in POST invoice:', err.message);
  }
  return res.status(404).json({ message: 'Quotation not found' });
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
