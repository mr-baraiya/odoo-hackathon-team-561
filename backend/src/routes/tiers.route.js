const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

// GET /api/customer-tiers - Query PostgreSQL DB
router.get('/', authenticateJWT, async (req, res) => {
  console.log('[API GET /customer-tiers] Querying PostgreSQL database...');
  try {
    const db = await getConnection();
    try {
      const rows = await db.queryAll(`SELECT * FROM customer_tiers ORDER BY default_discount_ceiling_pct ASC`);
      console.log(`[API GET /customer-tiers] Loaded ${rows ? rows.length : 0} tiers from PostgreSQL database.`);
      return res.json(rows || []);
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /customer-tiers] DB query failed:', err.message);
    return res.json([]);
  }
});

// GET /api/customer-tiers/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  console.log(`[API GET /customer-tiers/${id}] Fetching tier details...`);
  try {
    const db = await getConnection();
    try {
      const tier = await db.queryOne(`SELECT * FROM customer_tiers WHERE id::text = $1 OR code::text = $2`, [id, id.toLowerCase()]);
      if (tier) {
        console.log(`[API GET /customer-tiers/${id}] Found tier in PostgreSQL DB:`, tier.label || tier.code);
        return res.json(tier);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API GET /customer-tiers/${id}] DB query failed:`, err.message);
  }

  return res.status(404).json({ message: 'Customer tier not found' });
});

// POST /api/customer-tiers
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { code, label, default_discount_ceiling_pct } = req.body;
  try {
    const db = await getConnection();
    try {
      const inserted = await db.queryOne(
        `INSERT INTO customer_tiers (code, label, default_discount_ceiling_pct) VALUES ($1, $2, $3) RETURNING *`,
        [code.toLowerCase(), label, Number(default_discount_ceiling_pct || 0)]
      );
      if (inserted) return res.status(201).json(inserted);
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[customer-tiers] POST DB error:', err.message);
    return res.status(500).json({ message: 'Failed to create tier' });
  }
});

// PUT /api/customer-tiers/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { code, label, default_discount_ceiling_pct } = req.body;
  try {
    const db = await getConnection();
    try {
      const updated = await db.queryOne(
        `UPDATE customer_tiers SET code = COALESCE($1, code), label = COALESCE($2, label), default_discount_ceiling_pct = COALESCE($3, default_discount_ceiling_pct) WHERE id::text = $4 OR code::text = $5 RETURNING *`,
        [code ? code.toLowerCase() : null, label || null, default_discount_ceiling_pct !== undefined ? Number(default_discount_ceiling_pct) : null, req.params.id, req.params.id.toLowerCase()]
      );
      if (updated) return res.json(updated);
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[customer-tiers] PUT DB error:', err.message);
  }

  return res.status(404).json({ message: 'Customer tier not found' });
});

// DELETE /api/customer-tiers/:id
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const deleted = await db.queryOne(`DELETE FROM customer_tiers WHERE id::text = $1 OR code::text = $2 RETURNING *`, [req.params.id, req.params.id.toLowerCase()]);
      if (deleted) return res.json({ message: 'Tier deleted successfully', tier: deleted });
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[customer-tiers] DELETE DB error:', err.message);
  }

  return res.status(404).json({ message: 'Customer tier not found' });
});

module.exports = router;
