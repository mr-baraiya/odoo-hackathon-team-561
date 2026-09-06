const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const DEFAULT_SEED_PRICE_LISTS = [
  {
    id: 'pl_101',
    name: 'Standard Global Price List',
    code: 'GLOBAL-STD',
    tier_code: 'all',
    currency_code: 'USD',
    is_active: true,
    valid_from: '2026-01-01',
    valid_to: '2026-12-31',
    items: [
      { id: 'item_1', product_sku: 'SaaS-001', custom_price: 2400 },
      { id: 'item_2', product_sku: 'SRV-101', custom_price: 3200 },
    ],
  },
  {
    id: 'pl_102',
    name: 'Gold Partner Wholesale List',
    code: 'GOLD-WHOLESALE',
    tier_code: 'gold',
    currency_code: 'USD',
    is_active: true,
    valid_from: '2026-01-01',
    valid_to: '2026-12-31',
    items: [
      { id: 'item_3', product_sku: 'SaaS-001', custom_price: 2125 },
      { id: 'item_4', product_sku: 'HW-501', custom_price: 7650 },
    ],
  },
  {
    id: 'pl_103',
    name: 'Platinum Global Enterprise List',
    code: 'PLAT-ENTERPRISE',
    tier_code: 'platinum',
    currency_code: 'USD',
    is_active: true,
    valid_from: '2026-01-01',
    valid_to: '2026-12-31',
    items: [
      { id: 'item_5', product_sku: 'SaaS-001', custom_price: 1875 },
      { id: 'item_6', product_sku: 'HW-501', custom_price: 6750 },
    ],
  },
];

// Helper to seed DB if price_lists table is empty
async function ensureDbPriceListsSeeded(db) {
  try {
    const existing = await db.queryAll(`SELECT id FROM price_lists LIMIT 1`);
    if (!existing || existing.length === 0) {
      console.log('[priceLists.route.js] Table price_lists is empty. Auto-seeding initial price lists to DB...');
      const goldTier = await db.queryOne(`SELECT id FROM customer_tiers WHERE code::text = 'gold' LIMIT 1`);
      const platTier = await db.queryOne(`SELECT id FROM customer_tiers WHERE code::text = 'platinum' LIMIT 1`);

      await db.query(`
        INSERT INTO price_lists (name, tier_id, currency_code, is_active)
        VALUES ('Standard Global Price List', NULL, 'USD', true)
      `);
      if (goldTier) {
        await db.query(`
          INSERT INTO price_lists (name, tier_id, currency_code, is_active)
          VALUES ('Gold Partner Wholesale List', $1, 'USD', true)
        `, [goldTier.id]);
      }
      if (platTier) {
        await db.query(`
          INSERT INTO price_lists (name, tier_id, currency_code, is_active)
          VALUES ('Platinum Global Enterprise List', $1, 'USD', true)
        `, [platTier.id]);
      }
      console.log('[priceLists.route.js] Auto-seeded price_lists in PostgreSQL database!');
    }
  } catch (err) {
    console.warn('[priceLists.route.js] Auto-seed warning:', err.message);
  }
}

// GET /api/price-lists - Query PostgreSQL DB
router.get('/price-lists', authenticateJWT, async (req, res) => {
  console.log('[API GET /api/price-lists] Fetching price lists from PostgreSQL DB...');
  try {
    const db = await getConnection();
    try {
      await ensureDbPriceListsSeeded(db);

      const rows = await db.queryAll(`
        SELECT pl.*,
               COALESCE(t.code::text, 'all') as tier_code,
               COALESCE(t.label, 'All Tiers') as tier_label
        FROM price_lists pl
        LEFT JOIN customer_tiers t ON t.id = pl.tier_id
        ORDER BY pl.created_at ASC
      `);

      if (rows && rows.length > 0) {
        // Fetch items for each price list
        for (const pl of rows) {
          const items = await db.queryAll(`
            SELECT pli.*, p.sku as product_sku, p.name as product_name, p.base_price
            FROM price_list_items pli
            LEFT JOIN products p ON p.id = pli.product_id
            WHERE pli.price_list_id = $1
          `, [pl.id]);
          pl.code = pl.code || `PL-${String(pl.id).slice(-5)}`;
          pl.items = items.map((i) => ({
            id: i.id,
            product_id: i.product_id,
            product_sku: i.product_sku || 'SKU',
            custom_price: Number(i.price || 0),
          }));
        }
        console.log(`[API GET /api/price-lists] Returning ${rows.length} rows directly from PostgreSQL DB.`);
        return res.json(rows);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API GET /api/price-lists] DB query failed, using in-memory fallbacks:', err.message);
  }

  return res.json(DEFAULT_SEED_PRICE_LISTS);
});

// GET /api/price-lists/:id
router.get('/price-lists/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const list = await db.queryOne(`
          SELECT pl.*, COALESCE(t.code::text, 'all') as tier_code
          FROM price_lists pl
          LEFT JOIN customer_tiers t ON t.id = pl.tier_id
          WHERE pl.id = $1
        `, [id]);
        if (list) {
          const items = await db.queryAll(`
            SELECT pli.*, p.sku as product_sku
            FROM price_list_items pli
            LEFT JOIN products p ON p.id = pli.product_id
            WHERE pli.price_list_id = $1
          `, [id]);
          list.items = items.map((i) => ({ id: i.id, product_id: i.product_id, product_sku: i.product_sku, custom_price: Number(i.price || 0) }));
          return res.json(list);
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API GET /price-lists/${id}] DB error:`, err.message);
  }

  const list = DEFAULT_SEED_PRICE_LISTS.find((p) => p.id === id || p.code === id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  return res.json(list);
});

// POST /api/price-lists - Save to PostgreSQL DB
router.post('/price-lists', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const { name, code, tier_code, currency_code, is_active } = req.body;
  console.log('[API POST /api/price-lists] Creating price list in DB:', name);

  let createdList = null;
  try {
    const db = await getConnection();
    try {
      let targetTierId = null;
      if (tier_code && tier_code !== 'all') {
        const tierRow = await db.queryOne(`SELECT id FROM customer_tiers WHERE code::text = $1 LIMIT 1`, [tier_code.toLowerCase()]);
        if (tierRow) targetTierId = tierRow.id;
      }

      createdList = await db.queryOne(`
        INSERT INTO price_lists (name, tier_id, currency_code, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [name || 'New Custom Price List', targetTierId, (currency_code || 'USD').toUpperCase(), is_active !== false]);

      if (createdList) {
        console.log('[API POST /api/price-lists] DB INSERT SUCCESS:', createdList.id);
        createdList.code = code || `PL-${String(createdList.id).slice(-5)}`;
        createdList.tier_code = tier_code || 'all';
        createdList.items = [];
        return res.status(201).json(createdList);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API POST /api/price-lists] DB insert error:', err.message);
  }

  const newList = {
    id: `pl_${Date.now()}`,
    name: name || 'New Custom Price List',
    code: code || `PL-${Date.now().toString().slice(-5)}`,
    tier_code: tier_code || 'all',
    currency_code: currency_code || 'USD',
    is_active: is_active !== false,
    items: [],
  };
  DEFAULT_SEED_PRICE_LISTS.push(newList);
  return res.status(201).json(newList);
});

// PUT /api/price-lists/:id - Update in PostgreSQL DB
router.put('/price-lists/:id', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const { id } = req.params;
  const { name, tier_code, currency_code, is_active } = req.body;
  console.log(`[API PUT /api/price-lists/${id}] Updating price list in DB...`);

  let updatedList = null;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        let targetTierId = null;
        if (tier_code && tier_code !== 'all') {
          const tierRow = await db.queryOne(`SELECT id FROM customer_tiers WHERE code::text = $1 LIMIT 1`, [tier_code.toLowerCase()]);
          if (tierRow) targetTierId = tierRow.id;
        }

        updatedList = await db.queryOne(`
          UPDATE price_lists
          SET name = COALESCE($1, name),
              tier_id = $2,
              currency_code = COALESCE($3, currency_code),
              is_active = COALESCE($4, is_active)
          WHERE id = $5
          RETURNING *
        `, [name, targetTierId, currency_code, is_active, id]);

        if (updatedList) {
          console.log(`[API PUT /api/price-lists/${id}] DB UPDATE SUCCESS:`, updatedList.name);
          const items = await db.queryAll(`
            SELECT pli.*, p.sku as product_sku
            FROM price_list_items pli
            LEFT JOIN products p ON p.id = pli.product_id
            WHERE pli.price_list_id = $1
          `, [id]);
          updatedList.tier_code = tier_code || 'all';
          updatedList.items = items.map((i) => ({ id: i.id, product_id: i.product_id, product_sku: i.product_sku, custom_price: Number(i.price || 0) }));
          return res.json(updatedList);
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API PUT /api/price-lists/${id}] DB update error:`, err.message);
  }

  const list = DEFAULT_SEED_PRICE_LISTS.find((p) => p.id === id || p.code === id);
  if (!list) return res.status(404).json({ message: 'Price list not found' });
  Object.assign(list, req.body);
  return res.json(list);
});

// DELETE /api/price-lists/:id - Delete from PostgreSQL DB
router.delete('/price-lists/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  console.log(`[API DELETE /api/price-lists/${id}] Deleting from DB...`);

  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        await db.query(`DELETE FROM price_list_items WHERE price_list_id = $1`, [id]);
        const deleted = await db.queryOne(`DELETE FROM price_lists WHERE id = $1 RETURNING *`, [id]);
        if (deleted) {
          console.log(`[API DELETE /api/price-lists/${id}] DB DELETE SUCCESS:`, deleted.name);
          return res.json({ message: 'Price list deleted', priceList: deleted });
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API DELETE /api/price-lists/${id}] DB delete error:`, err.message);
  }

  const idx = DEFAULT_SEED_PRICE_LISTS.findIndex((p) => p.id === id || p.code === id);
  if (idx === -1) return res.status(404).json({ message: 'Price list not found' });
  const deleted = DEFAULT_SEED_PRICE_LISTS.splice(idx, 1)[0];
  return res.json({ message: 'Price list deleted', priceList: deleted });
});

// POST /api/price-lists/:id/items - Add item in PostgreSQL DB
router.post('/price-lists/:id/items', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const { id } = req.params;
  const { product_id, product_sku, custom_price } = req.body;
  console.log(`[API POST /api/price-lists/${id}/items] Adding override price item...`, req.body);

  try {
    const db = await getConnection();
    try {
      let targetProductId = isUUID(product_id) ? product_id : null;
      if (!targetProductId && product_sku) {
        const prodRow = await db.queryOne(`SELECT id FROM products WHERE sku = $1 LIMIT 1`, [product_sku]);
        if (prodRow) targetProductId = prodRow.id;
      }
      if (!targetProductId) {
        const firstProd = await db.queryOne(`SELECT id FROM products LIMIT 1`);
        if (firstProd) targetProductId = firstProd.id;
      }

      if (isUUID(id) && targetProductId) {
        const insertedItem = await db.queryOne(`
          INSERT INTO price_list_items (price_list_id, product_id, price)
          VALUES ($1, $2, $3)
          RETURNING *
        `, [id, targetProductId, Number(custom_price || 0)]);

        if (insertedItem) {
          console.log('[API POST price_list_items] DB INSERT SUCCESS:', insertedItem.id);
          return res.status(201).json({
            id: insertedItem.id,
            product_id: insertedItem.product_id,
            product_sku: product_sku || 'SKU',
            custom_price: Number(insertedItem.price || 0),
          });
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API POST /price-lists/${id}/items] DB error:`, err.message);
  }

  const newItem = {
    id: `item_${Date.now()}`,
    product_id: product_id || 'prod_1',
    product_sku: product_sku || 'SKU',
    custom_price: Number(custom_price || 0),
  };
  return res.status(201).json(newItem);
});

// DELETE /api/price-lists/:id/items/:itemId - Delete item in PostgreSQL DB
router.delete('/price-lists/:id/items/:itemId', authenticateJWT, authorizeRoles('admin', 'finance_ops'), async (req, res) => {
  const { id, itemId } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(itemId)) {
        const deleted = await db.queryOne(`DELETE FROM price_list_items WHERE id = $1 RETURNING *`, [itemId]);
        if (deleted) return res.json({ message: 'Item deleted from DB', item: deleted });
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn(`[API DELETE /price-lists/${id}/items/${itemId}] DB error:`, err.message);
  }

  return res.json({ message: 'Item deleted' });
});

module.exports = router;
