const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

// GET /api/dashboard/summary - Query live PostgreSQL DB metrics with fallback
router.get('/summary', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  console.log('[API GET /api/dashboard/summary] Querying PostgreSQL database summary metrics...');
  try {
    const db = await getConnection();
    try {
      const usersRes = await db.queryOne('SELECT COUNT(*) as count FROM users');
      const customersRes = await db.queryOne('SELECT COUNT(*) as count FROM customers');
      const productsRes = await db.queryOne('SELECT COUNT(*) as count FROM products');
      const quotesRes = await db.queryOne('SELECT COUNT(*) as count FROM quotations');
      const revRes = await db.queryOne("SELECT COALESCE(SUM(total_amount), 0) as total FROM quotations WHERE status::text IN ('confirmed', 'in_fulfillment', 'fulfilled', 'pending_approval', 'approved')");
      const pendingRes = await db.queryOne("SELECT COUNT(*) as count FROM quotations WHERE status::text = 'pending_approval'");
      const alertsRes = await db.queryOne("SELECT COUNT(*) as count FROM deal_health_alerts WHERE status::text = 'open'");
      const stalledRes = await db.queryOne("SELECT COUNT(*) as count FROM quotations WHERE status::text NOT IN ('confirmed', 'fulfilled', 'cancelled', 'rejected')");

      const metrics = {
        totalUsers: Number(usersRes?.count || 0),
        totalCustomers: Number(customersRes?.count || 0),
        totalProducts: Number(productsRes?.count || 0),
        totalQuotations: Number(quotesRes?.count || 0),
        totalRevenue: Number(revRes?.total || 0),
        pendingApprovalsCount: Number(pendingRes?.count || 0),
        healthAlertsCount: Number(alertsRes?.count || 0),
        stalledDealsCount: Number(stalledRes?.count || 0),
      };

      console.log('[API GET /api/dashboard/summary] Loaded PostgreSQL metrics:', metrics);
      return res.json(metrics);
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /api/dashboard/summary] DB query failed, using seed fallback:', err.message);
  }

  // Seed Fallback
  const totalPipeline = seed.QUOTATIONS.reduce((acc, q) => acc + (q.total_amount || 0), 0);
  const pendingApprovals = seed.QUOTATIONS.filter((q) => q.status === 'pending_approval').length;
  const openAlerts = seed.DEAL_HEALTH_ALERTS.filter((a) => a.status === 'open').length;

  res.json({
    totalUsers: seed.USERS.length,
    totalCustomers: seed.CUSTOMERS.length,
    totalProducts: seed.PRODUCTS.length,
    totalQuotations: seed.QUOTATIONS.length,
    totalRevenue: totalPipeline || 45000,
    pendingApprovalsCount: pendingApprovals,
    healthAlertsCount: openAlerts,
    stalledDealsCount: seed.QUOTATIONS.filter((q) => q.status === 'draft').length,
  });
});

// GET /api/dashboard/sales
router.get('/sales', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  const sales = seed.QUOTATIONS.map((q) => ({
    quote_number: q.quote_number,
    customer_name: q.customer_name,
    total_amount: q.total_amount,
    status: q.status,
  }));
  res.json({ sales });
});

// GET /api/dashboard/revenue
router.get('/revenue', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  const confirmedRevenue = seed.QUOTATIONS.filter((q) => ['confirmed', 'in_fulfillment', 'fulfilled'].includes(q.status)).reduce((acc, q) => acc + q.total_amount, 0);
  const recurringRevenue = seed.QUOTATIONS.flatMap((q) => q.lines || []).filter((l) => l.is_recurring).reduce((acc, l) => acc + l.line_total, 0);

  res.json({
    confirmedRevenue,
    recurringMonthlyRevenue: recurringRevenue,
    projectedAnnualRevenue: confirmedRevenue + recurringRevenue * 12,
  });
});

// GET /api/dashboard/quotations
router.get('/quotations', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  res.json(seed.QUOTATIONS);
});

// GET /api/dashboard/approvals
router.get('/approvals', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  res.json(seed.QUOTATIONS.filter((q) => q.status === 'pending_approval'));
});

// GET /api/dashboard/fulfillment
router.get('/fulfillment', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  res.json(seed.QUOTATIONS.filter((q) => q.status === 'in_fulfillment'));
});

// GET /api/dashboard/deal-health
router.get('/deal-health', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), (req, res) => {
  res.json({
    alerts: seed.DEAL_HEALTH_ALERTS,
    stalledDeals: seed.QUOTATIONS.filter((q) => q.status === 'draft'),
  });
});

module.exports = router;
