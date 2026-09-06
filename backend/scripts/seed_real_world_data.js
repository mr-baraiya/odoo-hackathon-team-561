const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dealflow360'
});

async function main() {
  console.log('🌱 Populating real-world enterprise B2B seed data into PostgreSQL...');

  // 1. Fetch sales rep and customer user IDs
  const salesRepRes = await pool.query("SELECT id FROM users WHERE role = 'sales_rep' LIMIT 1");
  const salesRepId = salesRepRes.rows[0]?.id || '00000000-0000-0000-0000-000000000101';

  const custUserRes = await pool.query("SELECT id FROM users WHERE role = 'customer' LIMIT 1");
  const custUserId = custUserRes.rows[0]?.id || '00000000-0000-0000-0000-000000000104';

  const tierRes = await pool.query("SELECT id, code FROM customer_tiers");
  const tierMap = {};
  tierRes.rows.forEach(t => { tierMap[t.code] = t.id; });

  const goldTierId = tierMap['gold'] || '00000000-0000-0000-0000-000000000203';
  const platinumTierId = tierMap['platinum'] || '00000000-0000-0000-0000-000000000204';
  const silverTierId = tierMap['silver'] || '00000000-0000-0000-0000-000000000202';

  // 2. Insert Real Customers
  const customersData = [
    {
      company_name: 'TechCorp Global Solutions',
      tier_id: platinumTierId,
      currency_code: 'USD',
      billing_address: '100 Tech Plaza, Suite 900, New York, NY 10001',
      shipping_address: '100 Tech Plaza, Dock 4, New York, NY 10001',
      primary_contact_name: 'Alex Mercer',
      primary_contact_email: 'alex.mercer@techcorp.com',
      primary_contact_phone: '+1 555-0147',
      sales_rep_id: salesRepId
    },
    {
      company_name: 'Starlight BioPharma Ltd',
      tier_id: goldTierId,
      currency_code: 'USD',
      billing_address: '45 BioTech Way, Cambridge, MA 02142',
      shipping_address: '45 BioTech Way, Receiving, Cambridge, MA 02142',
      primary_contact_name: 'Dr. Elena Vance',
      primary_contact_email: 'e.vance@starlightbio.com',
      primary_contact_phone: '+1 555-0398',
      sales_rep_id: salesRepId
    },
    {
      company_name: 'Vanguard Industrial Robotics',
      tier_id: goldTierId,
      currency_code: 'USD',
      billing_address: '880 Industrial Pkwy, Chicago, IL 60611',
      shipping_address: '880 Industrial Pkwy, Gate 2, Chicago, IL 60611',
      primary_contact_name: 'Marcus Sterling',
      primary_contact_email: 'm.sterling@vanguardrobotics.com',
      primary_contact_phone: '+1 555-0721',
      sales_rep_id: salesRepId
    },
    {
      company_name: 'Quantum Cloud Networks',
      tier_id: platinumTierId,
      currency_code: 'USD',
      billing_address: '500 Innovation Way, Seattle, WA 98101',
      shipping_address: '500 Innovation Way, Server Dock, Seattle, WA 98101',
      primary_contact_name: 'Sarah Connor',
      primary_contact_email: 's.connor@quantumcloud.io',
      primary_contact_phone: '+1 555-0833',
      sales_rep_id: salesRepId
    },
    {
      company_name: 'Apex Global Logistics',
      tier_id: silverTierId,
      currency_code: 'USD',
      billing_address: '77 Freight Ave, San Francisco, CA 94105',
      shipping_address: '77 Freight Ave, Terminal A, San Francisco, CA 94105',
      primary_contact_name: 'David Zhang',
      primary_contact_email: 'd.zhang@apexlogistics.com',
      primary_contact_phone: '+1 555-0912',
      sales_rep_id: salesRepId
    },
    {
      company_name: 'Horizon Financial Technologies',
      tier_id: platinumTierId,
      currency_code: 'USD',
      billing_address: '1 Canary Wharf, London, UK EC1A 1BB',
      shipping_address: '1 Canary Wharf, Mailroom, London, UK EC1A 1BB',
      primary_contact_name: 'Michael Chang',
      primary_contact_email: 'm.chang@horizonfintech.com',
      primary_contact_phone: '+44 20 7946 0912',
      sales_rep_id: salesRepId
    }
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const res = await pool.query(
      `INSERT INTO customers (company_name, tier_id, currency_code, billing_address, shipping_address, primary_contact_name, primary_contact_email, primary_contact_phone, sales_rep_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [c.company_name, c.tier_id, c.currency_code, c.billing_address, c.shipping_address, c.primary_contact_name, c.primary_contact_email, c.primary_contact_phone, c.sales_rep_id]
    );
    createdCustomers.push(res.rows[0]);
  }
  console.log(`Inserted ${createdCustomers.length} enterprise customer accounts.`);

  // 3. Get or Insert Real Products
  const catRes = await pool.query("SELECT id, category_type FROM product_categories");
  const catMap = {};
  catRes.rows.forEach(ct => { catMap[ct.category_type] = ct.id; });

  const hwCat = catMap['hardware'] || '00000000-0000-0000-0000-000000000401';
  const svCat = catMap['service'] || '00000000-0000-0000-0000-000000000402';
  const subCat = catMap['subscription'] || '00000000-0000-0000-0000-000000000403';

  const productsData = [
    { sku: 'HW-AI-WRK', name: 'Enterprise AI Workstation Rack Server', description: 'Dual Xeon Scalable processors, 256GB ECC RAM, 4x NVIDIA RTX GPUs', category_id: hwCat, unit: 'unit', base_price: 8500.00, cost_price: 5200.00, tax_rate_pct: 18.0, is_promoted: true },
    { sku: 'HW-NET-100G', name: '100GbE Core Fiber Switch 32-Port', description: 'Ultra low latency enterprise backbone switch with redundant power supplies', category_id: hwCat, unit: 'unit', base_price: 4200.00, cost_price: 2600.00, tax_rate_pct: 18.0, is_promoted: false },
    { sku: 'HW-IOT-NODE', name: 'Industrial Wireless IoT Edge Sensor Node', description: 'Ruggedized IP67 IoT telemetry collector with 5G fallback', category_id: hwCat, unit: 'unit', base_price: 450.00, cost_price: 210.00, tax_rate_pct: 18.0, is_promoted: false },
    { sku: 'SV-MIG-500', name: 'Enterprise Cloud & Data Migration Service', description: 'End-to-end zero downtime database migration & architecture design', category_id: svCat, unit: 'project', base_price: 3500.00, cost_price: 2200.00, tax_rate_pct: 18.0, is_promoted: true },
    { sku: 'SV-SEC-300', name: 'Zero-Trust Cybersecurity Risk Audit', description: 'Comprehensive vulnerability scan, penetration testing & compliance report', category_id: svCat, unit: 'audit', base_price: 2800.00, cost_price: 1800.00, tax_rate_pct: 18.0, is_promoted: false },
    { sku: 'SUB-DF-ENT', name: 'DealFlow360 Unlimited Enterprise Suite', description: 'Full automated workflow, governance rules, analytics & portal seats', category_id: subCat, unit: 'user/month', base_price: 1200.00, cost_price: 150.00, tax_rate_pct: 18.0, is_promoted: true },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const res = await pool.query(
      `INSERT INTO products (sku, name, description, category_id, unit, base_price, cost_price, tax_rate_pct, is_promoted, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
       ON CONFLICT (sku) DO UPDATE SET base_price = EXCLUDED.base_price, updated_at = NOW()
       RETURNING *`,
      [p.sku, p.name, p.description, p.category_id, p.unit, p.base_price, p.cost_price, p.tax_rate_pct, p.is_promoted]
    );
    createdProducts.push(res.rows[0]);
  }
  console.log(`Inserted ${createdProducts.length} enterprise products & services.`);

  // 4. Create Quotations Proposals
  const pAi = createdProducts.find(p => p.sku === 'HW-AI-WRK') || createdProducts[0];
  const pNet = createdProducts.find(p => p.sku === 'HW-NET-100G') || createdProducts[1];
  const pMig = createdProducts.find(p => p.sku === 'SV-MIG-500') || createdProducts[3];
  const pSub = createdProducts.find(p => p.sku === 'SUB-DF-ENT') || createdProducts[5];

  const cTechCorp = createdCustomers.find(c => c.company_name.includes('TechCorp')) || createdCustomers[0];
  const cStarlight = createdCustomers.find(c => c.company_name.includes('Starlight')) || createdCustomers[1];
  const cVanguard = createdCustomers.find(c => c.company_name.includes('Vanguard')) || createdCustomers[2];
  const cQuantum = createdCustomers.find(c => c.company_name.includes('Quantum')) || createdCustomers[3];
  const cApex = createdCustomers.find(c => c.company_name.includes('Apex')) || createdCustomers[4];
  const cHorizon = createdCustomers.find(c => c.company_name.includes('Horizon')) || createdCustomers[5];

  const quotationsData = [
    {
      quote_number: 'QR-2026-7583',
      customer_id: cTechCorp.id,
      sales_rep_id: salesRepId,
      status: 'under_negotiation',
      has_open_neg: true,
      subtotal: 28823.50,
      order_discount_pct: 15.0,
      total_discount_amount: 4323.50,
      total_amount: 24500.00,
      lines: [
        { product_id: pAi.id, quantity: 2, unit_price: 8500.0, discount_pct: 10.0, line_total: 15300.0 },
        { product_id: pNet.id, quantity: 2, unit_price: 4200.0, discount_pct: 10.0, line_total: 7560.0 },
        { product_id: pMig.id, quantity: 1, unit_price: 3500.0, discount_pct: 0.0, line_total: 3500.0 }
      ],
      neg_message: 'Client Alex Mercer requested volume discount: "We are expanding data center nodes and require a 15% total package discount to proceed."'
    },
    {
      quote_number: 'Q-2026-8802',
      customer_id: cStarlight.id,
      sales_rep_id: salesRepId,
      status: 'pending_approval',
      has_open_neg: true,
      subtotal: 53500.00,
      order_discount_pct: 20.0,
      total_discount_amount: 10700.00,
      total_amount: 42800.00,
      lines: [
        { product_id: pAi.id, quantity: 4, unit_price: 8500.0, discount_pct: 15.0, line_total: 28900.0 },
        { product_id: pSub.id, quantity: 12, unit_price: 1200.0, discount_pct: 10.0, line_total: 12960.0 }
      ],
      neg_message: 'Dr. Elena Vance requested 20% discount for multi-year clinical research compute nodes. Requires Sales Manager + Finance Ops approval.'
    },
    {
      quote_number: 'Q-2026-8803',
      customer_id: cVanguard.id,
      sales_rep_id: salesRepId,
      status: 'sent_to_customer',
      has_open_neg: false,
      subtotal: 21000.00,
      order_discount_pct: 10.0,
      total_discount_amount: 2100.00,
      total_amount: 18900.00,
      lines: [
        { product_id: pNet.id, quantity: 4, unit_price: 4200.0, discount_pct: 10.0, line_total: 15120.0 },
        { product_id: pMig.id, quantity: 1, unit_price: 3500.0, discount_pct: 0.0, line_total: 3500.0 }
      ]
    },
    {
      quote_number: 'Q-2026-8804',
      customer_id: cQuantum.id,
      sales_rep_id: salesRepId,
      status: 'confirmed',
      has_open_neg: false,
      subtotal: 35454.00,
      order_discount_pct: 12.0,
      total_discount_amount: 4254.00,
      total_amount: 31200.00,
      lines: [
        { product_id: pAi.id, quantity: 3, unit_price: 8500.0, discount_pct: 10.0, line_total: 22950.0 },
        { product_id: pSub.id, quantity: 6, unit_price: 1200.0, discount_pct: 10.0, line_total: 6480.0 }
      ]
    },
    {
      quote_number: 'Q-2026-8805',
      customer_id: cApex.id,
      sales_rep_id: salesRepId,
      status: 'confirmed',
      has_open_neg: false,
      subtotal: 16421.00,
      order_discount_pct: 5.0,
      total_discount_amount: 821.00,
      total_amount: 15600.00,
      lines: [
        { product_id: pNet.id, quantity: 3, unit_price: 4200.0, discount_pct: 5.0, line_total: 11970.0 },
        { product_id: pMig.id, quantity: 1, unit_price: 3500.0, discount_pct: 0.0, line_total: 3500.0 }
      ]
    },
    {
      quote_number: 'Q-2026-8806',
      customer_id: cHorizon.id,
      sales_rep_id: salesRepId,
      status: 'approved',
      has_open_neg: false,
      subtotal: 73333.00,
      order_discount_pct: 25.0,
      total_discount_amount: 18333.00,
      total_amount: 55000.00,
      lines: [
        { product_id: pAi.id, quantity: 6, unit_price: 8500.0, discount_pct: 20.0, line_total: 40800.0 },
        { product_id: pNet.id, quantity: 4, unit_price: 4200.0, discount_pct: 15.0, line_total: 14280.0 }
      ]
    }
  ];

  for (const q of quotationsData) {
    const qRes = await pool.query(
      `INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, subtotal, order_level_discount_pct, total_discount_amount, total_amount, currency_code, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'USD', NOW() - INTERVAL '1 day', NOW())
       ON CONFLICT (quote_number) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
       RETURNING *`,
      [q.quote_number, q.customer_id, q.sales_rep_id, q.status, q.subtotal, q.order_discount_pct, q.total_discount_amount, q.total_amount]
    );

    const quoteRow = qRes.rows[0];

    // Insert quotation lines with line_discount_ceiling_pct = 15.00
    if (q.lines) {
      for (const line of q.lines) {
        await pool.query(
          `INSERT INTO quotation_lines (quotation_id, product_id, quantity, unit_price, discount_pct, line_discount_ceiling_pct, line_total, created_at)
           VALUES ($1, $2, $3, $4, $5, 15.00, $6, NOW())`,
          [quoteRow.id, line.product_id, line.quantity, line.unit_price, line.discount_pct, line.line_total]
        );
      }
    }

    // Insert negotiation request if counter offer
    if (q.has_open_neg && q.neg_message) {
      await pool.query(
        `INSERT INTO negotiation_requests (quotation_id, customer_user_id, request_type, message, proposed_discount_pct, status, created_at)
         VALUES ($1, $2, 'counter_discount', $3, $4, 'open', NOW())`,
        [quoteRow.id, custUserId, q.neg_message, q.order_discount_pct]
      );
    }

    // Create connected Invoices & Fulfillment orders for confirmed quotes
    if (q.status === 'confirmed') {
      const invNum = `INV-2026-${quoteRow.quote_number.split('-')[2]}`;
      const isFull = q.total_amount > 20000;
      const amountPaid = isFull ? q.total_amount : Math.round(q.total_amount / 2);
      const invStatus = isFull ? 'paid' : 'partially_paid';

      await pool.query(
        `INSERT INTO invoices (quotation_id, invoice_number, invoice_type, amount_due, amount_paid, status, issued_at, due_date, created_at)
         VALUES ($1, $2, 'standard', $3, $4, $5, NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 days', NOW())
         ON CONFLICT (invoice_number) DO NOTHING`,
        [quoteRow.id, invNum, q.total_amount, amountPaid, invStatus]
      );

      await pool.query(
        `INSERT INTO fulfillment_orders (quotation_id, status, promised_delivery_date, created_at, updated_at)
         VALUES ($1, $2, NOW() + INTERVAL '5 days', NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [quoteRow.id, isFull ? 'partially_fulfilled' : 'fulfilled']
      );
    }
  }

  console.log(`Inserted ${quotationsData.length} real-world quotations, lines, invoices & fulfillment orders.`);
  console.log('✅ Real-world enterprise B2B seed data populated successfully!');

  await pool.end();
}

main().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
