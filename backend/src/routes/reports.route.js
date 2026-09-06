const express = require("express");
const seed = require("../db/dealflow360_seed");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/quotations",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json({
      reportType: "quotations",
      total: seed.QUOTATIONS.length,
      records: seed.QUOTATIONS,
    });
  },
);

router.get(
  "/sales",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    const records = req.query.status
      ? seed.QUOTATIONS.filter((quote) => quote.status === req.query.status)
      : seed.QUOTATIONS;
    res.json({
      reportType: "sales",
      totalSales: records.reduce(
        (total, quote) => total + Number(quote.total_amount || 0),
        0,
      ),
      records,
    });
  },
);

router.get(
  "/revenue",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json({
      reportType: "revenue",
      confirmedRevenue: seed.QUOTATIONS.filter(
        (q) => q.status === "confirmed",
      ).reduce((a, b) => a + b.total_amount, 0),
    });
  },
);

router.get(
  "/customers",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json({
      reportType: "customers",
      count: seed.CUSTOMERS.length,
      records: seed.CUSTOMERS,
    });
  },
);

router.get(
  "/products",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json({
      reportType: "products",
      count: seed.PRODUCTS.length,
      records: seed.PRODUCTS,
    });
  },
);

router.get(
  "/stalled-deals",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    const stalled = seed.QUOTATIONS.filter((q) => q.status === "draft");
    res.json({
      reportType: "stalled_deals",
      count: stalled.length,
      records: stalled,
    });
  },
);

router.get(
  "/deal-health",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  (req, res) => {
    res.json({
      reportType: "deal_health",
      alertsCount: seed.DEAL_HEALTH_ALERTS.length,
      records: seed.DEAL_HEALTH_ALERTS,
    });
  },
);

router.get("/discounts", authenticateJWT, authorizeRoles("admin", "sales_manager", "finance_ops"), (req, res) => {
  const quotes = seed.QUOTATIONS;
  const discounts = quotes.map((quote) => Number(quote.order_level_discount_pct || 0));
  res.json({
    summary: {
      avg_order_discount: discounts.length ? discounts.reduce((sum, value) => sum + value, 0) / discounts.length : 0,
      max_order_discount: Math.max(0, ...discounts),
      total_discount_value: quotes.reduce((sum, quote) => sum + Number(quote.total_discount_amount || 0), 0),
      high_discount_count: discounts.filter((value) => value > 20).length,
    },
    byRep: [],
    byProduct: [],
    highDiscountDeals: quotes.filter((quote) => Number(quote.order_level_discount_pct || 0) > 15).map((quote) => ({
      quote_number: quote.quote_number,
      company_name: quote.customer_name,
      rep_name: quote.sales_rep_name,
      order_level_discount_pct: quote.order_level_discount_pct,
      total_discount_amount: quote.total_discount_amount,
      total_amount: quote.total_amount,
      status: quote.status,
    })),
  });
});

router.get("/fulfillment", authenticateJWT, authorizeRoles("admin", "sales_manager", "finance_ops"), (req, res) => {
  const orders = seed.QUOTATIONS.filter((quote) => ["confirmed", "in_fulfillment", "fulfilled"].includes(quote.status)).map((quote) => ({
    quote_number: quote.quote_number,
    customer_name: quote.customer_name,
    status: quote.status,
    promised_delivery_date: null,
    actual_delivery_date: quote.status === "fulfilled" ? quote.last_activity_at : null,
    is_late: false,
  }));
  const byStatus = Object.entries(orders.reduce((groups, order) => {
    groups[order.status] = (groups[order.status] || 0) + 1;
    return groups;
  }, {})).map(([status, count]) => ({ status, count }));
  res.json({ summary: { total_orders: orders.length, delivered: orders.filter((order) => order.status === "fulfilled").length, in_transit: orders.filter((order) => order.status === "in_fulfillment").length, late_deliveries: 0 }, orders, byStatus });
});

module.exports = router;
