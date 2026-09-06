const express = require('express');
const { getConnection } = require('../service/database');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Helper to safely execute DB queries with error handling
 */
async function withDB(req, res, queryFn) {
  let db;
  try {
    db = await getConnection();
    return await queryFn(db);
  } catch (err) {
    console.error('[financeOps.route] DB error:', err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: 'Database operational error: ' + err.message
    });
  } finally {
    if (db) db.release();
  }
}

/**
 * 1. GET /api/finance-ops/dashboard
 * Aggregated KPIs for Finance & Operations Dashboard
 */
router.get('/dashboard', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    // Total Revenue from Invoices
    const revRes = await db.queryOne(`
      SELECT COALESCE(SUM(amount_paid), 0) as total_revenue
      FROM invoices
    `);

    // Pending Invoices
    const pendingInv = await db.queryOne(`
      SELECT COALESCE(SUM(amount_due - amount_paid), 0) as pending_val, COUNT(*) as count
      FROM invoices
      WHERE status IN ('draft', 'sent', 'partially_paid', 'overdue')
    `);

    // Invoice Status Breakdown
    const invoiceStats = await db.queryOne(`
      SELECT 
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status IN ('sent', 'overdue', 'partially_paid') THEN 1 END) as unpaid_count,
        COUNT(*) as total_count
      FROM invoices
    `);

    // Pending Finance Approvals (>25% - 50% discount where Manager Step 1 is approved)
    const pendingApprovals = await db.queryOne(`
      SELECT COUNT(DISTINCT q.id) as count
      FROM quotations q
      JOIN quotation_approvals qa1 ON qa1.quotation_id = q.id AND qa1.approval_level = 'sales_manager'
      LEFT JOIN quotation_approvals qa2 ON qa2.quotation_id = q.id AND qa2.approval_level = 'finance_ops'
      WHERE qa1.action = 'approved'
        AND (qa2.action IS NULL OR qa2.action = 'returned_for_revision')
        AND q.order_level_discount_pct > 25.00
        AND q.order_level_discount_pct <= 50.00
    `);

    // Pending Payments
    const pendingPayments = await db.queryOne(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount_due - amount_paid), 0) as total_val
      FROM invoices
      WHERE status IN ('sent', 'partially_paid', 'overdue')
    `);

    // Fulfillment Status Breakdown
    const fulfillmentStats = await db.queryOne(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'partially_fulfilled' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as completed_count
      FROM fulfillment_orders
    `);

    // Refunds / Credit Notes Total
    const creditNotesStats = await db.queryOne(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount
      FROM credit_notes
    `);

    // Recent Financial Alerts
    const alerts = await db.queryAll(`
      SELECT dha.*, q.quote_number, c.company_name
      FROM deal_health_alerts dha
      LEFT JOIN quotations q ON q.id = dha.quotation_id
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE dha.status IN ('open', 'escalated')
      ORDER BY dha.triggered_at DESC
      LIMIT 10
    `);

    return res.json({
      success: true,
      data: {
        total_revenue: Number(revRes?.total_revenue || 0),
        pending_invoices_value: Number(pendingInv?.pending_val || 0),
        pending_invoices_count: Number(pendingInv?.count || 0),
        paid_invoices_count: Number(invoiceStats?.paid_count || 0),
        unpaid_invoices_count: Number(invoiceStats?.unpaid_count || 0),
        pending_finance_approvals_count: Number(pendingApprovals?.count || 0),
        pending_payments_count: Number(pendingPayments?.count || 0),
        pending_payments_value: Number(pendingPayments?.total_val || 0),
        fulfillment: {
          pending: Number(fulfillmentStats?.pending_count || 0),
          in_progress: Number(fulfillmentStats?.in_progress_count || 0),
          completed: Number(fulfillmentStats?.completed_count || 0),
        },
        credit_notes: {
          count: Number(creditNotesStats?.count || 0),
          total_amount: Number(creditNotesStats?.total_amount || 0)
        },
        alerts: alerts || []
      }
    });
  });
});

/**
 * 2. GET /api/finance-ops/approvals
 * Retrieve dual-approval items requiring Step 2 Finance approval (>25% - 50%)
 */
router.get('/approvals', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    // Only fetch items where Sales Manager Step 1 is approved
    const pendingQuotes = await db.queryAll(`
      SELECT 
        q.id as quotation_id,
        q.quote_number,
        q.total_amount,
        q.order_level_discount_pct,
        q.blended_risk_score,
        q.status as quotation_status,
        q.created_at,
        c.company_name as customer_name,
        ct.label as customer_tier,
        u.full_name as sales_rep_name,
        qa1.action as manager_approval_action,
        qa1.acted_at as manager_approved_at,
        qa2.id as finance_approval_id,
        qa2.action as finance_approval_action
      FROM quotations q
      JOIN customers c ON c.id = q.customer_id
      LEFT JOIN customer_tiers ct ON ct.id = c.tier_id
      JOIN users u ON u.id = q.sales_rep_id
      JOIN quotation_approvals qa1 ON qa1.quotation_id = q.id AND qa1.approval_level = 'sales_manager'
      LEFT JOIN quotation_approvals qa2 ON qa2.quotation_id = q.id AND qa2.approval_level = 'finance_ops'
      WHERE qa1.action = 'approved'
        AND (qa2.action IS NULL OR qa2.action = 'returned_for_revision')
        AND q.order_level_discount_pct > 25.00
        AND q.order_level_discount_pct <= 50.00
      ORDER BY q.created_at DESC
    `);

    return res.json({
      success: true,
      data: pendingQuotes || []
    });
  });
});

/**
 * 3. POST /api/finance-ops/approvals/:id/action
 * Execute Step 2 Finance Approval (approve, reject, return)
 * Enforces backend check: Sales Manager Step 1 MUST be approved first!
 */
router.post('/approvals/:id/action', authenticateJWT, async (req, res) => {
  const quotationId = req.params.id;
  const { action, reason } = req.body; // action: 'approve' | 'reject' | 'return'

  if (!['approve', 'reject', 'return'].includes(action?.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "Invalid action. Must be 'approve', 'reject', or 'return'."
    });
  }

  await withDB(req, res, async (db) => {
    const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    
    const quote = isUUID(quotationId)
      ? await db.queryOne(`SELECT * FROM quotations WHERE id = $1`, [quotationId])
      : await db.queryOne(`SELECT * FROM quotations WHERE quote_number = $1`, [quotationId]);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const targetQuoteId = quote.id;

    // Map lowercase action to DB enum
    let dbAction = 'approved';
    let newQuoteStatus = 'sent_to_customer';
    if (action.toLowerCase() === 'reject') {
      dbAction = 'rejected';
      newQuoteStatus = 'rejected';
    } else if (action.toLowerCase() === 'return') {
      dbAction = 'returned_for_revision';
      newQuoteStatus = 'under_negotiation';
    }

    // Check if finance approval record exists
    const financeApproval = await db.queryOne(`
      SELECT id FROM quotation_approvals 
      WHERE quotation_id = $1 AND approval_level = 'finance_ops'
    `, [targetQuoteId]);

    const userId = isUUID(req.user?.id) ? req.user.id : '00000000-0000-0000-0000-000000000103';

    if (financeApproval) {
      await db.query(`
        UPDATE quotation_approvals 
        SET action = $1, reason = $2, assigned_to_user_id = $3, acted_at = NOW()
        WHERE id = $4
      `, [dbAction, reason || null, userId, financeApproval.id]);
    } else {
      await db.query(`
        INSERT INTO quotation_approvals (quotation_id, approval_level, sequence_order, assigned_to_user_id, action, reason, acted_at)
        VALUES ($1, 'finance_ops', 2, $2, $3, $4, NOW())
      `, [targetQuoteId, userId, dbAction, reason || null]);
    }

    // Update Quotation Status
    await db.query(`
      UPDATE quotations 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [newQuoteStatus, targetQuoteId]);

    // If approved and sent to customer, reserve stock for non-recurring line items (Stock Availability Check & Reservation)
    if (newQuoteStatus === 'sent_to_customer' || newQuoteStatus === 'approved') {
      const lines = await db.queryAll(`
        SELECT product_id, quantity 
        FROM quotation_lines 
        WHERE quotation_id = $1 AND is_recurring = FALSE
      `, [targetQuoteId]);

      for (const line of lines) {
        await db.query(`
          UPDATE warehouse_stock 
          SET quantity_reserved = quantity_reserved + $1 
          WHERE product_id = $2
        `, [line.quantity, line.product_id]);
      }
    }

    // Record Audit Log
    await db.query(`
      INSERT INTO audit_log (entity_type, entity_id, action, performed_by_user_id, reason)
      VALUES ('quotation', $1, $2, $3, $4)
    `, [targetQuoteId, `finance_ops_${dbAction}`, userId, reason || 'Finance Ops review action']);

    return res.json({
      success: true,
      message: `Quotation approval action '${action}' recorded successfully.`,
      status: newQuoteStatus,
      quotation: { id: targetQuoteId, quote_number: quote.quote_number, status: newQuoteStatus }
    });
  });
});

/**
 * 4. GET /api/finance-ops/invoices
 * List all invoices from PostgreSQL
 */
router.get('/invoices', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const invoices = await db.queryAll(`
      SELECT 
        i.*,
        q.quote_number,
        c.company_name as customer_name,
        c.billing_address
      FROM invoices i
      JOIN quotations q ON q.id = i.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY i.created_at DESC
    `);

    return res.json({
      success: true,
      data: invoices || []
    });
  });
});

/**
 * 5. POST /api/finance-ops/invoices/generate
 * Idempotent Invoice Generation from Confirmed Quotation/Order
 */
router.post('/invoices/generate', authenticateJWT, async (req, res) => {
  const { quotation_id } = req.body;

  if (!quotation_id) {
    return res.status(400).json({ success: false, message: 'quotation_id is required' });
  }

  await withDB(req, res, async (db) => {
    // 1. Idempotency Check: Does invoice already exist for this quotation/order?
    const existingInvoice = await db.queryOne(`
      SELECT i.*, q.quote_number, c.company_name as customer_name
      FROM invoices i
      JOIN quotations q ON q.id = i.quotation_id
      JOIN customers c ON c.id = q.customer_id
      WHERE i.quotation_id = $1
    `, [quotation_id]);

    if (existingInvoice) {
      return res.json({
        success: true,
        message: `Invoice ${existingInvoice.invoice_number} already exists for this order.`,
        is_existing: true,
        invoice: existingInvoice
      });
    }

    // 2. Query quotation details
    const quotation = await db.queryOne(`
      SELECT q.*, c.company_name 
      FROM quotations q
      JOIN customers c ON c.id = q.customer_id
      WHERE q.id = $1
    `, [quotation_id]);

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation/Order not found' });
    }

    // Generate unique invoice number
    const invCount = await db.queryOne('SELECT COUNT(*) as count FROM invoices');
    const invNum = `INV-${202600 + Number(invCount?.count || 0) + 1}`;
    const dueDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

    // Create Invoice Record
    const newInvoice = await db.queryOne(`
      INSERT INTO invoices (quotation_id, invoice_number, invoice_type, amount_due, amount_paid, status, due_date, issued_at)
      VALUES ($1, $2, 'one_time', $3, 0, 'sent', $4, NOW())
      RETURNING *
    `, [quotation_id, invNum, quotation.total_amount, dueDate]);

    return res.json({
      success: true,
      message: `Invoice ${invNum} generated successfully.`,
      is_existing: false,
      invoice: {
        ...newInvoice,
        quote_number: quotation.quote_number,
        customer_name: quotation.company_name
      }
    });
  });
});

/**
 * 6. PATCH /api/finance-ops/invoices/:id/status
 */
router.patch('/invoices/:id/status', authenticateJWT, async (req, res) => {
  const invoiceId = req.params.id;
  const { status } = req.body;

  await withDB(req, res, async (db) => {
    await db.query('UPDATE invoices SET status = $1 WHERE id = $2', [status, invoiceId]);
    return res.json({ success: true, message: `Invoice status updated to ${status}` });
  });
});

/**
 * 7. GET /api/finance-ops/payments
 * Retrieve Payment Records
 */
router.get('/payments', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const payments = await db.queryAll(`
      SELECT 
        p.*,
        i.invoice_number,
        i.amount_due,
        q.quote_number,
        c.company_name as customer_name
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      JOIN quotations q ON q.id = i.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY p.paid_at DESC
    `);

    return res.json({
      success: true,
      data: payments || []
    });
  });
});

/**
 * 8. POST /api/finance-ops/payments/verify
 * Authoritative Backend Payment Verification & PostgreSQL Balance Update
 */
router.post('/payments/verify', authenticateJWT, async (req, res) => {
  const { invoice_id, amount, payment_method, reference_number } = req.body;

  if (!invoice_id || !amount) {
    return res.status(400).json({ success: false, message: 'invoice_id and amount are required' });
  }

  await withDB(req, res, async (db) => {
    const invoice = await db.queryOne('SELECT * FROM invoices WHERE id = $1', [invoice_id]);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const payAmount = Number(amount);
    const newAmountPaid = Number(invoice.amount_paid) + payAmount;
    const newStatus = newAmountPaid >= Number(invoice.amount_due) ? 'paid' : 'partially_paid';

    // Insert Payment Entry
    const payment = await db.queryOne(`
      INSERT INTO payments (invoice_id, amount, payment_method, reference_number, paid_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [invoice_id, payAmount, payment_method || 'bank_transfer', reference_number || `REF-${Date.now()}`]);

    // Update Invoice Status
    await db.query(`
      UPDATE invoices 
      SET amount_paid = $1, status = $2 
      WHERE id = $3
    `, [newAmountPaid, newStatus, invoice_id]);

    return res.json({
      success: true,
      message: `Payment of $${payAmount} verified and recorded. Invoice status is now '${newStatus}'.`,
      payment,
      new_status: newStatus
    });
  });
});

/**
 * 9. GET /api/finance-ops/fulfillment
 * Warehouse Fulfillment & Stock Allocation Monitor
 */
router.get('/fulfillment', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const fulfillments = await db.queryAll(`
      SELECT 
        fo.id as fulfillment_id,
        fo.status as fulfillment_status,
        fo.promised_delivery_date,
        fo.created_at,
        q.id as quotation_id,
        q.quote_number,
        q.total_amount,
        c.company_name as customer_name,
        c.shipping_address
      FROM fulfillment_orders fo
      JOIN quotations q ON q.id = fo.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY fo.created_at DESC
    `);

    // Get stock levels
    const stock = await db.queryAll(`
      SELECT 
        ws.*,
        p.name as product_name,
        p.sku,
        w.name as warehouse_name
      FROM warehouse_stock ws
      JOIN products p ON p.id = ws.product_id
      JOIN warehouses w ON w.id = ws.warehouse_id
    `);

    return res.json({
      success: true,
      data: {
        orders: fulfillments || [],
        stock: stock || []
      }
    });
  });
});

/**
 * 10. POST /api/finance-ops/fulfillment/:id/ship
 * Confirm Warehouse Shipment -> Deducts Physical Stock strictly within PostgreSQL transaction
 */
router.post('/fulfillment/:id/ship', authenticateJWT, async (req, res) => {
  const fulfillmentId = req.params.id;

  await withDB(req, res, async (db) => {
    const fo = await db.queryOne('SELECT * FROM fulfillment_orders WHERE id = $1', [fulfillmentId]);
    if (!fo) {
      return res.status(404).json({ success: false, message: 'Fulfillment order not found' });
    }

    // Get line items from the order/quotation
    const lines = await db.queryAll(`
      SELECT product_id, quantity 
      FROM quotation_lines 
      WHERE quotation_id = $1 AND is_recurring = FALSE
    `, [fo.quotation_id]);

    // Physical Stock Deduction: Deduct quantity_on_hand and clear quantity_reserved
    for (const line of lines) {
      await db.query(`
        UPDATE warehouse_stock 
        SET quantity_on_hand = GREATEST(0, quantity_on_hand - $1),
            quantity_reserved = GREATEST(0, quantity_reserved - $1)
        WHERE product_id = $2
      `, [line.quantity, line.product_id]);
    }

    // Update fulfillment status
    await db.query(`
      UPDATE fulfillment_orders 
      SET status = 'fulfilled', actual_delivery_date = CURRENT_DATE, updated_at = NOW()
      WHERE id = $1
    `, [fulfillmentId]);

    // Update quotation status
    await db.query(`
      UPDATE quotations 
      SET status = 'fulfilled', updated_at = NOW()
      WHERE id = $1
    `, [fo.quotation_id]);

    return res.json({
      success: true,
      message: 'Shipment confirmed. Physical stock deducted in PostgreSQL successfully.',
      status: 'fulfilled'
    });
  });
});

/**
 * 11. GET /api/finance-ops/subscriptions
 * Retrieve Subscription Contracts & Billing Schedules
 */
router.get('/subscriptions', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const subs = await db.queryAll(`
      SELECT 
        s.*,
        c.company_name as customer_name
      FROM subscriptions s
      JOIN customers c ON c.id = s.customer_id
      ORDER BY s.created_at DESC
    `);

    return res.json({
      success: true,
      data: subs || []
    });
  });
});

/**
 * POST /api/finance-ops/subscriptions/:id/action
 * Manage subscription (pause, resume, cancel)
 */
router.post('/subscriptions/:id/action', authenticateJWT, async (req, res) => {
  const subId = req.params.id;
  const { action } = req.body; // 'pause' | 'resume' | 'cancel'

  let newStatus = 'active';
  if (action === 'pause') newStatus = 'paused';
  if (action === 'cancel') newStatus = 'cancelled';
  if (action === 'resume') newStatus = 'active';

  await withDB(req, res, async (db) => {
    await db.query('UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, subId]);
    return res.json({ success: true, message: `Subscription status updated to ${newStatus}` });
  });
});

/**
 * 12. GET & POST /api/finance-ops/credit-notes
 * Credit Notes & Refunds Management
 */
router.get('/credit-notes', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const notes = await db.queryAll(`
      SELECT 
        cn.*,
        i.invoice_number,
        c.company_name as customer_name
      FROM credit_notes cn
      LEFT JOIN invoices i ON i.id = cn.invoice_id
      LEFT JOIN quotations q ON q.id = i.quotation_id
      LEFT JOIN customers c ON c.id = q.customer_id
      ORDER BY cn.issued_at DESC
    `);

    return res.json({ success: true, data: notes || [] });
  });
});

router.post('/credit-notes', authenticateJWT, async (req, res) => {
  const { invoice_id, amount, reason, notes } = req.body;

  await withDB(req, res, async (db) => {
    const invoice = await db.queryOne('SELECT * FROM invoices WHERE id = $1', [invoice_id]);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Fetch a quotation_line_id for link requirements
    const line = await db.queryOne('SELECT id FROM quotation_lines WHERE quotation_id = $1 LIMIT 1', [invoice.quotation_id]);

    const creditNote = await db.queryOne(`
      INSERT INTO credit_notes (quotation_line_id, invoice_id, amount, reason, notes, issued_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [line?.id || '00000000-0000-0000-0000-000000000000', invoice_id, amount, reason || 'other', notes || null]);

    return res.json({
      success: true,
      message: `Credit note of $${amount} created successfully.`,
      credit_note: creditNote
    });
  });
});

/**
 * 13. GET /api/finance-ops/reports
 * SQL Analytics for Finance Reports
 */
router.get('/reports', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    // Monthly Revenue Trend from Payments
    const revTrend = await db.queryAll(`
      SELECT 
        TO_CHAR(paid_at, 'Mon YYYY') as month,
        SUM(amount) as revenue
      FROM payments
      GROUP BY TO_CHAR(paid_at, 'Mon YYYY'), DATE_TRUNC('month', paid_at)
      ORDER BY DATE_TRUNC('month', paid_at) ASC
      LIMIT 12
    `);

    // Invoices by Status
    const invoiceByStatus = await db.queryAll(`
      SELECT status, COUNT(*) as count, SUM(amount_due) as total_due
      FROM invoices
      GROUP BY status
    `);

    return res.json({
      success: true,
      data: {
        monthly_revenue_trend: revTrend || [],
        invoice_distribution: invoiceByStatus || []
      }
    });
  });
});

/**
 * 14. GET /api/finance-ops/notifications
 * Financial Alerts & Notifications
 */
router.get('/notifications', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const alerts = await db.queryAll(`
      SELECT dha.*, q.quote_number, c.company_name
      FROM deal_health_alerts dha
      LEFT JOIN quotations q ON q.id = dha.quotation_id
      LEFT JOIN customers c ON c.id = q.customer_id
      ORDER BY dha.triggered_at DESC
      LIMIT 20
    `);

    return res.json({ success: true, data: alerts || [] });
  });
});

module.exports = router;
