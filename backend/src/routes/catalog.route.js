const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// --- 5. PRODUCT CATEGORIES ---
router.get('/categories', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const rows = await db.queryAll(`
        SELECT pc.*, parent.name as parent_name
        FROM product_categories pc
        LEFT JOIN product_categories parent ON parent.id = pc.parent_id
        ORDER BY pc.name ASC
      `);
      if (rows && rows.length > 0) {
        return res.json(rows);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /categories] DB query failed:', err.message);
  }
  return res.json(seed.PRODUCT_CATEGORIES);
});

router.get('/categories/:id', authenticateJWT, (req, res) => {
  const cat = seed.PRODUCT_CATEGORIES.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  res.json(cat);
});

router.post('/categories', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { name, category_type, discount_ceiling_pct, parent_id } = req.body;
  console.log('[API POST /catalog/categories] Creating new sub-category:', name, req.body);

  const catType = (category_type || 'hardware').toString().toLowerCase();
  const validCatType = ['hardware', 'service', 'subscription'].includes(catType) ? catType : 'hardware';

  try {
    const db = await getConnection();
    try {
      let targetParentId = isUUID(parent_id) ? parent_id : null;
      if (!targetParentId) {
        const mainCat = await db.queryOne(
          `SELECT id FROM product_categories WHERE parent_id IS NULL AND (LOWER(name) LIKE $1 OR category_type = $2) LIMIT 1`,
          ['%' + validCatType + '%', validCatType]
        );
        if (mainCat) targetParentId = mainCat.id;
      }

      const inserted = await db.queryOne(`
        INSERT INTO product_categories (name, category_type, discount_ceiling_pct, parent_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [name, validCatType, Number(discount_ceiling_pct || 15), targetParentId]);
      if (inserted) {
        if (targetParentId) {
          const parentRow = await db.queryOne(`SELECT name FROM product_categories WHERE id = $1`, [targetParentId]);
          if (parentRow) inserted.parent_name = parentRow.name;
        }
        console.log('[API POST /catalog/categories] DB INSERT SUCCESS:', inserted);
        seed.PRODUCT_CATEGORIES.push(inserted);
        return res.status(201).json(inserted);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API POST /catalog/categories] DB insert failed:', err.message);
  }

  const newCat = {
    id: `40${seed.PRODUCT_CATEGORIES.length + 1}`,
    name,
    category_type: validCatType,
    discount_ceiling_pct: Number(discount_ceiling_pct || 15),
    parent_id: parent_id || null,
  };
  seed.PRODUCT_CATEGORIES.push(newCat);
  return res.status(201).json(newCat);
});

router.put('/categories/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, category_type, discount_ceiling_pct, parent_id } = req.body;
  const validParentId = isUUID(parent_id) ? parent_id : null;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        let newCatType = category_type;
        if (validParentId) {
          const parentRow = await db.queryOne(`SELECT category_type FROM product_categories WHERE id = $1`, [validParentId]);
          if (parentRow) newCatType = parentRow.category_type;
        }
        const updated = await db.queryOne(`
          UPDATE product_categories
          SET name = COALESCE($1, name),
              discount_ceiling_pct = COALESCE($2, discount_ceiling_pct),
              parent_id = CASE WHEN $3::uuid IS NOT NULL THEN $3::uuid ELSE parent_id END,
              category_type = COALESCE($4, category_type)
          WHERE id = $5
          RETURNING *
        `, [name, discount_ceiling_pct, validParentId, newCatType, id]);
        if (updated) return res.json(updated);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API PUT /catalog/categories] DB update error:', err.message);
  }

  const cat = seed.PRODUCT_CATEGORIES.find((c) => c.id === id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  Object.assign(cat, req.body);
  return res.json(cat);
});

router.delete('/categories/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const deleted = await db.queryOne(`DELETE FROM product_categories WHERE id = $1 RETURNING *`, [id]);
        if (deleted) return res.json({ message: 'Category deleted', category: deleted });
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API DELETE /catalog/categories] DB error:', err.message);
  }

  const idx = seed.PRODUCT_CATEGORIES.findIndex((c) => c.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Category not found' });
  const deleted = seed.PRODUCT_CATEGORIES.splice(idx, 1)[0];
  return res.json({ message: 'Category deleted', category: deleted });
});

// --- 6. PRODUCTS & VARIANTS ---
router.get('/products', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    try {
      const rows = await db.queryAll(`
        SELECT p.*, pc.name as category_name, pc.category_type,
               COALESCE(SUM(ws.quantity_on_hand), 25)::int AS stock_quantity
        FROM products p
        LEFT JOIN product_categories pc ON pc.id = p.category_id
        LEFT JOIN warehouse_stock ws ON ws.product_id = p.id
        GROUP BY p.id, pc.name, pc.category_type
        ORDER BY p.name ASC
      `);
      if (rows && rows.length > 0) {
        const allVariants = await db.queryAll(`SELECT id, product_id, attribute_name, value, extra_price FROM product_variant_attributes`);
        const rowsWithVariants = rows.map((p) => {
          const prodVars = allVariants
            ? allVariants
                .filter((v) => String(v.product_id) === String(p.id))
                .map((v) => ({
                  id: v.id,
                  attribute_name: v.attribute_name,
                  value: v.value,
                  extra_price: Number(v.extra_price || 0),
                }))
            : [];
          return { ...p, stock_quantity: Number(p.stock_quantity || 25), variants: prodVars };
        });
        return res.json(rowsWithVariants);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /products] DB query failed:', err.message);
  }
  return res.json(seed.PRODUCTS);
});

router.get('/products/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const product = await db.queryOne(`
          SELECT p.*, pc.name as category_name, pc.category_type
          FROM products p
          LEFT JOIN product_categories pc ON pc.id = p.category_id
          WHERE p.id = $1
        `, [id]);
        if (product) {
          const variants = await db.queryAll(
            `SELECT id, attribute_name, value, extra_price FROM product_variant_attributes WHERE product_id = $1`,
            [id]
          );
          product.variants = variants
            ? variants.map((v) => ({ id: v.id, attribute_name: v.attribute_name, value: v.value, extra_price: Number(v.extra_price || 0) }))
            : [];
          return res.json(product);
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /products/:id] DB query error:', err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id || p.sku === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  return res.json(product);
});

router.post('/products', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { sku, name, description, category_id, unit, base_price, cost_price, tax_rate_pct, is_promoted, promo_discount_pct, status, variants } = req.body;
  console.log('[API POST /catalog/products] Creating new product:', name);

  let createdProduct = null;
  try {
    const db = await getConnection();
    try {
      let targetCatId = isUUID(category_id) ? category_id : null;
      if (!targetCatId) {
        const catRow = await db.queryOne(`SELECT id FROM product_categories LIMIT 1`);
        if (catRow) targetCatId = catRow.id;
      }

      const generatedSku = sku && sku.trim() ? sku.trim() : `SKU-${Date.now().toString().slice(-6)}`;
      const isActive = status !== undefined ? status === 'active' : true;

      const insertQuery = `
        INSERT INTO products (sku, name, description, category_id, unit, base_price, cost_price, tax_rate_pct, is_active, is_promoted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      createdProduct = await db.queryOne(insertQuery, [
        generatedSku,
        name,
        description || '',
        targetCatId,
        unit || 'unit',
        Number(base_price || 0),
        Number(cost_price || 0),
        Number(tax_rate_pct || 18),
        isActive,
        Boolean(is_promoted),
      ]);

      if (createdProduct) {
        console.log('[API POST /catalog/products] DB INSERT SUCCESS:', createdProduct.id);

        if (Array.isArray(variants) && variants.length > 0) {
          for (const v of variants) {
            if (v.attribute_name && v.value) {
              await db.queryOne(
                `INSERT INTO product_variant_attributes (product_id, attribute_name, value, extra_price)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (product_id, attribute_name, value) DO UPDATE SET extra_price = EXCLUDED.extra_price`,
                [createdProduct.id, v.attribute_name.trim(), v.value.trim(), Number(v.extra_price || 0)]
              );
            }
          }
        }

        const fullProduct = await db.queryOne(`
          SELECT p.*, pc.name as category_name, pc.category_type
          FROM products p
          LEFT JOIN product_categories pc ON pc.id = p.category_id
          WHERE p.id = $1
        `, [createdProduct.id]);

        if (fullProduct) {
          const savedVars = await db.queryAll(
            `SELECT id, attribute_name, value, extra_price FROM product_variant_attributes WHERE product_id = $1`,
            [createdProduct.id]
          );
          fullProduct.promo_discount_pct = Number(promo_discount_pct || 10);
          fullProduct.status = status || (isActive ? 'active' : 'draft');
          fullProduct.variants = savedVars ? savedVars.map(v => ({ ...v, extra_price: Number(v.extra_price || 0) })) : [];
          seed.PRODUCTS.push(fullProduct);
          return res.status(201).json(fullProduct);
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API POST /catalog/products] DB insert failed:', err.message);
  }

  const cat = seed.PRODUCT_CATEGORIES.find((c) => c.id === category_id) || seed.PRODUCT_CATEGORIES[0];
  const newProd = {
    id: `50${seed.PRODUCTS.length + 1}`,
    sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
    name,
    description: description || '',
    category_id: cat ? cat.id : '401',
    category_name: cat ? cat.name : 'Hardware',
    unit: unit || 'unit',
    base_price: Number(base_price || 0),
    cost_price: Number(cost_price || 0),
    tax_rate_pct: Number(tax_rate_pct || 18),
    is_active: status ? status === 'active' : true,
    status: status || 'active',
    is_promoted: Boolean(is_promoted),
    promo_discount_pct: Number(promo_discount_pct || 10),
    variants: Array.isArray(variants) ? variants : [],
  };
  seed.PRODUCTS.push(newProd);
  return res.status(201).json(newProd);
});

router.put('/products/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { sku, name, description, category_id, unit, base_price, cost_price, tax_rate_pct, is_promoted, promo_discount_pct, status, is_active, variants } = req.body;
  console.log(`[API PUT /catalog/products/${id}] Updating product...`);

  let updatedProduct = null;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const updateQuery = `
          UPDATE products
          SET sku = COALESCE($1, sku),
              name = COALESCE($2, name),
              description = COALESCE($3, description),
              category_id = COALESCE($4, category_id),
              unit = COALESCE($5, unit),
              base_price = COALESCE($6, base_price),
              cost_price = COALESCE($7, cost_price),
              tax_rate_pct = COALESCE($8, tax_rate_pct),
              is_promoted = COALESCE($9, is_promoted),
              is_active = COALESCE($10, is_active),
              updated_at = NOW()
          WHERE id = $11
          RETURNING *
        `;
        const targetCatId = isUUID(category_id) ? category_id : null;
        const targetActive = is_active !== undefined ? is_active : (status ? status === 'active' : undefined);

        const result = await db.queryOne(updateQuery, [
          sku, name, description, targetCatId, unit, base_price, cost_price, tax_rate_pct, is_promoted, targetActive, id
        ]);

        if (result) {
          if (Array.isArray(variants)) {
            await db.queryOne(`DELETE FROM product_variant_attributes WHERE product_id = $1`, [id]);
            for (const v of variants) {
              if (v.attribute_name && v.value) {
                await db.queryOne(
                  `INSERT INTO product_variant_attributes (product_id, attribute_name, value, extra_price)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (product_id, attribute_name, value) DO UPDATE SET extra_price = EXCLUDED.extra_price`,
                  [id, v.attribute_name.trim(), v.value.trim(), Number(v.extra_price || 0)]
                );
              }
            }
          }

          updatedProduct = await db.queryOne(`
            SELECT p.*, pc.name as category_name, pc.category_type
            FROM products p
            LEFT JOIN product_categories pc ON pc.id = p.category_id
            WHERE p.id = $1
          `, [id]);

          if (updatedProduct) {
            const savedVars = await db.queryAll(
              `SELECT id, attribute_name, value, extra_price FROM product_variant_attributes WHERE product_id = $1`,
              [id]
            );
            updatedProduct.variants = savedVars ? savedVars.map(v => ({ ...v, extra_price: Number(v.extra_price || 0) })) : [];
          }
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API PUT /catalog/products/${id}] DB update error:`, err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id || p.sku === id);
  if (product) {
    Object.assign(product, req.body);
    if (!updatedProduct) updatedProduct = product;
  }

  return res.json(updatedProduct || { message: 'Product updated successfully' });
});

router.delete('/products/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  console.log(`[API DELETE /catalog/products/${id}] Deleting product...`);

  let deleted = null;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        deleted = await db.queryOne(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
        if (deleted) return res.json({ message: 'Product deleted', product: deleted });
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API DELETE /catalog/products/${id}] DB error:`, err.message);
  }

  const idx = seed.PRODUCTS.findIndex((p) => p.id === id || p.sku === id);
  if (idx !== -1) {
    deleted = seed.PRODUCTS.splice(idx, 1)[0];
  }
  return res.json({ message: 'Product deleted', product: deleted });
});

router.patch('/products/:id/status', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { is_active, status } = req.body;
  const targetActive = is_active !== undefined ? is_active : (status === 'active');

  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const updated = await db.queryOne(`UPDATE products SET is_active = $1 WHERE id = $2 RETURNING *`, [targetActive, id]);
        if (updated) return res.json({ message: 'Product status updated', product: updated });
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API PATCH /products/status] DB error:', err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id);
  if (product) {
    product.is_active = targetActive;
    if (status) product.status = status;
  }
  return res.json({ message: 'Product status updated', product });
});

router.patch('/products/:id/promotion', authenticateJWT, authorizeRoles('admin', 'sales_manager'), async (req, res) => {
  const { id } = req.params;
  const { is_promoted } = req.body;

  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const updated = await db.queryOne(`UPDATE products SET is_promoted = $1 WHERE id = $2 RETURNING *`, [is_promoted, id]);
        if (updated) return res.json({ message: 'Product promotion status updated', product: updated });
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API PATCH /products/promotion] DB error:', err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id);
  if (product) {
    product.is_promoted = is_promoted;
  }
  return res.json({ message: 'Product promotion updated', product });
});

module.exports = router;

// Product Variants (DB connected)
router.get('/products/:id/variants', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const rows = await db.queryAll(`SELECT * FROM product_variant_attributes WHERE product_id = $1`, [id]);
        return res.json(rows ? rows.map(r => ({ ...r, extra_price: Number(r.extra_price || 0) })) : []);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /products/:id/variants] DB error:', err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product.variants || []);
});

router.post('/products/:id/variants', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { attribute_name, value, extra_price } = req.body;

  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const inserted = await db.queryOne(`
          INSERT INTO product_variant_attributes (product_id, attribute_name, value, extra_price)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [id, attribute_name, value, Number(extra_price || 0)]);
        if (inserted) return res.status(201).json(inserted);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API POST /products/:id/variants] DB error:', err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!product.variants) product.variants = [];

  const newVariant = {
    id: `var_${Date.now()}`,
    attribute_name: attribute_name || 'RAM',
    value: value || '64GB',
    extra_price: Number(extra_price || 0),
  };
  product.variants.push(newVariant);
  res.status(201).json(newVariant);
});

router.put('/products/:id/variants/:variantId', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id, variantId } = req.params;
  const { attribute_name, value, extra_price } = req.body;

  try {
    const db = await getConnection();
    try {
      if (isUUID(variantId)) {
        const updated = await db.queryOne(`
          UPDATE product_variant_attributes
          SET attribute_name = COALESCE($1, attribute_name),
              value = COALESCE($2, value),
              extra_price = COALESCE($3, extra_price)
          WHERE id = $4
          RETURNING *
        `, [attribute_name, value, extra_price !== undefined ? Number(extra_price) : null, variantId]);
        if (updated) return res.json(updated);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API PUT /products/:id/variants/:variantId] DB error:', err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id);
  if (!product || !product.variants) return res.status(404).json({ message: 'Product or variant not found' });
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return res.status(404).json({ message: 'Variant not found' });

  Object.assign(variant, req.body);
  res.json(variant);
});

router.delete('/products/:id/variants/:variantId', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id, variantId } = req.params;

  try {
    const db = await getConnection();
    try {
      if (isUUID(variantId)) {
        await db.queryOne(`DELETE FROM product_variant_attributes WHERE id = $1`, [variantId]);
        return res.json({ message: 'Variant deleted', id: variantId });
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API DELETE /products/:id/variants/:variantId] DB error:', err.message);
  }

  const product = seed.PRODUCTS.find((p) => p.id === id);
  if (!product || !product.variants) return res.status(404).json({ message: 'Product or variant not found' });
  const idx = product.variants.findIndex((v) => v.id === variantId);
  if (idx === -1) return res.status(404).json({ message: 'Variant not found' });

  const deleted = product.variants.splice(idx, 1)[0];
  res.json({ message: 'Variant deleted', variant: deleted });
});

module.exports = router;
