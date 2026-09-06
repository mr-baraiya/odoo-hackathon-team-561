const express = require('express');
const seed = require('../db/dealflow360_seed');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// GET /api/customers - Query PostgreSQL DB
router.get('/', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  console.log('----------------------------------------------------');
  console.log('[API GET /api/customers] Request received from user:', req.user?.email || 'authenticated');
  console.log('[API GET /api/customers] Attempting to connect to PostgreSQL database...');
  try {
    const db = await getConnection();
    try {
      const rows = await db.queryAll(`
        SELECT c.*,
               t.code::text as tier_code,
               t.label as tier_label,
               t.default_discount_ceiling_pct,
               u.full_name as sales_rep_name,
               u.email as sales_rep_email
        FROM customers c
        LEFT JOIN customer_tiers t ON t.id = c.tier_id
        LEFT JOIN users u ON u.id = c.sales_rep_id
        ORDER BY c.created_at DESC, c.company_name ASC
      `);
      console.log(`[API GET /api/customers] Successfully loaded ${rows ? rows.length : 0} customer rows from PostgreSQL database.`);
      if (rows && rows.length > 0) {
        return res.json(rows);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API GET /api/customers] ERROR querying PostgreSQL DB:', err.message);
  }
  console.log(`[API GET /api/customers] Falling back to seed CUSTOMERS data (${seed.CUSTOMERS.length} records).`);
  return res.json(seed.CUSTOMERS);
});

// GET /api/customers/:id/quotations
router.get('/:id/quotations', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep', 'customer'), async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const quotes = await db.queryAll(`
          SELECT q.*, c.company_name
          FROM quotations q
          LEFT JOIN customers c ON c.id = q.customer_id
          WHERE q.customer_id = $1
          ORDER BY q.created_at DESC
        `, [id]);
        if (quotes && quotes.length > 0) return res.json(quotes);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /customers/:id/quotations] DB error, using seed:', err.message);
  }
  const quotes = seed.QUOTATIONS.filter((q) => q.customer_id === id || q.customer_id === `30${id.slice(-1)}`);
  res.json(quotes);
});

// GET /api/customers/:id/orders
router.get('/:id/orders', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep', 'customer'), async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const orders = await db.queryAll(`
          SELECT q.*, c.company_name
          FROM quotations q
          LEFT JOIN customers c ON c.id = q.customer_id
          WHERE q.customer_id = $1 AND q.status::text IN ('confirmed', 'in_fulfillment', 'fulfilled')
          ORDER BY q.created_at DESC
        `, [id]);
        if (orders && orders.length > 0) return res.json(orders);
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /customers/:id/orders] DB error, using seed:', err.message);
  }
  const orders = seed.QUOTATIONS.filter((q) => (q.customer_id === id || q.customer_id === `30${id.slice(-1)}`) && ['confirmed', 'in_fulfillment', 'fulfilled'].includes(q.status));
  res.json(orders);
});

// GET /api/customers/:id/invoices
router.get('/:id/invoices', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep', 'customer'), async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const quotes = await db.queryAll(`
          SELECT q.*, c.company_name
          FROM quotations q
          LEFT JOIN customers c ON c.id = q.customer_id
          WHERE q.customer_id = $1
          ORDER BY q.created_at DESC
        `, [id]);
        if (quotes && quotes.length > 0) {
          const invoices = quotes.map((q) => ({
            invoice_id: `INV-${String(q.quote_number || q.id).replace('Q-', '')}`,
            quotation_id: q.id,
            quote_number: q.quote_number,
            amount_due: q.total_amount || 0,
            status: q.status === 'fulfilled' ? 'PAID' : 'PENDING',
            issued_at: q.created_at ? String(q.created_at).split('T')[0] : '2026-01-01',
          }));
          return res.json(invoices);
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.warn('[API GET /customers/:id/invoices] DB error, using seed:', err.message);
  }
  const invoices = seed.QUOTATIONS.filter((q) => q.customer_id === id || q.customer_id === `30${id.slice(-1)}`).map((q) => ({
    invoice_id: `INV-${q.id}`,
    quotation_id: q.id,
    quote_number: q.quote_number,
    amount_due: q.total_amount,
    status: q.status === 'fulfilled' ? 'PAID' : 'PENDING',
    issued_at: q.created_at || '2026-01-01',
  }));
  res.json(invoices);
});

// GET /api/customers/:id
router.get('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'finance_ops', 'sales_rep'), async (req, res) => {
  const { id } = req.params;
  console.log(`[API GET /api/customers/${id}] Fetching customer details...`);
  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const customer = await db.queryOne(`
          SELECT c.*,
                 t.code::text as tier_code,
                 t.label as tier_label,
                 t.default_discount_ceiling_pct,
                 u.full_name as sales_rep_name,
                 u.email as sales_rep_email
          FROM customers c
          LEFT JOIN customer_tiers t ON t.id = c.tier_id
          LEFT JOIN users u ON u.id = c.sales_rep_id
          WHERE c.id = $1
        `, [id]);
        if (customer) {
          console.log(`[API GET /api/customers/${id}] Found customer in PostgreSQL DB:`, customer.company_name);
          return res.json(customer);
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error(`[API GET /api/customers/${id}] DB query failed:`, err.message);
  }

  const customer = seed.CUSTOMERS.find((c) => c.id === id || c.id === `30${id.slice(-1)}` || id.includes(c.id));
  if (!customer) {
    console.warn(`[API GET /api/customers/${id}] Customer NOT found in DB or seed.`);
    return res.status(404).json({ message: 'Customer not found' });
  }
  return res.json(customer);
});

// POST /api/customers - Save to PostgreSQL DB
router.post('/', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), async (req, res) => {
  console.log('----------------------------------------------------');
  console.log('[API POST /api/customers] Creating new customer:', req.body.company_name);
  console.log('[API POST /api/customers] Payload:', JSON.stringify(req.body, null, 2));

  const { company_name, tier_id, tier_code, currency_code, billing_address, shipping_address, primary_contact_name, primary_contact_email, primary_contact_phone, sales_rep_id } = req.body;

  try {
    const db = await getConnection();
    try {
      let targetTierId = null;
      if (isUUID(tier_id)) {
        targetTierId = tier_id;
      } else {
        const searchCode = (tier_code || tier_id || 'gold').toString().toLowerCase();
        const tierRow = await db.queryOne(`SELECT id FROM customer_tiers WHERE code::text = $1 LIMIT 1`, [searchCode]);
        if (tierRow) {
          targetTierId = tierRow.id;
          console.log(`[API POST /api/customers] Matched tier_code "${searchCode}" to tier ID:`, targetTierId);
        } else {
          const defaultTier = await db.queryOne(`SELECT id FROM customer_tiers LIMIT 1`);
          if (defaultTier) targetTierId = defaultTier.id;
        }
      }

      let validSalesRepId = isUUID(sales_rep_id) ? sales_rep_id : (isUUID(req.user?.id) ? req.user.id : null);
      if (!validSalesRepId) {
        const repRow = await db.queryOne(`SELECT id FROM users WHERE role::text = 'sales_rep' OR role::text = 'admin' LIMIT 1`);
        if (repRow) validSalesRepId = repRow.id;
      }

      console.log('[API POST /api/customers] Executing INSERT INTO customers with targetTierId:', targetTierId, 'validSalesRepId:', validSalesRepId);

      const newCustomer = await db.queryOne(`
        INSERT INTO customers (company_name, tier_id, currency_code, billing_address, shipping_address, primary_contact_name, primary_contact_email, primary_contact_phone, sales_rep_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        company_name,
        targetTierId,
        currency_code || 'USD',
        billing_address || '',
        shipping_address || '',
        primary_contact_name || '',
        primary_contact_email || '',
        primary_contact_phone || '',
        validSalesRepId,
      ]);

      console.log('[API POST /api/customers] PostgreSQL INSERT SUCCESSFUL! New ID:', newCustomer.id);

      const fullCustomer = await db.queryOne(`
        SELECT c.*,
               t.code::text as tier_code,
               t.label as tier_label,
               t.default_discount_ceiling_pct,
               u.full_name as sales_rep_name,
               u.email as sales_rep_email
        FROM customers c
        LEFT JOIN customer_tiers t ON t.id = c.tier_id
        LEFT JOIN users u ON u.id = c.sales_rep_id
        WHERE c.id = $1
      `, [newCustomer.id]);

      console.log('[API POST /api/customers] Returning created customer to client:', fullCustomer ? fullCustomer.company_name : newCustomer.company_name);
      return res.status(201).json(fullCustomer || newCustomer);
    } finally {
      db.release();
    }
  } catch (err) {
    console.error('[API POST /api/customers] ERROR inserting into PostgreSQL DB:', err.stack || err.message);
  }

  console.warn('[API POST /api/customers] Using seed fallback due to DB error.');
  const newId = `30${seed.CUSTOMERS.length + 1}`;
  const tier = seed.CUSTOMER_TIERS.find((t) => t.id === tier_id || t.code === tier_code) || seed.CUSTOMER_TIERS[1];
  const newCustomer = {
    id: newId,
    company_name,
    tier_id: tier.id,
    tier_code: tier.code,
    currency_code: currency_code || 'USD',
    billing_address: billing_address || '',
    shipping_address: shipping_address || '',
    primary_contact_name: primary_contact_name || '',
    primary_contact_email: primary_contact_email || '',
    primary_contact_phone: primary_contact_phone || '',
    sales_rep_id: sales_rep_id || req.user?.id || '00000000-0000-0000-0000-000000000101',
  };
  seed.CUSTOMERS.unshift(newCustomer);
  return res.status(201).json(newCustomer);
});

// PUT /api/customers/:id - Update in PostgreSQL DB
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'sales_manager', 'sales_rep'), async (req, res) => {
  const { id } = req.params;
  console.log('----------------------------------------------------');
  console.log(`[API PUT /api/customers/${id}] Updating customer record...`);
  console.log(`[API PUT /api/customers/${id}] Payload:`, JSON.stringify(req.body, null, 2));

  const { company_name, tier_id, tier_code, currency_code, billing_address, shipping_address, primary_contact_name, primary_contact_email, primary_contact_phone, sales_rep_id } = req.body;

  try {
    const db = await getConnection();
    try {
      let targetTierId = null;
      if (isUUID(tier_id)) {
        targetTierId = tier_id;
      } else if (tier_code || tier_id) {
        const searchCode = (tier_code || tier_id).toString().toLowerCase();
        const tierRow = await db.queryOne(`SELECT id FROM customer_tiers WHERE code::text = $1 LIMIT 1`, [searchCode]);
        if (tierRow) targetTierId = tierRow.id;
      }

      const validSalesRepId = isUUID(sales_rep_id) ? sales_rep_id : null;

      if (isUUID(id)) {
        await db.query(`
          UPDATE customers
          SET company_name = COALESCE($1::text, company_name),
              tier_id = COALESCE($2::uuid, tier_id),
              currency_code = COALESCE($3::text, currency_code),
              billing_address = COALESCE($4::text, billing_address),
              shipping_address = COALESCE($5::text, shipping_address),
              primary_contact_name = COALESCE($6::text, primary_contact_name),
              primary_contact_email = COALESCE($7::text, primary_contact_email),
              primary_contact_phone = COALESCE($8::text, primary_contact_phone),
              sales_rep_id = COALESCE($9::uuid, sales_rep_id),
              updated_at = now()
          WHERE id = $10::uuid
        `, [
          company_name || null,
          targetTierId || null,
          currency_code || null,
          billing_address || null,
          shipping_address || null,
          primary_contact_name || null,
          primary_contact_email || null,
          primary_contact_phone || null,
          validSalesRepId || null,
          id,
        ]);

        const updated = await db.queryOne(`
          SELECT c.*,
                 t.code::text as tier_code,
                 t.label as tier_label,
                 t.default_discount_ceiling_pct,
                 u.full_name as sales_rep_name,
                 u.email as sales_rep_email
          FROM customers c
          LEFT JOIN customer_tiers t ON t.id = c.tier_id
          LEFT JOIN users u ON u.id = c.sales_rep_id
          WHERE c.id = $1
        `, [id]);

        if (updated) {
          console.log(`[API PUT /api/customers/${id}] UPDATE SUCCESSFUL in PostgreSQL DB:`, updated.company_name);
          return res.json(updated);
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error(`[API PUT /api/customers/${id}] ERROR updating in PostgreSQL DB:`, err.stack || err.message);
  }

  console.warn(`[API PUT /api/customers/${id}] DB update failed or non-UUID id, attempting seed array update...`);
  const customer = seed.CUSTOMERS.find((c) => c.id === id || c.id === `30${id.slice(-1)}` || id.includes(c.id));
  if (!customer) {
    console.error(`[API PUT /api/customers/${id}] Customer not found in DB or seed.`);
    return res.status(404).json({ message: 'Customer not found' });
  }

  Object.assign(customer, req.body);
  console.log(`[API PUT /api/customers/${id}] Updated in-memory seed customer:`, customer.company_name);
  return res.json(customer);
});

// DELETE /api/customers/:id - Delete from PostgreSQL DB
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  console.log('----------------------------------------------------');
  console.log(`[API DELETE /api/customers/${id}] Deleting customer...`);

  try {
    const db = await getConnection();
    try {
      if (isUUID(id)) {
        const deleted = await db.queryOne(`DELETE FROM customers WHERE id = $1 RETURNING *`, [id]);
        if (deleted) {
          console.log(`[API DELETE /api/customers/${id}] DELETED customer from PostgreSQL DB:`, deleted.company_name);
          return res.json({ message: 'Customer deleted successfully', customer: deleted });
        }
      }
    } finally {
      db.release();
    }
  } catch (err) {
    console.error(`[API DELETE /api/customers/${id}] ERROR deleting from PostgreSQL DB:`, err.stack || err.message);
  }

  const idx = seed.CUSTOMERS.findIndex((c) => c.id === id || c.id === `30${id.slice(-1)}` || id.includes(c.id));
  if (idx === -1) {
    console.error(`[API DELETE /api/customers/${id}] Customer not found for deletion.`);
    return res.status(404).json({ message: 'Customer not found' });
  }

  const deleted = seed.CUSTOMERS.splice(idx, 1)[0];
  console.log(`[API DELETE /api/customers/${id}] Deleted from in-memory seed:`, deleted.company_name);
  return res.json({ message: 'Customer deleted successfully', customer: deleted });
});

module.exports = router;
