const express = require('express');
const seed = require('../db/dealflow360_seed');
const { getConnection } = require('../service/database');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

const isUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

let APPROVAL_RULES_MEMORY = [
  { id: '1001', name: 'Standard Sales Rep Auto-Approve', min_discount_pct: 0, max_discount_pct: 10, min_risk_score: 0.0, max_risk_score: 15.0, required_levels: ['sales_rep'], auto_approve: true, description: 'Discounts up to 10% auto-approved.' },
  { id: '1002', name: 'Sales Manager Escalation Rule', min_discount_pct: 10.1, max_discount_pct: 25, min_risk_score: 15.0, max_risk_score: 25.0, required_levels: ['sales_manager'], auto_approve: false, description: 'Discounts between 10% and 25% require Sales Manager sign-off.' },
  { id: '1003', name: 'Finance Operations Override Rule', min_discount_pct: 25.1, max_discount_pct: 50, min_risk_score: 25.0, max_risk_score: 40.0, required_levels: ['sales_manager', 'finance_ops'], auto_approve: false, description: 'Discounts between 25% and 50% require Finance sign-off.' },
  { id: '1004', name: 'Executive Board Exception Rule', min_discount_pct: 50.1, max_discount_pct: 100, min_risk_score: 40.0, max_risk_score: 100.0, required_levels: ['sales_manager', 'finance_ops', 'admin'], auto_approve: false, description: 'Discounts exceeding 50% require Executive Board sign-off.' },
];

// GET /api/approvals
router.get('/', authenticateJWT, (req, res) => {
  const allApprovals = seed.QUOTATIONS.flatMap((q) => q.approvals || []);
  res.json(allApprovals);
});

// GET /api/approvals/pending
router.get('/pending', authenticateJWT, (req, res) => {
  const pendingQuotes = seed.QUOTATIONS.filter((q) => q.status === 'pending_approval');
  res.json(pendingQuotes);
});

// --- APPROVAL RULES (POSTGRESQL DB CONNECTED) ---
router.get('/rules', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const dbRules = await db.queryAll('SELECT * FROM approval_chain_rules ORDER BY min_discount_pct ASC');
    db.release();
    if (dbRules && dbRules.length > 0) {
      const formatted = dbRules.map((r, index) => ({
        id: r.id,
        level: index + 1,
        name: r.name || `Level ${index + 1} Threshold Rule`,
        min_risk_score: Number(r.min_risk_score || 0),
        max_risk_score: r.max_risk_score !== null ? Number(r.max_risk_score) : null,
        min_discount_pct: Number(r.min_discount_pct || 0),
        max_discount_pct: Number(r.max_discount_pct || 25),
        required_levels: Array.isArray(r.required_levels) ? r.required_levels : String(r.required_levels || '').replace(/[{}]/g, '').split(','),
        auto_approve: r.auto_approve !== false && (r.auto_approve === true || index === 0),
        description: r.description || (r.required_levels?.includes('finance_ops') ? 'Requires Finance sign-off' : 'Requires Manager sign-off'),
      }));
      return res.json(formatted);
    }
  } catch (err) {
    console.warn('[approvals.route] DB query failed, falling back to memory:', err.message);
  }
  res.json(APPROVAL_RULES_MEMORY);
});

router.get('/rules/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getConnection();
    const rule = await db.queryOne('SELECT * FROM approval_chain_rules WHERE id = $1', [req.params.id]);
    db.release();
    if (rule) return res.json(rule);
  } catch (err) {
    console.warn('[approvals.route] DB query error:', err.message);
  }
  const rule = APPROVAL_RULES_MEMORY.find((r) => String(r.id) === String(req.params.id));
  if (!rule) return res.status(404).json({ message: 'Rule not found' });
  res.json(rule);
});

router.post('/rules', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const name = req.body.name || 'Custom Approval Rule';
  const min_discount_pct = Number(req.body.min_discount_pct || 0);
  const max_discount_pct = Number(req.body.max_discount_pct || 25);
  const min_risk_score = Number(req.body.min_risk_score || 0);
  const max_risk_score = req.body.max_risk_score !== undefined && req.body.max_risk_score !== '' ? Number(req.body.max_risk_score) : null;
  const required_levels = Array.isArray(req.body.required_levels) ? req.body.required_levels : ['sales_manager'];
  const reqLevelsStr = `{${required_levels.join(',')}}`;
  const auto_approve = Boolean(req.body.auto_approve);
  const description = req.body.description || 'Custom approval threshold rule.';

  try {
    const db = await getConnection();
    const inserted = await db.queryOne(
      `INSERT INTO approval_chain_rules 
       (name, min_discount_pct, max_discount_pct, min_risk_score, max_risk_score, required_levels, auto_approve, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, min_discount_pct, max_discount_pct, min_risk_score, max_risk_score, reqLevelsStr, auto_approve, description]
    );
    db.release();
    if (inserted) {
      return res.status(201).json({
        ...inserted,
        required_levels: Array.isArray(inserted.required_levels) ? inserted.required_levels : required_levels,
      });
    }
  } catch (err) {
    console.warn('[approvals.route] DB rule insert warning:', err.message);
  }

  const newRule = {
    id: `rule_${Date.now()}`,
    name,
    min_discount_pct,
    max_discount_pct,
    min_risk_score,
    max_risk_score,
    required_levels,
    auto_approve,
    description,
  };
  APPROVAL_RULES_MEMORY.push(newRule);
  res.status(201).json(newRule);
});

router.put('/rules/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { name, min_discount_pct, max_discount_pct, min_risk_score, max_risk_score, required_levels, auto_approve, description } = req.body;
  const reqLevelsStr = Array.isArray(required_levels) ? `{${required_levels.join(',')}}` : null;

  try {
    const db = await getConnection();
    const updated = await db.queryOne(
      `UPDATE approval_chain_rules SET 
        name = COALESCE($1, name),
        min_discount_pct = COALESCE($2, min_discount_pct),
        max_discount_pct = COALESCE($3, max_discount_pct),
        min_risk_score = COALESCE($4, min_risk_score),
        max_risk_score = COALESCE($5, max_risk_score),
        required_levels = COALESCE($6, required_levels),
        auto_approve = COALESCE($7, auto_approve),
        description = COALESCE($8, description)
       WHERE id = $9 RETURNING *`,
      [
        name || null,
        min_discount_pct !== undefined ? Number(min_discount_pct) : null,
        max_discount_pct !== undefined ? Number(max_discount_pct) : null,
        min_risk_score !== undefined ? Number(min_risk_score) : null,
        max_risk_score !== undefined && max_risk_score !== '' ? Number(max_risk_score) : null,
        reqLevelsStr,
        auto_approve !== undefined ? Boolean(auto_approve) : null,
        description || null,
        req.params.id,
      ]
    );
    db.release();
    if (updated) {
      return res.json({
        ...updated,
        required_levels: Array.isArray(updated.required_levels) ? updated.required_levels : String(updated.required_levels || '').replace(/[{}]/g, '').split(','),
      });
    }
  } catch (err) {
    console.warn('[approvals.route] DB update warning:', err.message);
  }

  const rule = APPROVAL_RULES_MEMORY.find((r) => String(r.id) === String(req.params.id));
  if (!rule) return res.status(404).json({ message: 'Rule not found' });
  Object.assign(rule, req.body);
  res.json(rule);
});

router.delete('/rules/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const db = await getConnection();
    await db.queryOne('DELETE FROM approval_chain_rules WHERE id = $1', [req.params.id]);
    db.release();
  } catch (err) {
    console.warn('[approvals.route] DB delete warning:', err.message);
  }

  const idx = APPROVAL_RULES_MEMORY.findIndex((r) => String(r.id) === String(req.params.id));
  if (idx !== -1) APPROVAL_RULES_MEMORY.splice(idx, 1);
  res.json({ message: 'Approval rule deleted successfully' });
});

// GET /api/approvals/:id
router.get('/:id', authenticateJWT, (req, res) => {
  const approval = seed.QUOTATIONS.flatMap((q) => q.approvals || []).find((a) => a.id === req.params.id);
  if (!approval) return res.status(404).json({ message: 'Approval step not found' });
  res.json(approval);
});

// POST /api/approvals/:id/approve
router.post('/:id/approve', authenticateJWT, authorizeRoles('sales_manager', 'finance_ops', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  try {
    const db = await getConnection();
    const userId = req.user?.id || null;
    const userRole = req.user?.role || 'sales_manager';

    let targetQuote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (!targetQuote) {
      const appRow = await db.queryOne(`SELECT quotation_id FROM quotation_approvals WHERE id::text = $1`, [id]);
      if (appRow) {
        targetQuote = await db.queryOne(`SELECT * FROM quotations WHERE id = $1`, [appRow.quotation_id]);
      }
    }

    console.log('[approvals.route /approve INCOMING]', { id, userRole, targetQuoteId: targetQuote?.id });

    let finalStatus = 'pending_approval';

    if (targetQuote) {
      const safeUserId = isUUID(String(userId)) ? userId : null;
      // 1. Update the specific approval level step matching user role or first open step
      const updateRes = await db.query(
        `UPDATE quotation_approvals 
         SET action = 'approved', acted_at = NOW(), reason = COALESCE($1, reason), assigned_to_user_id = COALESCE($2, assigned_to_user_id) 
         WHERE quotation_id = $3 AND (approval_level = $4 OR action IS NULL)`,
        [reason || 'Approved step', safeUserId, targetQuote.id, userRole]
      );
      console.log('[approvals.route /approve UPDATE RES]', updateRes);

      // 2. Check if all required approval steps for this quotation are completed
      const remainingPending = await db.queryOne(
        `SELECT COUNT(*) as count FROM quotation_approvals WHERE quotation_id = $1 AND (action IS NULL OR action != 'approved')`,
        [targetQuote.id]
      );

      const isFullyApproved = Number(remainingPending?.count || 0) === 0;
      finalStatus = isFullyApproved ? 'approved' : 'pending_approval';

      await db.query(
        `UPDATE quotations SET status = $1, updated_at = NOW() WHERE id = $2`,
        [finalStatus, targetQuote.id]
      );

      await db.query(
        `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
         VALUES ('quotation', $1, 'QUOTATION_APPROVAL_STEP', $2, $3, NOW())`,
        [targetQuote.id, `Approval step (${userRole}) approved. Overall quote status: ${finalStatus}`, safeUserId]
      );
    }
    db.release();

    if (Array.isArray(seed.QUOTATIONS)) {
      const seedQuote = seed.QUOTATIONS.find((q) => q.id === id || q.quote_number === id || (q.approvals || []).some((a) => a.id === id));
      if (seedQuote) {
        seedQuote.status = finalStatus;
      }
    }

    const msg = finalStatus === 'approved'
      ? 'Quotation fully approved! Dispatched for customer sending.'
      : 'Approval step signed off successfully. Pending remaining approval chain step (Finance/Ops).';

    return res.json({ message: msg, status: finalStatus, is_fully_approved: finalStatus === 'approved' });
  } catch (err) {
    console.warn('[approvals.route] DB approval update warning:', err.message);
    return res.json({ message: 'Quotation approved (fallback).' });
  }
});

// POST /api/approvals/:id/reject
router.post('/:id/reject', authenticateJWT, authorizeRoles('sales_manager', 'finance_ops', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  try {
    const db = await getConnection();
    const userId = req.user?.id || null;

    let targetQuote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (!targetQuote) {
      const appRow = await db.queryOne(`SELECT quotation_id FROM quotation_approvals WHERE id::text = $1`, [id]);
      if (appRow) {
        targetQuote = await db.queryOne(`SELECT * FROM quotations WHERE id = $1`, [appRow.quotation_id]);
      }
    }

    if (targetQuote) {
      await db.query(
        `UPDATE quotations SET status = 'rejected', updated_at = NOW() WHERE id = $1`,
        [targetQuote.id]
      );
      await db.query(
        `UPDATE quotation_approvals SET action = 'rejected', acted_at = NOW(), reason = COALESCE($1, reason) WHERE quotation_id = $2 OR id::text = $3`,
        [reason || 'Rejected by manager', targetQuote.id, id]
      );
      await db.query(
        `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
         VALUES ('quotation', $1, 'QUOTATION_REJECTED_BY_MANAGER', $2, $3, NOW())`,
        [targetQuote.id, reason || 'Quotation rejected by Sales Manager', userId]
      );
    }
    db.release();

    if (Array.isArray(seed.QUOTATIONS)) {
      const seedQuote = seed.QUOTATIONS.find((q) => q.id === id || q.quote_number === id || (q.approvals || []).some((a) => a.id === id));
      if (seedQuote) {
        seedQuote.status = 'rejected';
      }
    }

    return res.json({ message: 'Quotation rejected by manager.', status: 'rejected' });
  } catch (err) {
    console.warn('[approvals.route] DB rejection update warning:', err.message);
    return res.json({ message: 'Quotation rejected (fallback).' });
  }
});

// POST /api/approvals/:id/return
router.post('/:id/return', authenticateJWT, authorizeRoles('sales_manager', 'finance_ops', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  try {
    const db = await getConnection();
    const userId = req.user?.id || null;

    let targetQuote = await db.queryOne(`SELECT * FROM quotations WHERE id::text = $1 OR quote_number = $1`, [id]);
    if (!targetQuote) {
      const appRow = await db.queryOne(`SELECT quotation_id FROM quotation_approvals WHERE id::text = $1`, [id]);
      if (appRow) {
        targetQuote = await db.queryOne(`SELECT * FROM quotations WHERE id = $1`, [appRow.quotation_id]);
      }
    }

    if (targetQuote) {
      await db.query(
        `UPDATE quotations SET status = 'draft', updated_at = NOW() WHERE id = $1`,
        [targetQuote.id]
      );
      await db.query(
        `UPDATE quotation_approvals SET action = 'returned_for_revision', acted_at = NOW(), reason = COALESCE($1, reason) WHERE quotation_id = $2 OR id::text = $3`,
        [reason || 'Returned for revision by manager', targetQuote.id, id]
      );
      await db.query(
        `INSERT INTO audit_log (entity_type, entity_id, action, reason, performed_by_user_id, created_at)
         VALUES ('quotation', $1, 'QUOTATION_RETURNED_FOR_REVISION', $2, $3, NOW())`,
        [targetQuote.id, reason || 'Quotation returned for revision by Sales Manager (e.g. Max 7% discount)', userId]
      );
    }
    db.release();

    if (Array.isArray(seed.QUOTATIONS)) {
      const seedQuote = seed.QUOTATIONS.find((q) => q.id === id || q.quote_number === id || (q.approvals || []).some((a) => a.id === id));
      if (seedQuote) {
        seedQuote.status = 'draft';
      }
    }

    return res.json({ message: 'Quotation returned to Sales Representative for revision. Status set to draft.', status: 'draft' });
  } catch (err) {
    console.warn('[approvals.route] DB return update warning:', err.message);
    return res.json({ message: 'Quotation returned for revision (fallback).' });
  }
});

module.exports = router;
