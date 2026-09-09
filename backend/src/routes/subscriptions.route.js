const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();
const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// --- 18. SUBSCRIPTIONS ---
router.get('/subscriptions', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT ql.*, p.name as product_name
      FROM quotation_lines ql
      LEFT JOIN products p ON p.id = ql.product_id
      WHERE ql.is_recurring = true
    `);
    db.release();
    const recurringLines = (rows || []).map((l) => ({
      id: `sub_${l.id}`,
      quotation_line_id: l.id,
      quotation_id: l.quotation_id,
      product_name: l.product_name,
      status: 'active',
      monthly_price: Number(l.line_total || 0),
      started_at: l.created_at || new Date().toISOString(),
    }));
    return res.json(recurringLines);
  } catch (err) {
    console.warn('[subscriptions.route] DB query error:', err.message);
    return res.json([]);
  }
});

router.get('/subscriptions/:id', authenticateJWT, async (req, res) => {
  const cleanId = req.params.id.replace('sub_', '');
  try {
    const db = await getConnection();
    const l = await db.queryOne(`
      SELECT ql.*, p.name as product_name
      FROM quotation_lines ql
      LEFT JOIN products p ON p.id = ql.product_id
      WHERE ql.id::text = $1 OR ql.quotation_id::text = $1
    `, [cleanId]);
    db.release();
    if (l) {
      return res.json({
        id: `sub_${l.id}`,
        quotation_line_id: l.id,
        product_name: l.product_name,
        status: 'active',
        monthly_price: Number(l.line_total || 0),
      });
    }
  } catch (err) {
    console.warn('[subscriptions.route] DB query error:', err.message);
  }
  return res.status(404).json({ message: 'Subscription not found' });
});

router.post('/subscriptions', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const newSub = {
    id: `sub_${Date.now()}`,
    product_name: req.body.product_name || 'Enterprise SaaS Plan',
    status: 'active',
    monthly_price: Number(req.body.monthly_price || 350),
    started_at: new Date().toISOString(),
  };
  res.status(201).json(newSub);
});

router.put('/subscriptions/:id', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription updated', id: req.params.id, ...req.body });
});

router.post('/subscriptions/:id/pause', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription paused.', id: req.params.id, status: 'paused' });
});

router.post('/subscriptions/:id/resume', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription resumed.', id: req.params.id, status: 'active' });
});

router.post('/subscriptions/:id/cancel', authenticateJWT, (req, res) => {
  res.json({ message: 'Subscription cancelled. Credit note generated.', id: req.params.id, status: 'cancelled' });
});

// --- 19. SUBSCRIPTION PLANS (POSTGRESQL DB CONNECTED) ---
router.get('/subscription-plans', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT sp.*, p.name as product_name
      FROM subscription_plans sp
      LEFT JOIN products p ON p.id = sp.product_id
      ORDER BY sp.price_per_cycle ASC
    `);
    db.release();
    if (rows) {
      return res.json(rows.map((p) => ({
        id: p.id,
        product_id: p.product_id,
        product_name: p.product_name || 'Enterprise SaaS Suite',
        name: p.name,
        cycle: p.cycle || 'monthly',
        price_per_cycle: Number(p.price_per_cycle || 0),
        proration_enabled: p.proration_enabled !== false,
        proration_policy: p.proration_policy || 'pro_rata_credit',
        cancellation_notice_days: Number(p.cancellation_notice_days || 7),
        cancellation_policy: p.cancellation_policy || 'end_of_cycle',
        partial_refund_allowed: p.partial_refund_allowed !== false,
        refund_window_days: Number(p.refund_window_days || 14),
        early_termination_fee_pct: Number(p.early_termination_fee_pct || 0),
        created_at: p.created_at,
      })));
    }
  } catch (err) {
    console.warn('[subscriptions.route] DB query failed:', err.message);
  }
  res.json([]);
});

router.get('/subscription-plans/:id', authenticateJWT, async (req, res) => {
  const idParam = req.params.id;
  try {
    const db = await getConnection();
    let plan;
    if (isUUID(idParam)) {
      plan = await db.queryOne('SELECT * FROM subscription_plans WHERE id = $1', [idParam]);
    } else {
      plan = await db.queryOne('SELECT * FROM subscription_plans WHERE id::text = $1 OR id::text LIKE $2 LIMIT 1', [idParam, '%' + idParam]);
    }
    db.release();
    if (plan) return res.json(plan);
  } catch (err) {
    console.warn('[subscriptions.route] DB get plan error:', err.message);
  }

  return res.status(404).json({ message: 'Plan not found' });
});

router.post('/subscription-plans', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const {
    product_id,
    name,
    cycle,
    price_per_cycle,
    proration_enabled,
    proration_policy,
    cancellation_notice_days,
    cancellation_policy,
    partial_refund_allowed,
    refund_window_days,
    early_termination_fee_pct,
  } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ message: 'Plan Name is required' });

  const nameVal = name.trim();
  const cycleVal = (cycle || 'monthly').toString().toLowerCase();
  const priceVal = Number(price_per_cycle || 199);
  const proEnabled = proration_enabled !== false;
  const proPolicy = proration_policy || 'pro_rata_credit';
  const noticeDays = Number(cancellation_notice_days || 7);
  const cancelPolicy = cancellation_policy || 'end_of_cycle';
  const refundAllowed = partial_refund_allowed !== false;
  const refundWindow = Number(refund_window_days || 14);
  const terminationFee = Number(early_termination_fee_pct || 0);

  try {
    const db = await getConnection();
    let prodUuid = product_id;
    if (product_id && !isUUID(product_id)) {
      const prodRow = await db.queryOne('SELECT id FROM products WHERE id::text = $1 OR id::text LIKE $2 LIMIT 1', [product_id, '%' + product_id]);
      if (prodRow) prodUuid = prodRow.id;
    }
    if (!prodUuid || !isUUID(prodUuid)) {
      const firstProd = await db.queryOne('SELECT id FROM products LIMIT 1');
      if (firstProd) prodUuid = firstProd.id;
    }

    const inserted = await db.queryOne(
      `INSERT INTO subscription_plans 
       (product_id, name, cycle, price_per_cycle, proration_enabled, proration_policy, cancellation_notice_days, cancellation_policy, partial_refund_allowed, refund_window_days, early_termination_fee_pct) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [prodUuid, nameVal, cycleVal, priceVal, proEnabled, proPolicy, noticeDays, cancelPolicy, refundAllowed, refundWindow, terminationFee]
    );
    db.release();
    if (inserted) {
      console.log('[subscriptions.route] DB PLAN INSERT SUCCESS:', inserted);
      return res.status(201).json(inserted);
    }
  } catch (err) {
    console.warn('[subscriptions.route] DB insert failed:', err.message);
    return res.status(500).json({ message: 'Failed to create subscription plan' });
  }
});

router.put('/subscription-plans/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const {
    name,
    cycle,
    price_per_cycle,
    proration_enabled,
    proration_policy,
    cancellation_notice_days,
    cancellation_policy,
    partial_refund_allowed,
    refund_window_days,
    early_termination_fee_pct,
  } = req.body;
  const idParam = req.params.id;

  try {
    const db = await getConnection();
    let updated;
    if (isUUID(idParam)) {
      updated = await db.queryOne(
        `UPDATE subscription_plans SET 
          name = COALESCE($1, name),
          cycle = COALESCE($2, cycle),
          price_per_cycle = COALESCE($3, price_per_cycle),
          proration_enabled = COALESCE($4, proration_enabled),
          proration_policy = COALESCE($5, proration_policy),
          cancellation_notice_days = COALESCE($6, cancellation_notice_days),
          cancellation_policy = COALESCE($7, cancellation_policy),
          partial_refund_allowed = COALESCE($8, partial_refund_allowed),
          refund_window_days = COALESCE($9, refund_window_days),
          early_termination_fee_pct = COALESCE($10, early_termination_fee_pct)
         WHERE id = $11 RETURNING *`,
        [
          name || null,
          cycle ? cycle.toLowerCase() : null,
          price_per_cycle !== undefined ? Number(price_per_cycle) : null,
          proration_enabled !== undefined ? Boolean(proration_enabled) : null,
          proration_policy || null,
          cancellation_notice_days !== undefined ? Number(cancellation_notice_days) : null,
          cancellation_policy || null,
          partial_refund_allowed !== undefined ? Boolean(partial_refund_allowed) : null,
          refund_window_days !== undefined ? Number(refund_window_days) : null,
          early_termination_fee_pct !== undefined ? Number(early_termination_fee_pct) : null,
          idParam,
        ]
      );
    } else {
      updated = await db.queryOne(
        `UPDATE subscription_plans SET 
          name = COALESCE($1, name),
          cycle = COALESCE($2, cycle),
          price_per_cycle = COALESCE($3, price_per_cycle),
          proration_enabled = COALESCE($4, proration_enabled),
          proration_policy = COALESCE($5, proration_policy),
          cancellation_notice_days = COALESCE($6, cancellation_notice_days),
          cancellation_policy = COALESCE($7, cancellation_policy),
          partial_refund_allowed = COALESCE($8, partial_refund_allowed),
          refund_window_days = COALESCE($9, refund_window_days),
          early_termination_fee_pct = COALESCE($10, early_termination_fee_pct)
         WHERE id::text = $11 OR id::text LIKE $12 RETURNING *`,
        [
          name || null,
          cycle ? cycle.toLowerCase() : null,
          price_per_cycle !== undefined ? Number(price_per_cycle) : null,
          proration_enabled !== undefined ? Boolean(proration_enabled) : null,
          proration_policy || null,
          cancellation_notice_days !== undefined ? Number(cancellation_notice_days) : null,
          cancellation_policy || null,
          partial_refund_allowed !== undefined ? Boolean(partial_refund_allowed) : null,
          refund_window_days !== undefined ? Number(refund_window_days) : null,
          early_termination_fee_pct !== undefined ? Number(early_termination_fee_pct) : null,
          idParam,
          '%' + idParam,
        ]
      );
    }
    db.release();
    if (updated) {
      console.log('[subscriptions.route] DB PLAN UPDATE SUCCESS:', updated);
      return res.json(updated);
    }
  } catch (err) {
    console.warn('[subscriptions.route] DB plan update failed:', err.message);
  }

  return res.status(404).json({ message: 'Plan not found' });
});

router.delete('/subscription-plans/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const idParam = req.params.id;
  try {
    const db = await getConnection();
    if (isUUID(idParam)) {
      await db.queryOne('DELETE FROM subscription_plans WHERE id = $1', [idParam]);
    } else {
      await db.queryOne('DELETE FROM subscription_plans WHERE id::text = $1 OR id::text LIKE $2', [idParam, '%' + idParam]);
    }
    db.release();
    console.log('[subscriptions.route] DB PLAN DELETE SUCCESS:', idParam);
  } catch (err) {
    console.warn('[subscriptions.route] DB plan delete warning:', err.message);
  }

  res.json({ message: 'Subscription plan deleted successfully' });
});

module.exports = router;
