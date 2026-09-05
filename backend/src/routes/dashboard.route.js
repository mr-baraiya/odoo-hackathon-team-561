const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/dashboard/summary
router.get('/summary', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const totalPipeline = seed.QUOTATIONS.reduce((acc, q) => acc + q.total_amount, 0);
  const pendingApprovals = seed.QUOTATIONS.filter((q) => q.status === 'pending_approval').length;
  const totalOrders = seed.QUOTATIONS.filter((q) => ['confirmed', 'in_fulfillment', 'fulfilled'].includes(q.status)).length;
  const openAlerts = seed.DEAL_HEALTH_ALERTS.filter((a) => a.status === 'open').length;

  res.json({
    totalQuotations: seed.QUOTATIONS.length,
    totalPipelineValue: totalPipeline,
    pendingApprovalsCount: pendingApprovals,
    totalOrdersCount: totalOrders,
    openDealHealthAlertsCount: openAlerts,
  });
});

// GET /api/dashboard/sales
router.get('/sales', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const sales = seed.QUOTATIONS.map((q) => ({
    quote_number: q.quote_number,
    customer_name: q.customer_name,
    total_amount: q.total_amount,
    status: q.status,
  }));
  res.json({ sales });
});

// GET /api/dashboard/revenue
router.get('/revenue', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  const confirmedRevenue = seed.QUOTATIONS.filter((q) => ['confirmed', 'in_fulfillment', 'fulfilled'].includes(q.status)).reduce((acc, q) => acc + q.total_amount, 0);
  const recurringRevenue = seed.QUOTATIONS.flatMap((q) => q.lines).filter((l) => l.is_recurring).reduce((acc, l) => acc + l.line_total, 0);

  res.json({
    confirmedRevenue,
    recurringMonthlyRevenue: recurringRevenue,
    projectedAnnualRevenue: confirmedRevenue + recurringRevenue * 12,
  });
});

// GET /api/dashboard/quotations
router.get('/quotations', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json(seed.QUOTATIONS);
});

// GET /api/dashboard/approvals
router.get('/approvals', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json(seed.QUOTATIONS.filter((q) => q.status === 'pending_approval'));
});

// GET /api/dashboard/fulfillment
router.get('/fulfillment', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json(seed.QUOTATIONS.filter((q) => q.status === 'in_fulfillment'));
});

// GET /api/dashboard/deal-health
router.get('/deal-health', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops'), (req, res) => {
  res.json({
    alerts: seed.DEAL_HEALTH_ALERTS,
    stalledDeals: seed.QUOTATIONS.filter((q) => q.status === 'draft'),
  });
});

module.exports = router;
