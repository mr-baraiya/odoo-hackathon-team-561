const express = require("express");
const seed = require("../db/dealflow360_seed");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const Database = require("../service/database");

const router = express.Router();

const managerRoles = ["admin", "sales_manager"];

function seedManagerSummary() {
  const quotes = seed.QUOTATIONS;
  return {
    totalQuotations: quotes.length,
    totalPipelineValue: quotes.reduce(
      (total, quote) => total + Number(quote.total_amount || 0),
      0,
    ),
    pendingApprovalsCount: quotes.filter(
      (quote) => quote.status === "pending_approval",
    ).length,
    teamMembersCount: new Set(quotes.map((quote) => quote.sales_rep_id)).size,
    highRiskCount: quotes.filter(
      (quote) => Number(quote.blended_risk_score || 0) >= 25,
    ).length,
  };
}

function seedManagerQueue() {
  return seed.QUOTATIONS.flatMap((quote) =>
    (quote.approvals || [])
      .filter((step) => !step.action)
      .map((step) => ({
        id: step.id,
        quoteId: quote.quote_number || quote.id,
        customer: quote.customer_name,
        customerEmail: quote.customer_email || "",
        customerPhone: quote.customer_phone || "",
        requestedBy: quote.sales_rep_name,
        reason: `Risk score ${quote.blended_risk_score}`,
        status: "pending",
        amount: quote.total_amount,
        createdAt: quote.created_at,
      })),
  );
}

function seedManagerActivity() {
  return seed.AUDIT_LOGS.slice(-5)
    .reverse()
    .map((entry) => ({
      id: entry.id,
      text: entry.reason || entry.action,
      user:
        seed.USERS.find((user) => user.id === entry.performed_by_user_id)
          ?.full_name || "System",
      createdAt: entry.created_at,
    }));
}

router.get(
  "/manager",
  authenticateJWT,
  authorizeRoles(...managerRoles),
  async (req, res) => {
    let db;
    try {
      db = await Database.getConnection();
      const summary = await db.queryOne(`
      SELECT
        COUNT(*)::int AS "totalQuotations",
        COALESCE(SUM(total_amount), 0)::numeric AS "totalPipelineValue",
        COUNT(*) FILTER (WHERE status = 'pending_approval')::int AS "pendingApprovalsCount",
        COUNT(DISTINCT sales_rep_id)::int AS "teamMembersCount",
        COUNT(*) FILTER (WHERE blended_risk_score >= 25)::int AS "highRiskCount"
      FROM quotations
    `);
      const queue = await db.queryAll(`
      SELECT
        qa.id,
        q.quote_number AS "quoteId",
        c.company_name AS customer,
        c.primary_contact_email AS "customerEmail",
        c.primary_contact_phone AS "customerPhone",
        rep.full_name AS "requestedBy",
        qa.reason,
        q.total_amount AS amount,
        q.created_at AS "createdAt"
      FROM quotation_approvals qa
      JOIN quotations q ON q.id = qa.quotation_id
      JOIN customers c ON c.id = q.customer_id
      JOIN users rep ON rep.id = q.sales_rep_id
      WHERE qa.action IS NULL AND qa.approval_level = 'sales_manager'
      ORDER BY q.created_at DESC
      LIMIT 10
    `);
      const activity = await db.queryAll(`
      SELECT al.id, al.action, al.reason, al.created_at AS "createdAt",
             COALESCE(u.full_name, 'System') AS "user"
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.performed_by_user_id
      ORDER BY al.created_at DESC LIMIT 5
    `);
      return res.json({
        summary,
        queue: queue.map((item) => ({ ...item, status: "pending" })),
        activity,
      });
    } catch (error) {
      return res.json({
        summary: seedManagerSummary(),
        queue: seedManagerQueue(),
        activity: seedManagerActivity(),
        source: "seed-fallback",
      });
    } finally {
      if (db) db.release();
    }
  },
);

router.get(
  "/finance",
  authenticateJWT,
  authorizeRoles("finance_ops", "admin"),
  async (req, res) => {
    let db;
    try {
      db = await Database.getConnection();
      const summary = await db.queryOne(`
        SELECT
          COALESCE((SELECT SUM(total_amount) FROM quotations WHERE status IN ('confirmed', 'in_fulfillment', 'fulfilled')), 0)::numeric AS revenue,
          COALESCE((SELECT SUM(amount_due - amount_paid) FROM invoices WHERE status NOT IN ('paid', 'void')), 0)::numeric AS outstanding,
          COALESCE((SELECT COUNT(*) FROM invoices WHERE status IN ('sent', 'partially_paid', 'overdue')), 0)::int AS "pendingInvoices",
          COALESCE((SELECT COUNT(*) FROM quotation_lines WHERE is_recurring = TRUE AND subscription_status = 'active'), 0)::int AS subscriptions,
          COALESCE((SELECT COUNT(*) FROM quotations WHERE blended_risk_score >= 15 AND status NOT IN ('rejected', 'fulfilled')), 0)::int AS "highRiskDeals"
      `);
      const invoices = await db.queryAll(`
        SELECT i.id, i.invoice_number, i.amount_due, i.amount_paid, i.status, i.due_date,
               c.company_name AS customer_name
        FROM invoices i
        JOIN quotations q ON q.id = i.quotation_id
        JOIN customers c ON c.id = q.customer_id
        ORDER BY i.due_date NULLS LAST, i.created_at DESC
        LIMIT 20
      `);
      const highRiskDealsList = await db.queryAll(`
        SELECT q.id, q.quote_number, q.blended_risk_score, c.company_name AS customer_name
        FROM quotations q
        JOIN customers c ON c.id = q.customer_id
        WHERE q.blended_risk_score >= 15 AND q.status NOT IN ('rejected', 'fulfilled')
        ORDER BY q.blended_risk_score DESC LIMIT 20
      `);
      return res.json({ summary, invoices, highRiskDealsList });
    } catch (error) {
      const invoices = seed.QUOTATIONS.map((quote) => ({
        id: `inv_${quote.id}`,
        invoice_number: `INV-${quote.quote_number}`,
        amount_due: quote.total_amount,
        amount_paid: quote.status === "fulfilled" ? quote.total_amount : 0,
        status: quote.status === "fulfilled" ? "paid" : "sent",
        customer_name: quote.customer_name,
      }));
      const highRiskDealsList = seed.QUOTATIONS.filter(
        (quote) => Number(quote.blended_risk_score || 0) >= 15,
      ).map((quote) => ({
        id: quote.id,
        quote_number: quote.quote_number,
        blended_risk_score: quote.blended_risk_score,
        customer_name: quote.customer_name,
      }));
      return res.json({
        summary: {
          revenue: seed.QUOTATIONS.filter((quote) =>
            ["confirmed", "in_fulfillment", "fulfilled"].includes(quote.status),
          ).reduce((sum, quote) => sum + Number(quote.total_amount || 0), 0),
          outstanding: invoices
            .filter((invoice) => invoice.status !== "paid")
            .reduce((sum, invoice) => sum + Number(invoice.amount_due || 0), 0),
          pendingInvoices: invoices.filter(
            (invoice) => invoice.status !== "paid",
          ).length,
          subscriptions: seed.QUOTATIONS.flatMap(
            (quote) => quote.lines || [],
          ).filter(
            (line) =>
              line.is_recurring && line.subscription_status === "active",
          ).length,
          highRiskDeals: highRiskDealsList.length,
        },
        invoices,
        highRiskDealsList,
        source: "seed-fallback",
      });
    } finally {
      if (db) db.release();
    }
  },
);

// GET /api/dashboard/summary
router.get(
  "/summary",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    const totalPipeline = seed.QUOTATIONS.reduce(
      (acc, q) => acc + q.total_amount,
      0,
    );
    const pendingApprovals = seed.QUOTATIONS.filter(
      (q) => q.status === "pending_approval",
    ).length;
    const totalOrders = seed.QUOTATIONS.filter((q) =>
      ["confirmed", "in_fulfillment", "fulfilled"].includes(q.status),
    ).length;
    const openAlerts = seed.DEAL_HEALTH_ALERTS.filter(
      (a) => a.status === "open",
    ).length;

    res.json({
      totalQuotations: seed.QUOTATIONS.length,
      totalPipelineValue: totalPipeline,
      pendingApprovalsCount: pendingApprovals,
      totalOrdersCount: totalOrders,
      openDealHealthAlertsCount: openAlerts,
    });
  },
);

// GET /api/dashboard/sales
router.get(
  "/sales",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    const sales = seed.QUOTATIONS.map((q) => ({
      quote_number: q.quote_number,
      customer_name: q.customer_name,
      total_amount: q.total_amount,
      status: q.status,
    }));
    res.json({ sales });
  },
);

// GET /api/dashboard/revenue
router.get(
  "/revenue",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    const confirmedRevenue = seed.QUOTATIONS.filter((q) =>
      ["confirmed", "in_fulfillment", "fulfilled"].includes(q.status),
    ).reduce((acc, q) => acc + q.total_amount, 0);
    const recurringRevenue = seed.QUOTATIONS.flatMap((q) => q.lines)
      .filter((l) => l.is_recurring)
      .reduce((acc, l) => acc + l.line_total, 0);

    res.json({
      confirmedRevenue,
      recurringMonthlyRevenue: recurringRevenue,
      projectedAnnualRevenue: confirmedRevenue + recurringRevenue * 12,
    });
  },
);

// GET /api/dashboard/quotations
router.get(
  "/quotations",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  async (req, res) => {
    let db;
    try {
      db = await Database.getConnection();
      const quotations = await db.queryAll(`
      SELECT q.id, q.quote_number, q.status, q.total_amount, q.order_level_discount_pct,
             q.created_at, c.company_name AS customer,
             c.primary_contact_email AS "customerEmail",
             c.primary_contact_phone AS "customerPhone",
             rep.full_name AS "salesRep"
      FROM quotations q
      JOIN customers c ON c.id = q.customer_id
      JOIN users rep ON rep.id = q.sales_rep_id
      ORDER BY q.created_at DESC
    `);
      return res.json(quotations);
    } catch (error) {
      // Seed fallback below keeps local demo mode available.
    } finally {
      if (db) db.release();
    }
    res.json(seed.QUOTATIONS);
  },
);

// GET /api/dashboard/approvals
router.get(
  "/approvals",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json(seed.QUOTATIONS.filter((q) => q.status === "pending_approval"));
  },
);

// GET /api/dashboard/fulfillment
router.get(
  "/fulfillment",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json(seed.QUOTATIONS.filter((q) => q.status === "in_fulfillment"));
  },
);

// GET /api/dashboard/deal-health
router.get(
  "/deal-health",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json({
      alerts: seed.DEAL_HEALTH_ALERTS,
      stalledDeals: seed.QUOTATIONS.filter((q) => q.status === "draft"),
    });
  },
);

module.exports = router;
