const express = require('express');
const seed = require('../db/dealflow360_seed');
const { getConnection } = require('../service/database');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// GET /api/warehouses
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll('SELECT * FROM warehouses ORDER BY name ASC');
    db.release();
    if (rows && rows.length > 0) {
      return res.json(rows.map((r) => ({
        id: r.id,
        name: r.name,
        location: r.location || '',
        shipping_cost_weight: Number(r.shipping_cost_weight || 1.0),
        is_active: r.is_active !== false,
        created_at: r.created_at,
      })));
    }
  } catch (err) {
    console.warn('[warehouses.route] DB query failed, using fallback:', err.message);
  }
  res.json(seed.WAREHOUSES);
});

// GET /api/warehouses/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  const idParam = req.params.id;
  try {
    const db = await getConnection();
    let row;
    if (isUUID(idParam)) {
      row = await db.queryOne('SELECT * FROM warehouses WHERE id = $1', [idParam]);
    } else {
      row = await db.queryOne('SELECT * FROM warehouses WHERE id::text = $1 OR id::text LIKE $2 LIMIT 1', [idParam, '%' + idParam]);
    }
    db.release();
    if (row) return res.json(row);
  } catch (err) {
    console.warn('[warehouses.route] DB query failed:', err.message);
  }
  const warehouse = seed.WAREHOUSES.find((w) => String(w.id) === String(req.params.id));
  if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
  res.json(warehouse);
});

// POST /api/warehouses
router.post('/', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const { name, location, shipping_cost_weight, is_active } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Warehouse Name is required' });

  const nameVal = name.trim();
  const locVal = (location || '').trim();
  const weightVal = Number(shipping_cost_weight || 1.0);
  const activeVal = is_active !== false;

  try {
    const db = await getConnection();
    const inserted = await db.queryOne(
      'INSERT INTO warehouses (name, location, shipping_cost_weight, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [nameVal, locVal, weightVal, activeVal]
    );
    db.release();
    if (inserted) {
      console.log('[warehouses.route] DB WAREHOUSE INSERT SUCCESS:', inserted);
      return res.status(201).json(inserted);
    }
  } catch (err) {
    console.warn('[warehouses.route] DB insert failed, using memory fallback:', err.message);
  }

  const newWh = {
    id: `70${seed.WAREHOUSES.length + 1}`,
    name: nameVal,
    location: locVal,
    shipping_cost_weight: weightVal,
    is_active: activeVal,
  };
  seed.WAREHOUSES.push(newWh);
  res.status(201).json(newWh);
});

// PUT /api/warehouses/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const { name, location, shipping_cost_weight, is_active } = req.body;
  const idParam = req.params.id;

  try {
    const db = await getConnection();
    let updated;
    if (isUUID(idParam)) {
      updated = await db.queryOne(
        'UPDATE warehouses SET name = COALESCE($1, name), location = COALESCE($2, location), shipping_cost_weight = COALESCE($3, shipping_cost_weight), is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *',
        [name, location, shipping_cost_weight ? Number(shipping_cost_weight) : null, is_active !== undefined ? Boolean(is_active) : null, idParam]
      );
    } else {
      updated = await db.queryOne(
        'UPDATE warehouses SET name = COALESCE($1, name), location = COALESCE($2, location), shipping_cost_weight = COALESCE($3, shipping_cost_weight), is_active = COALESCE($4, is_active) WHERE id::text = $5 OR id::text LIKE $6 RETURNING *',
        [name, location, shipping_cost_weight ? Number(shipping_cost_weight) : null, is_active !== undefined ? Boolean(is_active) : null, idParam, '%' + idParam]
      );
    }
    db.release();
    if (updated) {
      console.log('[warehouses.route] DB WAREHOUSE UPDATE SUCCESS:', updated);
      return res.json(updated);
    }
  } catch (err) {
    console.warn('[warehouses.route] DB update failed:', err.message);
  }

  const warehouse = seed.WAREHOUSES.find((w) => String(w.id) === String(req.params.id));
  if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
  Object.assign(warehouse, req.body);
  res.json(warehouse);
});

// DELETE /api/warehouses/:id
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const idParam = req.params.id;
  try {
    const db = await getConnection();
    if (isUUID(idParam)) {
      await db.queryOne('DELETE FROM warehouses WHERE id = $1', [idParam]);
    } else {
      await db.queryOne('DELETE FROM warehouses WHERE id::text = $1 OR id::text LIKE $2', [idParam, '%' + idParam]);
    }
    db.release();
    console.log('[warehouses.route] DB WAREHOUSE DELETE SUCCESS:', idParam);
  } catch (err) {
    console.warn('[warehouses.route] DB delete warning:', err.message);
  }

  const idx = seed.WAREHOUSES.findIndex((w) => String(w.id) === String(req.params.id));
  if (idx !== -1) seed.WAREHOUSES.splice(idx, 1);
  res.json({ message: 'Warehouse deleted successfully' });
});

module.exports = router;
