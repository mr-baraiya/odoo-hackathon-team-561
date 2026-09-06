/**
 * Seed subscription_plans table with comprehensive plans:
 * - 2 Monthly plans
 * - 2 Quarterly plans
 * - 2 Yearly plans
 * Each has proration, cancellation, and refund rules configured.
 */
const { getConnection } = require('../src/service/database');

const PLANS = [
  // --- MONTHLY PLANS ---
  {
    name: 'Starter Monthly SaaS License',
    cycle: 'monthly',
    price_per_cycle: 199.00,
    proration_enabled: true,
    proration_policy: 'pro_rata_credit',
    cancellation_notice_days: 7,
    cancellation_policy: 'end_of_cycle',
    partial_refund_allowed: true,
    refund_window_days: 14,
    early_termination_fee_pct: 0,
  },
  {
    name: 'Professional Monthly Suite',
    cycle: 'monthly',
    price_per_cycle: 499.00,
    proration_enabled: true,
    proration_policy: 'pro_rata_credit',
    cancellation_notice_days: 14,
    cancellation_policy: 'end_of_cycle',
    partial_refund_allowed: true,
    refund_window_days: 7,
    early_termination_fee_pct: 0,
  },
  // --- QUARTERLY PLANS ---
  {
    name: 'Business Quarterly Bundle',
    cycle: 'quarterly',
    price_per_cycle: 1079.00,
    proration_enabled: true,
    proration_policy: 'pro_rata_credit',
    cancellation_notice_days: 14,
    cancellation_policy: 'end_of_cycle',
    partial_refund_allowed: true,
    refund_window_days: 21,
    early_termination_fee_pct: 5,
  },
  {
    name: 'Enterprise Quarterly License',
    cycle: 'quarterly',
    price_per_cycle: 2699.00,
    proration_enabled: true,
    proration_policy: 'pro_rata_credit',
    cancellation_notice_days: 30,
    cancellation_policy: 'end_of_cycle',
    partial_refund_allowed: true,
    refund_window_days: 14,
    early_termination_fee_pct: 10,
  },
  // --- YEARLY PLANS ---
  {
    name: 'Growth Annual Plan (Save 20%)',
    cycle: 'yearly',
    price_per_cycle: 3588.00,
    proration_enabled: true,
    proration_policy: 'pro_rata_credit',
    cancellation_notice_days: 30,
    cancellation_policy: 'end_of_cycle',
    partial_refund_allowed: true,
    refund_window_days: 30,
    early_termination_fee_pct: 15,
  },
  {
    name: 'Enterprise Annual Commitment (Save 25%)',
    cycle: 'yearly',
    price_per_cycle: 8999.00,
    proration_enabled: false,
    proration_policy: 'no_proration',
    cancellation_notice_days: 60,
    cancellation_policy: 'end_of_cycle',
    partial_refund_allowed: false,
    refund_window_days: 0,
    early_termination_fee_pct: 25,
  },
];

(async () => {
  let db;
  try {
    db = await getConnection();

    // Get a valid product UUID (prefer the SaaS subscription product)
    const saasProduct = await db.queryOne(
      "SELECT id FROM products WHERE name ILIKE '%SaaS%' OR name ILIKE '%subscription%' LIMIT 1"
    );
    const fallbackProduct = await db.queryOne('SELECT id FROM products LIMIT 1');
    const productId = (saasProduct || fallbackProduct)?.id;

    if (!productId) {
      console.error('ERROR: No product found in DB to link subscription plans');
      process.exit(1);
    }
    console.log('Using product ID:', productId);

    // Clear existing plans
    await db.queryAll('DELETE FROM subscription_plans');
    console.log('Cleared old subscription_plans...');

    let insertedCount = 0;
    for (const plan of PLANS) {
      const row = await db.queryOne(
        `INSERT INTO subscription_plans
         (product_id, name, cycle, price_per_cycle, proration_enabled, proration_policy,
          cancellation_notice_days, cancellation_policy, partial_refund_allowed,
          refund_window_days, early_termination_fee_pct)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, name, cycle, price_per_cycle`,
        [
          productId,
          plan.name,
          plan.cycle,
          plan.price_per_cycle,
          plan.proration_enabled,
          plan.proration_policy,
          plan.cancellation_notice_days,
          plan.cancellation_policy,
          plan.partial_refund_allowed,
          plan.refund_window_days,
          plan.early_termination_fee_pct,
        ]
      );
      console.log(`INSERTED: [${row.cycle.toUpperCase()}] ${row.name} — $${row.price_per_cycle}`);
      insertedCount++;
    }

    const total = await db.queryOne('SELECT COUNT(*) as count FROM subscription_plans');
    console.log(`\nTOTAL PLANS IN DB: ${total.count}`);

  } catch (e) {
    console.error('SEED ERROR:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
