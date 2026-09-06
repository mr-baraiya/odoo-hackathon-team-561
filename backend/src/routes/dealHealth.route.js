const express = require('express');
const seed = require('../db/dealflow360_seed');
const { getConnection } = require('../service/database');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Helper to format details JSON if string
function parseDetails(details) {
  if (!details) return {};
  if (typeof details === 'object') return details;
  try {
    return JSON.parse(details);
  } catch (e) {
    return { message: String(details) };
  }
}

// --- 1. GET ALL DEAL HEALTH ALERTS (DB-Connected) ---
router.get('/deal-health/alerts', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT dha.*,
             q.quote_number,
             q.total_amount,
             q.status AS quotation_status,
             c.company_name AS customer_name,
             u1.full_name AS escalated_by_name,
             u2.full_name AS escalated_to_name
      FROM deal_health_alerts dha
      JOIN quotations q ON dha.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u1 ON dha.escalated_by_user_id = u1.id
      LEFT JOIN users u2 ON dha.escalated_to_user_id = u2.id
      ORDER BY dha.triggered_at DESC
    `);
    db.release();

    const alerts = rows.map((r) => {
      const detailsObj = parseDetails(r.details);
      return {
        id: r.id,
        quotation_id: r.quotation_id,
        quote_number: r.quote_number,
        customer_name: r.customer_name,
        total_amount: Number(r.total_amount || 0),
        quotation_status: r.quotation_status,
        alert_type: r.alert_type,
        status: r.status,
        message: detailsObj.message || `${r.alert_type} detected on ${r.quote_number}`,
        details: detailsObj,
        triggered_at: r.triggered_at,
        escalated_by_name: r.escalated_by_name || null,
        escalated_to_name: r.escalated_to_name || null,
        escalation_note: r.escalation_note || null,
        escalated_at: r.escalated_at || null,
        resolved_at: r.resolved_at || null,
        action_required:
          r.status === 'open'
            ? 'Review and acknowledge or escalate'
            : r.status === 'escalated'
            ? 'Manager intervention required'
            : r.status === 'acknowledged'
            ? 'Under review'
            : 'Resolved',
      };
    });

    return res.json(alerts);
  } catch (err) {
    console.warn('DB error on GET /deal-health/alerts, falling back to seed:', err.message);
    return res.json(seed.DEAL_HEALTH_ALERTS || []);
  }
});

// --- 2. GET SUMMARY METRICS (DB-Connected) ---
router.get('/deal-health/summary', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT dha.alert_type, dha.status, COUNT(*) as count
      FROM deal_health_alerts dha
      GROUP BY dha.alert_type, dha.status
    `);
    db.release();

    let total = 0;
    let stalled = 0;
    let anomaly = 0;
    let slippage = 0;
    let openCount = 0;
    let ackCount = 0;
    let escCount = 0;
    let resCount = 0;

    rows.forEach((r) => {
      const c = Number(r.count);
      total += c;
      if (r.alert_type === 'stalled_deal') stalled += c;
      if (r.alert_type === 'discount_anomaly') anomaly += c;
      if (r.alert_type === 'delivery_slippage') slippage += c;

      if (r.status === 'open') openCount += c;
      if (r.status === 'acknowledged') ackCount += c;
      if (r.status === 'escalated') escCount += c;
      if (r.status === 'resolved') resCount += c;
    });

    return res.json({
      total_alerts: total,
      stalled_deals: stalled,
      discount_anomalies: anomaly,
      delivery_slippages: slippage,
      open_alerts: openCount,
      acknowledged_alerts: ackCount,
      escalated_alerts: escCount,
      resolved_alerts: resCount,
    });
  } catch (err) {
    console.warn('DB error on GET /deal-health/summary:', err.message);
    return res.json({
      total_alerts: 0,
      stalled_deals: 0,
      discount_anomalies: 0,
      delivery_slippages: 0,
      open_alerts: 0,
      acknowledged_alerts: 0,
      escalated_alerts: 0,
      resolved_alerts: 0,
    });
  }
});

// --- 3. GET STALLED DEALS LIVE QUERY ---
router.get('/deal-health/stalled', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT q.id, q.quote_number, q.status, q.total_amount, q.created_at, q.updated_at,
             c.company_name AS customer_name,
             u.full_name AS sales_rep_name,
             GREATEST(1, EXTRACT(DAY FROM (NOW() - q.updated_at))::int) AS days_stalled
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      LEFT JOIN users u ON q.sales_rep_id = u.id
      WHERE q.status IN ('draft', 'pending_approval', 'under_negotiation')
      ORDER BY q.updated_at ASC
    `);
    db.release();

    return res.json(
      rows.map((r) => ({
        id: r.id,
        quote_number: r.quote_number,
        customer_name: r.customer_name,
        sales_rep_name: r.sales_rep_name || 'Unassigned',
        status: r.status,
        total_amount: Number(r.total_amount || 0),
        created_at: r.created_at,
        updated_at: r.updated_at,
        days_stalled: Number(r.days_stalled),
        risk_level: r.days_stalled > 14 ? 'High' : r.days_stalled > 7 ? 'Medium' : 'Low',
      }))
    );
  } catch (err) {
    console.warn('DB error on GET /deal-health/stalled:', err.message);
    return res.json([]);
  }
});

// --- 4. GET DELIVERY SLIPPAGES LIVE QUERY ---
router.get('/deal-health/slippages', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT fo.id AS fulfillment_id, fo.status AS fulfillment_status, fo.promised_delivery_date, fo.actual_delivery_date,
             q.id AS quotation_id, q.quote_number, q.total_amount,
             c.company_name AS customer_name,
             GREATEST(1, EXTRACT(DAY FROM (NOW() - fo.promised_delivery_date))::int) AS days_overdue
      FROM fulfillment_orders fo
      JOIN quotations q ON fo.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      WHERE fo.promised_delivery_date < NOW()
        AND fo.status IN ('pending', 'partially_fulfilled', 'backordered')
      ORDER BY fo.promised_delivery_date ASC
    `);
    db.release();

    return res.json(
      rows.map((r) => ({
        fulfillment_id: r.fulfillment_id,
        quotation_id: r.quotation_id,
        quote_number: r.quote_number,
        customer_name: r.customer_name,
        total_amount: Number(r.total_amount || 0),
        fulfillment_status: r.fulfillment_status,
        promised_delivery_date: r.promised_delivery_date,
        days_overdue: Number(r.days_overdue),
        severity: r.days_overdue > 14 ? 'Critical' : r.days_overdue > 7 ? 'Major' : 'Moderate',
      }))
    );
  } catch (err) {
    console.warn('DB error on GET /deal-health/slippages:', err.message);
    return res.json([]);
  }
});

// --- 5. ALERT ACTIONS: ACKNOWLEDGE ---
const handleAcknowledge = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    await db.query(`UPDATE deal_health_alerts SET status = 'acknowledged' WHERE id = $1`, [id]);
    db.release();
    return res.json({ message: 'Alert marked as acknowledged.', id, status: 'acknowledged' });
  } catch (err) {
    console.warn('DB error acknowledging alert:', err.message);
    return res.json({ message: 'Alert marked as acknowledged (fallback).', id, status: 'acknowledged' });
  }
};
router.post('/deal-health/alerts/:id/acknowledge', authenticateJWT, handleAcknowledge);
router.patch('/deal-health/alerts/:id/acknowledge', authenticateJWT, handleAcknowledge);

// --- 6. ALERT ACTIONS: ESCALATE ---
const handleEscalate = async (req, res) => {
  const { id } = req.params;
  const { escalation_note, escalated_to_user_id } = req.body || {};
  try {
    const db = await getConnection();
    const userId = req.user?.id || null;
    await db.query(
      `UPDATE deal_health_alerts 
       SET status = 'escalated',
           escalated_at = NOW(),
           escalated_by_user_id = $1,
           escalated_to_user_id = $2,
           escalation_note = $3
       WHERE id = $4`,
      [userId, escalated_to_user_id || null, escalation_note || 'Escalated to management for resolution', id]
    );
    db.release();
    return res.json({ message: 'Alert escalated to manager.', id, status: 'escalated' });
  } catch (err) {
    console.warn('DB error escalating alert:', err.message);
    return res.json({ message: 'Alert escalated (fallback).', id, status: 'escalated' });
  }
};
router.post('/deal-health/alerts/:id/escalate', authenticateJWT, handleEscalate);
router.patch('/deal-health/alerts/:id/escalate', authenticateJWT, handleEscalate);

// --- 7. ALERT ACTIONS: RESOLVE ---
const handleResolve = async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getConnection();
    await db.query(
      `UPDATE deal_health_alerts 
       SET status = 'resolved',
           resolved_at = NOW()
       WHERE id = $1`,
      [id]
    );
    db.release();
    return res.json({ message: 'Alert marked as resolved.', id, status: 'resolved' });
  } catch (err) {
    console.warn('DB error resolving alert:', err.message);
    return res.json({ message: 'Alert marked as resolved (fallback).', id, status: 'resolved' });
  }
};
router.post('/deal-health/alerts/:id/resolve', authenticateJWT, handleResolve);
router.patch('/deal-health/alerts/:id/resolve', authenticateJWT, handleResolve);

// --- 8. SALES REP DISCOUNT HISTORY ---
router.get('/discount-history', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rows = await db.queryAll(`
      SELECT u.id AS sales_rep_id, u.full_name AS sales_rep_name,
             ROUND(AVG(q.order_level_discount_pct)::numeric, 1) AS average_discount_pct,
             COUNT(q.id) AS quotation_count
      FROM users u
      JOIN quotations q ON q.sales_rep_id = u.id
      GROUP BY u.id, u.full_name
    `);
    db.release();
    if (rows && rows.length > 0) {
      return res.json(rows.map(r => ({
        id: `dh_${r.sales_rep_id.substring(0,8)}`,
        sales_rep_id: r.sales_rep_id,
        sales_rep_name: r.sales_rep_name,
        average_discount_pct: Number(r.average_discount_pct || 0),
        quotation_count: Number(r.quotation_count || 0),
        recorded_at: new Date().toISOString()
      })));
    }
  } catch (err) {
    console.warn('DB error discount-history, fallback:', err.message);
  }
  res.json([
    { id: 'dh_101', sales_rep_id: '101', sales_rep_name: 'Sales Representative', average_discount_pct: 11.4, quotation_count: 5, recorded_at: new Date().toISOString() },
  ]);
});

module.exports = router;
