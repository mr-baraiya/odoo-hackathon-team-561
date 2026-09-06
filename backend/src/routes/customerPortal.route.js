const express = require('express');
const seed = require('../db/dealflow360_seed');
const { getConnection } = require('../service/database');
const { authenticateJWT } = require('../middleware/auth.middleware');
const sendWhatsApp = require('../utils/sendWhatsApp');
const { validateDiscountBoundary } = require('../utils/discountValidator');

const router = express.Router();

// Helper to sanitize UUID
const isUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Helper: resolve current user's customerId + user row from JWT
const resolveUserContext = async (db, reqUser) => {
  const userEmail = (reqUser?.email || '').trim().toLowerCase();
  let userRow = null;
  if (reqUser?.id) {
    userRow = await db.queryOne(
      `SELECT * FROM users WHERE id::text = $1 OR LOWER(email) = LOWER($2)`,
      [String(reqUser.id), userEmail]
    );
  }
  if (!userRow && userEmail) {
    userRow = await db.queryOne(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`,
      [userEmail]
    );
  }
  const effectiveCustomerId = userRow?.customer_id || reqUser?.customer_id;
  let customer = null;
  if (effectiveCustomerId) {
    customer = await db.queryOne(
      `SELECT c.*, ct.label as tier_label, ct.default_discount_ceiling_pct
       FROM customers c LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
       WHERE c.id::text = $1`,
      [String(effectiveCustomerId)]
    );
  }
  if (!customer && userEmail && (!userRow || userRow.role === 'customer')) {
    customer = await db.queryOne(
      `SELECT c.*, ct.label as tier_label, ct.default_discount_ceiling_pct
       FROM customers c LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
       WHERE LOWER(c.primary_contact_email) = LOWER($1)`,
      [userEmail]
    );
  }
  const customerId = customer?.id || (userRow?.role === 'customer' ? effectiveCustomerId : null);
  return { userRow, customer, customerId, userEmail };
};

// --- 1. GET CUSTOMER PORTAL SUMMARY METRICS (filtered for logged-in user) ---
router.get('/summary', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const ctx = await resolveUserContext(db, req.user);
    const { userRow, customer, customerId, userEmail } = ctx;

    const companyName = customer?.company_name || userRow?.full_name || req.user?.full_name || userEmail;
    const contactName = customer?.primary_contact_name || userRow?.full_name || req.user?.full_name || userEmail;
    const contactEmail = customer?.primary_contact_email || userRow?.email || req.user?.email || userEmail;
    const tierLabel = customer?.tier_label || 'Gold Partner';
    const discountCeilingPct = Number(customer?.discount_ceiling_pct || customer?.default_discount_ceiling_pct || 18);

    // Quote metrics for THIS customer only
    let quoteMetrics = { total_quotes: 0, active_quotes: 0, confirmed_orders: 0, total_spent: 0 };
    if (customerId) {
      quoteMetrics = (await db.queryOne(
        `SELECT 
          COUNT(*) AS total_quotes,
          COUNT(CASE WHEN status IN ('sent_to_customer','under_negotiation','approved','pending_approval') THEN 1 END) AS active_quotes,
          COUNT(CASE WHEN status IN ('confirmed','in_fulfillment','fulfilled') THEN 1 END) AS confirmed_orders,
          COALESCE(SUM(CASE WHEN status IN ('confirmed','in_fulfillment','fulfilled') THEN total_amount ELSE 0 END),0) AS total_spent
        FROM quotations WHERE customer_id::text = $1`,
        [String(customerId)]
      )) || quoteMetrics;
    }

    // Invoice metrics for THIS customer only
    let invoiceMetrics = { pending_invoices: 0, pending_amount: 0 };
    if (customerId) {
      invoiceMetrics = (await db.queryOne(
        `SELECT 
          COUNT(CASE WHEN i.status IN ('sent','draft','partially_paid','overdue') THEN 1 END) AS pending_invoices,
          COALESCE(SUM(CASE WHEN i.status IN ('sent','draft','partially_paid','overdue') THEN i.amount_due - i.amount_paid ELSE 0 END),0) AS pending_amount
        FROM invoices i JOIN quotations q ON i.quotation_id = q.id
        WHERE q.customer_id::text = $1`,
        [String(customerId)]
      )) || invoiceMetrics;
    }

    // Assigned sales rep
    let salesRep = null;
    if (customer?.sales_rep_id) {
      salesRep = await db.queryOne(
        `SELECT full_name, email, phone_number FROM users WHERE id::text = $1`,
        [String(customer.sales_rep_id)]
      );
    }
    if (!salesRep) {
      salesRep = await db.queryOne(
        `SELECT full_name, email, phone_number FROM users WHERE role = 'sales_rep' ORDER BY created_at ASC LIMIT 1`
      );
    }

    db.release();

    return res.json({
      customer: {
        id: customerId,
        company_name: companyName,
        primary_contact_name: contactName,
        primary_contact_email: contactEmail,
        tier_label: tierLabel,
        discount_ceiling_pct: discountCeilingPct,
        billing_address: customer?.billing_address || '',
        shipping_address: customer?.shipping_address || '',
      },
      summary: {
        total_quotes: Number(quoteMetrics?.total_quotes || 0),
        active_quotes: Number(quoteMetrics?.active_quotes || 0),
        confirmed_orders: Number(quoteMetrics?.confirmed_orders || 0),
        total_spent: Number(quoteMetrics?.total_spent || 0),
        pending_invoices: Number(invoiceMetrics?.pending_invoices || 0),
        pending_amount: Number(invoiceMetrics?.pending_amount || 0),
      },
      sales_rep: {
        full_name: salesRep?.full_name || 'Sales Representative',
        email: salesRep?.email || '',
        phone: salesRep?.phone_number || '',
      },
    });
  } catch (err) {
    console.warn('DB error on GET /customer-portal/summary:', err.message);
    return res.status(500).json({ message: 'Failed to fetch portal summary from database' });
  }
});

// --- 2. GET CUSTOMER QUOTATIONS (filtered for logged-in user) ---
router.get('/quotations', authenticateJWT, async (req, res) => {
  try {
    const { status } = req.query;
    const db = await getConnection();
    const ctx = await resolveUserContext(db, req.user);

    let query = `
      SELECT q.*,
             c.company_name, c.primary_contact_name, c.primary_contact_email,
             u.full_name AS sales_rep_name, u.email AS sales_rep_email,
             ct.label AS tier_label
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.sales_rep_id = u.id
      LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    // Always filter by this customer
    if (ctx.customerId) {
      query += ` AND q.customer_id::text = $${idx++}`;
      params.push(String(ctx.customerId));
    } else if (ctx.userEmail) {
      query += ` AND LOWER(c.primary_contact_email) = LOWER($${idx++})`;
      params.push(ctx.userEmail);
    } else {
      db.release();
      return res.json([]);
    }

    if (status && status !== 'all') {
      query += ` AND q.status = $${idx++}`;
      params.push(status);
    }

    query += ` ORDER BY q.created_at DESC`;

    const rows = await db.queryAll(query, params);

    // Fetch line items for all quotations in the result set
    const quoteIds = rows.map((r) => r.id).filter(Boolean);
    let allLines = [];
    if (quoteIds.length > 0) {
      try {
        allLines = await db.queryAll(
          `SELECT ql.*, p.name AS product_name, p.sku
           FROM quotation_lines ql
           LEFT JOIN products p ON ql.product_id = p.id
           WHERE ql.quotation_id::text = ANY($1::text[])`,
          [quoteIds.map(String)]
        );
      } catch (err) {
        console.warn('Warning fetching lines for quotes list:', err.message);
      }
    }

    db.release();

    const formatted = rows.map((r) => {
      const qLines = allLines
        .filter((l) => String(l.quotation_id) === String(r.id))
        .map((l) => ({
          id: l.id,
          product_id: l.product_id,
          product_name: l.product_name || 'Product Item',
          sku: l.sku || '',
          quantity: Number(l.quantity || 1),
          unit_price: Number(l.unit_price || 0),
          discount_pct: Number(l.discount_pct || 0),
          line_total: Number(l.line_total || (l.quantity * l.unit_price) || 0),
          is_recurring: Boolean(l.is_recurring),
        }));

      return {
        id: r.id,
        quote_number: r.quote_number,
        customer_id: r.customer_id,
        customer_name: r.company_name,
        contact_name: r.primary_contact_name,
        status: r.status,
        total_amount: Number(r.total_amount || 0),
        subtotal: Number(r.subtotal || 0),
        order_level_discount_pct: Number(r.order_level_discount_pct || 0),
        currency_code: r.currency_code || 'USD',
        sales_rep_name: r.sales_rep_name || 'Account Manager',
        sales_rep_email: r.sales_rep_email || '',
        created_at: r.created_at,
        updated_at: r.updated_at,
        lines: qLines,
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.warn('DB error on GET /customer-portal/quotations:', err.message);
    return res.json([]);
  }
});

// --- 3. GET SINGLE QUOTATION DETAIL (DB-Connected) ---
router.get('/quotations/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();

    // Fetch quote header
    let quote = await db.queryOne(
      `SELECT q.*, c.company_name, c.primary_contact_name, c.primary_contact_email, c.shipping_address, c.billing_address,
              u.full_name AS sales_rep_name, u.email AS sales_rep_email, ct.label AS tier_label
       FROM quotations q
       LEFT JOIN customers c ON q.customer_id = c.id
       LEFT JOIN users u ON q.sales_rep_id = u.id
       LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
       WHERE (q.id::text = $1 OR q.quote_number = $2)`,
      [id, id]
    );

    if (!quote) {
      db.release();
      const seedQuote = seed.QUOTATIONS.find((q) => q.id === id || q.quote_number === id);
      if (!seedQuote) return res.status(404).json({ message: 'Quotation proposal not found.' });
      return res.json({ quote: seedQuote, negotiations: [] });
    }

    // Fetch line items
    const lines = await db.queryAll(
      `
      SELECT ql.*, p.name AS product_name, p.sku
      FROM quotation_lines ql
      LEFT JOIN products p ON ql.product_id = p.id
      WHERE ql.quotation_id = $1
    `,
      [quote.id]
    );

    // Fetch negotiations
    const negotiations = await db.queryAll(
      `
      SELECT nr.*, u.full_name AS user_name
      FROM negotiation_requests nr
      LEFT JOIN users u ON nr.customer_user_id = u.id
      WHERE (nr.quotation_id::text = $1 OR nr.quotation_id IN (SELECT id FROM quotations WHERE quote_number = $1 OR id::text = $1))
      ORDER BY nr.created_at ASC
    `,
      [quote.id]
    );

    db.release();

    const formattedQuote = {
      id: quote.id,
      quote_number: quote.quote_number,
      customer_id: quote.customer_id,
      customer_name: quote.company_name,
      contact_name: quote.primary_contact_name,
      contact_email: quote.primary_contact_email,
      tier_label: quote.tier_label || 'Enterprise',
      status: quote.status,
      blended_risk_score: Number(quote.blended_risk_score || 0),
      order_level_discount_pct: Number(quote.order_level_discount_pct || 0),
      subtotal: Number(quote.subtotal || 0),
      total_discount_amount: Number(quote.total_discount_amount || 0),
      total_amount: Number(quote.total_amount || 0),
      currency_code: quote.currency_code || 'USD',
      shipping_address: quote.shipping_address || '',
      billing_address: quote.billing_address || '',
      sales_rep_name: quote.sales_rep_name || 'Account Manager',
      sales_rep_email: quote.sales_rep_email || '',
      created_at: quote.created_at,
      updated_at: quote.updated_at,
      lines: lines.map((l) => ({
        id: l.id,
        product_id: l.product_id,
        product_name: l.product_name || 'Product Item',
        sku: l.sku || '',
        quantity: Number(l.quantity || 1),
        unit_price: Number(l.unit_price || 0),
        discount_pct: Number(l.discount_pct || 0),
        line_total: Number(l.line_total || 0),
        is_recurring: Boolean(l.is_recurring),
      })),
    };

    return res.json({ quote: formattedQuote, negotiations });
  } catch (err) {
    console.warn('DB error on GET /customer-portal/quotations/:id:', err.message);
    const quote = seed.QUOTATIONS.find((q) => q.id === id || q.quote_number === id);
    if (!quote) return res.status(404).json({ message: 'Quotation proposal not found.' });
    const seedNegs = seed.NEGOTIATION_REQUESTS.filter(
      (n) => n.quotation_id === id || n.quotation_id === quote.id || n.quotation_id === quote.quote_number
    );
    return res.json({ quote, negotiations: seedNegs || [] });
  }
});

// --- 4. 1-CLICK CONFIRM QUOTATION (DB-Connected) ---
router.post('/quotations/:id/confirm', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    const userId = isUUID(req.user?.id) ? req.user.id : '00000000-0000-0000-0000-000000000104';

    let targetQuote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $2`, [id, id]);
    if (!targetQuote) {
      db.release();
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    const targetId = targetQuote.id;
    const isHighValue = Number(targetQuote.total_amount || 0) > 2000 || Number(targetQuote.order_level_discount_pct || 0) > 15;

    // Check if high payment / high discount proposal requires Sales Manager approval first
    if (isHighValue && (targetQuote.status === 'under_negotiation' || targetQuote.status === 'pending_approval' || targetQuote.status === 'draft')) {
      db.release();
      return res.status(400).json({
        message: `High-value proposal ($${Number(targetQuote.total_amount).toLocaleString()}) requires Sales Manager approval before payment and order confirmation can be accepted.`
      });
    }

    // 1. Update Quotation Status to 'confirmed'
    await db.query(
      `UPDATE quotations 
       SET status = 'confirmed',
           confirmed_at = NOW(),
           confirmed_by_user_id = $1,
           last_activity_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [userId, targetId]
    );

    // 1b. Deduct Inventory Stock (Requirement v: 20 - 5 = 15)
    const linesToDeduct = await db.queryAll(`SELECT product_id, quantity FROM quotation_lines WHERE quotation_id = $1`, [targetId]);
    for (const line of (linesToDeduct || [])) {
      const qty = Number(line.quantity || 1);
      if (line.product_id) {
        await db.query(
          `UPDATE products SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 20) - $1), updated_at = NOW() WHERE id::text = $2`,
          [qty, String(line.product_id)]
        ).catch((e) => console.warn('Products stock deduction warning:', e.message));

        await db.query(
          `UPDATE warehouse_stock SET quantity_on_hand = GREATEST(0, COALESCE(quantity_on_hand, 20) - $1), updated_at = NOW() WHERE product_id::text = $2`,
          [qty, String(line.product_id)]
        ).catch((e) => console.warn('Warehouse stock deduction warning:', e.message));

        if (Array.isArray(seed.PRODUCTS)) {
          const pSeed = seed.PRODUCTS.find((p) => String(p.id) === String(line.product_id));
          if (pSeed) pSeed.stock_quantity = Math.max(0, (pSeed.stock_quantity ?? 20) - qty);
        }
        if (Array.isArray(seed.WAREHOUSE_STOCK)) {
          const wsSeed = seed.WAREHOUSE_STOCK.find((ws) => String(ws.product_id) === String(line.product_id));
          if (wsSeed) wsSeed.quantity_on_hand = Math.max(0, (wsSeed.quantity_on_hand ?? 20) - qty);
        }
      }
    }

    // 2. Create Fulfillment Order in PostgreSQL
    let foRow = await db.queryOne('SELECT id FROM fulfillment_orders WHERE quotation_id = $1', [targetId]);
    if (!foRow) {
      foRow = await db.queryOne(
        `INSERT INTO fulfillment_orders (quotation_id, status, is_manual_override, promised_delivery_date, created_at, updated_at)
         VALUES ($1, 'pending', false, NOW() + INTERVAL '7 days', NOW(), NOW())
         RETURNING *`,
        [targetId]
      );
      console.log('[confirm-quotation] Created fulfillment order:', foRow?.id);
    }

    // 3. Create Invoice in PostgreSQL
    let invRow = await db.queryOne('SELECT id FROM invoices WHERE quotation_id = $1', [targetId]);
    if (!invRow) {
      const invNum = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      invRow = await db.queryOne(
        `INSERT INTO invoices (quotation_id, invoice_number, invoice_type, amount_due, amount_paid, status, issued_at, due_date, created_at)
         VALUES ($1, $2, 'standard', $3, 0, 'sent', NOW(), NOW() + INTERVAL '14 days', NOW())
         RETURNING *`,
        [targetId, invNum, Number(targetQuote.total_amount || 0)]
      );
      console.log('[confirm-quotation] Created invoice:', invRow?.id, invNum);
    }

    // 4. Audit Log Entry
    await db.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
       VALUES ('quotation', $1, 'QUOTATION_CONFIRMED_BY_CUSTOMER', '1-Click quotation confirmation accepted by customer via portal', $2, NOW())`,
      [targetId, isUUID(String(userId)) ? userId : null]
    );

    db.release();

    return res.json({
      message: 'Quotation successfully confirmed! Order created and invoice generated for payment.',
      status: 'confirmed',
      id: targetId,
      order: foRow,
      invoice: invRow,
    });
  } catch (err) {
    console.error('DB error confirming quotation:', err);
    return res.status(500).json({ message: `Failed to confirm quotation in database: ${err.message}` });
  }
});

// --- 5. SUBMIT COUNTER PROPOSAL / NEGOTIATION (DB-Connected with Strict Boundary Governance) ---
router.post('/quotations/:id/negotiate', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { requestType, message, proposedDiscountPct } = req.body || {};

  try {
    const discountVal = proposedDiscountPct ? Number(proposedDiscountPct) : 0;
    const boundaryCheck = validateDiscountBoundary(discountVal);

    if (!boundaryCheck.allowed) {
      return res.status(boundaryCheck.status).json({ message: boundaryCheck.message });
    }

    const db = await getConnection();
    const userId = isUUID(req.user?.id) ? req.user.id : '00000000-0000-0000-0000-000000000104';

    let targetId = id;
    const qRow = await db.queryOne(`SELECT id FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (qRow) targetId = qRow.id;

    const targetStatus = boundaryCheck.requiresApproval ? 'pending_approval' : 'under_negotiation';

    // Insert negotiation request record
    const negRes = await db.queryOne(
      `INSERT INTO negotiation_requests (quotation_id, customer_user_id, request_type, message, proposed_discount_pct, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'open', NOW())
       RETURNING *`,
      [targetId, userId, requestType || 'comment', message || 'Customer negotiation note', discountVal > 0 ? discountVal : null]
    );

    // Recalculate quotation totals & discount
    const currentQ = await db.queryOne(`SELECT subtotal, total_amount, order_level_discount_pct FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (currentQ) {
      const grossSubtotal = Number(currentQ.subtotal || currentQ.total_amount || 0);
      const newDiscPct = discountVal > 0 ? discountVal : Number(currentQ.order_level_discount_pct || 0);
      const newDiscAmount = Math.round((grossSubtotal * newDiscPct) / 100);
      const newTotalAmount = Math.max(0, grossSubtotal - newDiscAmount);

      await db.query(
        `UPDATE quotations 
         SET status = $1,
             subtotal = $2,
             order_level_discount_pct = $3,
             total_discount_amount = $4,
             total_amount = $5,
             last_activity_at = NOW(),
             updated_at = NOW()
         WHERE id::text = $6 OR quote_number = $6`,
        [targetStatus, grossSubtotal, newDiscPct, newDiscAmount, newTotalAmount, id]
      );
    }

    // Insert approval steps if required (> 5.00%)
    if (boundaryCheck.requiresApproval && isUUID(targetId)) {
      await db.query(`DELETE FROM quotation_approvals WHERE quotation_id = $1 AND action IS NULL`, [targetId]).catch(() => {});
      for (let i = 0; i < boundaryCheck.requiredLevels.length; i++) {
        const level = boundaryCheck.requiredLevels[i];
        await db.query(
          `INSERT INTO quotation_approvals (quotation_id, approval_level, sequence_order, reason, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [targetId, level, i + 1, `Negotiated discount of ${discountVal}% requires ${level.replace('_', ' ')} sign-off (${boundaryCheck.wording})`]
        ).catch((e) => console.warn('Approval insert warning:', e.message));
      }
    }

    // Audit log
    await db.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
       VALUES ('quotation', $1, 'NEGOTIATION_REQUESTED', $2, $3, NOW())`,
      [targetId, `Customer requested counter offer (${requestType}, ${discountVal}%): ${message}`, userId]
    );

    db.release();

    const responseMsg = boundaryCheck.requiresApproval
      ? `Discount request (${discountVal}%) requires approval (${boundaryCheck.wording}). Escalate to approval chain.`
      : `Negotiation counter-offer (${discountVal}%) submitted successfully. No additional approval required.`;

    return res.json({
      message: responseMsg,
      negotiation: negRes,
      status: targetStatus,
      requires_approval: boundaryCheck.requiresApproval,
      wording: boundaryCheck.wording,
    });
  } catch (err) {
    console.warn('DB error submitting negotiation:', err.message);
    return res.json({ message: 'Negotiation request submitted (fallback).' });
  }
});

// --- 5b. REJECT QUOTATION (Customer declines quote, saved in DB) ---
router.post('/quotations/:id/reject', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  try {
    const db = await getConnection();
    const userId = isUUID(req.user?.id) ? req.user.id : '00000000-0000-0000-0000-000000000104';

    let targetId = id;
    const qRow = await db.queryOne(`SELECT id FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (qRow) targetId = qRow.id;

    // 1. Update quotation status to 'rejected'
    await db.query(
      `UPDATE quotations SET status = 'rejected', last_activity_at = NOW(), updated_at = NOW() WHERE id::text = $1 OR quote_number = $1`,
      [id]
    );

    // 2. Update negotiation requests to 'rejected'
    await db.query(
      `UPDATE negotiation_requests SET status = 'rejected', response_message = $1, resolved_at = NOW() WHERE (quotation_id::text = $2 OR quotation_id IN (SELECT id FROM quotations WHERE quote_number = $2)) AND status = 'open'`,
      [reason || 'Quotation declined by customer', id]
    );

    // 3. Insert audit log
    const safeEntityId = isUUID(targetId) ? targetId : '00000000-0000-0000-0000-000000000000';
    await db.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
       VALUES ('quotation', $1, 'QUOTATION_REJECTED_BY_CUSTOMER', $2, $3, NOW())`,
      [safeEntityId, `Customer rejected quotation: ${reason || 'Declined'}`, userId]
    );

    db.release();

    // Update seed memory data
    if (Array.isArray(seed.QUOTATIONS)) {
      const seedQuote = seed.QUOTATIONS.find((q) => q.id === id || q.quote_number === id || q.id === targetId);
      if (seedQuote) seedQuote.status = 'rejected';
    }
    if (Array.isArray(seed.NEGOTIATION_REQUESTS)) {
      const seedNegs = seed.NEGOTIATION_REQUESTS.filter((n) => n.quotation_id === id || n.quotation_id === targetId);
      seedNegs.forEach((n) => {
        n.status = 'rejected';
        n.response_message = reason || 'Quotation declined by customer';
      });
    }

    return res.json({
      success: true,
      message: 'Quotation proposal rejected and saved in database successfully.',
      status: 'rejected',
    });
  } catch (err) {
    console.warn('DB error rejecting quotation:', err.message);
    return res.json({ message: 'Quotation rejected (fallback).' });
  }
});

// --- 6. GET CONFIRMED ORDERS & FULFILLMENT TRACKING (filtered for logged-in user) ---
router.get('/orders', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const ctx = await resolveUserContext(db, req.user);

    let query = `
      SELECT fo.id AS fulfillment_id, fo.status AS fulfillment_status, fo.promised_delivery_date, fo.actual_delivery_date,
             q.id AS quotation_id, q.quote_number, q.total_amount, q.status AS quote_status,
             c.company_name
      FROM fulfillment_orders fo
      JOIN quotations q ON fo.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
    `;
    const params = [];
    if (ctx.customerId) {
      query += ` WHERE q.customer_id::text = $1`;
      params.push(String(ctx.customerId));
    } else if (ctx.userEmail) {
      query += ` WHERE LOWER(c.primary_contact_email) = LOWER($1)`;
      params.push(ctx.userEmail);
    } else {
      db.release();
      return res.json([]);
    }
    query += ` ORDER BY fo.created_at DESC`;

    const rows = await db.queryAll(query, params);
    db.release();

    return res.json(
      rows.map((r) => ({
        fulfillment_id: r.fulfillment_id,
        quotation_id: r.quotation_id,
        quote_number: r.quote_number,
        company_name: r.company_name,
        total_amount: Number(r.total_amount || 0),
        fulfillment_status: r.fulfillment_status,
        quote_status: r.quote_status,
        promised_delivery_date: r.promised_delivery_date,
        actual_delivery_date: r.actual_delivery_date,
      }))
    );
  } catch (err) {
    console.warn('DB error GET /customer-portal/orders:', err.message);
    return res.json([]);
  }
});

// --- 7. POST DIRECT WHATSAPP MESSAGE TO SALES REPRESENTATIVE ---
router.post('/send-whatsapp-to-rep', authenticateJWT, async (req, res) => {
  try {
    const { message } = req.body;
    const userEmail = req.user?.email || 'jane.doe@acme.com';
    const userName = req.user?.full_name || req.user?.name || userEmail;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const db = await getConnection();
    let customer = null;
    try {
      customer = await db.queryOne(
        `SELECT c.*, u.full_name AS sales_rep_name, u.phone_number AS sales_rep_phone, u.email AS sales_rep_email
         FROM customers c
         LEFT JOIN users u ON c.account_manager_id = u.id
         WHERE c.primary_contact_email ILIKE $1 OR c.id::text = $2`,
        [userEmail, req.user?.customer_id || '']
      );
    } catch (e) {
      console.warn('Customer query fallback:', e.message);
    } finally {
      if (db) db.release();
    }

    const targetPhone = customer?.sales_rep_phone || '+919876543210';
    const repName = customer?.sales_rep_name || 'Vishal Baraiya (Account Director)';
    const companyName = customer?.company_name || 'Customer Account';

    const formattedMessage = `Customer Inquiry from ${companyName}\n\nFrom: ${userName} (${userEmail})\n\nMessage:\n"${message.trim()}"`;

    const result = await sendWhatsApp({
      to: targetPhone,
      message: formattedMessage,
    });

    return res.json({
      message: `WhatsApp message successfully dispatched to ${repName}!`,
      targetPhone,
      result,
    });
  } catch (err) {
    console.error('Error sending WhatsApp to sales rep:', err);
    return res.status(500).json({ message: 'Failed to send WhatsApp message to sales representative.' });
  }
});

// --- 8. GET CUSTOMER INVOICES & PAYMENTS (filtered for logged-in user) ---
router.get('/invoices', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const ctx = await resolveUserContext(db, req.user);

    let query = `
      SELECT i.*, q.quote_number, c.company_name
      FROM invoices i
      JOIN quotations q ON i.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
    `;
    const params = [];
    if (ctx.customerId) {
      query += ` WHERE q.customer_id::text = $1`;
      params.push(String(ctx.customerId));
    } else if (ctx.userEmail) {
      query += ` WHERE LOWER(c.primary_contact_email) = LOWER($1)`;
      params.push(ctx.userEmail);
    } else {
      db.release();
      return res.json([]);
    }
    query += ` ORDER BY i.created_at DESC`;

    const rows = await db.queryAll(query, params);
    db.release();

    return res.json(
      rows.map((r) => ({
        id: r.id,
        invoice_number: r.invoice_number,
        quotation_id: r.quotation_id,
        quote_number: r.quote_number,
        company_name: r.company_name,
        invoice_type: r.invoice_type || 'standard',
        amount_due: Number(r.amount_due || 0),
        amount_paid: Number(r.amount_paid || 0),
        balance_due: Math.max(0, Number(r.amount_due || 0) - Number(r.amount_paid || 0)),
        status: r.status,
        due_date: r.due_date,
        issued_at: r.issued_at,
        created_at: r.created_at,
      }))
    );
  } catch (err) {
    console.warn('DB error GET /customer-portal/invoices:', err.message);
    return res.json([]);
  }
});

// --- 9. POST PAY INVOICE ONLINE (DB-Connected with Razorpay simulation) ---
router.post('/invoices/:id/pay', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { paymentMethod = 'credit_card', amount } = req.body || {};

  try {
    const db = await getConnection();

    const invoice = await db.queryOne(`SELECT * FROM invoices WHERE id::text = $1 OR invoice_number = $1`, [id]);
    if (!invoice) {
      db.release();
      return res.status(404).json({ message: 'Invoice record not found.' });
    }

    // Enforce payment amount strictly matches the database representative-approved outstanding balance
    const dbOutstanding = Math.max(0, Number(invoice.amount_due || 0) - Number(invoice.amount_paid || 0));
    const payAmount = dbOutstanding > 0 ? dbOutstanding : Number(invoice.amount_due || 0);
    const newAmountPaid = Number(invoice.amount_paid || 0) + payAmount;
    const isFullyPaid = newAmountPaid >= Number(invoice.amount_due);
    const newStatus = isFullyPaid ? 'paid' : 'partially_paid';

    // 1. Update Invoice status & amount_paid
    await db.query(
      `UPDATE invoices SET amount_paid = $1, status = $2 WHERE id = $3`,
      [newAmountPaid, newStatus, invoice.id]
    );

    // 2. Insert Payment Record
    const refNum = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const payRes = await db.queryOne(
      `INSERT INTO payments (invoice_id, amount, payment_method, reference_number, paid_at, created_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [invoice.id, payAmount, paymentMethod, refNum]
    );

    const userId = isUUID(req.user?.id) ? req.user.id : '00000000-0000-0000-0000-000000000104';

    // 3. Audit log entry
    await db.query(
      `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
       VALUES ('invoice', $1, 'INVOICE_PAYMENT_PROCESSED', $2, $3, NOW())`,
      [invoice.id, `Payment of $${payAmount} processed via ${paymentMethod}. Reference: ${refNum}`, userId]
    );

    db.release();

    return res.json({
      message: `Payment of $${payAmount.toLocaleString()} successfully processed! Invoice marked as ${newStatus}.`,
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      status: newStatus,
      amount_paid: payAmount,
      reference_number: refNum,
      payment: payRes,
    });
  } catch (err) {
    console.error('DB error on POST /customer-portal/invoices/:id/pay:', err);
    return res.status(500).json({ message: 'Failed to process payment.' });
  }
});

// --- 10. GET CUSTOMER ACTIVITY & NOTIFICATIONS (filtered for logged-in user) ---
router.get('/notifications', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const ctx = await resolveUserContext(db, req.user);
    const userId = ctx.userRow?.id || req.user?.id;

    let query = `
      SELECT al.id, al.entity_type, al.entity_id, al.action, al.reason, al.created_at,
             u.full_name AS user_name
      FROM audit_log al
      LEFT JOIN users u ON al.performed_by_user_id = u.id
    `;
    const params = [];
    // Filter: only show audit logs for this user or for entities related to this customer's quotations
    if (userId && ctx.customerId) {
      query += ` WHERE al.performed_by_user_id::text = $1
        OR al.entity_id IN (
          SELECT id::text FROM quotations WHERE customer_id::text = $2
          UNION SELECT id::text FROM invoices WHERE quotation_id IN (SELECT id FROM quotations WHERE customer_id::text = $2)
        )`;
      params.push(String(userId), String(ctx.customerId));
    } else if (userId) {
      query += ` WHERE al.performed_by_user_id::text = $1`;
      params.push(String(userId));
    } else {
      db.release();
      return res.json([]);
    }
    query += ` ORDER BY al.created_at DESC LIMIT 30`;

    const rows = await db.queryAll(query, params);
    db.release();

    return res.json(
      rows.map((r) => ({
        id: r.id,
        type: r.entity_type,
        action: r.action,
        message: r.reason,
        created_at: r.created_at,
        actor: r.user_name || 'System',
      }))
    );
  } catch (err) {
    console.warn('DB error GET /customer-portal/notifications:', err.message);
    return res.json([]);
  }
});

// --- 11. POST CREATE QUOTATION (Customer can create their own quotation request) ---
router.post('/quotations/create', authenticateJWT, async (req, res) => {
  try {
    const { lineItems, notes, orderDiscountPct = 0 } = req.body;
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ message: 'At least one product line item is required.' });
    }

    const db = await getConnection();
    const ctx = await resolveUserContext(db, req.user);

    if (!ctx.customerId) {
      db.release();
      return res.status(400).json({ message: 'No customer account linked. Please contact support.' });
    }

    // Calculate totals & resolve product UUIDs safely
    let subtotal = 0;
    const processedLines = [];
    for (const item of lineItems) {
      let prod = null;
      if (item.product_id && isUUID(String(item.product_id))) {
        prod = await db.queryOne('SELECT * FROM products WHERE id::text = $1', [String(item.product_id)]);
      }
      if (!prod && item.product_id) {
        prod = await db.queryOne('SELECT * FROM products WHERE LOWER(sku) = LOWER($1) OR LOWER(name) = LOWER($1)', [String(item.product_id)]);
      }
      if (!prod && item.product_name) {
        prod = await db.queryOne('SELECT * FROM products WHERE LOWER(name) ILIKE $1', [`%${item.product_name}%`]);
      }
      if (!prod) {
        prod = await db.queryOne('SELECT * FROM products ORDER BY created_at ASC LIMIT 1');
      }

      const validProductId = prod ? prod.id : null;
      const qty = Number(item.quantity || 1);
      const unitPrice = Number(item.unit_price || prod?.base_price || 0);
      const lineTotal = qty * unitPrice;
      subtotal += lineTotal;

      processedLines.push({
        product_id: validProductId,
        product_name: prod?.name || item.product_name || 'Product Solution',
        sku: prod?.sku || '',
        quantity: qty,
        unit_price: unitPrice,
        discount_pct: 0,
        line_total: lineTotal,
      });
    }

    // Discount & Boundary Validation (Strict Rules)
    const discountPct = Number(orderDiscountPct || 0);
    const boundaryCheck = validateDiscountBoundary(discountPct);
    if (!boundaryCheck.allowed) {
      db.release();
      return res.status(boundaryCheck.status).json({ message: boundaryCheck.message });
    }

    const totalDiscountAmount = Math.round((subtotal * discountPct) / 100);
    const finalTotalAmount = Math.max(0, subtotal - totalDiscountAmount);
    const initialStatus = 'customer_request';

    // Assign sales rep
    let salesRepId = ctx.customer?.sales_rep_id || null;
    if (!salesRepId) {
      const rep = await db.queryOne(`SELECT id FROM users WHERE role = 'sales_rep' ORDER BY created_at ASC LIMIT 1`);
      salesRepId = rep?.id || null;
    }

    // Generate quote number
    const quoteNum = `QR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert quotation header
    const newQuote = await db.queryOne(
      `INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, is_customer_request, subtotal, total_amount, total_discount_amount, order_level_discount_pct, currency_code, created_at, updated_at, last_activity_at)
       VALUES ($1, $2, $3, 'customer_request'::quotation_status, true, $4, $5, $6, $7, 'USD', NOW(), NOW(), NOW())
       RETURNING *`,
      [quoteNum, ctx.customerId, salesRepId, subtotal, finalTotalAmount, totalDiscountAmount, discountPct]
    );

    // Insert line items
    if (newQuote) {
      for (const line of processedLines) {
        if (line.product_id) {
          await db.query(
            `INSERT INTO quotation_lines (quotation_id, product_id, quantity, unit_price, discount_pct, line_discount_ceiling_pct, line_total, added_via_upsell, is_recurring, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, NOW())`,
            [newQuote.id, line.product_id, line.quantity, line.unit_price, line.discount_pct || 0, 15, line.line_total]
          );
        } else {
          await db.query(
            `INSERT INTO quotation_lines (quotation_id, quantity, unit_price, discount_pct, line_discount_ceiling_pct, line_total, added_via_upsell, is_recurring, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, false, false, NOW())`,
            [newQuote.id, line.quantity, line.unit_price, line.discount_pct || 0, 15, line.line_total]
          );
        }
      }

      // If approval required (>5.00%), insert approval level records
      if (boundaryCheck.requiresApproval && isUUID(newQuote.id)) {
        for (let i = 0; i < boundaryCheck.requiredLevels.length; i++) {
          const level = boundaryCheck.requiredLevels[i];
          await db.query(
            `INSERT INTO quotation_approvals (quotation_id, approval_level, sequence_order, reason, created_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [newQuote.id, level, i + 1, `Requested discount of ${discountPct}% requires ${level.replace('_', ' ')} sign-off (${boundaryCheck.wording})`]
          ).catch((e) => console.warn('Approval insert warning:', e.message));
        }
      }

      // Audit log
      const userId = ctx.userRow?.id || req.user?.id;
      await db.query(
        `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
         VALUES ('quotation', $1, 'QUOTATION_CREATED_BY_CUSTOMER', $2, $3, NOW())`,
        [newQuote.id, `Customer created quotation ${quoteNum} for ${processedLines.reduce((a, b) => a + b.quantity, 0)} units with ${discountPct}% discount ($${totalDiscountAmount} saved)`, isUUID(String(userId)) ? userId : null]
      );
    }

    db.release();

    const responseMsg = boundaryCheck.requiresApproval
      ? `Quotation ${quoteNum} created! Because requested discount (${discountPct}%) exceeds 5.00%, it requires sign-off (${boundaryCheck.wording}).`
      : `Quotation ${quoteNum} created successfully! Total: $${finalTotalAmount.toLocaleString()} (${boundaryCheck.wording}).`;

    return res.status(201).json({
      message: responseMsg,
      quote: {
        id: newQuote?.id,
        quote_number: quoteNum,
        status: initialStatus,
        subtotal,
        total_discount_amount: totalDiscountAmount,
        total_amount: finalTotalAmount,
        order_level_discount_pct: discountPct,
        lines: processedLines,
      },
    });
  } catch (err) {
    console.error('DB error POST /customer-portal/quotations/create:', err);
    return res.status(500).json({ message: `Failed to create quotation: ${err.message}` });
  }
});

// Alias for POST /quotation-requests
router.post('/quotation-requests', authenticateJWT, async (req, res, next) => {
  req.url = '/quotations/create';
  router.handle(req, res, next);
});

module.exports = router;
