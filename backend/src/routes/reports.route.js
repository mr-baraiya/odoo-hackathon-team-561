const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/quotations', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json({ reportType: 'quotations', total: seed.QUOTATIONS.length, records: seed.QUOTATIONS });
});

router.get('/sales', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json({ reportType: 'sales', totalSales: seed.QUOTATIONS.reduce((a, b) => a + b.total_amount, 0), records: seed.QUOTATIONS });
});

router.get('/revenue', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json({ reportType: 'revenue', confirmedRevenue: seed.QUOTATIONS.filter((q) => q.status === 'confirmed').reduce((a, b) => a + b.total_amount, 0) });
});

router.get('/customers', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json({ reportType: 'customers', count: seed.CUSTOMERS.length, records: seed.CUSTOMERS });
});

router.get('/products', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json({ reportType: 'products', count: seed.PRODUCTS.length, records: seed.PRODUCTS });
});

router.get('/stalled-deals', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const stalled = seed.QUOTATIONS.filter((q) => q.status === 'draft');
  res.json({ reportType: 'stalled_deals', count: stalled.length, records: stalled });
});

router.get('/deal-health', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json({ reportType: 'deal_health', alertsCount: seed.DEAL_HEALTH_ALERTS.length, records: seed.DEAL_HEALTH_ALERTS });
});

module.exports = router;
