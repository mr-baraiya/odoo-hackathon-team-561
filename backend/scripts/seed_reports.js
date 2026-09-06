/**
 * DealFlow360 — Comprehensive Reports Seed Script
 * Seeds realistic dummy data across all tables needed for Reports & Analytics:
 * - quotations (multiple statuses, 12 months spread)
 * - quotation_lines (with discounts)
 * - invoices
 * - payments
 * - fulfillment_orders
 * - rep_discount_history
 * - deal_health_alerts
 * - negotiation_requests
 */
const { getConnection } = require('../src/service/database');

// ─── KNOWN IDs ────────────────────────────────────────────────────────────────
const CUSTOMERS = [
  { id: '00000000-0000-0000-0000-000000000301', name: 'Acme Corporation' },
  { id: '00000000-0000-0000-0000-000000000302', name: 'Beta Industries Ltd' },
  { id: '00000000-0000-0000-0000-000000000303', name: 'Cyberdyne Systems' },
  { id: '00000000-0000-0000-0000-000000000304', name: 'Nexus Logistics Group' },
  { id: 'a8d4ad93-0bf7-4b96-b807-058ad3238970', name: 'ABC Ltd' },
  { id: 'dc7ecb61-ac37-4184-850e-5cca12bedb63', name: 'Darshan Institute' },
];

const USERS = {
  salesRep:     '00000000-0000-0000-0000-000000000101',
  salesManager: '00000000-0000-0000-0000-000000000102',
  vishal:       'bef012f7-daae-4dee-93a3-5ba193d0f1ff',
  admin:        '00000000-0000-0000-0000-000000000105',
};

const PRODUCTS = [
  { id: '00000000-0000-0000-0000-000000000501', name: 'Enterprise Rack Server',       price: 4500, cost: 2700 },
  { id: '00000000-0000-0000-0000-000000000502', name: 'Workstation Laptop Pro 16"',   price: 1800, cost: 1100 },
  { id: '00000000-0000-0000-0000-000000000503', name: 'Onsite Deployment Service',    price: 1200, cost:  950 },
  { id: '00000000-0000-0000-0000-000000000504', name: 'DealFlow360 SaaS Subscription', price: 350, cost:   50 },
];

const PRICE_LIST_ID = '6456e425-6a86-46b9-9ef9-176f6c392234';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const rand   = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randF  = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
};
const dateOffset = (base, days) => {
  const dt = new Date(base);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString();
};

// ─── QUOTATION SCENARIOS ───────────────────────────────────────────────────────
// Each scenario: status, age in days ago, discount %, customer index, rep, lines
const SCENARIOS = [
  // ── CONFIRMED / FULFILLED (Revenue) ────────────────────────────────────────
  { status: 'confirmed',       ageDays: 2,   discPct: 5,  custIdx: 0, rep: USERS.vishal,       lines: [[0,2],[3,12]] },
  { status: 'confirmed',       ageDays: 8,   discPct: 10, custIdx: 1, rep: USERS.salesRep,     lines: [[1,5],[2,1]]  },
  { status: 'confirmed',       ageDays: 15,  discPct: 8,  custIdx: 2, rep: USERS.vishal,       lines: [[0,1],[3,24]] },
  { status: 'confirmed',       ageDays: 22,  discPct: 15, custIdx: 3, rep: USERS.salesManager, lines: [[1,3],[3,6]]  },
  { status: 'in_fulfillment',  ageDays: 30,  discPct: 12, custIdx: 0, rep: USERS.vishal,       lines: [[0,3],[2,2]]  },
  { status: 'confirmed',       ageDays: 45,  discPct: 7,  custIdx: 4, rep: USERS.salesRep,     lines: [[1,2],[3,12]] },
  { status: 'fulfilled',       ageDays: 55,  discPct: 20, custIdx: 1, rep: USERS.vishal,       lines: [[0,2],[2,1]]  },
  { status: 'confirmed',       ageDays: 62,  discPct: 5,  custIdx: 5, rep: USERS.salesManager, lines: [[3,24]]       },
  { status: 'fulfilled',       ageDays: 75,  discPct: 18, custIdx: 2, rep: USERS.salesRep,     lines: [[0,1],[1,2],[3,6]] },
  { status: 'confirmed',       ageDays: 80,  discPct: 10, custIdx: 3, rep: USERS.vishal,       lines: [[1,4]]        },
  { status: 'in_fulfillment',  ageDays: 90,  discPct: 22, custIdx: 0, rep: USERS.salesRep,     lines: [[0,2],[2,2]]  },
  { status: 'confirmed',       ageDays: 100, discPct: 6,  custIdx: 4, rep: USERS.vishal,       lines: [[3,12],[1,1]] },
  { status: 'fulfilled',       ageDays: 115, discPct: 25, custIdx: 1, rep: USERS.salesManager, lines: [[0,4],[2,1]]  },
  { status: 'confirmed',       ageDays: 120, discPct: 8,  custIdx: 5, rep: USERS.salesRep,     lines: [[1,3],[3,6]]  },
  { status: 'in_fulfillment',  ageDays: 130, discPct: 12, custIdx: 2, rep: USERS.vishal,       lines: [[0,1],[1,2]]  },
  { status: 'confirmed',       ageDays: 145, discPct: 15, custIdx: 3, rep: USERS.salesRep,     lines: [[1,5],[2,2],[3,12]] },
  { status: 'confirmed',       ageDays: 155, discPct: 5,  custIdx: 0, rep: USERS.vishal,       lines: [[0,2]]        },
  { status: 'fulfilled',       ageDays: 170, discPct: 30, custIdx: 1, rep: USERS.salesManager, lines: [[0,3],[3,24]] },
  // ── DRAFT / STALLED ────────────────────────────────────────────────────────
  { status: 'draft',           ageDays: 5,   discPct: 0,  custIdx: 4, rep: USERS.salesRep,     lines: [[1,1]]        },
  { status: 'draft',           ageDays: 7,   discPct: 0,  custIdx: 5, rep: USERS.vishal,       lines: [[0,1],[3,6]]  },
  { status: 'draft',           ageDays: 20,  discPct: 0,  custIdx: 0, rep: USERS.salesRep,     lines: [[2,1]]        },
  // ── PENDING APPROVAL ───────────────────────────────────────────────────────
  { status: 'pending_approval', ageDays: 1,  discPct: 18, custIdx: 2, rep: USERS.vishal,       lines: [[0,2],[1,3]]  },
  { status: 'pending_approval', ageDays: 3,  discPct: 26, custIdx: 3, rep: USERS.salesRep,     lines: [[0,1],[3,12]] },
  // ── SENT TO CUSTOMER ──────────────────────────────────────────────────────
  { status: 'sent_to_customer', ageDays: 4,  discPct: 8,  custIdx: 0, rep: USERS.vishal,       lines: [[1,2],[3,6]]  },
  { status: 'sent_to_customer', ageDays: 9,  discPct: 12, custIdx: 4, rep: USERS.salesManager, lines: [[0,1],[2,1]]  },
  { status: 'under_negotiation',ageDays: 6,  discPct: 20, custIdx: 1, rep: USERS.vishal,       lines: [[0,2],[3,12]] },
  // ── REJECTED / CANCELLED ─────────────────────────────────────────────────
  { status: 'rejected',        ageDays: 40,  discPct: 35, custIdx: 2, rep: USERS.salesRep,     lines: [[0,3]]        },
  { status: 'cancelled',       ageDays: 60,  discPct: 28, custIdx: 3, rep: USERS.vishal,       lines: [[1,2],[3,6]]  },
  // ── APPROVED ─────────────────────────────────────────────────────────────
  { status: 'approved',        ageDays: 3,   discPct: 18, custIdx: 5, rep: USERS.vishal,       lines: [[0,1],[1,2]]  },
  { status: 'approved',        ageDays: 11,  discPct: 22, custIdx: 0, rep: USERS.salesManager, lines: [[0,2],[3,24]] },
];

// ─── MAIN SEED ────────────────────────────────────────────────────────────────
(async () => {
  let db;
  try {
    db = await getConnection();
    console.log('Connected to database. Starting seed...\n');

    // ── 1. Clear dependent tables first ───────────────────────────────────────
    console.log('Clearing old data...');
    await db.queryAll('DELETE FROM rep_discount_history');
    await db.queryAll('DELETE FROM deal_health_alerts');
    await db.queryAll('DELETE FROM negotiation_requests');
    await db.queryAll('DELETE FROM fulfillment_splits');
    await db.queryAll('DELETE FROM fulfillment_orders');
    await db.queryAll('DELETE FROM payments');
    await db.queryAll('DELETE FROM invoices');
    await db.queryAll('DELETE FROM quotation_approvals');
    await db.queryAll('DELETE FROM quotation_lines');
    // Delete previously seeded quotations (Q-2026-201 onward), keep original 101/102
    await db.queryAll("DELETE FROM quotations WHERE quote_number LIKE 'Q-2026-2%'");
    console.log('Cleared dependent records.\n');

    // ── 2. Insert Quotations ──────────────────────────────────────────────────
    const insertedQuotations = [];
    let quoteNum = 200;

    for (const sc of SCENARIOS) {
      const customer = CUSTOMERS[sc.custIdx];
      const createdAt = daysAgo(sc.ageDays);
      const subtotal = sc.lines.reduce((sum, [pIdx, qty]) => sum + PRODUCTS[pIdx].price * qty, 0);
      const discountAmt = parseFloat((subtotal * sc.discPct / 100).toFixed(2));
      const totalAmt = parseFloat((subtotal - discountAmt).toFixed(2));
      const riskScore = randF(5, 45, 1);
      quoteNum++;

      const row = await db.queryOne(
        `INSERT INTO quotations
         (quote_number, customer_id, sales_rep_id, price_list_id, status,
          blended_risk_score, order_level_discount_pct, subtotal,
          total_discount_amount, total_amount, currency_code,
          last_activity_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING id, quote_number, status, total_amount`,
        [
          `Q-2026-${String(quoteNum).padStart(3,'0')}`,
          customer.id, sc.rep, PRICE_LIST_ID,
          sc.status, riskScore, sc.discPct,
          subtotal, discountAmt, totalAmt, 'USD',
          createdAt, createdAt, createdAt,
        ]
      );
      insertedQuotations.push({ ...row, createdAt, custId: customer.id, rep: sc.rep, lines: sc.lines, discPct: sc.discPct, totalAmt });
      process.stdout.write(`  [${sc.status.padEnd(18)}] ${row.quote_number} — $${totalAmt.toLocaleString()} (${sc.discPct}% off)\n`);
    }

    console.log(`\n✓ Inserted ${insertedQuotations.length} quotations\n`);

    // ── 3. Insert Quotation Lines ─────────────────────────────────────────────
    let lineCount = 0;
    for (const q of insertedQuotations) {
      for (const [pIdx, qty] of q.lines) {
        const prod = PRODUCTS[pIdx];
        const lineDisc = Math.min(q.discPct + randF(0, 5, 1), 50); // slight per-line variance, cap at 50%
        const lineTotal = parseFloat((prod.price * qty * (1 - lineDisc / 100)).toFixed(2));
        const marginPct = parseFloat(((prod.price - prod.cost) / prod.price * 100).toFixed(2));
        // SaaS product (504) lines are recurring — must have subscription_status
        const isSaaS = prod.id === '00000000-0000-0000-0000-000000000504';
        const isRecurring = isSaaS;
        const subStatus = isSaaS ? 'active' : null;

        await db.queryOne(
          `INSERT INTO quotation_lines
           (quotation_id, product_id, quantity, unit_price, discount_pct,
            line_discount_ceiling_pct, line_total, margin_pct, added_via_upsell,
            is_recurring, subscription_status, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [q.id, prod.id, qty, prod.price, lineDisc, lineDisc + 10,
           lineTotal, marginPct, false, isRecurring, subStatus, q.createdAt]
        );
        lineCount++;
      }
    }
    console.log(`✓ Inserted ${lineCount} quotation lines\n`);

    // ── 4. Invoices & Payments for confirmed/fulfilled quotations ─────────────
    const billableStatuses = ['confirmed', 'in_fulfillment', 'fulfilled'];
    const billable = insertedQuotations.filter(q => billableStatuses.includes(q.status));
    let invoiceNum = 1000;
    let invoiceCount = 0, paymentCount = 0;

    for (const q of billable) {
      invoiceNum++;
      const issuedAt = q.createdAt;
      const dueDate = dateOffset(issuedAt, 30);
      const isPaid = q.status === 'fulfilled' || Math.random() > 0.4;
      const invoiceStatus = isPaid ? 'paid' : (new Date(dueDate) < new Date() ? 'overdue' : 'sent');
      const amountPaid = isPaid ? q.totalAmt : 0;

      const inv = await db.queryOne(
        `INSERT INTO invoices
         (quotation_id, invoice_number, invoice_type, amount_due, amount_paid,
          status, due_date, issued_at, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id`,
        [q.id, `INV-2026-${String(invoiceNum).padStart(4,'0')}`,
         'standard', q.totalAmt, amountPaid,
         invoiceStatus, dueDate, issuedAt, issuedAt]
      );
      invoiceCount++;

      if (isPaid) {
        await db.queryOne(
          `INSERT INTO payments (invoice_id, amount, payment_method, reference_number, paid_at, created_at)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [inv.id, q.totalAmt,
           pick(['bank_transfer','credit_card','wire_transfer','ach']),
           `REF-${String(rand(100000, 999999))}`,
           dateOffset(issuedAt, rand(5, 25)),
           issuedAt]
        );
        paymentCount++;
      }
    }
    console.log(`✓ Inserted ${invoiceCount} invoices, ${paymentCount} payments\n`);

    // ── 5. Fulfillment Orders ─────────────────────────────────────────────────
    const fulfilmentStatuses = ['confirmed', 'in_fulfillment', 'fulfilled'];
    const fulfillable = insertedQuotations.filter(q => fulfilmentStatuses.includes(q.status));
    let fulfillCount = 0;

    const FULFILLMENT_STATUS_MAP = {
      'confirmed':      'pending',
      'in_fulfillment': 'partially_fulfilled',
      'fulfilled':      'fulfilled',
    };

    for (const q of fulfillable) {
      const fStatus = FULFILLMENT_STATUS_MAP[q.status] || 'pending';
      const promised = dateOffset(q.createdAt, rand(7, 21));
      const isDelivered = fStatus === 'fulfilled';
      const isLate = isDelivered && Math.random() > 0.75;
      const actual = isDelivered
        ? dateOffset(promised, isLate ? rand(1, 5) : rand(-2, 0))
        : null;

      await db.queryOne(
        `INSERT INTO fulfillment_orders
         (quotation_id, status, is_manual_override, promised_delivery_date,
          actual_delivery_date, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [q.id, fStatus, false, promised, actual, q.createdAt, q.createdAt]
      );
      fulfillCount++;
    }
    console.log(`✓ Inserted ${fulfillCount} fulfillment orders\n`);

    // ── 6. Rep Discount History ───────────────────────────────────────────────
    const repIds = [USERS.salesRep, USERS.vishal, USERS.salesManager];
    let rdCount = 0;
    for (const repId of repIds) {
      const repQuotes = insertedQuotations.filter(q => q.rep === repId);
      for (const q of repQuotes) {
        await db.queryOne(
          `INSERT INTO rep_discount_history (sales_rep_id, quotation_id, average_discount_pct, recorded_at)
           VALUES ($1,$2,$3,$4)`,
          [repId, q.id, q.discPct, q.createdAt]
        );
        rdCount++;
      }
    }
    console.log(`✓ Inserted ${rdCount} rep discount history records\n`);

    // ── 7. Deal Health Alerts ─────────────────────────────────────────────────
    const stalledQuotes = insertedQuotations.filter(q => q.status === 'draft' && q.discPct === 0);
    let alertCount = 0;

    for (const q of stalledQuotes.slice(0, 3)) {
      await db.queryOne(
        `INSERT INTO deal_health_alerts
         (quotation_id, alert_type, details, status, triggered_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [q.id, 'stalled_deal',
         JSON.stringify({ message: `Quote ${q.quote_number} has been in draft for ${rand(5,15)} days with no activity`, days_stalled: rand(5,20) }),
         'open', q.createdAt]
      );
      alertCount++;
    }

    // Discount anomaly alerts
    const highDiscountQuotes = insertedQuotations.filter(q => q.discPct >= 25);
    for (const q of highDiscountQuotes.slice(0, 3)) {
      await db.queryOne(
        `INSERT INTO deal_health_alerts
         (quotation_id, alert_type, details, status, triggered_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [q.id, 'discount_anomaly',
         JSON.stringify({ message: `Unusually high discount of ${q.discPct}% applied to quote ${q.quote_number}`, discount_pct: q.discPct }),
         pick(['open', 'acknowledged']), q.createdAt]
      );
      alertCount++;
    }
    console.log(`✓ Inserted ${alertCount} deal health alerts\n`);

    // ── 8. Negotiation Requests (for under_negotiation quotes) ────────────────
    const negotiatingQuotes = insertedQuotations.filter(q => q.status === 'under_negotiation');
    let negCount = 0;
    for (const q of negotiatingQuotes) {
      await db.queryOne(
        `INSERT INTO negotiation_requests
         (quotation_id, customer_user_id, request_type, message, proposed_discount_pct, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [q.id, USERS.salesRep,  // use sales_rep user (valid FK to users table)
         'counter_discount',
         'We would like to request an additional 5% discount given our volume commitment and long-term partnership potential.',
         q.discPct + 5, 'open', q.createdAt]
      );
      negCount++;
    }
    console.log(`✓ Inserted ${negCount} negotiation requests\n`);

    // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
    const finalCounts = await Promise.all([
      db.queryOne('SELECT COUNT(*) as c FROM quotations'),
      db.queryOne('SELECT COUNT(*) as c FROM quotation_lines'),
      db.queryOne('SELECT COUNT(*) as c FROM invoices'),
      db.queryOne('SELECT COUNT(*) as c FROM payments'),
      db.queryOne('SELECT COUNT(*) as c FROM fulfillment_orders'),
      db.queryOne('SELECT COUNT(*) as c FROM rep_discount_history'),
      db.queryOne('SELECT COUNT(*) as c FROM deal_health_alerts'),
      db.queryOne('SELECT COALESCE(SUM(total_amount),0) as rev FROM quotations'),
      db.queryOne("SELECT COALESCE(SUM(total_amount),0) as rev FROM quotations WHERE status='confirmed'"),
    ]);

    console.log('═══════════════════════════════════════');
    console.log('         SEED COMPLETE — DB SUMMARY     ');
    console.log('═══════════════════════════════════════');
    console.log(`  Quotations:          ${finalCounts[0].c}`);
    console.log(`  Quotation Lines:     ${finalCounts[1].c}`);
    console.log(`  Invoices:            ${finalCounts[2].c}`);
    console.log(`  Payments:            ${finalCounts[3].c}`);
    console.log(`  Fulfillment Orders:  ${finalCounts[4].c}`);
    console.log(`  Disc History Rows:   ${finalCounts[5].c}`);
    console.log(`  Deal Health Alerts:  ${finalCounts[6].c}`);
    console.log(`  Total Pipeline:      $${Number(finalCounts[7].rev).toLocaleString()}`);
    console.log(`  Confirmed Revenue:   $${Number(finalCounts[8].rev).toLocaleString()}`);
    console.log('═══════════════════════════════════════');

  } catch(e) {
    console.error('\nSEED ERROR:', e.message);
    console.error(e.stack);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
