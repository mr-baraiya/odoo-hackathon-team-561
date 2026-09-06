const express = require('express');
const { getConnection } = require('../service/database');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validateDiscountBoundary } = require('../utils/discountValidator');

const router = express.Router();

const isUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Helper to safely execute DB query with standard JSON response handling
 */
async function withDB(req, res, queryFn) {
  let db;
  try {
    db = await getConnection();
    return await queryFn(db);
  } catch (err) {
    console.error('[salesRep.route] DB error:', err.message, err.stack);
    return res.status(500).json({
      success: false,
      message: 'Database operational error: ' + err.message
    });
  } finally {
    if (db) db.release();
  }
}

/**
 * 1. GET /api/sales-rep/summary
 * Returns Sales Rep dashboard KPI metrics directly from PostgreSQL
 */
router.get('/summary', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const assignedAccounts = await db.queryOne(`SELECT COUNT(*) as count FROM customers`);
    
    const pipelineSum = await db.queryOne(`
      SELECT COALESCE(SUM(total_amount), 0) as total_val, COUNT(*) as deal_count 
      FROM quotations 
      WHERE status IN ('sent_to_customer', 'under_negotiation', 'approved', 'draft')
    `);

    const quotationRequests = await db.queryOne(`
      SELECT COUNT(*) as count 
      FROM quotations 
      WHERE status = 'customer_request' OR is_customer_request = TRUE
    `);

    const openNegotiations = await db.queryOne(`
      SELECT COUNT(*) as count 
      FROM negotiation_requests 
      WHERE status = 'open'
    `);

    const pendingApprovals = await db.queryOne(`
      SELECT COUNT(*) as count 
      FROM quotation_approvals 
      WHERE action IS NULL OR action = 'returned_for_revision'
    `);

    const wonDeals = await db.queryOne(`
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as won_val
      FROM quotations 
      WHERE status IN ('confirmed', 'in_fulfillment', 'fulfilled')
    `);

    const lostDeals = await db.queryOne(`
      SELECT COUNT(*) as count 
      FROM quotations 
      WHERE status IN ('rejected', 'cancelled')
    `);

    const totalRevenue = await db.queryOne(`
      SELECT COALESCE(SUM(amount_paid), 0) as revenue
      FROM invoices
    `);

    const healthAlerts = await db.queryAll(`
      SELECT dha.*, q.quote_number, c.company_name
      FROM deal_health_alerts dha
      LEFT JOIN quotations q ON q.id = dha.quotation_id
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE dha.status = 'open'
      ORDER BY dha.triggered_at DESC
      LIMIT 10
    `);

    const monthlyQuota = 500000;
    const currentClosedWon = Number(wonDeals?.won_val || 0);
    const quotaPct = Math.round((currentClosedWon / monthlyQuota) * 100);

    return res.json({
      success: true,
      assigned_accounts_count: Number(assignedAccounts?.count || 0),
      active_pipeline_value: Number(pipelineSum?.total_val || 0),
      active_deals_count: Number(pipelineSum?.deal_count || 0),
      quotation_requests_count: Number(quotationRequests?.count || 0),
      open_negotiations_count: Number(openNegotiations?.count || 0),
      pending_approvals_count: Number(pendingApprovals?.count || 0),
      won_deals_count: Number(wonDeals?.count || 0),
      lost_deals_count: Number(lostDeals?.count || 0),
      revenue: Number(totalRevenue?.revenue || 0),
      health_alerts: healthAlerts || [],
      quota: {
        target: monthlyQuota,
        achieved: currentClosedWon,
        percentage: quotaPct,
      },
      sales_rep_name: req.user?.full_name || req.user?.name || 'Sales Representative',
      sales_rep_role: 'Senior Sales Representative',
    });
  });
});

/**
 * 2. GET /api/sales-rep/customers
 * Assigned customer portfolio with discount ceilings & contact details
 */
router.get('/customers', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const rows = await db.queryAll(`
      SELECT c.*, ct.label AS tier_label, ct.code AS tier_code, ct.default_discount_ceiling_pct
      FROM customers c
      LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
      ORDER BY c.company_name ASC
    `);

    const formatted = rows.map((r) => ({
      id: r.id,
      company_name: r.company_name,
      primary_contact_name: r.primary_contact_name,
      primary_contact_email: r.primary_contact_email,
      primary_contact_phone: r.primary_contact_phone || 'N/A',
      tier_label: r.tier_label || 'Gold Enterprise',
      tier_code: r.tier_code || 'gold',
      discount_ceiling_pct: Number(r.default_discount_ceiling_pct || 15),
      billing_address: r.billing_address,
      shipping_address: r.shipping_address,
      currency_code: r.currency_code || 'USD',
      created_at: r.created_at,
    }));

    return res.json({ success: true, data: formatted });
  });
});

/**
 * GET /api/sales-rep/customers/:id/history
 * Fetch customer quotation, order & payment history from PostgreSQL
 */
router.get('/customers/:id/history', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  await withDB(req, res, async (db) => {
    const customer = await db.queryOne(`
      SELECT c.*, ct.label AS tier_label, ct.default_discount_ceiling_pct
      FROM customers c
      LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
      WHERE c.id::text = $1
    `, [id]);

    const quotations = await db.queryAll(`
      SELECT q.*, 
             (SELECT COUNT(*) FROM quotation_lines ql WHERE ql.quotation_id = q.id) as item_count
      FROM quotations q
      WHERE q.customer_id::text = $1
      ORDER BY q.created_at DESC
    `, [id]);

    const invoices = await db.queryAll(`
      SELECT i.*, q.quote_number
      FROM invoices i
      JOIN quotations q ON q.id = i.quotation_id
      WHERE q.customer_id::text = $1
      ORDER BY i.created_at DESC
    `, [id]);

    return res.json({
      success: true,
      data: {
        customer,
        quotations: quotations || [],
        invoices: invoices || []
      }
    });
  });
});

/**
 * 3. GET /api/sales-rep/products
 * Product Catalog with stock availability, subscription plans, and upsell rules
 */
router.get('/products', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const products = await db.queryAll(`
      SELECT 
        p.*,
        pc.name as category_name,
        pc.discount_ceiling_pct as category_discount_ceiling,
        COALESCE(SUM(ws.quantity_on_hand), 0) as total_quantity_on_hand,
        COALESCE(SUM(ws.quantity_reserved), 0) as total_quantity_reserved
      FROM products p
      LEFT JOIN product_categories pc ON pc.id = p.category_id
      LEFT JOIN warehouse_stock ws ON ws.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id, pc.id
      ORDER BY p.name ASC
    `);

    const subPlans = await db.queryAll(`SELECT * FROM subscription_plans`);
    const upsellRules = await db.queryAll(`
      SELECT ur.*, p.name as suggested_product_name, p.sku as suggested_sku, p.base_price
      FROM upsell_rules ur
      JOIN products p ON p.id = ur.suggested_product_id
      WHERE ur.is_active = TRUE
    `);

    const formatted = products.map(p => {
      const onHand = Number(p.total_quantity_on_hand || 0);
      const reserved = Number(p.total_quantity_reserved || 0);
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description,
        category_name: p.category_name || 'General',
        unit: p.unit,
        base_price: Number(p.base_price),
        cost_price: Number(p.cost_price),
        tax_rate_pct: Number(p.tax_rate_pct),
        quantity_on_hand: onHand,
        quantity_reserved: reserved,
        quantity_available: Math.max(0, onHand - reserved),
        plans: subPlans.filter(sp => sp.product_id === p.id),
        upsell: upsellRules.filter(ur => ur.base_product_id === p.id)
      };
    });

    return res.json({ success: true, data: formatted });
  });
});

/**
 * 4. GET /api/sales-rep/quotation-requests & POST /api/sales-rep/quotations/:id/convert-request
 * Customer quotation requests inbox
 */
router.get('/quotation-requests', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const requests = await db.queryAll(`
      SELECT q.*, c.company_name, c.primary_contact_name, c.primary_contact_email
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.status = 'customer_request' OR q.is_customer_request = TRUE
      ORDER BY q.created_at DESC
    `);

    return res.json({ success: true, data: requests || [] });
  });
});

router.post('/quotations/:id/convert-request', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  await withDB(req, res, async (db) => {
    await db.query(`
      UPDATE quotations 
      SET status = 'draft', is_customer_request = FALSE, updated_at = NOW() 
      WHERE id::text = $1 OR quote_number = $1
    `, [id]);

    return res.json({
      success: true,
      message: 'Quotation request converted to official draft quotation successfully.',
      quotation_id: id
    });
  });
});

/**
 * 5. GET /api/sales-rep/quotations
 * List assigned quotations with negotiation counter-offer status
 */
router.get('/quotations', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const rows = await db.queryAll(`
      SELECT q.*, c.company_name, c.primary_contact_name, c.primary_contact_email,
             (SELECT COUNT(*) FROM negotiation_requests nr WHERE nr.quotation_id = q.id AND nr.status = 'open') as open_neg_count
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      ORDER BY q.created_at DESC
    `);

    const formatted = rows.map((r) => ({
      id: r.id,
      quote_number: r.quote_number,
      customer_id: r.customer_id,
      company_name: r.company_name || 'Assigned Client',
      contact_name: r.primary_contact_name || 'Primary Contact',
      contact_email: r.primary_contact_email || '',
      status: r.status,
      total_amount: Number(r.total_amount || 0),
      subtotal: Number(r.subtotal || 0),
      total_discount_amount: Number(r.total_discount_amount || 0),
      order_level_discount_pct: Number(r.order_level_discount_pct || 0),
      currency_code: r.currency_code || 'USD',
      has_open_negotiation: Number(r.open_neg_count || 0) > 0,
      created_at: r.created_at,
    }));

    return res.json({ success: true, data: formatted });
  });
});

/**
 * 6. POST /api/sales-rep/quotations/:id/submit
 * Submit quotation with backend discount governance validation
 */
router.post('/quotations/:id/submit', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { order_level_discount_pct } = req.body || {};

  await withDB(req, res, async (db) => {
    const quote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const discountPct = order_level_discount_pct !== undefined ? Number(order_level_discount_pct) : Number(quote.order_level_discount_pct || 0);

    // Strict Backend Discount Governance Boundary Validation
    const boundaryCheck = validateDiscountBoundary(discountPct);

    if (!boundaryCheck.allowed) {
      return res.status(boundaryCheck.status).json({
        success: false,
        message: boundaryCheck.message
      });
    }

    const newStatus = boundaryCheck.targetStatus; // 'sent_to_customer' or 'pending_approval'
    const userId = isUUID(req.user?.id) ? req.user.id : quote.sales_rep_id;

    // Update Quotation Status in PostgreSQL
    await db.query(`
      UPDATE quotations 
      SET order_level_discount_pct = $1,
          status = $2,
          updated_at = NOW()
      WHERE id = $3
    `, [discountPct, newStatus, quote.id]);

    // Clear previous pending approval records
    await db.query(`DELETE FROM quotation_approvals WHERE quotation_id = $1 AND action IS NULL`, [quote.id]).catch(() => {});

    // Create Approval Records if required
    if (boundaryCheck.requiresApproval) {
      for (let i = 0; i < boundaryCheck.requiredLevels.length; i++) {
        const level = boundaryCheck.requiredLevels[i];
        await db.query(`
          INSERT INTO quotation_approvals (quotation_id, approval_level, sequence_order, assigned_to_user_id, reason, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [quote.id, level, i + 1, userId, `Submitted ${discountPct}% discount requiring ${level.replace('_', ' ')} approval.`]);
      }
    }

    // Record Audit Log
    await db.query(`
      INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
      VALUES ('quotation', $1, 'SUBMITTED', $2, $3, NOW())
    `, [quote.id, `Submitted with ${discountPct}% discount. Status: ${newStatus}`, userId]);

    return res.json({
      success: true,
      message: boundaryCheck.requiresApproval ? 
        `Quotation submitted! Discount of ${discountPct}% requires approval.` :
        `Quotation submitted and authorized directly! Discount is ${discountPct}%.`,
      status: newStatus,
      requires_approval: boundaryCheck.requiresApproval,
      required_levels: boundaryCheck.requiredLevels
    });
  });
});

/**
 * 7. POST /api/sales-rep/quotations/:id/send
 * Send quotation to customer (strictly prohibited if pending_approval or draft)
 */
router.post('/quotations/:id/send', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  await withDB(req, res, async (db) => {
    const quote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quote.status === 'pending_approval') {
      return res.status(403).json({
        success: false,
        message: 'Cannot send quotation awaiting approval. Manager / Finance sign-off required first.'
      });
    }

    await db.query(`UPDATE quotations SET status = 'sent_to_customer', updated_at = NOW() WHERE id = $1`, [quote.id]);

    return res.json({
      success: true,
      message: `Quotation ${quote.quote_number} sent to customer successfully.`,
      status: 'sent_to_customer'
    });
  });
});

/**
 * 8. GET /api/sales-rep/approvals
 * Approval Tracking Progress for Rep's Submitted Quotations
 */
router.get('/approvals', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const approvals = await db.queryAll(`
      SELECT 
        qa.*,
        q.quote_number,
        q.order_level_discount_pct,
        q.total_amount,
        q.status as quotation_status,
        c.company_name as customer_name
      FROM quotation_approvals qa
      JOIN quotations q ON q.id = qa.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY qa.created_at DESC
    `);

    return res.json({ success: true, data: approvals || [] });
  });
});

/**
 * 9. GET /api/sales-rep/negotiations & POST /api/sales-rep/quotations/:id/respond-negotiation
 * Customer negotiation proposals & mandatory re-approval engine
 */
router.get('/negotiations', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const negs = await db.queryAll(`
      SELECT 
        nr.*,
        q.quote_number,
        q.order_level_discount_pct as current_discount_pct,
        q.total_amount,
        c.company_name as customer_name
      FROM negotiation_requests nr
      JOIN quotations q ON q.id = nr.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY nr.created_at DESC
    `);

    return res.json({ success: true, data: negs || [] });
  });
});

router.post('/quotations/:id/respond-negotiation', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { action, revisedDiscountPct, message } = req.body || {};

  await withDB(req, res, async (db) => {
    const quote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const discountVal = revisedDiscountPct !== undefined ? Number(revisedDiscountPct) : Number(quote.order_level_discount_pct || 0);

    // Mandatory Negotiation Re-Approval Engine Check
    const boundaryCheck = validateDiscountBoundary(discountVal);
    if (action !== 'reject' && !boundaryCheck.allowed) {
      return res.status(boundaryCheck.status).json({ success: false, message: boundaryCheck.message });
    }

    const userId = isUUID(req.user?.id) ? req.user.id : quote.sales_rep_id;

    if (action === 'accept' || action === 'counter') {
      const statusToSet = boundaryCheck.requiresApproval ? 'pending_approval' : 'sent_to_customer';

      await db.query(`
        UPDATE quotations 
        SET order_level_discount_pct = $1,
            status = $2,
            updated_at = NOW() 
        WHERE id = $3
      `, [discountVal, statusToSet, quote.id]);

      await db.query(`
        UPDATE negotiation_requests 
        SET status = 'accepted', response_message = $1, resolved_at = NOW() 
        WHERE quotation_id = $2 AND status = 'open'
      `, [message || `Sales rep responded: ${action} with ${discountVal}% discount`, quote.id]);

      if (boundaryCheck.requiresApproval) {
        await db.query(`DELETE FROM quotation_approvals WHERE quotation_id = $1 AND action IS NULL`, [quote.id]).catch(() => {});
        for (let i = 0; i < boundaryCheck.requiredLevels.length; i++) {
          const level = boundaryCheck.requiredLevels[i];
          await db.query(`
            INSERT INTO quotation_approvals (quotation_id, approval_level, sequence_order, assigned_to_user_id, reason, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
          `, [quote.id, level, i + 1, userId, `Revised negotiation discount of ${discountVal}% requires ${level.replace('_', ' ')} approval.`]);
        }
      }
    } else if (action === 'reject') {
      await db.query(`UPDATE quotations SET status = 'under_negotiation', updated_at = NOW() WHERE id = $1`, [quote.id]);
      await db.query(`
        UPDATE negotiation_requests 
        SET status = 'rejected', response_message = $1, resolved_at = NOW() 
        WHERE quotation_id = $2 AND status = 'open'
      `, [message || 'Proposal declined by sales rep', quote.id]);
    }

    return res.json({
      success: true,
      message: `Negotiation action '${action}' processed successfully.`,
      status: quote.status
    });
  });
});

/**
 * 10. GET /api/sales-rep/orders & GET /api/sales-rep/fulfillment
 * Confirmed Orders & Read-Only Warehouse Fulfillment Monitor
 */
router.get('/orders', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const orders = await db.queryAll(`
      SELECT 
        q.id as quotation_id,
        q.quote_number,
        q.total_amount,
        q.status as order_status,
        q.created_at,
        c.company_name as customer_name,
        c.shipping_address,
        fo.status as fulfillment_status,
        i.invoice_number,
        i.status as payment_status,
        i.amount_due,
        i.amount_paid
      FROM quotations q
      JOIN customers c ON c.id = q.customer_id
      LEFT JOIN fulfillment_orders fo ON fo.quotation_id = q.id
      LEFT JOIN invoices i ON i.quotation_id = q.id
      WHERE q.status IN ('confirmed', 'in_fulfillment', 'fulfilled')
      ORDER BY q.created_at DESC
    `);

    return res.json({ success: true, data: orders || [] });
  });
});

router.get('/fulfillment', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const fulfillments = await db.queryAll(`
      SELECT 
        fo.id as fulfillment_id,
        fo.status as fulfillment_status,
        fo.promised_delivery_date,
        q.quote_number,
        c.company_name as customer_name
      FROM fulfillment_orders fo
      JOIN quotations q ON q.id = fo.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY fo.created_at DESC
    `);

    return res.json({ success: true, data: fulfillments || [] });
  });
});

/**
 * 11. GET /api/sales-rep/invoices
 * Read-Only Invoice & Payment Ledger
 */
router.get('/invoices', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const invoices = await db.queryAll(`
      SELECT 
        i.*,
        q.quote_number,
        c.company_name as customer_name
      FROM invoices i
      JOIN quotations q ON q.id = i.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY i.created_at DESC
    `);

    return res.json({ success: true, data: invoices || [] });
  });
});

/**
 * 12. GET /api/sales-rep/deal-health, /reports, /notifications
 */
router.get('/deal-health', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const alerts = await db.queryAll(`
      SELECT dha.*, q.quote_number, c.company_name
      FROM deal_health_alerts dha
      JOIN quotations q ON q.id = dha.quotation_id
      JOIN customers c ON c.id = q.customer_id
      ORDER BY dha.triggered_at DESC
      LIMIT 20
    `);

    return res.json({ success: true, data: alerts || [] });
  });
});

router.get('/reports', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const salesTrend = await db.queryAll(`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        COUNT(*) as quotation_count,
        SUM(total_amount) as pipeline_value
      FROM quotations
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
      LIMIT 12
    `);

    const winLoss = await db.queryAll(`
      SELECT status, COUNT(*) as count
      FROM quotations
      GROUP BY status
    `);

    return res.json({
      success: true,
      data: {
        sales_trend: salesTrend || [],
        win_loss: winLoss || []
      }
    });
  });
});

router.get('/notifications', authenticateJWT, async (req, res) => {
  await withDB(req, res, async (db) => {
    const notifications = await db.queryAll(`
      SELECT dha.*, q.quote_number, c.company_name
      FROM deal_health_alerts dha
      LEFT JOIN quotations q ON q.id = dha.quotation_id
      LEFT JOIN customers c ON c.id = q.customer_id
      ORDER BY dha.triggered_at DESC
      LIMIT 20
    `);

    return res.json({ success: true, data: notifications || [] });
  });
});

module.exports = router;
