const express = require('express');
const seed = require('../db/dealflow360_seed');
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
      if (rows && rows.length > 0) {
        console.log(`[API GET /customer-tiers] Loaded ${rows.length} tiers from PostgreSQL database.`);
        return res.json(rows);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /customer-tiers] DB query failed, using seed fallback:', err.message);
  }
  return res.json(seed.CUSTOMER_TIERS);
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

  const tier = seed.CUSTOMER_TIERS.find((t) => t.id === id || t.code === id);
  if (!tier) return res.status(404).json({ message: 'Customer tier not found' });
  res.json(tier);
});

// POST /api/customer-tiers
router.post('/', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const { code, label, default_discount_ceiling_pct } = req.body;
  const newTier = {
    id: `20${seed.CUSTOMER_TIERS.length + 1}`,
    code: code.toLowerCase(),
    label,
    default_discount_ceiling_pct: Number(default_discount_ceiling_pct || 0),
  };

  seed.CUSTOMER_TIERS.push(newTier);
  res.status(201).json(newTier);
});

// PUT /api/customer-tiers/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const tier = seed.CUSTOMER_TIERS.find((t) => t.id === req.params.id || t.code === req.params.id);
  if (!tier) return res.status(404).json({ message: 'Customer tier not found' });

  Object.assign(tier, req.body);
  res.json(tier);
});

// DELETE /api/customer-tiers/:id
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.CUSTOMER_TIERS.findIndex((t) => t.id === req.params.id || t.code === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Customer tier not found' });

  const deleted = seed.CUSTOMER_TIERS.splice(idx, 1)[0];
  res.json({ message: 'Tier deleted successfully', tier: deleted });
});

module.exports = router;
