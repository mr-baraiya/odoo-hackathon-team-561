const express = require("express");
const seed = require("../db/dealflow360_seed");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const Database = require("../service/database");

const router = express.Router();

async function updateApprovalInDatabase(id, action, reason, performedByEmail) {
  let db;
  try {
    db = await Database.getConnection();
    await db.query("BEGIN");
    const approval = await db.queryOne(
      `SELECT qa.id, qa.quotation_id, q.quote_number, actor.id AS performed_by_user_id
       FROM quotation_approvals qa
       JOIN quotations q ON q.id = qa.quotation_id
       LEFT JOIN users actor ON actor.email = $2
       WHERE qa.id::text = $1 AND qa.approval_level = 'sales_manager'`,
      [id, performedByEmail],
    );
    if (!approval) {
      await db.query("ROLLBACK");
      return null;
    }

    await db.query(
      `UPDATE quotation_approvals
       SET action = $1::approval_action, reason = $2, acted_at = now()
       WHERE id = $3`,
      [action, reason, approval.id],
    );

    const nextStatus =
      action === "rejected"
        ? "rejected"
        : action === "returned_for_revision"
          ? "draft"
          : null;
    if (nextStatus) {
      await db.query(
        "UPDATE quotations SET status = $1::quotation_status, updated_at = now() WHERE id = $2",
        [nextStatus, approval.quotation_id],
      );
    } else {
      await db.query(
        `UPDATE quotations SET status = 'approved'::quotation_status, updated_at = now()
         WHERE id = $1 AND NOT EXISTS (
           SELECT 1 FROM quotation_approvals
           WHERE quotation_id = $1 AND action IS DISTINCT FROM 'approved'::approval_action
         )`,
        [approval.quotation_id],
      );
    }

    await db.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, performed_by_user_id, reason)
       VALUES ('quotation', $1, $2, $3, $4)`,
      [
        approval.quotation_id,
        `approval_${action}`,
        approval.performed_by_user_id || null,
        reason,
      ],
    );
    await db.query("COMMIT");
    return { quoteId: approval.quote_number };
  } catch (error) {
    if (db) await db.query("ROLLBACK").catch(() => {});
    return null;
  } finally {
    if (db) db.release();
  }
}

const APPROVAL_RULES = [
  {
    id: "1001",
    min_risk_score: 15.0,
    max_risk_score: 25.0,
    required_levels: ["sales_manager"],
  },
  {
    id: "1002",
    min_risk_score: 25.0,
    max_risk_score: null,
    required_levels: ["sales_manager", "finance_ops"],
  },
];

// GET /api/approvals
router.get("/", authenticateJWT, (req, res) => {
  const allApprovals = seed.QUOTATIONS.flatMap((q) => q.approvals || []);
  res.json(allApprovals);
});

// GET /api/approvals/pending
router.get("/pending", authenticateJWT, (req, res) => {
  const pendingQuotes = seed.QUOTATIONS.filter(
    (q) => q.status === "pending_approval",
  );
  res.json(pendingQuotes);
});

// GET /api/approvals/queue
router.get(
  "/queue",
  authenticateJWT,
  authorizeRoles("admin", "sales_manager", "finance_ops"),
  async (req, res) => {
    let db;
    try {
      db = await Database.getConnection();
      const queue = await db.queryAll(`
        SELECT qa.id, q.quote_number AS "quoteId", c.company_name AS customer,
               c.primary_contact_email AS "customerEmail", c.primary_contact_phone AS "customerPhone",
               rep.full_name AS "requestedBy", qa.reason, q.total_amount AS amount, q.created_at AS "createdAt"
        FROM quotation_approvals qa
        JOIN quotations q ON q.id = qa.quotation_id
        JOIN customers c ON c.id = q.customer_id
        JOIN users rep ON rep.id = q.sales_rep_id
        WHERE qa.action IS NULL AND qa.approval_level = 'sales_manager'
        ORDER BY q.created_at DESC LIMIT 50
      `);
      return res.json(queue.map((item) => ({ ...item, status: "pending" })));
    } catch (error) {
      // Seed data remains available when PostgreSQL is not configured locally.
    } finally {
      if (db) db.release();
    }
    const queue = seed.QUOTATIONS.flatMap((quote) =>
      (quote.approvals || []).map((step, index) => ({
        id: step.id,
        quoteId: quote.quote_number || quote.id,
        customer: quote.customer_name,
        customerEmail: quote.customer_email || "",
        customerPhone: quote.customer_phone || "",
        blendedRisk: quote.blended_risk_score,
        stage: step.approval_level,
        assignedTo:
          seed.USERS.find((user) => user.role === step.approval_level)
            ?.full_name || step.approval_level,
        date: quote.created_at,
        status:
          step.action === "approved"
            ? "approved"
            : step.action === "rejected"
              ? "rejected"
              : step.action === "returned_for_revision"
                ? "returned"
                : "pending",
        approvalSteps: quote.approvals,
        violations: [],
        worstLine: "Review quotation policy compliance",
        overallPattern: `Quote total: ${quote.total_amount} ${quote.currency_code || "USD"}`,
        step: index + 1,
      })),
    );
    res.json(queue);
  },
);

// --- APPROVAL RULES ---
router.get("/rules", authenticateJWT, (req, res) => {
  res.json(APPROVAL_RULES);
});

router.get("/rules/:id", authenticateJWT, (req, res) => {
  const rule = APPROVAL_RULES.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ message: "Rule not found" });
  res.json(rule);
});

router.post("/rules", authenticateJWT, authorizeRoles("admin"), (req, res) => {
  const newRule = {
    id: `100${APPROVAL_RULES.length + 1}`,
    min_risk_score: Number(req.body.min_risk_score || 0),
    max_risk_score: req.body.max_risk_score
      ? Number(req.body.max_risk_score)
      : null,
    required_levels: req.body.required_levels || ["sales_manager"],
  };
  APPROVAL_RULES.push(newRule);
  res.status(201).json(newRule);
});

router.put(
  "/rules/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  (req, res) => {
    const rule = APPROVAL_RULES.find((r) => r.id === req.params.id);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    Object.assign(rule, req.body);
    res.json(rule);
  },
);

router.delete(
  "/rules/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  (req, res) => {
    const idx = APPROVAL_RULES.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Rule not found" });
    const deleted = APPROVAL_RULES.splice(idx, 1)[0];
    res.json({ message: "Approval rule deleted", rule: deleted });
  },
);

// GET /api/approvals/:id
router.get("/:id/details", authenticateJWT, async (req, res) => {
  let db;
  try {
    db = await Database.getConnection();
    const quote = await db.queryOne(
      `SELECT q.*, c.company_name AS customer_name,
              c.primary_contact_email AS customer_email,
              c.primary_contact_phone AS customer_phone
       FROM quotations q
       JOIN customers c ON c.id = q.customer_id
       WHERE q.id::text = $1 OR q.quote_number = $1
          OR EXISTS (SELECT 1 FROM quotation_approvals qa WHERE qa.quotation_id = q.id AND qa.id::text = $1)`,
      [req.params.id],
    );
    if (quote) {
      const approvals = await db.queryAll(
        `SELECT qa.*, qa.approval_level AS role,
                CASE WHEN qa.action = 'approved' THEN 'approved'
                     WHEN qa.action = 'rejected' THEN 'rejected'
                     WHEN qa.action = 'returned_for_revision' THEN 'returned'
                     ELSE 'pending' END AS status,
                qa.acted_at AS date,
                COALESCE(assigned.full_name, qa.approval_level::text) AS name
         FROM quotation_approvals qa
         LEFT JOIN users assigned ON assigned.id = qa.assigned_to_user_id
         WHERE qa.quotation_id = $1 ORDER BY qa.sequence_order`,
        [quote.id],
      );
      const auditTrail = await db.queryAll(
        `SELECT al.*, COALESCE(u.full_name, 'System') AS "user",
                al.reason AS action, al.created_at AS date
         FROM audit_log al
         LEFT JOIN users u ON u.id = al.performed_by_user_id
         WHERE al.entity_type = 'quotation' AND al.entity_id = $1
         ORDER BY al.created_at`,
        [quote.id],
      );
      return res.json({ quote, approvals, auditTrail });
    }
  } catch (error) {
    // Seed fallback below keeps the demo usable without PostgreSQL.
  } finally {
    if (db) db.release();
  }

  const quote = seed.QUOTATIONS.find(
    (item) =>
      item.id === req.params.id ||
      item.quote_number === req.params.id ||
      (item.approvals || []).some((step) => step.id === req.params.id),
  );
  if (!quote)
    return res.status(404).json({ message: "Approval quotation not found" });

  const approvals = (quote.approvals || []).map((step, index) => ({
    ...step,
    step: index + 1,
    role: step.approval_level,
    status:
      step.action === "approved"
        ? "approved"
        : step.action === "rejected"
          ? "rejected"
          : "pending",
    date: step.acted_at || null,
  }));
  const auditTrail = seed.AUDIT_LOGS.filter(
    (entry) =>
      entry.entity_type === "quotation" && entry.entity_id === quote.id,
  ).map((entry) => ({
    ...entry,
    user:
      seed.USERS.find((user) => user.id === entry.performed_by_user_id)
        ?.full_name || "System",
    action: entry.reason || entry.action,
    date: entry.created_at,
  }));

  return res.json({ quote, approvals, auditTrail });
});

router.get("/:id", authenticateJWT, (req, res) => {
  const approval = seed.QUOTATIONS.flatMap((q) => q.approvals || []).find(
    (a) => a.id === req.params.id,
  );
  if (!approval)
    return res.status(404).json({ message: "Approval step not found" });
  res.json(approval);
});

// POST /api/approvals/:id/approve
router.post(
  "/:id/approve",
  authenticateJWT,
  authorizeRoles("sales_manager", "finance_ops", "admin"),
  async (req, res) => {
    const { reason } = req.body;
    const databaseResult = await updateApprovalInDatabase(
      req.params.id,
      "approved",
      reason || "Approved by manager",
      req.user.email,
    );
    if (databaseResult)
      return res.json({
        message: "Approval saved to database.",
        quote: databaseResult,
      });
    const quote = seed.QUOTATIONS.find((q) =>
      (q.approvals || []).some((a) => a.id === req.params.id),
    );
    if (!quote)
      return res.status(404).json({ message: "Approval step not found" });

    const appStep = quote.approvals.find((a) => a.id === req.params.id);
    appStep.action = "approved";
    appStep.acted_at = new Date().toISOString();
    appStep.reason = reason || "Approved by manager";

    const allApproved = quote.approvals.every((a) => a.action === "approved");
    if (allApproved) {
      quote.status = "approved";
    }

    seed.AUDIT_LOGS.push({
      id: `audit_${Date.now()}`,
      entity_type: "quotation",
      entity_id: quote.id,
      action: "approval_approved",
      performed_by_user_id: req.user.id,
      reason: reason || "Approved quotation step",
      created_at: new Date().toISOString(),
    });

    res.json({
      message: `Approval step approved. Quote status: ${quote.status}`,
      quote,
    });
  },
);

// POST /api/approvals/:id/reject
router.post(
  "/:id/reject",
  authenticateJWT,
  authorizeRoles("sales_manager", "finance_ops", "admin"),
  async (req, res) => {
    const { reason } = req.body;
    const databaseResult = await updateApprovalInDatabase(
      req.params.id,
      "rejected",
      reason || "Rejected by manager",
      req.user.email,
    );
    if (databaseResult)
      return res.json({
        message: "Rejection saved to database.",
        quote: databaseResult,
      });
    const quote = seed.QUOTATIONS.find((q) =>
      (q.approvals || []).some((a) => a.id === req.params.id),
    );
    if (!quote)
      return res.status(404).json({ message: "Approval step not found" });

    const appStep = quote.approvals.find((a) => a.id === req.params.id);
    appStep.action = "rejected";
    appStep.acted_at = new Date().toISOString();
    appStep.reason = reason || "Rejected by manager";

    quote.status = "rejected";

    seed.AUDIT_LOGS.push({
      id: `audit_${Date.now()}`,
      entity_type: "quotation",
      entity_id: quote.id,
      action: "approval_rejected",
      performed_by_user_id: req.user.id,
      reason: reason || "Rejected quotation step",
      created_at: new Date().toISOString(),
    });

    res.json({
      message: "Approval step rejected. Quote status: rejected",
      quote,
    });
  },
);

// POST /api/approvals/:id/return
router.post(
  "/:id/return",
  authenticateJWT,
  authorizeRoles("sales_manager", "finance_ops", "admin"),
  async (req, res) => {
    const { reason } = req.body;
    const databaseResult = await updateApprovalInDatabase(
      req.params.id,
      "returned_for_revision",
      reason || "Returned for revision",
      req.user.email,
    );
    if (databaseResult)
      return res.json({
        message: "Return request saved to database.",
        quote: databaseResult,
      });
    const quote = seed.QUOTATIONS.find((q) =>
      (q.approvals || []).some((a) => a.id === req.params.id),
    );
    if (!quote)
      return res.status(404).json({ message: "Approval step not found" });

    const appStep = quote.approvals.find((a) => a.id === req.params.id);
    appStep.action = "returned_for_revision";
    appStep.acted_at = new Date().toISOString();
    appStep.reason = reason || "Returned for revision";

    quote.status = "draft";

    seed.AUDIT_LOGS.push({
      id: `audit_${Date.now()}`,
      entity_type: "quotation",
      entity_id: quote.id,
      action: "approval_returned_for_revision",
      performed_by_user_id: req.user.id,
      reason: reason || "Returned for revision",
      created_at: new Date().toISOString(),
    });

    res.json({
      message: "Quotation returned for revision. Status: draft",
      quote,
    });
  },
);

module.exports = router;
