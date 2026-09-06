/**
 * Seed upsell_rules table with comprehensive product pairing rules
 * covering all 4 products in the catalog.
 */
const { getConnection } = require('../src/service/database');

(async () => {
  let db;
  try {
    db = await getConnection();

    // Fetch all products
    const products = await db.queryAll('SELECT id, name, sku, base_price, cost_price FROM products ORDER BY id');
    console.log('PRODUCTS AVAILABLE:');
    products.forEach((p) => console.log(`  [${p.sku}] ${p.name} — $${p.base_price}`));

    if (products.length < 2) {
      console.error('ERROR: Need at least 2 products to create pairing rules');
      process.exit(1);
    }

    // Map products by position for convenience
    const findBySku = (skuFragment) => products.find((p) => (p.sku || '').includes(skuFragment));
    const p0 = products[0]; // Enterprise Rack Server (501)
    const p1 = products[1]; // Workstation Laptop Pro (502)
    const p2 = products[2]; // DealFlow360 SaaS (504)
    const p3 = products[3]; // Onsite Deployment Service (503)

    // Clear old rules
    await db.queryAll('DELETE FROM upsell_rules');
    console.log('\nCleared old upsell_rules...');

    const RULES = [
      // Rack Server → SaaS (strong pairing, very likely bought together)
      p0 && p2 ? {
        base_product_id: p0.id,
        suggested_product_id: p2.id,
        co_purchase_score: 0.92,
        min_margin_pct_required: 20,
        is_active: true,
        label: `${p0.name} → ${p2.name}`,
      } : null,

      // Rack Server → Onsite Deployment (natural add-on)
      p0 && p3 ? {
        base_product_id: p0.id,
        suggested_product_id: p3.id,
        co_purchase_score: 0.87,
        min_margin_pct_required: 25,
        is_active: true,
        label: `${p0.name} → ${p3.name}`,
      } : null,

      // Workstation Laptop → SaaS (professional users)
      p1 && p2 ? {
        base_product_id: p1.id,
        suggested_product_id: p2.id,
        co_purchase_score: 0.78,
        min_margin_pct_required: 18,
        is_active: true,
        label: `${p1.name} → ${p2.name}`,
      } : null,

      // SaaS → Onsite Deployment (enterprise onboarding)
      p2 && p3 ? {
        base_product_id: p2.id,
        suggested_product_id: p3.id,
        co_purchase_score: 0.65,
        min_margin_pct_required: 20,
        is_active: true,
        label: `${p2.name} → ${p3.name}`,
      } : null,

      // Workstation Laptop → Rack Server (scale-up upsell)
      p1 && p0 ? {
        base_product_id: p1.id,
        suggested_product_id: p0.id,
        co_purchase_score: 0.55,
        min_margin_pct_required: 15,
        is_active: false,
        label: `${p1.name} → ${p0.name} (inactive)`,
      } : null,
    ].filter(Boolean);

    let count = 0;
    for (const rule of RULES) {
      const row = await db.queryOne(
        `INSERT INTO upsell_rules (base_product_id, suggested_product_id, co_purchase_score, min_margin_pct_required, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [rule.base_product_id, rule.suggested_product_id, rule.co_purchase_score, rule.min_margin_pct_required, rule.is_active]
      );
      const status = rule.is_active ? '✓' : '○';
      console.log(`${status} INSERTED: ${rule.label} [score=${rule.co_purchase_score}, minMgn=${rule.min_margin_pct_required}%]`);
      count++;
    }

    const total = await db.queryOne('SELECT COUNT(*) as count FROM upsell_rules');
    console.log(`\nTOTAL UPSELL RULES IN DB: ${total.count}`);

  } catch (e) {
    console.error('SEED ERROR:', e.message);
  } finally {
    if (db) db.release();
    process.exit(0);
  }
})();
