-- migrate:up
-- dealflow360 initial full schema migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users and auth
CREATE TYPE user_role AS ENUM (
    'sales_rep',
    'sales_manager',
    'finance_ops',
    'customer',
    'admin'
);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    phone_number        VARCHAR(50),
    role                user_role NOT NULL,
    password_hash       TEXT,
    magic_link_token    TEXT,
    magic_link_expires_at TIMESTAMPTZ,
    customer_id         UUID,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- customer tiers and accounts
CREATE TYPE customer_tier_code AS ENUM ('bronze', 'silver', 'gold', 'platinum');

CREATE TABLE customer_tiers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                customer_tier_code NOT NULL UNIQUE,
    label               VARCHAR(50) NOT NULL,
    default_discount_ceiling_pct NUMERIC(5,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name    VARCHAR(200) NOT NULL,
    tier_id         UUID NOT NULL REFERENCES customer_tiers(id),
    currency_code   CHAR(3) NOT NULL DEFAULT 'USD',
    billing_address TEXT,
    shipping_address TEXT,
    primary_contact_name  VARCHAR(150),
    primary_contact_email VARCHAR(150),
    primary_contact_phone VARCHAR(50),
    sales_rep_id    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- products, categories and price lists
CREATE TYPE product_category_type AS ENUM ('hardware', 'service', 'subscription', 'other');

CREATE TABLE product_categories (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100) NOT NULL UNIQUE,
    category_type       product_category_type NOT NULL,
    discount_ceiling_pct NUMERIC(5,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku             VARCHAR(60) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category_id     UUID NOT NULL REFERENCES product_categories(id),
    unit            VARCHAR(30) NOT NULL DEFAULT 'unit',
    base_price      NUMERIC(14,2) NOT NULL,
    cost_price      NUMERIC(14,2) NOT NULL,
    tax_rate_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_promoted     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_variant_attributes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name  VARCHAR(60) NOT NULL,
    value           VARCHAR(60) NOT NULL,
    extra_price     NUMERIC(14,2) NOT NULL DEFAULT 0,
    UNIQUE (product_id, attribute_name, value)
);

CREATE TABLE price_lists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    tier_id         UUID REFERENCES customer_tiers(id),
    currency_code   CHAR(3) NOT NULL DEFAULT 'USD',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_list_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_list_id   UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price           NUMERIC(14,2) NOT NULL,
    UNIQUE (price_list_id, product_id)
);

-- approval chain rules
CREATE TYPE approval_level AS ENUM ('sales_manager', 'finance_ops');

CREATE TABLE approval_chain_rules (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_risk_score      NUMERIC(6,2) NOT NULL,
    max_risk_score      NUMERIC(6,2),
    required_levels     approval_level[] NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- warehouses and inventory
CREATE TABLE warehouses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100) NOT NULL,
    location            VARCHAR(200),
    shipping_cost_weight NUMERIC(6,3) NOT NULL DEFAULT 1.0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE warehouse_stock (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id        UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_on_hand    INTEGER NOT NULL DEFAULT 0,
    reorder_threshold   INTEGER NOT NULL DEFAULT 0,
    replenishment_lead_days INTEGER NOT NULL DEFAULT 0,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (warehouse_id, product_id)
);

-- subscription plans
CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');

CREATE TABLE subscription_plans (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id          UUID NOT NULL REFERENCES products(id),
    name                VARCHAR(150) NOT NULL,
    cycle               billing_cycle NOT NULL,
    price_per_cycle     NUMERIC(14,2) NOT NULL,
    proration_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    cancellation_notice_days INTEGER NOT NULL DEFAULT 0,
    partial_refund_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- upsell rules
CREATE TABLE upsell_rules (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_product_id     UUID NOT NULL REFERENCES products(id),
    suggested_product_id UUID NOT NULL REFERENCES products(id),
    co_purchase_score   NUMERIC(6,3) NOT NULL DEFAULT 0,
    min_margin_pct_required NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (base_product_id <> suggested_product_id)
);

-- quotations and quote items
CREATE TYPE quotation_status AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'rejected',
    'sent_to_customer',
    'under_negotiation',
    'confirmed',
    'in_fulfillment',
    'fulfilled',
    'cancelled'
);

CREATE TABLE quotations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number        VARCHAR(30) NOT NULL UNIQUE,
    customer_id         UUID NOT NULL REFERENCES customers(id),
    sales_rep_id        UUID NOT NULL REFERENCES users(id),
    price_list_id       UUID REFERENCES price_lists(id),
    status              quotation_status NOT NULL DEFAULT 'draft',
    blended_risk_score  NUMERIC(6,2) NOT NULL DEFAULT 0,
    order_level_discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
    subtotal            NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(14,2) NOT NULL DEFAULT 0,
    currency_code       CHAR(3) NOT NULL DEFAULT 'USD',
    confirmed_by_user_id UUID REFERENCES users(id),
    confirmed_at        TIMESTAMPTZ,
    confirmation_triggered_reapproval BOOLEAN NOT NULL DEFAULT FALSE,
    last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE subscription_line_status AS ENUM ('active', 'paused', 'cancelled');

CREATE TABLE quotation_lines (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id        UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id          UUID NOT NULL REFERENCES products(id),
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    quantity            NUMERIC(12,2) NOT NULL DEFAULT 1,
    unit_price          NUMERIC(14,2) NOT NULL,
    discount_pct        NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_discount_ceiling_pct NUMERIC(5,2) NOT NULL,
    line_total          NUMERIC(14,2) NOT NULL,
    margin_pct          NUMERIC(5,2),
    added_via_upsell    BOOLEAN NOT NULL DEFAULT FALSE,
    is_recurring        BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_status subscription_line_status,
    cancelled_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_recurring_has_status CHECK (
        (is_recurring = TRUE AND subscription_status IS NOT NULL) OR
        (is_recurring = FALSE AND subscription_status IS NULL)
    )
);

-- approvals and audit history
CREATE TYPE approval_action AS ENUM ('approved', 'rejected', 'returned_for_revision');

CREATE TABLE quotation_approvals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id        UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    approval_level      approval_level NOT NULL,
    sequence_order      INTEGER NOT NULL,
    assigned_to_user_id UUID REFERENCES users(id),
    action              approval_action,
    reason              TEXT,
    acted_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           UUID NOT NULL,
    action              VARCHAR(50) NOT NULL,
    performed_by_user_id UUID REFERENCES users(id),
    reason              TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- fulfillment orders and splits
CREATE TYPE fulfillment_status AS ENUM (
    'pending', 'partially_fulfilled', 'fulfilled', 'backordered'
);

CREATE TABLE fulfillment_orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id        UUID NOT NULL REFERENCES quotations(id),
    status              fulfillment_status NOT NULL DEFAULT 'pending',
    is_manual_override  BOOLEAN NOT NULL DEFAULT FALSE,
    promised_delivery_date DATE,
    actual_delivery_date   DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fulfillment_splits (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fulfillment_order_id UUID NOT NULL REFERENCES fulfillment_orders(id) ON DELETE CASCADE,
    quotation_line_id   UUID NOT NULL REFERENCES quotation_lines(id),
    warehouse_id        UUID NOT NULL REFERENCES warehouses(id),
    quantity_fulfilled  NUMERIC(12,2) NOT NULL,
    quantity_backordered NUMERIC(12,2) NOT NULL DEFAULT 0,
    backorder_consolidated BOOLEAN NOT NULL DEFAULT FALSE,
    backorder_consolidated_at TIMESTAMPTZ,
    estimated_shipment_cost NUMERIC(14,2),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- invoices, payments and subscription billing schedules
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void');

CREATE TABLE invoices (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id        UUID NOT NULL REFERENCES quotations(id),
    invoice_number      VARCHAR(30) NOT NULL UNIQUE,
    invoice_type        VARCHAR(20) NOT NULL DEFAULT 'one_time',
    amount_due          NUMERIC(14,2) NOT NULL,
    amount_paid         NUMERIC(14,2) NOT NULL DEFAULT 0,
    status              invoice_status NOT NULL DEFAULT 'draft',
    due_date            DATE,
    issued_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id          UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount              NUMERIC(14,2) NOT NULL,
    payment_method      VARCHAR(50),
    reference_number    VARCHAR(100),
    paid_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscription_billing_schedules (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_line_id   UUID NOT NULL REFERENCES quotation_lines(id),
    cycle_start_date    DATE NOT NULL,
    cycle_end_date      DATE NOT NULL,
    scheduled_amount    NUMERIC(14,2) NOT NULL,
    prorated            BOOLEAN NOT NULL DEFAULT FALSE,
    proration_reason    TEXT,
    invoice_id          UUID REFERENCES invoices(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE credit_note_reason AS ENUM ('cancellation', 'partial_refund', 'downgrade', 'other');

CREATE TABLE credit_notes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_line_id   UUID NOT NULL REFERENCES quotation_lines(id),
    invoice_id          UUID REFERENCES invoices(id),
    amount              NUMERIC(14,2) NOT NULL,
    reason              credit_note_reason NOT NULL,
    notes               TEXT,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- customer negotiation requests
CREATE TYPE negotiation_request_type AS ENUM ('comment', 'change_request', 'counter_discount', 'question');
CREATE TYPE negotiation_status AS ENUM ('open', 'addressed', 'accepted', 'rejected');

CREATE TABLE negotiation_requests (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id        UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    quotation_line_id   UUID REFERENCES quotation_lines(id),
    customer_user_id    UUID NOT NULL REFERENCES users(id),
    request_type        negotiation_request_type NOT NULL,
    message             TEXT,
    proposed_discount_pct NUMERIC(5,2),
    status              negotiation_status NOT NULL DEFAULT 'open',
    responded_by_user_id UUID REFERENCES users(id),
    response_message    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at         TIMESTAMPTZ
);

-- deal health and discount history
CREATE TYPE alert_type AS ENUM ('stalled_deal', 'discount_anomaly', 'delivery_slippage');
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'escalated', 'resolved');

CREATE TABLE deal_health_alerts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id        UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    alert_type          alert_type NOT NULL,
    details             JSONB,
    status              alert_status NOT NULL DEFAULT 'open',
    triggered_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    escalated_by_user_id UUID REFERENCES users(id),
    escalated_to_user_id UUID REFERENCES users(id),
    escalation_note     TEXT,
    escalated_at        TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ
);

CREATE TABLE rep_discount_history (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_rep_id        UUID NOT NULL REFERENCES users(id),
    quotation_id        UUID NOT NULL REFERENCES quotations(id),
    average_discount_pct NUMERIC(5,2) NOT NULL,
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- reporting views and indexes
CREATE VIEW v_quotation_report AS
SELECT
    q.id AS quotation_id,
    q.quote_number,
    q.status,
    q.total_amount,
    q.total_discount_amount,
    q.created_at,
    c.company_name,
    u.full_name AS sales_rep_name,
    pc.name AS category_name,
    p.name AS product_name,
    ql.discount_pct,
    ql.line_total
FROM quotations q
JOIN customers c ON c.id = q.customer_id
JOIN users u ON u.id = q.sales_rep_id
LEFT JOIN quotation_lines ql ON ql.quotation_id = q.id
LEFT JOIN products p ON p.id = ql.product_id
LEFT JOIN product_categories pc ON pc.id = p.category_id;

CREATE VIEW v_stalled_deals AS
SELECT id, quote_number, customer_id, sales_rep_id, last_activity_at,
       EXTRACT(DAY FROM now() - last_activity_at) AS days_inactive
FROM quotations
WHERE status NOT IN ('confirmed', 'fulfilled', 'cancelled', 'rejected')
  AND last_activity_at < now() - INTERVAL '7 days';

CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_rep ON quotations(sales_rep_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotation_lines_quotation ON quotation_lines(quotation_id);
CREATE INDEX idx_quotation_lines_product ON quotation_lines(product_id);
CREATE INDEX idx_warehouse_stock_product ON warehouse_stock(product_id);
CREATE INDEX idx_invoices_quotation ON invoices(quotation_id);
CREATE INDEX idx_negotiation_requests_quotation ON negotiation_requests(quotation_id);
CREATE INDEX idx_deal_health_alerts_status ON deal_health_alerts(status);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- migrate:down
DROP VIEW IF EXISTS v_stalled_deals CASCADE;
DROP VIEW IF EXISTS v_quotation_report CASCADE;
DROP TABLE IF EXISTS rep_discount_history CASCADE;
DROP TABLE IF EXISTS deal_health_alerts CASCADE;
DROP TABLE IF EXISTS negotiation_requests CASCADE;
DROP TABLE IF EXISTS credit_notes CASCADE;
DROP TABLE IF EXISTS subscription_billing_schedules CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS fulfillment_splits CASCADE;
DROP TABLE IF EXISTS fulfillment_orders CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS quotation_approvals CASCADE;
DROP TABLE IF EXISTS quotation_lines CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS upsell_rules CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS warehouse_stock CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS approval_chain_rules CASCADE;
DROP TABLE IF EXISTS price_list_items CASCADE;
DROP TABLE IF EXISTS price_lists CASCADE;
DROP TABLE IF EXISTS product_variant_attributes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS customer_tiers CASCADE;

DROP TYPE IF EXISTS alert_status CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS negotiation_status CASCADE;
DROP TYPE IF EXISTS negotiation_request_type CASCADE;
DROP TYPE IF EXISTS credit_note_reason CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS fulfillment_status CASCADE;
DROP TYPE IF EXISTS approval_action CASCADE;
DROP TYPE IF EXISTS subscription_line_status CASCADE;
DROP TYPE IF EXISTS quotation_status CASCADE;
DROP TYPE IF EXISTS billing_cycle CASCADE;
DROP TYPE IF EXISTS approval_level CASCADE;
DROP TYPE IF EXISTS product_category_type CASCADE;
DROP TYPE IF EXISTS customer_tier_code CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
