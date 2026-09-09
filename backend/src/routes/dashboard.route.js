const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

// GET /api/dashboard/summary - Query live PostgreSQL DB metrics
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
    console.warn('[API GET /api/dashboard/summary] DB query failed:', err.message);
    res.json({
      totalUsers: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalQuotations: 0,
      totalRevenue: 0,
      pendingApprovalsCount: 0,
      healthAlertsCount: 0,
      stalledDealsCount: 0,
    });
  }
});

// GET /api/dashboard/sales
router.get('/sales', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const sales = await db.queryAll(`
        SELECT q.quote_number, c.company_name as customer_name, q.total_amount, q.status 
        FROM quotations q 
        LEFT JOIN customers c ON q.customer_id = c.id 
        ORDER BY q.created_at DESC LIMIT 50
      `);
      return res.json({ sales: sales || [] });
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /api/dashboard/sales] DB query failed:', err.message);
    res.json({ sales: [] });
  }
});

// GET /api/dashboard/revenue
router.get('/revenue', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const revRes = await db.queryOne("SELECT COALESCE(SUM(total_amount), 0) as total FROM quotations WHERE status::text IN ('confirmed', 'in_fulfillment', 'fulfilled')");
      const recRes = await db.queryOne("SELECT COALESCE(SUM(line_total), 0) as total FROM quotation_lines WHERE is_recurring = true");
      const confirmedRevenue = Number(revRes?.total || 0);
      const recurringRevenue = Number(recRes?.total || 0);

      return res.json({
        confirmedRevenue,
        recurringMonthlyRevenue: recurringRevenue,
        projectedAnnualRevenue: confirmedRevenue + recurringRevenue * 12,
      });
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /api/dashboard/revenue] DB query failed:', err.message);
    res.json({ confirmedRevenue: 0, recurringMonthlyRevenue: 0, projectedAnnualRevenue: 0 });
  }
});

// GET /api/dashboard/quotations
router.get('/quotations', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const quotes = await db.queryAll('SELECT * FROM quotations ORDER BY created_at DESC LIMIT 100');
      return res.json(quotes || []);
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /api/dashboard/quotations] DB error:', err.message);
    res.json([]);
  }
});

// GET /api/dashboard/approvals
router.get('/approvals', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const pending = await db.queryAll("SELECT * FROM quotations WHERE status::text = 'pending_approval' ORDER BY created_at DESC");
      return res.json(pending || []);
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /api/dashboard/approvals] DB error:', err.message);
    res.json([]);
  }
});

// GET /api/dashboard/fulfillment
router.get('/fulfillment', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const inFulfillment = await db.queryAll("SELECT * FROM quotations WHERE status::text = 'in_fulfillment' ORDER BY created_at DESC");
      return res.json(inFulfillment || []);
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /api/dashboard/fulfillment] DB error:', err.message);
    res.json([]);
  }
});

// GET /api/dashboard/deal-health
router.get('/deal-health', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const alerts = await db.queryAll("SELECT * FROM deal_health_alerts ORDER BY created_at DESC");
      const stalled = await db.queryAll("SELECT * FROM quotations WHERE status::text = 'draft' ORDER BY created_at DESC");
      return res.json({
        alerts: alerts || [],
        stalledDeals: stalled || [],
      });
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /api/dashboard/deal-health] DB error:', err.message);
    res.json({ alerts: [], stalledDeals: [] });
  }
});

module.exports = router;
