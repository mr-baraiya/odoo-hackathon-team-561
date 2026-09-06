const express = require('express');
const seed = require('../db/dealflow360_seed');
const { getUpsellSuggestions } = require('../service/upsellEngine');
const { getConnection } = require('../service/database');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const isUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// ─── UPSELL RULES (DB-Connected) ───────────────────────────────────────────

// GET /api/upsell-rules  — fetch all pairing rules from DB
router.get('/upsell-rules', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT ur.*,
             bp.name  AS base_product_name,
             bp.sku   AS base_product_sku,
             sp.name  AS suggested_product_name,
             sp.sku   AS suggested_product_sku,
             sp.base_price AS suggested_price,
             sp.cost_price AS suggested_cost
      FROM upsell_rules ur
      LEFT JOIN products bp ON bp.id = ur.base_product_id
      LEFT JOIN products sp ON sp.id = ur.suggested_product_id
      ORDER BY ur.co_purchase_score DESC, ur.created_at DESC
    `);
    db.release();
    if (rows && rows.length > 0) {
      return res.json(rows.map((r) => ({
        id: r.id,
        base_product_id: r.base_product_id,
        base_product_name: r.base_product_name || 'Unknown Product',
        base_product_sku: r.base_product_sku || '',
        suggested_product_id: r.suggested_product_id,
        suggested_product_name: r.suggested_product_name || 'Unknown Product',
        suggested_product_sku: r.suggested_product_sku || '',
        suggested_price: Number(r.suggested_price || 0),
        suggested_cost: Number(r.suggested_cost || 0),
        co_purchase_score: Number(r.co_purchase_score || 0),
        min_margin_pct_required: Number(r.min_margin_pct_required || 0),
        is_active: r.is_active !== false,
        created_at: r.created_at,
      })));
    }
  } catch (err) {
    console.warn('[upsell.route] DB get upsell-rules failed:', err.message);
  }
  // Fallback to seed
  res.json(seed.UPSELL_RULES);
});

// POST /api/upsell-rules  — create new pairing rule
router.post('/upsell-rules', authenticateJWT, authorizeRoles('admin', 'sales_manager'), async (req, res) => {
  const { base_product_id, suggested_product_id, co_purchase_score, min_margin_pct_required, is_active } = req.body;

  if (!base_product_id || !suggested_product_id)
    return res.status(400).json({ message: 'base_product_id and suggested_product_id are required' });

  const score = Math.min(1, Math.max(0, Number(co_purchase_score || 0.8)));
  const minMargin = Number(min_margin_pct_required || 15);
  const active = is_active !== false;

  try {
    const db = await getConnection();
    const inserted = await db.queryOne(
      `INSERT INTO upsell_rules (base_product_id, suggested_product_id, co_purchase_score, min_margin_pct_required, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [base_product_id, suggested_product_id, score, minMargin, active]
    );
    db.release();
    if (inserted) {
      console.log('[upsell.route] DB RULE INSERT:', inserted.id);
      return res.status(201).json(inserted);
    }
  } catch (err) {
    console.warn('[upsell.route] DB insert failed:', err.message);
  }

  // Memory fallback
  const newRule = {
    id: `90${seed.UPSELL_RULES.length + 1}`,
    base_product_id, suggested_product_id,
    co_purchase_score: score,
    min_margin_pct_required: minMargin,
    is_active: active,
  };
  seed.UPSELL_RULES.push(newRule);
  res.status(201).json(newRule);
});

// PUT /api/upsell-rules/:id  — update pairing rule
router.put('/upsell-rules/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager'), async (req, res) => {
  const idParam = req.params.id;
  const { co_purchase_score, min_margin_pct_required, is_active } = req.body;

  try {
    const db = await getConnection();
    let updated;
    if (isUUID(idParam)) {
      updated = await db.queryOne(
        `UPDATE upsell_rules SET
           co_purchase_score       = COALESCE($1, co_purchase_score),
           min_margin_pct_required = COALESCE($2, min_margin_pct_required),
           is_active               = COALESCE($3, is_active)
         WHERE id = $4 RETURNING *`,
        [
          co_purchase_score !== undefined ? Number(co_purchase_score) : null,
          min_margin_pct_required !== undefined ? Number(min_margin_pct_required) : null,
          is_active !== undefined ? Boolean(is_active) : null,
          idParam,
        ]
      );
    }
    db.release();
    if (updated) return res.json(updated);
  } catch (err) {
    console.warn('[upsell.route] DB update failed:', err.message);
  }

  const rule = seed.UPSELL_RULES.find((r) => r.id === idParam);
  if (!rule) return res.status(404).json({ message: 'Upsell rule not found' });
  Object.assign(rule, req.body);
  res.json(rule);
});

// DELETE /api/upsell-rules/:id
router.delete('/upsell-rules/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager'), async (req, res) => {
  const idParam = req.params.id;
  try {
    const db = await getConnection();
    if (isUUID(idParam)) {
      await db.queryOne('DELETE FROM upsell_rules WHERE id = $1', [idParam]);
    }
    db.release();
    console.log('[upsell.route] DB RULE DELETE:', idParam);
  } catch (err) {
    console.warn('[upsell.route] DB delete failed:', err.message);
  }
  const idx = seed.UPSELL_RULES.findIndex((r) => r.id === idParam);
  if (idx !== -1) seed.UPSELL_RULES.splice(idx, 1);
  res.json({ message: 'Upsell rule deleted', id: idParam });
});

// PATCH /api/upsell-rules/:id/toggle  — toggle active status
router.patch('/upsell-rules/:id/toggle', authenticateJWT, authorizeRoles('admin', 'sales_manager'), async (req, res) => {
  const idParam = req.params.id;
  try {
    const db = await getConnection();
    let updated;
    if (isUUID(idParam)) {
      updated = await db.queryOne(
        `UPDATE upsell_rules SET is_active = NOT is_active WHERE id = $1 RETURNING *`,
        [idParam]
      );
    }
    db.release();
    if (updated) return res.json(updated);
  } catch (err) {
    console.warn('[upsell.route] DB toggle failed:', err.message);
  }
  res.json({ message: 'Toggled', id: idParam });
});

// ─── RECOMMENDATIONS ENGINE ─────────────────────────────────────────────────

// GET /api/recommendations — run live suggestion engine from DB rules + products
router.get('/recommendations', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const [rules, products] = await Promise.all([
      db.queryAll('SELECT * FROM upsell_rules WHERE is_active = true'),
      db.queryAll('SELECT * FROM products WHERE is_active = true OR is_active IS NULL'),
    ]);
    db.release();

    const mapped = rules.map((r) => ({
      baseProductId: r.base_product_id,
      suggestedProductId: r.suggested_product_id,
      coPurchaseScore: Number(r.co_purchase_score || 0.8),
      minMarginPctRequired: Number(r.min_margin_pct_required || 15),
    }));
    const result = getUpsellSuggestions({
      currentCartLines: [],
      availableProducts: products,
      upsellRules: mapped,
    });
    return res.json(result);
  } catch (err) {
    console.warn('[upsell.route] DB recommendations failed:', err.message);
  }
  // Fallback
  const result = getUpsellSuggestions({
    currentCartLines: [],
    availableProducts: seed.PRODUCTS,
    upsellRules: seed.UPSELL_RULES,
  });
  res.json(result);
});

// GET /api/recommendations/:productId  — suggestions for a specific product
router.get('/recommendations/:productId', authenticateJWT, async (req, res) => {
  const { productId } = req.params;
  try {
    const db = await getConnection();
    const [rules, products] = await Promise.all([
      db.queryAll('SELECT * FROM upsell_rules WHERE is_active = true'),
      db.queryAll('SELECT * FROM products'),
    ]);
    db.release();
    const mapped = rules.map((r) => ({
      baseProductId: r.base_product_id,
      suggestedProductId: r.suggested_product_id,
      coPurchaseScore: Number(r.co_purchase_score),
      minMarginPctRequired: Number(r.min_margin_pct_required),
    }));
    // Find the product being queried
    const targetProd = products.find((p) => p.id === productId);
    const unitPrice = Number(targetProd?.base_price || 1000);
    const costPrice = Number(targetProd?.cost_price || 600);
    const result = getUpsellSuggestions({
      currentCartLines: [{ productId, quantity: 1, unitPrice, costPrice, discountPct: 0 }],
      availableProducts: products,
      upsellRules: mapped,
    });
    return res.json(result);
  } catch (err) {
    console.warn('[upsell.route] DB recommendations/:id failed:', err.message);
  }
  const result = getUpsellSuggestions({
    currentCartLines: [{ productId, quantity: 1, unitPrice: 1000, costPrice: 600, discountPct: 0 }],
    availableProducts: seed.PRODUCTS,
    upsellRules: seed.UPSELL_RULES,
  });
  res.json(result);
});

module.exports = router;
