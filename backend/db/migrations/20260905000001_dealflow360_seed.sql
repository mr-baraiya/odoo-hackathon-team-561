-- migrate:up
-- dealflow360 seed data migration

-- 1. Users (Series 100)
INSERT INTO users (
    id,
    full_name,
    email,
    phone_number,
    role,
    password_hash,
    is_active
)
VALUES
(
    '00000000-0000-0000-0000-000000000101',
    'Sales Representative',
    'baraiyavishalbhai32@gmail.com',
    '+917383359679',
    'sales_rep',
    crypt('Darshan@1234', gen_salt('bf')),
    TRUE
),
(
    '00000000-0000-0000-0000-000000000102',
    'Sales Manager',
    'singhsaurabh43431@gmail.com',
    '+919508461241',
    'sales_manager',
    crypt('Darshan@1234', gen_salt('bf')),
    TRUE
),
(
    '00000000-0000-0000-0000-000000000103',
    'Finance Operations',
    'baraiyavijaybhai32@gmail.com',
    '+919624994057',
    'finance_ops',
    crypt('Darshan@1234', gen_salt('bf')),
    TRUE
),
(
    '00000000-0000-0000-0000-000000000104',
    'Demo Customer',
    'mayankpathar49@gmail.com',
    '+919274488638',
    'customer',
    crypt('Darshan@1234', gen_salt('bf')),
    TRUE
),
(
    '00000000-0000-0000-0000-000000000105',
    'System Administrator',
    'vvbaraiya32@gmail.com',
    '+917046537550',
    'admin',
    crypt('Darshan@1234', gen_salt('bf')),
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- 2. Customer Tiers (Series 200)
INSERT INTO customer_tiers (id, code, label, default_discount_ceiling_pct) VALUES
('00000000-0000-0000-0000-000000000201', 'bronze', 'Bronze Partner', 5.00),
('00000000-0000-0000-0000-000000000202', 'silver', 'Silver Partner', 10.00),
('00000000-0000-0000-0000-000000000203', 'gold', 'Gold Enterprise', 15.00),
('00000000-0000-0000-0000-000000000204', 'platinum', 'Platinum Global', 25.00) ON CONFLICT (code) DO NOTHING;

-- 3. Customers (Series 300)
INSERT INTO customers (id, company_name, tier_id, currency_code, billing_address, shipping_address, primary_contact_name, primary_contact_email, primary_contact_phone, sales_rep_id) VALUES
('00000000-0000-0000-0000-000000000301', 'Acme Corporation', '00000000-0000-0000-0000-000000000203', 'USD', '100 Acme Way, Suite 400, New York, NY', '100 Acme Way, Warehouse Dock B, New York, NY', 'Jane Doe', 'jane.doe@acme.com', '+1 555-0192', '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000000302', 'Beta Industries Ltd', '00000000-0000-0000-0000-000000000202', 'USD', '45 Tech Plaza, Austin, TX', '45 Tech Plaza, Austin, TX', 'Robert Smith', 'r.smith@betaind.com', '+1 555-0344', '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000000303', 'Cyberdyne Systems', '00000000-0000-0000-0000-000000000204', 'USD', '800 Skynet Blvd, San Jose, CA', '800 Skynet Blvd, San Jose, CA', 'Miles Dyson', 'dyson@cyberdyne.io', '+1 555-0999', '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000000304', 'Nexus Logistics Group', '00000000-0000-0000-0000-000000000203', 'USD', '12 Freight Lane, Chicago, IL', '12 Freight Lane, Chicago, IL', 'Marcus Vance', 'marcus@nexuslogistics.com', '+1 555-0811', '00000000-0000-0000-0000-000000000101') ON CONFLICT (id) DO NOTHING;

UPDATE users SET customer_id = '00000000-0000-0000-0000-000000000301' WHERE id = '00000000-0000-0000-0000-000000000104';

-- 4. Product Categories (Series 400)
INSERT INTO product_categories (id, name, category_type, discount_ceiling_pct) VALUES
('00000000-0000-0000-0000-000000000401', 'Hardware', 'hardware', 15.00),
('00000000-0000-0000-0000-000000000402', 'Services', 'service', 10.00),
('00000000-0000-0000-0000-000000000403', 'Subscriptions', 'subscription', 20.00) ON CONFLICT (name) DO NOTHING;

-- 5. Products Catalog (Series 500)
INSERT INTO products (id, sku, name, description, category_id, unit, base_price, cost_price, tax_rate_pct, is_promoted) VALUES
('00000000-0000-0000-0000-000000000501', 'HW-SRV-01', 'Enterprise Dual-Socket Rack Server', 'High performance enterprise server with 128GB RAM & NVMe SSD RAID', '00000000-0000-0000-0000-000000000401', 'unit', 4500.00, 2700.00, 18.00, true),
('00000000-0000-0000-0000-000000000502', 'HW-LAP-02', 'Workstation Laptop Pro 16"', 'Mobile engineering workstation with 4K display and dedicated GPU', '00000000-0000-0000-0000-000000000401', 'unit', 1800.00, 1100.00, 18.00, false),
('00000000-0000-0000-0000-000000000503', 'SV-DEP-01', 'Onsite Deployment Service', 'Professional setup, network configuration and validation', '00000000-0000-0000-0000-000000000402', 'project', 1200.00, 950.00, 18.00, false),
('00000000-0000-0000-0000-000000000504', 'SUB-DF-01', 'DealFlow360 Enterprise SaaS Subscription', 'Full sales ops automation, predictive analytics & customer portal access', '00000000-0000-0000-0000-000000000403', 'user/month', 350.00, 50.00, 18.00, true) ON CONFLICT (sku) DO NOTHING;

-- 6. Subscription Plans (Series 600)
INSERT INTO subscription_plans (id, product_id, name, cycle, price_per_cycle, proration_enabled, cancellation_notice_days, partial_refund_allowed) VALUES
('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000504', 'Monthly Enterprise Plan', 'monthly', 350.00, true, 7, true),
('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000504', 'Annual Enterprise Plan (Save 15%)', 'yearly', 3570.00, true, 30, true) ON CONFLICT (id) DO NOTHING;

-- 7. Warehouses (Series 700)
INSERT INTO warehouses (id, name, location, shipping_cost_weight) VALUES
('00000000-0000-0000-0000-000000000701', 'Main Central Warehouse', 'Chicago, IL', 1.000),
('00000000-0000-0000-0000-000000000702', 'East Coast Depot', 'Newark, NJ', 1.200),
('00000000-0000-0000-0000-000000000703', 'West Coast Logistics Hub', 'Reno, NV', 1.500) ON CONFLICT (id) DO NOTHING;

-- 8. Warehouse Stock (Series 800)
INSERT INTO warehouse_stock (id, warehouse_id, product_id, quantity_on_hand, reorder_threshold) VALUES
('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000501', 5, 2),
('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000501', 3, 1),
('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000502', 12, 5),
('00000000-0000-0000-0000-000000000804', '00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000502', 20, 5) ON CONFLICT (warehouse_id, product_id) DO NOTHING;

-- 9. Upsell Rules (Series 900)
INSERT INTO upsell_rules (id, base_product_id, suggested_product_id, co_purchase_score, min_margin_pct_required) VALUES
('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000503', 0.920, 15.00),
('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000504', 0.850, 20.00) ON CONFLICT (id) DO NOTHING;

-- 10. Approval Chain Rules (Series 1000)
INSERT INTO approval_chain_rules (id, min_risk_score, max_risk_score, required_levels) VALUES
('00000000-0000-0000-0000-000000001001', 15.00, 25.00, ARRAY['sales_manager'::approval_level]),
('00000000-0000-0000-0000-000000001002', 25.00, NULL, ARRAY['sales_manager'::approval_level, 'finance_ops'::approval_level]) ON CONFLICT (id) DO NOTHING;

-- 11. Quotations (Series 1100)
INSERT INTO quotations (id, quote_number, customer_id, sales_rep_id, status, blended_risk_score, subtotal, total_discount_amount, total_amount) VALUES
('00000000-0000-0000-0000-000000001101', 'Q-2026-101', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101', 'pending_approval', 18.50, 7500.00, 1110.00, 6390.00),
('00000000-0000-0000-0000-000000001102', 'Q-2026-102', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000101', 'draft', 0.00, 3600.00, 180.00, 3420.00) ON CONFLICT (quote_number) DO NOTHING;

-- 12. Quotation Lines (Series 1200)
INSERT INTO quotation_lines (id, quotation_id, product_id, quantity, unit_price, discount_pct, line_discount_ceiling_pct, line_total, margin_pct, added_via_upsell, is_recurring) VALUES
('00000000-0000-0000-0000-000000001201', '00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000501', 1, 4500.00, 12.00, 15.00, 3960.00, 31.82, false, false),
('00000000-0000-0000-0000-000000001202', '00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000000503', 2, 1200.00, 18.00, 10.00, 1968.00, 3.45, true, false),
('00000000-0000-0000-0000-000000001203', '00000000-0000-0000-0000-000000001102', '00000000-0000-0000-0000-000000000502', 2, 1800.00, 5.00, 15.00, 3420.00, 35.67, false, false) ON CONFLICT (id) DO NOTHING;

-- 13. Quotation Approvals (Series 1300)
INSERT INTO quotation_approvals (id, quotation_id, approval_level, sequence_order) VALUES
('00000000-0000-0000-0000-000000001301', '00000000-0000-0000-0000-000000001101', 'sales_manager', 1),
('00000000-0000-0000-0000-000000001302', '00000000-0000-0000-0000-000000001101', 'finance_ops', 2) ON CONFLICT (id) DO NOTHING;

-- 14. Deal Health Alerts (Series 1400)
INSERT INTO deal_health_alerts (id, quotation_id, alert_type, details, status) VALUES
('00000000-0000-0000-0000-000000001401', '00000000-0000-0000-0000-000000001102', 'stalled_deal', '{"days_inactive": 9, "rep_name": "Sales Representative", "customer_name": "Beta Industries Ltd"}', 'open') ON CONFLICT (id) DO NOTHING;

-- migrate:down
DELETE FROM deal_health_alerts WHERE id = '00000000-0000-0000-0000-000000001401';
DELETE FROM quotation_approvals WHERE quotation_id IN ('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000001102');
DELETE FROM quotation_lines WHERE quotation_id IN ('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000001102');
DELETE FROM quotations WHERE id IN ('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000001102');
DELETE FROM approval_chain_rules WHERE id IN ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000001002');
DELETE FROM upsell_rules WHERE id IN ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000902');
DELETE FROM warehouse_stock WHERE warehouse_id IN ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000703');
DELETE FROM warehouses WHERE id IN ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000703');
DELETE FROM subscription_plans WHERE id IN ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000602');
DELETE FROM products WHERE id IN ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000504');
DELETE FROM product_categories WHERE id IN ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000403');
DELETE FROM customers WHERE id IN ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000304');
DELETE FROM customer_tiers WHERE id IN ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000204');
DELETE FROM users WHERE id IN ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000105');
