const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/customers
router.get('/', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  res.json(seed.CUSTOMERS);
});

// GET /api/customers/:id/quotations
router.get('/:id/quotations', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep', 'customer'), (req, res) => {
  const quotes = seed.QUOTATIONS.filter((q) => q.customer_id === req.params.id);
  res.json(quotes);
});

// GET /api/customers/:id/orders
router.get('/:id/orders', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep', 'customer'), (req, res) => {
  const orders = seed.QUOTATIONS.filter((q) => q.customer_id === req.params.id && ['confirmed', 'in_fulfillment', 'fulfilled'].includes(q.status));
  res.json(orders);
});

// GET /api/customers/:id/invoices
router.get('/:id/invoices', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep', 'customer'), (req, res) => {
  const invoices = seed.QUOTATIONS.filter((q) => q.customer_id === req.params.id).map((q) => ({
    invoice_id: `inv_${q.id}`,
    quotation_id: q.id,
    quote_number: q.quote_number,
    amount_due: q.total_amount,
    status: q.status === 'fulfilled' ? 'paid' : 'sent',
    issued_at: q.created_at,
  }));
  res.json(invoices);
});

// GET /api/customers/:id
router.get('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  const customer = seed.CUSTOMERS.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

// POST /api/customers
router.post('/', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), (req, res) => {
  const { company_name, tier_id, currency_code, billing_address, shipping_address, primary_contact_name, primary_contact_email, primary_contact_phone, sales_rep_id } = req.body;
  const newId = `30${seed.CUSTOMERS.length + 1}`;
  const tier = seed.CUSTOMER_TIERS.find((t) => t.id === tier_id) || seed.CUSTOMER_TIERS[1];

  const newCustomer = {
    id: newId,
    company_name,
    tier_id: tier.id,
    tier_code: tier.code,
    currency_code: currency_code || 'USD',
    billing_address: billing_address || '',
    shipping_address: shipping_address || '',
    primary_contact_name: primary_contact_name || '',
    primary_contact_email: primary_contact_email || '',
    primary_contact_phone: primary_contact_phone || '',
    sales_rep_id: sales_rep_id || req.user.id,
  };

  seed.CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

// PUT /api/customers/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), (req, res) => {
  const customer = seed.CUSTOMERS.find((c) => c.id === req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  Object.assign(customer, req.body);
  res.json(customer);
});

// DELETE /api/customers/:id
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.CUSTOMERS.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Customer not found' });

  const deleted = seed.CUSTOMERS.splice(idx, 1)[0];
  res.json({ message: 'Customer deleted successfully', customer: deleted });
});

module.exports = router;
