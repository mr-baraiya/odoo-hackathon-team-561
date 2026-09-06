const express = require('express');
const seed = require('../db/dealflow360_seed');
const { getConnection } = require('../service/database');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Helper to resolve warehouse / product ID to UUID if short seed ID is passed
async function resolveWarehouseUUID(db, idStr) {
  if (!idStr) return null;
  if (isUUID(idStr)) return idStr;
  const row = await db.queryOne('SELECT id FROM warehouses WHERE id::text = $1 OR id::text LIKE $2 LIMIT 1', [idStr, '%' + idStr]);
  return row ? row.id : idStr;
}

async function resolveProductUUID(db, idStr) {
  if (!idStr) return null;
  if (isUUID(idStr)) return idStr;
  const row = await db.queryOne('SELECT id FROM products WHERE id::text = $1 OR id::text LIKE $2 LIMIT 1', [idStr, '%' + idStr]);
  return row ? row.id : idStr;
}

// GET /api/inventory/reorder-alerts
router.get('/reorder-alerts', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT ws.*, p.name as product_name, w.name as warehouse_name 
      FROM warehouse_stock ws
      LEFT JOIN products p ON p.id = ws.product_id
      LEFT JOIN warehouses w ON w.id = ws.warehouse_id
      WHERE ws.quantity_on_hand <= ws.reorder_threshold
    `);
    db.release();
    if (rows) {
      return res.json(rows.map((s) => ({
        stock_id: s.id,
        product_name: s.product_name || s.product_id,
        warehouse_name: s.warehouse_name || s.warehouse_id,
        quantity_on_hand: Number(s.quantity_on_hand || 0),
        reorder_threshold: Number(s.reorder_threshold || 0),
        replenishment_lead_days: Number(s.replenishment_lead_days || 0),
        alert_status: s.quantity_on_hand === 0 ? 'out_of_stock' : 'critical_low_stock',
      })));
    }
  } catch (err) {
    console.warn('[inventory.route] DB reorder query failed, falling back:', err.message);
  }

  const alerts = seed.WAREHOUSE_STOCK.filter((s) => s.quantity_on_hand <= s.reorder_threshold).map((s) => {
    const prod = seed.PRODUCTS.find((p) => p.id === s.product_id);
    const wh = seed.WAREHOUSES.find((w) => w.id === s.warehouse_id);
    return {
      stock_id: s.id,
      product_name: prod ? prod.name : s.product_id,
      warehouse_name: wh ? wh.name : s.warehouse_id,
      quantity_on_hand: s.quantity_on_hand,
      reorder_threshold: s.reorder_threshold,
      replenishment_lead_days: s.replenishment_lead_days || 7,
      alert_status: s.quantity_on_hand === 0 ? 'out_of_stock' : 'critical_low_stock',
    };
  });
  res.json(alerts);
});

// GET /api/inventory
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT ws.*, p.name as product_name, p.sku as product_sku, w.name as warehouse_name, w.location as warehouse_location
      FROM warehouse_stock ws
      LEFT JOIN products p ON p.id = ws.product_id
      LEFT JOIN warehouses w ON w.id = ws.warehouse_id
      ORDER BY ws.updated_at DESC
    `);
    db.release();
    if (rows && rows.length > 0) {
      return res.json(rows.map((s) => ({
        id: s.id,
        warehouse_id: s.warehouse_id,
        product_id: s.product_id,
        product_name: s.product_name,
        product_sku: s.product_sku,
        warehouse_name: s.warehouse_name,
        warehouse_location: s.warehouse_location,
        quantity_on_hand: Number(s.quantity_on_hand || 0),
        reorder_threshold: Number(s.reorder_threshold || 2),
        replenishment_lead_days: Number(s.replenishment_lead_days || 7),
        updated_at: s.updated_at,
      })));
    }
  } catch (err) {
    console.warn('[inventory.route] DB query failed, falling back:', err.message);
  }
  res.json(seed.WAREHOUSE_STOCK);
});

// GET /api/inventory/product/:productId
router.get('/product/:productId', authenticateJWT, (req, res) => {
  const stock = seed.WAREHOUSE_STOCK.filter((s) => s.product_id === req.params.productId);
  res.json(stock);
});

// GET /api/inventory/warehouse/:warehouseId
router.get('/warehouse/:warehouseId', authenticateJWT, (req, res) => {
  const stock = seed.WAREHOUSE_STOCK.filter((s) => s.warehouse_id === req.params.warehouseId);
  res.json(stock);
});

// POST /api/inventory/stock
router.post('/stock', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const { warehouse_id, product_id, quantity_on_hand, reorder_threshold, replenishment_lead_days } = req.body;
  const qty = Number(quantity_on_hand || 0);
  const reorder = Number(reorder_threshold || 2);
  const leadDays = Number(replenishment_lead_days || 7);

  try {
    const db = await getConnection();
    const whUuid = await resolveWarehouseUUID(db, warehouse_id);
    const prodUuid = await resolveProductUUID(db, product_id);

    const inserted = await db.queryOne(
      'INSERT INTO warehouse_stock (warehouse_id, product_id, quantity_on_hand, reorder_threshold, replenishment_lead_days) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [whUuid, prodUuid, qty, reorder, leadDays]
    );
    db.release();
    if (inserted) {
      console.log('[inventory.route] DB STOCK INSERT SUCCESS:', inserted);
      return res.status(201).json(inserted);
    }
  } catch (err) {
    console.warn('[inventory.route] DB insert failed, using memory fallback:', err.message);
  }

  const newStock = {
    id: `80${seed.WAREHOUSE_STOCK.length + 1}`,
    warehouse_id,
    product_id,
    quantity_on_hand: qty,
    reorder_threshold: reorder,
    replenishment_lead_days: leadDays,
  };
  seed.WAREHOUSE_STOCK.push(newStock);
  res.status(201).json(newStock);
});

// PUT /api/inventory/stock/:id
router.put('/stock/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const { quantity_on_hand, reorder_threshold, replenishment_lead_days } = req.body;
  const idParam = req.params.id;

  try {
    const db = await getConnection();
    let updated;
    if (isUUID(idParam)) {
      updated = await db.queryOne(
        'UPDATE warehouse_stock SET quantity_on_hand = COALESCE($1, quantity_on_hand), reorder_threshold = COALESCE($2, reorder_threshold), replenishment_lead_days = COALESCE($3, replenishment_lead_days), updated_at = NOW() WHERE id = $4 RETURNING *',
        [
          quantity_on_hand !== undefined ? Number(quantity_on_hand) : null,
          reorder_threshold !== undefined ? Number(reorder_threshold) : null,
          replenishment_lead_days !== undefined ? Number(replenishment_lead_days) : null,
          idParam,
        ]
      );
    } else {
      updated = await db.queryOne(
        'UPDATE warehouse_stock SET quantity_on_hand = COALESCE($1, quantity_on_hand), reorder_threshold = COALESCE($2, reorder_threshold), replenishment_lead_days = COALESCE($3, replenishment_lead_days), updated_at = NOW() WHERE id::text = $4 OR id::text LIKE $5 RETURNING *',
        [
          quantity_on_hand !== undefined ? Number(quantity_on_hand) : null,
          reorder_threshold !== undefined ? Number(reorder_threshold) : null,
          replenishment_lead_days !== undefined ? Number(replenishment_lead_days) : null,
          idParam,
          '%' + idParam,
        ]
      );
    }
    db.release();
    if (updated) {
      console.log('[inventory.route] DB STOCK UPDATE SUCCESS:', updated);
      return res.json(updated);
    }
  } catch (err) {
    console.warn('[inventory.route] DB update failed:', err.message);
  }

  const stock = seed.WAREHOUSE_STOCK.find((s) => String(s.id) === String(req.params.id));
  if (!stock) return res.status(404).json({ message: 'Stock record not found' });
  Object.assign(stock, req.body);
  res.json(stock);
});

// PATCH /api/inventory/stock/:id
router.patch('/stock/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const { quantity_on_hand, reorder_threshold, replenishment_lead_days } = req.body;
  const idParam = req.params.id;

  try {
    const db = await getConnection();
    let updated;
    if (isUUID(idParam)) {
      updated = await db.queryOne(
        'UPDATE warehouse_stock SET quantity_on_hand = COALESCE($1, quantity_on_hand), reorder_threshold = COALESCE($2, reorder_threshold), replenishment_lead_days = COALESCE($3, replenishment_lead_days), updated_at = NOW() WHERE id = $4 RETURNING *',
        [
          quantity_on_hand !== undefined ? Number(quantity_on_hand) : null,
          reorder_threshold !== undefined ? Number(reorder_threshold) : null,
          replenishment_lead_days !== undefined ? Number(replenishment_lead_days) : null,
          idParam,
        ]
      );
    } else {
      updated = await db.queryOne(
        'UPDATE warehouse_stock SET quantity_on_hand = COALESCE($1, quantity_on_hand), reorder_threshold = COALESCE($2, reorder_threshold), replenishment_lead_days = COALESCE($3, replenishment_lead_days), updated_at = NOW() WHERE id::text = $4 OR id::text LIKE $5 RETURNING *',
        [
          quantity_on_hand !== undefined ? Number(quantity_on_hand) : null,
          reorder_threshold !== undefined ? Number(reorder_threshold) : null,
          replenishment_lead_days !== undefined ? Number(replenishment_lead_days) : null,
          idParam,
          '%' + idParam,
        ]
      );
    }
    db.release();
    if (updated) {
      console.log('[inventory.route] DB STOCK PATCH SUCCESS:', updated);
      return res.json(updated);
    }
  } catch (err) {
    console.warn('[inventory.route] DB patch failed:', err.message);
  }

  const stock = seed.WAREHOUSE_STOCK.find((s) => String(s.id) === String(req.params.id));
  if (!stock) return res.status(404).json({ message: 'Stock record not found' });
  if (req.body.quantity_on_hand !== undefined) stock.quantity_on_hand = Number(req.body.quantity_on_hand);
  if (req.body.reorder_threshold !== undefined) stock.reorder_threshold = Number(req.body.reorder_threshold);
  if (req.body.replenishment_lead_days !== undefined) stock.replenishment_lead_days = Number(req.body.replenishment_lead_days);
  res.json(stock);
});

// DELETE /api/inventory/stock/:id
router.delete('/stock/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops', 'sales_manager', 'sales_rep'), async (req, res) => {
  const idParam = req.params.id;
  try {
    const db = await getConnection();
    if (isUUID(idParam)) {
      await db.queryOne('DELETE FROM warehouse_stock WHERE id = $1', [idParam]);
    } else {
      await db.queryOne('DELETE FROM warehouse_stock WHERE id::text = $1 OR id::text LIKE $2', [idParam, '%' + idParam]);
    }
    db.release();
    console.log('[inventory.route] DB STOCK DELETE SUCCESS:', idParam);
  } catch (err) {
    console.warn('[inventory.route] DB stock delete warning:', err.message);
  }

  const idx = seed.WAREHOUSE_STOCK.findIndex((s) => String(s.id) === String(req.params.id));
  if (idx !== -1) seed.WAREHOUSE_STOCK.splice(idx, 1);
  res.json({ message: 'Stock allocation deleted' });
});

module.exports = router;
