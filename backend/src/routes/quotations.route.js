const express = require('express');
const seed = require('../db/dealflow360_seed');
const { calculateBlendedRiskScore } = require('../service/riskScoreEngine');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

const isUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// GET /api/quotations
router.get('/', authenticateJWT, async (req, res) => {
  const { status, salesRepId } = req.query;
  try {
    const db = await getConnection();
    let query = `
      SELECT q.*, c.company_name, c.primary_contact_name, u.full_name as sales_rep_name,
             (SELECT COUNT(*) FROM negotiation_requests nr WHERE nr.quotation_id = q.id AND nr.status = 'open') as open_neg_count
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      LEFT JOIN users u ON u.id = q.sales_rep_id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`q.status = $${params.length}`);
    }
    if (salesRepId && isUUID(salesRepId)) {
      params.push(salesRepId);
      conditions.push(`q.sales_rep_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }
    query += ` ORDER BY q.created_at DESC`;

    const rows = await db.queryAll(query, params);
    db.release();

    if (rows && rows.length > 0) {
      return res.json(
        rows.map((r) => ({
          ...r,
          total_amount: Number(r.total_amount || 0),
          order_level_discount_pct: Number(r.order_level_discount_pct || 0),
          has_open_negotiation: Number(r.open_neg_count || 0) > 0,
        }))
      );
    }
  } catch (err) {
    console.warn('DB error GET /api/quotations:', err.message);
  }

  let filtered = [...seed.QUOTATIONS];
  if (status) filtered = filtered.filter((q) => q.status === status);
  if (salesRepId) filtered = filtered.filter((q) => q.sales_rep_id === salesRepId);

  res.json(filtered);
});

// GET /api/quotations/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    const qRow = await db.queryOne(`
      SELECT q.*, c.company_name, c.primary_contact_name, c.primary_contact_email, c.primary_contact_phone,
             u.full_name as sales_rep_name
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      LEFT JOIN users u ON u.id = q.sales_rep_id
      WHERE q.id::text = $1 OR q.quote_number = $1
    `, [id]);

    if (qRow) {
      const lines = await db.queryAll(`
        SELECT ql.*, p.name as product_name, p.sku, p.base_price, p.tax_rate_pct
        FROM quotation_lines ql
        LEFT JOIN products p ON p.id = ql.product_id
        WHERE ql.quotation_id = $1
      `, [qRow.id]);

      db.release();

      return res.json({
        ...qRow,
        total_amount: Number(qRow.total_amount || 0),
        subtotal: Number(qRow.subtotal || 0),
        total_discount_amount: Number(qRow.total_discount_amount || 0),
        lines: lines ? lines.map((l) => ({ ...l, unit_price: Number(l.unit_price), line_total: Number(l.line_total) })) : [],
      });
    }
    db.release();
  } catch (err) {
    console.warn('DB error GET /api/quotations/:id:', err.message);
  }

  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id || q.quote_number === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });
  res.json(quote);
});

const { validateDiscountBoundary } = require('../utils/discountValidator');

// POST /api/quotations
router.post('/', authenticateJWT, async (req, res) => {
  const { customerId, salesRepId, lineItems, orderDiscountPct, discount_pct, discountPct, order_level_discount_pct, status: requestedStatus } = req.body;

  const discountVal = Number(orderDiscountPct ?? discount_pct ?? discountPct ?? order_level_discount_pct ?? 0);
  const boundaryCheck = validateDiscountBoundary(discountVal);

  if (!boundaryCheck.allowed) {
    return res.status(boundaryCheck.status).json({
      success: false,
      message: boundaryCheck.message
    });
  }

  try {
    const db = await getConnection();

    let targetCustId = isUUID(customerId) ? customerId : null;
    if (!targetCustId) {
      const custRow = await db.queryOne(`SELECT id FROM customers LIMIT 1`);
      if (custRow) targetCustId = custRow.id;
    }

    let targetRepId = isUUID(salesRepId) ? salesRepId : (isUUID(req.user?.id) ? req.user.id : null);
    if (!targetRepId) {
      const repRow = await db.queryOne(`SELECT id FROM users WHERE role = 'sales_rep' LIMIT 1`);
      if (repRow) targetRepId = repRow.id;
    }

    // Calculate totals & risk score
    const riskResult = calculateBlendedRiskScore({
      customerTierCode: 'gold',
      lineItems: lineItems || [],
      orderDiscountPct: discountVal,
    });

    const quoteNumber = `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let finalStatus = requestedStatus || 'draft';
    if (requestedStatus === 'sent_to_customer') {
      finalStatus = boundaryCheck.targetStatus;
    }

    const insQuote = await db.queryOne(`
      INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, blended_risk_score, order_level_discount_pct, subtotal, total_discount_amount, total_amount, currency_code, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'USD', NOW(), NOW())
      RETURNING *
    `, [
      quoteNumber,
      targetCustId,
      targetRepId,
      finalStatus,
      riskResult.blendedRiskScore || 0,
      discountVal,
      riskResult.subtotal || 0,
      riskResult.totalDiscountAmount || 0,
      riskResult.totalAmount || 0,
    ]);

    if (insQuote && Array.isArray(lineItems)) {
      for (const item of lineItems) {
        let prodId = isUUID(item.productId || item.id) ? (item.productId || item.id) : null;
        if (!prodId) {
          const firstProd = await db.queryOne(`SELECT id FROM products LIMIT 1`);
          if (firstProd) prodId = firstProd.id;
        }

        if (prodId) {
          await db.query(`
            INSERT INTO quotation_lines (quotation_id, product_id, quantity, unit_price, discount_pct, line_discount_ceiling_pct, line_total, margin_pct, is_recurring)
            VALUES ($1, $2, $3, $4, $5, 15, $6, 30, $7)
          `, [
            insQuote.id,
            prodId,
            Number(item.quantity || 1),
            Number(item.unitPrice || item.base_price || 100),
            Number(item.discountPct || 0),
            Number(item.lineTotal || (item.quantity * item.unitPrice * (1 - (item.discountPct || 0)/100))),
            Boolean(item.is_recurring),
          ]);
        }
      }
    }

    // Insert approval records if required
    if (boundaryCheck.requiresApproval && finalStatus === 'pending_approval') {
      for (let i = 0; i < boundaryCheck.requiredLevels.length; i++) {
        const level = boundaryCheck.requiredLevels[i];
        await db.query(`
          INSERT INTO quotation_approvals (quotation_id, approval_level, sequence_order, assigned_to_user_id, reason, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [insQuote.id, level, i + 1, targetRepId, `Discount of ${discountVal}% requires ${level.replace('_', ' ')} approval.`]);
      }
    }

    // Audit log
    await db.query(`
      INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
      VALUES ('quotation', $1, 'CREATED', $2, $3, NOW())
    `, [insQuote.id, `New quotation created with ${discountVal}% discount. Status: ${finalStatus}`, targetRepId]);

    db.release();

    return res.status(201).json({
      ...insQuote,
      message: 'Quotation created successfully in PostgreSQL DB!',
    });
  } catch (err) {
    console.error('DB error POST /api/quotations:', err);
  }

  // Fallback
  const customer = seed.CUSTOMERS.find((c) => c.id === customerId) || seed.CUSTOMERS[0];
  const rep = seed.USERS.find((u) => u.id === salesRepId) || req.user || seed.USERS[0];

  const riskResult = calculateBlendedRiskScore({
    customerTierCode: customer.tier_code || 'silver',
    lineItems: lineItems || [],
    orderDiscountPct: Number(orderDiscountPct || 0),
  });

  const quoteId = `110${seed.QUOTATIONS.length + 1}`;
  const quoteNumber = `Q-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newQuote = {
    id: quoteId,
    quote_number: quoteNumber,
    customer_id: customer.id,
    customer_name: customer.company_name,
    customer_tier_code: customer.tier_code || 'silver',
    sales_rep_id: rep.id,
    sales_rep_name: rep.full_name,
    status: riskResult.suggestedStatus,
    blended_risk_score: riskResult.blendedRiskScore,
    order_level_discount_pct: Number(orderDiscountPct || 0),
    subtotal: riskResult.subtotal,
    total_discount_amount: riskResult.totalDiscountAmount,
    total_amount: riskResult.totalAmount,
    currency_code: 'USD',
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  seed.QUOTATIONS.unshift(newQuote);
  res.status(201).json(newQuote);
});

// POST /api/quotations/:id/send
router.post('/:id/send', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    await db.query(`UPDATE quotations SET status = 'sent_to_customer', updated_at = NOW() WHERE id::text = $1 OR quote_number = $1`, [id]);
    db.release();
    return res.json({ message: 'Quotation status updated to sent_to_customer in DB.' });
  } catch (err) {
    console.warn('DB error POST /api/quotations/:id/send:', err.message);
  }

  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (quote) quote.status = 'sent_to_customer';
  res.json({ message: 'Quotation sent to customer.', quote });
});

// POST /api/quotations/:id/confirm
router.post('/:id/confirm', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    const qRow = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (qRow) {
      await db.query(`UPDATE quotations SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW() WHERE id = $1`, [qRow.id]);
      
      // Auto-create fulfillment order in DB
      const ful = await db.queryOne(`
        INSERT INTO fulfillment_orders (quotation_id, status, created_at, updated_at)
        VALUES ($1, 'pending', NOW(), NOW())
        RETURNING *
      `, [qRow.id]);

      // Auto-create draft invoice in DB
      const invNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.query(`
        INSERT INTO invoices (quotation_id, invoice_number, invoice_type, amount_due, amount_paid, status, created_at)
        VALUES ($1, $2, 'one_time', $3, 0, 'sent', NOW())
      `, [qRow.id, invNum, qRow.total_amount]);

      db.release();
      return res.json({ message: 'Quotation confirmed! Fulfillment Order and Invoice created in PostgreSQL DB.', quotation_id: qRow.id });
    }
    db.release();
  } catch (err) {
    console.warn('DB error POST /api/quotations/:id/confirm:', err.message);
  }

  const quote = seed.QUOTATIONS.find((q) => q.id === req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });

  quote.status = 'confirmed';
  res.json({ message: 'Quotation confirmed! Order generated.', quote });
});

module.exports = router;

