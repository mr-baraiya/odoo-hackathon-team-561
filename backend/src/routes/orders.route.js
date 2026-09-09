const express = require('express');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { getConnection } = require('../service/database');

const router = express.Router();

// GET /api/orders
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT q.id as quotation_id, ('ord_' || q.id::text) as id, ('ORD-' || q.quote_number) as order_number,
             q.customer_id, c.company_name as customer_name, q.total_amount,
             CASE WHEN q.status::text = 'confirmed' THEN 'pending_fulfillment' ELSE q.status::text END as status,
             q.created_at
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.status::text IN ('confirmed', 'in_fulfillment', 'fulfilled')
      ORDER BY q.created_at DESC
    `);
    db.release();
    return res.json(rows || []);
  } catch (err) {
    console.warn('DB error GET /api/orders:', err.message);
    return res.json([]);
  }
});

// GET /api/orders/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const cleanId = id.startsWith('ord_') ? id.replace('ord_', '') : id;
  try {
    const db = await getConnection();
    const qRow = await db.queryOne(`
      SELECT q.*, c.company_name as customer_name
      FROM quotations q
      LEFT JOIN customers c ON c.id = q.customer_id
      WHERE q.id::text = $1 OR q.quote_number = $1
    `, [cleanId]);
    if (qRow) {
      const lines = await db.queryAll(`SELECT * FROM quotation_lines WHERE quotation_id = $1`, [qRow.id]);
      db.release();
      return res.json({
        id: `ord_${qRow.id}`,
        quotation_id: qRow.id,
        order_number: `ORD-${qRow.quote_number}`,
        customer_id: qRow.customer_id,
        customer_name: qRow.customer_name,
        total_amount: Number(qRow.total_amount || 0),
        status: qRow.status === 'confirmed' ? 'pending_fulfillment' : qRow.status,
        lines: lines || [],
        created_at: qRow.created_at,
      });
    }
    db.release();
  } catch (err) {
    console.warn('DB error GET /api/orders/:id:', err.message);
  }
  return res.status(404).json({ message: 'Order not found' });
});

// POST /api/orders
router.post('/', authenticateJWT, async (req, res) => {
  const { quotationId } = req.body;
  try {
    const db = await getConnection();
    const qRow = await db.queryOne(`SELECT q.*, c.company_name as customer_name FROM quotations q LEFT JOIN customers c ON c.id = q.customer_id WHERE q.id::text = $1 OR q.quote_number = $1`, [quotationId]);
    if (qRow) {
      await db.query(`UPDATE quotations SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW() WHERE id = $1`, [qRow.id]);
      db.release();
      return res.status(201).json({
        id: `ord_${qRow.id}`,
        quotation_id: qRow.id,
        order_number: `ORD-${qRow.quote_number}`,
        customer_id: qRow.customer_id,
        customer_name: qRow.customer_name,
        total_amount: Number(qRow.total_amount || 0),
        status: 'pending_fulfillment',
        created_at: new Date().toISOString(),
      });
    }
    db.release();
  } catch (err) {
    console.warn('DB error POST /api/orders:', err.message);
  }
  return res.status(404).json({ message: 'Quotation not found' });
});

// PUT /api/orders/:id
router.put('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const cleanId = id.startsWith('ord_') ? id.replace('ord_', '') : id;
  const { status } = req.body;
  try {
    const db = await getConnection();
    if (status) {
      await db.query(`UPDATE quotations SET status = $1, updated_at = NOW() WHERE id::text = $2 OR quote_number = $2`, [status, cleanId]);
    }
    db.release();
    return res.json({ id: `ord_${cleanId}`, status: status || 'in_fulfillment' });
  } catch (err) {
    console.warn('DB error PUT /api/orders/:id:', err.message);
  }
  return res.status(404).json({ message: 'Order not found' });
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const cleanId = id.startsWith('ord_') ? id.replace('ord_', '') : id;
  const status = req.body.status || 'in_fulfillment';
  try {
    const db = await getConnection();
    const updated = await db.queryOne(`UPDATE quotations SET status = $1, updated_at = NOW() WHERE id::text = $2 OR quote_number = $2 RETURNING *`, [status, cleanId]);
    db.release();
    if (updated) {
      return res.json({ id: `ord_${updated.id}`, order_number: `ORD-${updated.quote_number}`, status: updated.status });
    }
  } catch (err) {
    console.warn('DB error PATCH /api/orders/:id/status:', err.message);
  }
  return res.status(404).json({ message: 'Order not found' });
});

module.exports = router;
