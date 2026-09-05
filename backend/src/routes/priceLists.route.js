const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const PRICE_LISTS = [
  { id: 'pl_101', name: 'Standard Global Price List', tier_id: '201', currency_code: 'USD', is_active: true, items: [] },
  { id: 'pl_102', name: 'Enterprise Gold Partner List', tier_id: '203', currency_code: 'USD', is_active: true, items: [] },
];

router.get('/price-lists', authenticateJWT, (req, res) => {
  res.json(PRICE_LISTS);
});

router.get('/price-lists/:id', authenticateJWT, (req, res) => {
  const list = PRICE_LISTS.find((p) => p.id === req.params.id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  res.json(list);
});

router.post('/price-lists', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const newList = {
    id: `pl_${Date.now()}`,
    name: req.body.name || 'New Price List',
    tier_id: req.body.tier_id || '201',
    currency_code: req.body.currency_code || 'USD',
    is_active: true,
    items: [],
  };
  PRICE_LISTS.push(newList);
  res.status(201).json(newList);
});

router.put('/price-lists/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const list = PRICE_LISTS.find((p) => p.id === req.params.id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  Object.assign(list, req.body);
  res.json(list);
});

router.delete('/price-lists/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = PRICE_LISTS.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Price list not found' });
  const deleted = PRICE_LISTS.splice(idx, 1)[0];
  res.json({ message: 'Price list deleted', priceList: deleted });
});

// Price List Items
router.get('/price-lists/:id/items', authenticateJWT, (req, res) => {
  const list = PRICE_LISTS.find((p) => p.id === req.params.id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  res.json(list.items || []);
});

router.post('/price-lists/:id/items', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const list = PRICE_LISTS.find((p) => p.id === req.params.id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  const newItem = {
    id: `item_${Date.now()}`,
    product_id: req.body.product_id,
    price: Number(req.body.price || 0),
  };
  list.items.push(newItem);
  res.status(201).json(newItem);
});

router.put('/price-lists/:id/items/:itemId', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const list = PRICE_LISTS.find((p) => p.id === req.params.id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  const item = list.items.find((i) => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Price list item not found' });
  Object.assign(item, req.body);
  res.json(item);
});

router.delete('/price-lists/:id/items/:itemId', authenticateJWT, authorizeRoles('admin', 'finance_ops'), (req, res) => {
  const list = PRICE_LISTS.find((p) => p.id === req.params.id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  const idx = list.items.findIndex((i) => i.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ message: 'Price list item not found' });
  const deleted = list.items.splice(idx, 1)[0];
  res.json({ message: 'Item deleted', item: deleted });
});

module.exports = router;
