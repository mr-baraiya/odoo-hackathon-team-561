const express = require('express');
const { getConnection } = require('../service/database');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const ROLES = ['admin', 'sales_manager', 'finance_ops', 'sales_rep'];

// ─── HELPER: release safely ─────────────────────────────────────────────────
async function withDB(fn, fallback) {
  let db;
  try {
    db = await getConnection();
    return await fn(db);
  } catch (err) {
    console.warn('[reports.route] DB error:', err.message);
    if (typeof fallback === 'function') return fallback();
    throw err;
  } finally {
    if (db) db.release();
  }
}

// ─── 1. SALES REPORT ─────────────────────────────────────────────────────────
// GET /api/reports/sales
router.get('/sales', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      const [summary, byRep, byMonth, byStatus] = await Promise.all([
        db.queryOne(`
          SELECT
            COUNT(*)                                   AS total_quotes,
            COUNT(*) FILTER (WHERE status='confirmed') AS confirmed_quotes,
            COUNT(*) FILTER (WHERE status='draft')     AS draft_quotes,
            COUNT(*) FILTER (WHERE status='pending_approval') AS pending_quotes,
            COALESCE(SUM(total_amount), 0)             AS total_pipeline_value,
            COALESCE(SUM(total_amount) FILTER (WHERE status='confirmed'), 0) AS confirmed_revenue,
            COALESCE(AVG(total_amount), 0)             AS avg_deal_size,
            COALESCE(MAX(total_amount), 0)             AS largest_deal,
            COALESCE(SUM(total_discount_amount), 0)    AS total_discounts_given,
            COALESCE(AVG(blended_risk_score), 0)       AS avg_risk_score
          FROM quotations
        `),
        db.queryAll(`
          SELECT
            u.full_name              AS rep_name,
            u.role                   AS rep_role,
            COUNT(q.id)              AS total_quotes,
            COALESCE(SUM(q.total_amount), 0)  AS pipeline_value,
            COALESCE(SUM(q.total_amount) FILTER (WHERE q.status='confirmed'), 0) AS closed_revenue,
            COALESCE(AVG(q.order_level_discount_pct), 0) AS avg_discount_pct,
            COUNT(q.id) FILTER (WHERE q.status='confirmed') AS closed_deals
          FROM quotations q
          LEFT JOIN users u ON u.id = q.sales_rep_id
          GROUP BY u.id, u.full_name, u.role
          ORDER BY pipeline_value DESC
        `),
        db.queryAll(`
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
            DATE_TRUNC('month', created_at)                       AS month_date,
            COUNT(*)                                              AS quote_count,
            COALESCE(SUM(total_amount), 0)                       AS revenue,
            COALESCE(SUM(total_discount_amount), 0)              AS discounts
          FROM quotations
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY month_date DESC
          LIMIT 12
        `),
        db.queryAll(`
          SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as value
          FROM quotations
          GROUP BY status
          ORDER BY count DESC
        `),
      ]);
      return { summary, byRep, byMonth, byStatus };
    });
    res.json({ reportType: 'sales', ...result });
  } catch (err) {
    // Seed fallback
    const quotations = seed.QUOTATIONS || [];
    res.json({
      reportType: 'sales',
      summary: {
        total_quotes: quotations.length,
        confirmed_revenue: quotations.filter(q => q.status === 'confirmed').reduce((a, b) => a + (b.total_amount || 0), 0),
        total_pipeline_value: quotations.reduce((a, b) => a + (b.total_amount || 0), 0),
        avg_deal_size: quotations.length ? quotations.reduce((a, b) => a + (b.total_amount || 0), 0) / quotations.length : 0,
        total_discounts_given: quotations.reduce((a, b) => a + (b.total_discount_amount || 0), 0),
      },
      byRep: [], byMonth: [], byStatus: [],
    });
  }
});

// ─── 2. REVENUE REPORT ────────────────────────────────────────────────────────
// GET /api/reports/revenue
router.get('/revenue', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      const [summary, byMonth, byCustomer, recentInvoices] = await Promise.all([
        db.queryOne(`
          SELECT
            COALESCE(SUM(q.total_amount), 0)                                         AS gross_revenue,
            COALESCE(SUM(q.total_amount) FILTER (WHERE q.status='confirmed'), 0)     AS confirmed_revenue,
            COALESCE(SUM(q.total_discount_amount), 0)                                AS total_discounts,
            COALESCE(SUM(q.total_amount) - SUM(q.total_discount_amount), 0)          AS net_revenue,
            COALESCE(AVG(q.order_level_discount_pct), 0)                             AS avg_discount_pct,
            (SELECT COALESCE(SUM(amount),0) FROM payments)                           AS payments_received,
            (SELECT COUNT(*) FROM invoices)                                           AS invoice_count
          FROM quotations q
        `),
        db.queryAll(`
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
            DATE_TRUNC('month', created_at)                       AS sort_date,
            COALESCE(SUM(total_amount), 0)                       AS gross,
            COALESCE(SUM(total_amount) FILTER (WHERE status='confirmed'), 0) AS confirmed,
            COALESCE(SUM(total_discount_amount), 0)              AS discounts
          FROM quotations
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY sort_date DESC
          LIMIT 12
        `),
        db.queryAll(`
          SELECT
            c.company_name,
            c.primary_contact_name AS contact,
            ct.label AS tier,
            COUNT(q.id) AS quote_count,
            COALESCE(SUM(q.total_amount), 0) AS total_revenue,
            COALESCE(SUM(q.total_amount) FILTER (WHERE q.status='confirmed'), 0) AS confirmed_revenue,
            COALESCE(AVG(q.order_level_discount_pct), 0) AS avg_discount
          FROM customers c
          LEFT JOIN quotations q ON q.customer_id = c.id
          LEFT JOIN customer_tiers ct ON ct.id = c.tier_id
          GROUP BY c.id, c.company_name, c.primary_contact_name, ct.label
          HAVING COUNT(q.id) > 0
          ORDER BY total_revenue DESC
          LIMIT 10
        `),
        db.queryAll(`
          SELECT i.id, i.invoice_number, i.invoice_type,
                 i.amount_due, i.amount_paid, i.status, i.due_date, i.issued_at, i.created_at,
                 c.company_name
          FROM invoices i
          LEFT JOIN quotations q ON q.id = i.quotation_id
          LEFT JOIN customers c ON c.id = q.customer_id
          ORDER BY i.created_at DESC
          LIMIT 10
        `),
      ]);
      return { summary, byMonth, byCustomer, recentInvoices };
    });
    res.json({ reportType: 'revenue', ...result });
  } catch (err) {
    res.json({ reportType: 'revenue', summary: {}, byMonth: [], byCustomer: [], recentInvoices: [] });
  }
});

// ─── 3. QUOTATION REPORT ──────────────────────────────────────────────────────
// GET /api/reports/quotations
router.get('/quotations', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      const [records, summary, stalledDeals] = await Promise.all([
        db.queryAll(`
          SELECT
            q.id, q.quote_number, q.status,
            q.total_amount, q.total_discount_amount, q.subtotal,
            q.order_level_discount_pct, q.blended_risk_score,
            q.created_at, q.updated_at,
            c.company_name AS customer_name,
            u.full_name    AS sales_rep_name,
            COUNT(ql.id)   AS line_count
          FROM quotations q
          LEFT JOIN customers c  ON c.id = q.customer_id
          LEFT JOIN users u      ON u.id = q.sales_rep_id
          LEFT JOIN quotation_lines ql ON ql.quotation_id = q.id
          GROUP BY q.id, c.company_name, u.full_name
          ORDER BY q.created_at DESC
        `),
        db.queryOne(`
          SELECT
            COUNT(*)                                           AS total,
            COUNT(*) FILTER (WHERE status='confirmed')        AS confirmed,
            COUNT(*) FILTER (WHERE status='draft')            AS drafts,
            COUNT(*) FILTER (WHERE status='pending_approval') AS pending,
            COALESCE(AVG(order_level_discount_pct), 0)        AS avg_discount,
            COALESCE(AVG(blended_risk_score), 0)              AS avg_risk
          FROM quotations
        `),
        db.queryAll(`
          SELECT q.quote_number, q.status, q.total_amount, q.updated_at,
                 c.company_name,
                 EXTRACT(EPOCH FROM (NOW() - q.updated_at))/86400 AS days_stalled
          FROM quotations q
          LEFT JOIN customers c ON c.id = q.customer_id
          WHERE q.status IN ('draft','pending_approval')
            AND q.updated_at < NOW() - INTERVAL '3 days'
          ORDER BY q.updated_at ASC
        `),
      ]);
      return { records, summary, stalledDeals };
    });
    res.json({ reportType: 'quotations', ...result });
  } catch (err) {
    const quotations = seed.QUOTATIONS || [];
    res.json({ reportType: 'quotations', records: quotations, summary: {}, stalledDeals: [] });
  }
});

// ─── 4. CUSTOMER REPORT ───────────────────────────────────────────────────────
// GET /api/reports/customers
router.get('/customers', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      const [customers, summary, byTier] = await Promise.all([
        db.queryAll(`
          SELECT
            c.id, c.company_name, c.primary_contact_name, c.primary_contact_email,
            c.currency_code, c.created_at,
            ct.label AS tier_name,
            ct.default_discount_ceiling_pct AS tier_max_discount,
            u.full_name AS assigned_rep,
            COUNT(q.id)              AS quote_count,
            COALESCE(SUM(q.total_amount), 0) AS lifetime_value,
            COALESCE(SUM(q.total_amount) FILTER (WHERE q.status='confirmed'), 0) AS confirmed_revenue,
            MAX(q.created_at) AS last_quote_date
          FROM customers c
          LEFT JOIN customer_tiers ct ON ct.id = c.tier_id
          LEFT JOIN users u ON u.id = c.sales_rep_id
          LEFT JOIN quotations q ON q.customer_id = c.id
          GROUP BY c.id, ct.label, ct.default_discount_ceiling_pct, u.full_name
          ORDER BY lifetime_value DESC
        `),
        db.queryOne(`
          SELECT
            COUNT(*) AS total_customers,
            COUNT(DISTINCT c.tier_id) AS tier_count,
            COALESCE(AVG(q.total_amount), 0) AS avg_customer_value
          FROM customers c
          LEFT JOIN quotations q ON q.customer_id = c.id
        `),
        db.queryAll(`
          SELECT ct.label AS tier, COUNT(c.id) AS customer_count,
                 COALESCE(SUM(q.total_amount), 0) AS total_revenue
          FROM customer_tiers ct
          LEFT JOIN customers c ON c.tier_id = ct.id
          LEFT JOIN quotations q ON q.customer_id = c.id
          GROUP BY ct.id, ct.label
          ORDER BY total_revenue DESC
        `),
      ]);
      return { customers, summary, byTier };
    });
    res.json({ reportType: 'customers', ...result });
  } catch (err) {
    const customers = seed.CUSTOMERS || [];
    res.json({ reportType: 'customers', customers, summary: {}, byTier: [] });
  }
});

// ─── 5. PRODUCT REPORT ───────────────────────────────────────────────────────
// GET /api/reports/products
router.get('/products', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      const [products, topSellers, byCategory] = await Promise.all([
        db.queryAll(`
          SELECT
            p.id, p.name, p.sku, p.base_price, p.cost_price,
            p.is_active, p.is_promoted,
            pc.name AS category_name,
            COALESCE(p.base_price - p.cost_price, 0)                AS gross_margin_abs,
            CASE WHEN p.base_price > 0
              THEN ROUND(((p.base_price - p.cost_price) / p.base_price) * 100, 2)
              ELSE 0 END                                              AS margin_pct,
            COUNT(DISTINCT ql.quotation_id) AS quoted_in_deals,
            COALESCE(SUM(ql.quantity), 0)   AS total_units_quoted,
            COALESCE(SUM(ql.line_total), 0) AS total_revenue_quoted,
            COALESCE(AVG(ql.discount_pct), 0) AS avg_discount_applied
          FROM products p
          LEFT JOIN product_categories pc ON pc.id = p.category_id
          LEFT JOIN quotation_lines ql ON ql.product_id = p.id
          GROUP BY p.id, pc.name
          ORDER BY total_revenue_quoted DESC
        `),
        db.queryAll(`
          SELECT p.name, p.sku, SUM(ql.quantity) AS units, SUM(ql.line_total) AS revenue
          FROM quotation_lines ql
          JOIN products p ON p.id = ql.product_id
          GROUP BY p.id, p.name, p.sku
          ORDER BY revenue DESC
          LIMIT 5
        `),
        db.queryAll(`
          SELECT pc.name AS category,
                 COUNT(DISTINCT p.id) AS product_count,
                 COALESCE(SUM(ql.line_total), 0) AS revenue
          FROM product_categories pc
          LEFT JOIN products p ON p.category_id = pc.id
          LEFT JOIN quotation_lines ql ON ql.product_id = p.id
          GROUP BY pc.id, pc.name
          ORDER BY revenue DESC
        `),
      ]);
      return { products, topSellers, byCategory };
    });
    res.json({ reportType: 'products', ...result });
  } catch (err) {
    const products = seed.PRODUCTS || [];
    res.json({ reportType: 'products', products, topSellers: [], byCategory: [] });
  }
});

// ─── 6. DISCOUNT REPORT ──────────────────────────────────────────────────────
// GET /api/reports/discounts
router.get('/discounts', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      const [summary, byRep, byProduct, highDiscountDeals] = await Promise.all([
        db.queryOne(`
          SELECT
            COALESCE(AVG(order_level_discount_pct), 0)  AS avg_order_discount,
            COALESCE(MAX(order_level_discount_pct), 0)  AS max_order_discount,
            COALESCE(SUM(total_discount_amount), 0)     AS total_discount_value,
            COUNT(*) FILTER (WHERE order_level_discount_pct > 20) AS high_discount_count,
            COUNT(*) FILTER (WHERE order_level_discount_pct > 30) AS very_high_discount_count
          FROM quotations
        `),
        db.queryAll(`
          SELECT
            u.full_name AS rep_name,
            COUNT(q.id) AS quote_count,
            COALESCE(AVG(q.order_level_discount_pct), 0) AS avg_discount,
            COALESCE(MAX(q.order_level_discount_pct), 0) AS max_discount,
            COALESCE(SUM(q.total_discount_amount), 0)    AS total_discounts_given
          FROM quotations q
          JOIN users u ON u.id = q.sales_rep_id
          GROUP BY u.id, u.full_name
          ORDER BY avg_discount DESC
        `),
        db.queryAll(`
          SELECT
            p.name AS product_name, p.sku,
            COUNT(ql.id)              AS times_discounted,
            COALESCE(AVG(ql.discount_pct), 0) AS avg_line_discount,
            COALESCE(MAX(ql.discount_pct), 0) AS max_line_discount,
            COALESCE(SUM(ql.quantity * ql.unit_price * ql.discount_pct / 100), 0) AS discount_value_lost
          FROM quotation_lines ql
          JOIN products p ON p.id = ql.product_id
          WHERE ql.discount_pct > 0
          GROUP BY p.id, p.name, p.sku
          ORDER BY avg_line_discount DESC
          LIMIT 10
        `),
        db.queryAll(`
          SELECT q.quote_number, q.order_level_discount_pct, q.total_discount_amount,
                 q.total_amount, q.status, c.company_name, u.full_name AS rep_name
          FROM quotations q
          LEFT JOIN customers c ON c.id = q.customer_id
          LEFT JOIN users u ON u.id = q.sales_rep_id
          WHERE q.order_level_discount_pct > 15
          ORDER BY q.order_level_discount_pct DESC
          LIMIT 10
        `),
      ]);
      return { summary, byRep, byProduct, highDiscountDeals };
    });
    res.json({ reportType: 'discounts', ...result });
  } catch (err) {
    res.json({ reportType: 'discounts', summary: {}, byRep: [], byProduct: [], highDiscountDeals: [] });
  }
});

// ─── 7. FULFILLMENT REPORT ───────────────────────────────────────────────────
// GET /api/reports/fulfillment
router.get('/fulfillment', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      const [summary, orders, byStatus] = await Promise.all([
        db.queryOne(`
          SELECT
            COUNT(*) AS total_orders,
            COUNT(*) FILTER (WHERE status='fulfilled')            AS delivered,
            COUNT(*) FILTER (WHERE status='partially_fulfilled')  AS in_transit,
            COUNT(*) FILTER (WHERE status='pending')              AS pending,
            COUNT(*) FILTER (WHERE status='backordered')          AS backordered,
            COUNT(*) FILTER (WHERE actual_delivery_date IS NOT NULL
                             AND actual_delivery_date > promised_delivery_date) AS late_deliveries,
            COALESCE(AVG(
              EXTRACT(EPOCH FROM (actual_delivery_date - created_at)) / 86400
            ) FILTER (WHERE actual_delivery_date IS NOT NULL), 0) AS avg_fulfillment_days
          FROM fulfillment_orders
        `),
        db.queryAll(`
          SELECT
            fo.id, fo.status, fo.promised_delivery_date, fo.actual_delivery_date,
            fo.is_manual_override, fo.created_at,
            q.quote_number,
            c.company_name AS customer_name,
            CASE WHEN fo.actual_delivery_date > fo.promised_delivery_date THEN true ELSE false END AS is_late
          FROM fulfillment_orders fo
          LEFT JOIN quotations q ON q.id = fo.quotation_id
          LEFT JOIN customers c ON c.id = q.customer_id
          ORDER BY fo.created_at DESC
          LIMIT 20
        `),
        db.queryAll(`
          SELECT status, COUNT(*) AS count FROM fulfillment_orders GROUP BY status ORDER BY count DESC
        `),
      ]);
      return { summary, orders, byStatus };
    });
    res.json({ reportType: 'fulfillment', ...result });
  } catch (err) {
    res.json({ reportType: 'fulfillment', summary: { total_orders: 0 }, orders: [], byStatus: [] });
  }
});

// ─── 8. COMBINED SUMMARY (for dashboard widget) ───────────────────────────────
// GET /api/reports/summary
router.get('/summary', authenticateJWT, async (req, res) => {
  try {
    const result = await withDB(async (db) => {
      return await db.queryOne(`
        SELECT
          (SELECT COUNT(*) FROM quotations)                                     AS total_quotes,
          (SELECT COALESCE(SUM(total_amount),0) FROM quotations)                AS pipeline_value,
          (SELECT COALESCE(SUM(total_amount),0) FROM quotations WHERE status='confirmed') AS confirmed_revenue,
          (SELECT COUNT(*) FROM customers)                                      AS total_customers,
          (SELECT COUNT(*) FROM products WHERE is_active = true OR is_active IS NULL) AS active_products,
          (SELECT COUNT(*) FROM users WHERE is_active = true)                   AS active_users,
          (SELECT COUNT(*) FROM upsell_rules WHERE is_active = true)            AS active_upsell_rules,
          (SELECT COUNT(*) FROM subscription_plans)                             AS subscription_plans
      `);
    });
    res.json(result);
  } catch (err) {
    res.json({ total_quotes: 0, pipeline_value: 0, confirmed_revenue: 0, total_customers: 0 });
  }
});

// ─── legacy routes (keep for backward compat) ────────────────────────────────
router.get('/stalled-deals', authenticateJWT, authorizeRoles(...ROLES), async (req, res) => {
  try {
    const result = await withDB(async (db) => db.queryAll(`
      SELECT q.quote_number, q.status, q.total_amount, q.updated_at,
             c.company_name,
             EXTRACT(EPOCH FROM (NOW() - q.updated_at))/86400 AS days_stalled
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.status IN ('draft','pending_approval')
      ORDER BY q.updated_at ASC
    `));
    res.json({ reportType: 'stalled_deals', count: result.length, records: result });
  } catch {
    const stalled = seed.QUOTATIONS.filter(q => q.status === 'draft');
    res.json({ reportType: 'stalled_deals', count: stalled.length, records: stalled });
  }
});

router.get('/deal-health', authenticateJWT, authorizeRoles(...ROLES), (req, res) => {
  res.json({ reportType: 'deal_health', alertsCount: seed.DEAL_HEALTH_ALERTS.length, records: seed.DEAL_HEALTH_ALERTS });
});

module.exports = router;
