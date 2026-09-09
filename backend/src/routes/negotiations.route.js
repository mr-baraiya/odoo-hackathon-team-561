const express = require('express');
const { getConnection } = require('../service/database');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// GET /api/negotiations
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT nr.*, u.full_name AS user_name
      FROM negotiation_requests nr
      LEFT JOIN users u ON nr.customer_user_id = u.id
      ORDER BY nr.created_at DESC
    `);
    db.release();
    return res.json(rows);
  } catch (err) {
    console.warn('DB error GET /negotiations:', err.message);
    return res.json([]);
  }
});

// GET /api/quotations/:id/negotiations
router.get('/quotations/:id/negotiations', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT nr.*, u.full_name AS user_name
      FROM negotiation_requests nr
      LEFT JOIN users u ON nr.customer_user_id = u.id
      WHERE nr.quotation_id::text = $1 OR nr.quotation_id IN (SELECT id FROM quotations WHERE quote_number = $1)
      ORDER BY nr.created_at ASC
    `, [req.params.id]);
    db.release();
    return res.json(rows);
  } catch (err) {
    console.warn('DB error GET /quotations/:id/negotiations:', err.message);
    return res.json([]);
  }
});

// POST /api/quotations/:id/negotiations
router.post('/quotations/:id/negotiations', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const quote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [req.params.id]);
    if (!quote) {
      db.release();
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const { message, proposedDiscountPct, requestType } = req.body;
    const userId = isUUID(req.user?.id) ? req.user.id : null;
    const discPct = proposedDiscountPct ? Number(proposedDiscountPct) : null;

    const newNeg = await db.queryOne(`
      INSERT INTO negotiation_requests (quotation_id, customer_user_id, request_type, message, proposed_discount_pct, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'open', NOW())
      RETURNING *
    `, [quote.id, userId, requestType || 'counter_discount', message || '', discPct]);

    await db.query(`UPDATE quotations SET status = 'under_negotiation', last_activity_at = NOW(), updated_at = NOW() WHERE id = $1`, [quote.id]);
    db.release();

    return res.status(201).json({ message: 'Negotiation submitted.', negotiation: newNeg });
  } catch (err) {
    console.warn('DB error POST /quotations/:id/negotiations:', err.message);
    return res.status(500).json({ message: 'Failed to submit negotiation' });
  }
});

// GET /api/negotiations/:id
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const neg = await db.queryOne(`SELECT * FROM negotiation_requests WHERE id::text = $1`, [req.params.id]);
    db.release();
    if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });
    return res.json(neg);
  } catch (err) {
    console.warn('DB error GET /negotiations/:id:', err.message);
    return res.status(404).json({ message: 'Negotiation request not found' });
  }
});

// POST /api/negotiations/:id/respond
router.post('/:id/respond', authenticateJWT, async (req, res) => {
  try {
    const { responseMessage } = req.body;
    const userId = isUUID(req.user?.id) ? req.user.id : null;
    const db = await getConnection();

    const neg = await db.queryOne(`
      UPDATE negotiation_requests
      SET responded_by_user_id = $1, response_message = $2, status = 'addressed', resolved_at = NOW()
      WHERE id::text = $3
      RETURNING *
    `, [userId, responseMessage || '', req.params.id]);
    db.release();

    if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });
    return res.json({ message: 'Response sent to customer.', negotiation: neg });
  } catch (err) {
    console.warn('DB error POST /negotiations/:id/respond:', err.message);
    return res.status(500).json({ message: 'Failed to respond to negotiation' });
  }
});

// POST /api/negotiations/:id/accept
router.post('/:id/accept', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const neg = await db.queryOne(`
      UPDATE negotiation_requests
      SET status = 'accepted', resolved_at = NOW()
      WHERE id::text = $1
      RETURNING *
    `, [req.params.id]);

    let quote = null;
    if (neg) {
      if (neg.proposed_discount_pct !== null) {
        quote = await db.queryOne(`
          UPDATE quotations
          SET order_level_discount_pct = $1, status = 'approved', updated_at = NOW(), last_activity_at = NOW()
          WHERE id = $2
          RETURNING *
        `, [neg.proposed_discount_pct, neg.quotation_id]);
      } else {
        quote = await db.queryOne(`SELECT * FROM quotations WHERE id = $1`, [neg.quotation_id]);
      }
    }
    db.release();

    if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });
    return res.json({ message: 'Negotiation counter-discount accepted.', negotiation: neg, quote });
  } catch (err) {
    console.warn('DB error POST /negotiations/:id/accept:', err.message);
    return res.status(500).json({ message: 'Failed to accept negotiation' });
  }
});

// POST /api/negotiations/:id/reject
router.post('/:id/reject', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const neg = await db.queryOne(`
      UPDATE negotiation_requests
      SET status = 'rejected', resolved_at = NOW()
      WHERE id::text = $1
      RETURNING *
    `, [req.params.id]);
    db.release();

    if (!neg) return res.status(404).json({ message: 'Negotiation request not found' });
    return res.json({ message: 'Negotiation counter-discount rejected.', negotiation: neg });
  } catch (err) {
    console.warn('DB error POST /negotiations/:id/reject:', err.message);
    return res.status(500).json({ message: 'Failed to reject negotiation' });
  }
});

module.exports = router;
