const express = require('express');
const { calculateFulfillmentSplits } = require('../service/fulfillmentEngine');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

async function getWarehousesWithStock(db) {
  const warehouses = await db.queryAll('SELECT * FROM warehouses ORDER BY name ASC');
  const stocks = await db.queryAll('SELECT * FROM warehouse_stock');
  return (warehouses || []).map((wh) => {
    const stockMap = {};
    (stocks || []).filter((s) => String(s.warehouse_id) === String(wh.id)).forEach((s) => {
      stockMap[s.product_id] = Number(s.quantity_on_hand || 0);
    });
    return { ...wh, stockMap };
  });
}

// GET /api/fulfillment
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const quotes = await db.queryAll("SELECT id, quote_number, status, created_at FROM quotations WHERE status::text IN ('confirmed', 'in_fulfillment', 'fulfilled') ORDER BY created_at DESC");
    db.release();
    const FULFILLMENTS = (quotes || []).map((q) => ({
      id: `ful_${q.id}`,
      quotation_id: q.id,
      quote_number: q.quote_number,
      status: q.status === 'fulfilled' ? 'fulfilled' : 'pending',
      created_at: q.created_at,
    }));
    return res.json(FULFILLMENTS);
  } catch (err) {
    console.warn('[fulfillment.route] DB error:', err.message);
    return res.json([]);
  }
});

// POST /api/fulfillment/calculate-split
router.post('/calculate-split', authenticateJWT, async (req, res) => {
  const { lineItems, overrideSplits } = req.body;
  try {
    const db = await getConnection();
    const warehousesWithStock = await getWarehousesWithStock(db);
    db.release();
    const result = calculateFulfillmentSplits(lineItems || [], warehousesWithStock, overrideSplits);
    return res.json(result);
  } catch (err) {
    console.warn('[fulfillment.route] DB error in calculate-split:', err.message);
    return res.json({ fulfillmentSplits: [], backorderedItems: lineItems || [] });
  }
});

// GET /api/fulfillment/splits/:orderId
router.get('/splits/:orderId', authenticateJWT, async (req, res) => {
  const cleanId = req.params.orderId.replace('ful_', '');
  try {
    const db = await getConnection();
    const qRow = await db.queryOne('SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1', [cleanId]);
    if (!qRow) {
      db.release();
      return res.status(404).json({ message: 'Quotation/Order not found' });
    }
    const lines = await db.queryAll('SELECT ql.*, p.name as product_name FROM quotation_lines ql LEFT JOIN products p ON p.id = ql.product_id WHERE ql.quotation_id = $1', [qRow.id]);
    const warehousesWithStock = await getWarehousesWithStock(db);
    db.release();

    const lineItems = (lines || []).map((l) => ({
      lineId: l.id,
      productId: l.product_id,
      productName: l.product_name,
      quantity: Number(l.quantity || 1),
    }));

    const result = calculateFulfillmentSplits(lineItems, warehousesWithStock);
    return res.json(result.fulfillmentSplits);
  } catch (err) {
    console.warn('[fulfillment.route] DB error in splits:', err.message);
    return res.status(404).json({ message: 'Quotation/Order not found' });
  }
});

// GET /api/fulfillment/:id/splits
router.get('/:id/splits', authenticateJWT, async (req, res) => {
  const cleanId = req.params.id.replace('ful_', '');
  try {
    const db = await getConnection();
    const qRow = await db.queryOne('SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1', [cleanId]);
    if (!qRow) {
      db.release();
      return res.status(404).json({ message: 'Quotation not found' });
    }
    const lines = await db.queryAll('SELECT ql.*, p.name as product_name FROM quotation_lines ql LEFT JOIN products p ON p.id = ql.product_id WHERE ql.quotation_id = $1', [qRow.id]);
    const warehousesWithStock = await getWarehousesWithStock(db);
    db.release();

    const lineItems = (lines || []).map((l) => ({
      lineId: l.id,
      productId: l.product_id,
      productName: l.product_name,
      quantity: Number(l.quantity || 1),
    }));

    const result = calculateFulfillmentSplits(lineItems, warehousesWithStock);
    return res.json(result.fulfillmentSplits);
  } catch (err) {
    return res.status(404).json({ message: 'Quotation not found' });
  }
});

// GET /api/fulfillment/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  const cleanId = req.params.id.replace('ful_', '');
  try {
    const db = await getConnection();
    const qRow = await db.queryOne('SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1', [cleanId]);
    if (!qRow) {
      db.release();
      return res.status(404).json({ message: 'Fulfillment record not found' });
    }
    const lines = await db.queryAll('SELECT * FROM quotation_lines WHERE quotation_id = $1', [qRow.id]);
    db.release();

    return res.json({
      id: `ful_${qRow.id}`,
      quotation_id: qRow.id,
      quote_number: qRow.quote_number,
      status: qRow.status === 'fulfilled' ? 'fulfilled' : 'pending',
      lines: lines || [],
    });
  } catch (err) {
    return res.status(404).json({ message: 'Fulfillment record not found' });
  }
});

// POST /api/fulfillment
router.post('/', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const { quotationId } = req.body;
  try {
    const db = await getConnection();
    const qRow = await db.queryOne('SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1', [quotationId]);
    if (!qRow) {
      db.release();
      return res.status(404).json({ message: 'Quotation not found' });
    }
    await db.query("UPDATE quotations SET status = 'in_fulfillment', updated_at = NOW() WHERE id = $1", [qRow.id]);
    db.release();

    return res.status(201).json({
      id: `ful_${qRow.id}`,
      quotation_id: qRow.id,
      status: 'in_fulfillment',
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(404).json({ message: 'Quotation not found' });
  }
});

// PUT /api/fulfillment/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const cleanId = req.params.id.replace('ful_', '');
  const { status } = req.body;
  try {
    const db = await getConnection();
    if (status) {
      await db.query('UPDATE quotations SET status = $1, updated_at = NOW() WHERE id::text = $2 OR quote_number = $2', [status, cleanId]);
    }
    db.release();
    return res.json({ id: `ful_${cleanId}`, status: status || 'in_fulfillment' });
  } catch (err) {
    return res.status(404).json({ message: 'Fulfillment record not found' });
  }
});

// PATCH /api/fulfillment/:id/status
router.patch('/:id/status', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const cleanId = req.params.id.replace('ful_', '');
  const status = req.body.status || 'fulfilled';
  try {
    const db = await getConnection();
    await db.query('UPDATE quotations SET status = $1, updated_at = NOW() WHERE id::text = $2 OR quote_number = $2', [status, cleanId]);
    db.release();
    return res.json({ message: `Fulfillment status updated to ${status}`, status });
  } catch (err) {
    return res.status(404).json({ message: 'Fulfillment record not found' });
  }
});

// POST /api/fulfillment/:id/split
router.post('/:id/split', authenticateJWT, async (req, res) => {
  const cleanId = req.params.id.replace('ful_', '');
  try {
    const db = await getConnection();
    const qRow = await db.queryOne('SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1', [cleanId]);
    if (!qRow) {
      db.release();
      return res.status(404).json({ message: 'Quotation not found' });
    }
    const lines = await db.queryAll('SELECT ql.*, p.name as product_name FROM quotation_lines ql LEFT JOIN products p ON p.id = ql.product_id WHERE ql.quotation_id = $1', [qRow.id]);
    const warehousesWithStock = await getWarehousesWithStock(db);
    db.release();

    const lineItems = (lines || []).map((l) => ({
      lineId: l.id,
      productId: l.product_id,
      productName: l.product_name,
      quantity: Number(l.quantity || 1),
    }));

    const result = calculateFulfillmentSplits(lineItems, warehousesWithStock, req.body.overrideSplits);
    return res.json(result);
  } catch (err) {
    return res.status(404).json({ message: 'Quotation not found' });
  }
});

// PUT /api/fulfillment/:id/splits/:splitId
router.put('/:id/splits/:splitId', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  res.json({ message: 'Fulfillment split override updated.', splitId: req.params.splitId, override: req.body });
});

module.exports = router;
