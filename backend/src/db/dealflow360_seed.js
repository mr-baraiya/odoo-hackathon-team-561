// dev seed data (Simple Numbering Scheme: 101=Users, 201=Tiers, 301=Customers, 401=Categories, 501=Products, 601=Plans, 701=Warehouses, 801=Stock, 901=Upsells, 1101=Quotes)

const crypto = require('crypto');

function generateUUID() {
  return crypto.randomUUID ? crypto.randomUUID() : `uuid_${Math.random().toString(36).substr(2, 9)}`;
}

// 1. Users (Series 100)
const USERS = [
  {
    id: '101',
    full_name: 'Sales Representative',
    email: 'baraiyavishalbhai32@gmail.com',
    phone_number: '+917383359679',
    role: 'sales_rep',
    password_hash: '$2b$10$rBTHhR2f1N/0Vvv/YTNw.eoIz9vM630v/.SzZL7T3UB3HmCoMjC1i',
    customer_id: null,
    is_active: true,
  },
  {
    id: '102',
    full_name: 'Sales Manager',
    email: 'singhsaurabh43431@gmail.com',
    phone_number: '+919508461241',
    role: 'sales_manager',
    password_hash: '$2b$10$rBTHhR2f1N/0Vvv/YTNw.eoIz9vM630v/.SzZL7T3UB3HmCoMjC1i',
    customer_id: null,
    is_active: true,
  },
  {
    id: '103',
    full_name: 'Finance Operations',
    email: 'baraiyavijaybhai32@gmail.com',
    phone_number: '+919624994057',
    role: 'finance_ops',
    password_hash: '$2b$10$rBTHhR2f1N/0Vvv/YTNw.eoIz9vM630v/.SzZL7T3UB3HmCoMjC1i',
    customer_id: null,
    is_active: true,
  },
  {
    id: '104',
    full_name: 'Demo Customer',
    email: 'mayankpathar49@gmail.com',
    phone_number: '+919274488638',
    role: 'customer',
    password_hash: '$2b$10$rBTHhR2f1N/0Vvv/YTNw.eoIz9vM630v/.SzZL7T3UB3HmCoMjC1i',
    magic_link_token: 'magic_acme_token_99',
    magic_link_expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    customer_id: '301',
    is_active: true,
  },
  {
    id: '105',
    full_name: 'System Administrator',
    email: 'vvbaraiya32@gmail.com',
    phone_number: '+917046537550',
    role: 'admin',
    password_hash: '$2b$10$rBTHhR2f1N/0Vvv/YTNw.eoIz9vM630v/.SzZL7T3UB3HmCoMjC1i',
    customer_id: null,
    is_active: true,
  },
];

// 2. Customer Tiers (Series 200)
const CUSTOMER_TIERS = [
  { id: '201', code: 'bronze', label: 'Bronze Partner', default_discount_ceiling_pct: 5.0 },
  { id: '202', code: 'silver', label: 'Silver Partner', default_discount_ceiling_pct: 10.0 },
  { id: '203', code: 'gold', label: 'Gold Enterprise', default_discount_ceiling_pct: 15.0 },
  { id: '204', code: 'platinum', label: 'Platinum Global', default_discount_ceiling_pct: 25.0 },
];

// 3. Customers (Series 300)
const CUSTOMERS = [
  {
    id: '301',
    company_name: 'Acme Corporation',
    tier_id: '203',
    tier_code: 'gold',
    currency_code: 'USD',
    billing_address: '100 Acme Way, Suite 400, New York, NY',
    shipping_address: '100 Acme Way, Warehouse Dock B, New York, NY',
    primary_contact_name: 'Jane Doe',
    primary_contact_email: 'jane.doe@acme.com',
    primary_contact_phone: '+1 555-0192',
    sales_rep_id: '101',
  },
  {
    id: '302',
    company_name: 'Beta Industries Ltd',
    tier_id: '202',
    tier_code: 'silver',
    currency_code: 'USD',
    billing_address: '45 Tech Plaza, Austin, TX',
    shipping_address: '45 Tech Plaza, Austin, TX',
    primary_contact_name: 'Robert Smith',
    primary_contact_email: 'r.smith@betaind.com',
    primary_contact_phone: '+1 555-0344',
    sales_rep_id: '101',
  },
  {
    id: '303',
    company_name: 'Cyberdyne Systems',
    tier_id: '204',
    tier_code: 'platinum',
    currency_code: 'USD',
    billing_address: '800 Skynet Blvd, San Jose, CA',
    shipping_address: '800 Skynet Blvd, San Jose, CA',
    primary_contact_name: 'Miles Dyson',
    primary_contact_email: 'dyson@cyberdyne.io',
    primary_contact_phone: '+1 555-0999',
    sales_rep_id: '101',
  },
  {
    id: '304',
    company_name: 'Nexus Logistics Group',
    tier_id: '203',
    tier_code: 'gold',
    currency_code: 'USD',
    billing_address: '12 Freight Lane, Chicago, IL',
    shipping_address: '12 Freight Lane, Chicago, IL',
    primary_contact_name: 'Marcus Vance',
    primary_contact_email: 'marcus@nexuslogistics.com',
    primary_contact_phone: '+1 555-0811',
    sales_rep_id: '101',
  },
];

// 4. Product Categories (Series 400)
const PRODUCT_CATEGORIES = [
  { id: '401', name: 'Hardware', category_type: 'hardware', discount_ceiling_pct: 15.0 },
  { id: '402', name: 'Services', category_type: 'service', discount_ceiling_pct: 10.0 },
  { id: '403', name: 'Subscriptions', category_type: 'subscription', discount_ceiling_pct: 20.0 },
];

// 5. Products Catalog (Series 500)
const PRODUCTS = [
  {
    id: '501',
    sku: 'HW-SRV-01',
    name: 'Enterprise Dual-Socket Rack Server',
    description: 'High performance enterprise rack server with 128GB RAM & NVMe SSD RAID',
    category_id: '401',
    category_name: 'Hardware',
    category_type: 'hardware',
    unit: 'unit',
    base_price: 4500.0,
    cost_price: 2700.0,
    tax_rate_pct: 18.0,
    is_active: true,
    is_promoted: true,
  },
  {
    id: '502',
    sku: 'HW-LAP-02',
    name: 'Workstation Laptop Pro 16"',
    description: 'Mobile engineering workstation with 4K display and dedicated GPU',
    category_id: '401',
    category_name: 'Hardware',
    category_type: 'hardware',
    unit: 'unit',
    base_price: 1800.0,
    cost_price: 1100.0,
    tax_rate_pct: 18.0,
    is_active: true,
    is_promoted: false,
  },
  {
    id: '503',
    sku: 'SV-DEP-01',
    name: 'Onsite Deployment & Integration Service',
    description: 'Professional setup, network configuration and system validation by certified engineer',
    category_id: '402',
    category_name: 'Services',
    category_type: 'service',
    unit: 'project',
    base_price: 1200.0,
    cost_price: 950.0,
    tax_rate_pct: 18.0,
    is_active: true,
    is_promoted: false,
  },
  {
    id: '504',
    sku: 'SUB-DF-01',
    name: 'DealFlow360 Enterprise SaaS Subscription',
    description: 'Full sales ops automation, predictive analytics & customer portal access',
    category_id: '403',
    category_name: 'Subscriptions',
    category_type: 'subscription',
    unit: 'user/month',
    base_price: 350.0,
    cost_price: 50.0,
    tax_rate_pct: 18.0,
    is_active: true,
    is_promoted: true,
  },
];

// 6. Subscription Plans (Series 600)
const SUBSCRIPTION_PLANS = [
  {
    id: '601',
    product_id: '504',
    name: 'Monthly Enterprise Plan',
    cycle: 'monthly',
    price_per_cycle: 350.0,
    proration_enabled: true,
    cancellation_notice_days: 7,
    partial_refund_allowed: true,
  },
  {
    id: '602',
    product_id: '504',
    name: 'Annual Enterprise Plan (Save 15%)',
    cycle: 'yearly',
    price_per_cycle: 3570.0,
    proration_enabled: true,
    cancellation_notice_days: 30,
    partial_refund_allowed: true,
  },
];

// 7. Warehouses (Series 700) & Stock (Series 800)
const WAREHOUSES = [
  { id: '701', name: 'Main Central Warehouse', location: 'Chicago, IL', shipping_cost_weight: 1.0, is_active: true },
  { id: '702', name: 'East Coast Depot', location: 'Newark, NJ', shipping_cost_weight: 1.2, is_active: true },
  { id: '703', name: 'West Coast Logistics Hub', location: 'Reno, NV', shipping_cost_weight: 1.5, is_active: true },
];

const WAREHOUSE_STOCK = [
  { id: '801', warehouse_id: '701', product_id: '501', quantity_on_hand: 5, reorder_threshold: 2 },
  { id: '802', warehouse_id: '702', product_id: '501', quantity_on_hand: 3, reorder_threshold: 1 },
  { id: '803', warehouse_id: '703', product_id: '501', quantity_on_hand: 0, reorder_threshold: 1 },

  { id: '804', warehouse_id: '701', product_id: '502', quantity_on_hand: 12, reorder_threshold: 5 },
  { id: '805', warehouse_id: '702', product_id: '502', quantity_on_hand: 20, reorder_threshold: 5 },
  { id: '806', warehouse_id: '703', product_id: '502', quantity_on_hand: 15, reorder_threshold: 5 },
];

// 9. Upsell Rules (Series 900)
const UPSELL_RULES = [
  {
    id: '901',
    base_product_id: '501',
    suggested_product_id: '503',
    co_purchase_score: 0.92,
    min_margin_pct_required: 15.0,
    is_active: true,
  },
  {
    id: '902',
    base_product_id: '501',
    suggested_product_id: '504',
    co_purchase_score: 0.85,
    min_margin_pct_required: 20.0,
    is_active: true,
  },
];

// 11. Quotations (Series 1100) & Lines (Series 1200) & Approvals (Series 1300)
let QUOTATIONS = [
  {
    id: '1101',
    quote_number: 'Q-2026-101',
    customer_id: '301',
    customer_name: 'Acme Corporation',
    customer_tier_code: 'gold',
    sales_rep_id: '101',
    sales_rep_name: 'Sales Representative',
    status: 'pending_approval',
    blended_risk_score: 18.5,
    order_level_discount_pct: 0,
    subtotal: 7500.0,
    total_discount_amount: 1110.0,
    total_amount: 6390.0,
    currency_code: 'USD',
    last_activity_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    lines: [
      {
        id: '1201',
        quotation_id: '1101',
        product_id: '501',
        product_name: 'Enterprise Dual-Socket Rack Server',
        quantity: 1,
        unit_price: 4500.0,
        cost_price: 2700.0,
        discount_pct: 12.0,
        line_discount_ceiling_pct: 15.0,
        line_total: 3960.0,
        margin_pct: 31.82,
        is_recurring: false,
        added_via_upsell: false,
      },
      {
        id: '1202',
        quotation_id: '1101',
        product_id: '503',
        product_name: 'Onsite Deployment & Integration Service',
        quantity: 2,
        unit_price: 1200.0,
        cost_price: 950.0,
        discount_pct: 18.0,
        line_discount_ceiling_pct: 10.0,
        line_total: 1968.0,
        margin_pct: 3.45,
        is_recurring: false,
        added_via_upsell: true,
      },
      {
        id: '1203',
        quotation_id: '1101',
        product_id: '504',
        subscription_plan_id: '601',
        product_name: 'DealFlow360 Enterprise SaaS Subscription',
        quantity: 2,
        unit_price: 350.0,
        cost_price: 50.0,
        discount_pct: 10.0,
        line_discount_ceiling_pct: 20.0,
        line_total: 630.0,
        margin_pct: 84.13,
        is_recurring: true,
        subscription_status: 'active',
        added_via_upsell: false,
      },
    ],
    approvals: [
      { id: '1301', quotation_id: '1101', approval_level: 'sales_manager', sequence_order: 1, action: null },
      { id: '1302', quotation_id: '1101', approval_level: 'finance_ops', sequence_order: 2, action: null },
    ],
  },
  {
    id: '1102',
    quote_number: 'Q-2026-102',
    customer_id: '302',
    customer_name: 'Beta Industries Ltd',
    customer_tier_code: 'silver',
    sales_rep_id: '101',
    sales_rep_name: 'Sales Representative',
    status: 'draft',
    blended_risk_score: 0.0,
    order_level_discount_pct: 0,
    subtotal: 3600.0,
    total_discount_amount: 180.0,
    total_amount: 3420.0,
    currency_code: 'USD',
    last_activity_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    lines: [
      {
        id: '1204',
        quotation_id: '1102',
        product_id: '502',
        product_name: 'Workstation Laptop Pro 16"',
        quantity: 2,
        unit_price: 1800.0,
        cost_price: 1100.0,
        discount_pct: 5.0,
        line_discount_ceiling_pct: 15.0,
        line_total: 3420.0,
        margin_pct: 35.67,
        is_recurring: false,
        added_via_upsell: false,
      },
    ],
    approvals: [],
  },
];

let AUDIT_LOGS = [];
let NEGOTIATION_REQUESTS = [];

// 14. Deal Health Alerts (Series 1400)
let DEAL_HEALTH_ALERTS = [
  {
    id: '1401',
    quotation_id: '1102',
    quote_number: 'Q-2026-102',
    alert_type: 'stalled_deal',
    details: { days_inactive: 9, rep_name: 'Sales Representative', customer_name: 'Beta Industries Ltd' },
    status: 'open',
    triggered_at: new Date().toISOString(),
  },
];

module.exports = {
  generateUUID,
  CUSTOMER_TIERS,
  CUSTOMERS,
  USERS,
  PRODUCT_CATEGORIES,
  PRODUCTS,
  SUBSCRIPTION_PLANS,
  WAREHOUSES,
  WAREHOUSE_STOCK,
  UPSELL_RULES,
  QUOTATIONS,
  AUDIT_LOGS,
  NEGOTIATION_REQUESTS,
  DEAL_HEALTH_ALERTS,
};
