const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// --- 5. PRODUCT CATEGORIES ---
router.get('/categories', authenticateJWT, (req, res) => {
  res.json(seed.PRODUCT_CATEGORIES);
});

router.get('/categories/:id', authenticateJWT, (req, res) => {
  const cat = seed.PRODUCT_CATEGORIES.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
});

router.post('/categories', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const { name, category_type, discount_ceiling_pct } = req.body;
  const newCat = {
    id: `40${seed.PRODUCT_CATEGORIES.length + 1}`,
    name,
    category_type: category_type || 'hardware',
    discount_ceiling_pct: Number(discount_ceiling_pct || 10),
  };
  seed.PRODUCT_CATEGORIES.push(newCat);
  res.status(201).json(newCat);
});

router.put('/categories/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const cat = seed.PRODUCT_CATEGORIES.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  Object.assign(cat, req.body);
  res.json(cat);
});

router.delete('/categories/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.PRODUCT_CATEGORIES.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Category not found' });
  const deleted = seed.PRODUCT_CATEGORIES.splice(idx, 1)[0];
  res.json({ message: 'Category deleted', category: deleted });
});

// --- 6. PRODUCTS & VARIANTS ---
router.get('/products', authenticateJWT, (req, res) => {
  res.json(seed.PRODUCTS);
});

router.get('/products/:id', authenticateJWT, (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id || p.sku === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

router.post('/products', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const { sku, name, description, category_id, unit, base_price, cost_price, tax_rate_pct, is_promoted } = req.body;
  const cat = seed.PRODUCT_CATEGORIES.find((c) => c.id === category_id) || seed.PRODUCT_CATEGORIES[0];
  const newProd = {
    id: `50${seed.PRODUCTS.length + 1}`,
    sku: sku || `SKU-${Date.now()}`,
    name,
    description: description || '',
    category_id: cat.id,
    category_name: cat.name,
    category_type: cat.category_type,
    unit: unit || 'unit',
    base_price: Number(base_price || 0),
    cost_price: Number(cost_price || 0),
    tax_rate_pct: Number(tax_rate_pct || 18),
    is_active: true,
    is_promoted: Boolean(is_promoted),
    variants: [],
  };
  seed.PRODUCTS.push(newProd);
  res.status(201).json(newProd);
});

router.put('/products/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id || p.sku === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  Object.assign(product, req.body);
  res.json(product);
});

router.delete('/products/:id', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const idx = seed.PRODUCTS.findIndex((p) => p.id === req.params.id || p.sku === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  const deleted = seed.PRODUCTS.splice(idx, 1)[0];
  res.json({ message: 'Product deleted', product: deleted });
});

router.patch('/products/:id/status', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.is_active = req.body.is_active !== undefined ? req.body.is_active : !product.is_active;
  res.json({ message: `Product status set to ${product.is_active ? 'active' : 'inactive'}`, product });
});

router.patch('/products/:id/promotion', authenticateJWT, authorizeRoles('admin', 'sales_manager'), (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.is_promoted = req.body.is_promoted !== undefined ? req.body.is_promoted : !product.is_promoted;
  res.json({ message: `Product promotion set to ${product.is_promoted}`, product });
});

// Product Variants
router.get('/products/:id/variants', authenticateJWT, (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product.variants || []);
});

router.post('/products/:id/variants', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.variants) product.variants = [];

  const newVariant = {
    id: `var_${Date.now()}`,
    attribute_name: req.body.attribute_name || 'RAM',
    value: req.body.value || '64GB',
    extra_price: Number(req.body.extra_price || 0),
  };
  product.variants.push(newVariant);
  res.status(201).json(newVariant);
});

router.put('/products/:id/variants/:variantId', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id);
  if (!product || !product.variants) return res.status(404).json({ message: 'Product or variant not found' });
  const variant = product.variants.find((v) => v.id === req.params.variantId);
  if (!variant) return res.status(404).json({ message: 'Variant not found' });

  Object.assign(variant, req.body);
  res.json(variant);
});

router.delete('/products/:id/variants/:variantId', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  const product = seed.PRODUCTS.find((p) => p.id === req.params.id);
  if (!product || !product.variants) return res.status(404).json({ message: 'Product or variant not found' });
  const idx = product.variants.findIndex((v) => v.id === req.params.variantId);
  if (idx === -1) return res.status(404).json({ message: 'Variant not found' });

  const deleted = product.variants.splice(idx, 1)[0];
  res.json({ message: 'Variant deleted', variant: deleted });
});

module.exports = router;
