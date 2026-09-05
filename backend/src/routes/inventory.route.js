const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/inventory/reorder-alerts (placed before parametric routes)
router.get('/reorder-alerts', authenticateJWT, (req, res) => {
  const alerts = seed.WAREHOUSE_STOCK.filter((s) => s.quantity_on_hand <= s.reorder_threshold).map((s) => {
    const prod = seed.PRODUCTS.find((p) => p.id === s.product_id);
    const wh = seed.WAREHOUSES.find((w) => w.id === s.warehouse_id);
    return {
      stock_id: s.id,
      product_name: prod ? prod.name : s.product_id,
      warehouse_name: wh ? wh.name : s.warehouse_id,
      quantity_on_hand: s.quantity_on_hand,
      reorder_threshold: s.reorder_threshold,
      alert_status: 'critical_low_stock',
    };
  });
  res.json(alerts);
});

// GET /api/inventory
router.get('/', authenticateJWT, (req, res) => {
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
router.post('/stock', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const { warehouse_id, product_id, quantity_on_hand, reorder_threshold } = req.body;
  const newStock = {
    id: `80${seed.WAREHOUSE_STOCK.length + 1}`,
    warehouse_id,
    product_id,
    quantity_on_hand: Number(quantity_on_hand || 0),
    reorder_threshold: Number(reorder_threshold || 2),
  };
  seed.WAREHOUSE_STOCK.push(newStock);
  res.status(201).json(newStock);
});

// PUT /api/inventory/stock/:id
router.put('/stock/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const stock = seed.WAREHOUSE_STOCK.find((s) => s.id === req.params.id);
  if (!stock) return res.status(404).json({ message: 'Stock record not found' });
  Object.assign(stock, req.body);
  res.json(stock);
});

// PATCH /api/inventory/stock/:id
router.patch('/stock/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const stock = seed.WAREHOUSE_STOCK.find((s) => s.id === req.params.id);
  if (!stock) return res.status(404).json({ message: 'Stock record not found' });
  if (req.body.quantity_on_hand !== undefined) stock.quantity_on_hand = Number(req.body.quantity_on_hand);
  if (req.body.reorder_threshold !== undefined) stock.reorder_threshold = Number(req.body.reorder_threshold);
  res.json(stock);
});

module.exports = router;
