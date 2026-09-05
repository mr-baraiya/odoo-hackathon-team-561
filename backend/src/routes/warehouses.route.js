const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/warehouses
router.get('/', authenticateJWT, (req, res) => {
  res.json(seed.WAREHOUSES);
});

// GET /api/warehouses/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const warehouse = seed.WAREHOUSES.find((w) => w.id === req.params.id);
  if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
  res.json(warehouse);
});

// POST /api/warehouses
router.post('/', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const { name, location, shipping_cost_weight } = req.body;
  const newWh = {
    id: `70${seed.WAREHOUSES.length + 1}`,
    name,
    location: location || '',
    shipping_cost_weight: Number(shipping_cost_weight || 1.0),
    is_active: true,
  };
  seed.WAREHOUSES.push(newWh);
  res.status(201).json(newWh);
});

// PUT /api/warehouses/:id
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const warehouse = seed.WAREHOUSES.find((w) => w.id === req.params.id);
  if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
  Object.assign(warehouse, req.body);
  res.json(warehouse);
});

// DELETE /api/warehouses/:id
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.WAREHOUSES.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Warehouse not found' });
  const deleted = seed.WAREHOUSES.splice(idx, 1)[0];
  res.json({ message: 'Warehouse deleted', warehouse: deleted });
});

module.exports = router;
