# DealFlow360 — Database Architecture & Migrations

This directory contains the database schema definitions, SQL migrations, seed datasets, and migration execution instructions for the DealFlow360 B2B Sales Operations Platform.

---

## Database Specifications

- Engine: PostgreSQL (v14.0 or higher)
- Default Database Name: dealflow360
- Migration Utility: Dbmate (`dbmate`)
- Encoding: UTF-8
- Primary Keys: Bigint (Identity / Auto-increment) & Serial ID mappings
- Foreign Keys: Enforced ON DELETE CASCADE / RESTRICT

---

## Directory Structure

```text
database/
├── README.md                 # Database setup and schema documentation
├── schema.sql                # Complete consolidated PostgreSQL DDL schema
└── seed.sql                  # Initial system seed data DML

backend/db/
├── migrations/               # Dbmate version-controlled migration files
│   ├── 20260905000000_dealflow360_init.sql # DDL schema creation migration
│   └── 20260905000001_dealflow360_seed.sql # System initial data seed migration
├── dealflow360_schema.sql    # DDL schema definition copy
├── schema.sql                # Dbmate generated database schema snapshot
└── scripts/                  # Seed generator and helper scripts
```

---

## Entity-Relationship & Table Architecture

The DealFlow360 relational model consists of 24 core tables divided into 7 functional domains:

### 1. Identity & Access Management
- `users`: User identity credentials, roles (`admin`, `sales_manager`, `finance_ops`, `sales_rep`, `customer`), contact details.
- `roles`: Role definitions and description text.
- `permissions`: Granular permission action codes.
- `role_permissions`: Junction table mapping permissions to system roles.

### 2. Customer Directory & Segmentation
- `customer_tiers`: Discount ceilings (`bronze`: 5%, `silver`: 10%, `gold`: 15%, `platinum`: 25%) and credit limits.
- `customers`: B2B customer accounts, billing addresses, tax GSTIN numbers, assigned customer tiers.

### 3. Product Catalog & Governance
- `categories`: Product category hierarchy and default discount ceilings (`hardware`, `service`, `subscription`).
- `products`: Product catalog SKUs, base pricing, cost pricing, unit of measure, stock status.
- `price_lists`: Tiered price books and seasonal price rules.
- `tier_prices`: Custom price points assigned per customer tier or account.
- `discount_rules`: Policy rules defining maximum allowed discount percentages by product category.

### 4. Sales Pipeline & Governance
- `quotations`: Sales quotes, total amounts, blended risk scores, approval status (`draft`, `pending_approval`, `approved`, `rejected`, `fulfilled`).
- `quotation_lines`: Quote line items, quantities, unit prices, cost prices, line-level discount percentages, margins.
- `approvals`: Multi-tier approval routing logs tracking manager and finance approvals.
- `negotiations`: Customer counter-offer proposals and interactive negotiation history.
- `upsell_rules`: Co-purchase rules and product cross-sell recommendation mappings.

### 5. Inventory & Logistics
- `warehouses`: Warehouse locations, shipping cost weights, and depot names.
- `inventories`: Multi-warehouse stock levels on hand and allocated stock.
- `inventory_transactions`: Audit log of stock movements, fulfillments, and adjustments.
- `orders`: Confirmed customer orders derived from approved quotes.
- `order_items`: Line items attached to confirmed orders.
- `fulfillment_splits`: Multi-warehouse greedy stock allocation splits and shipping cost calculations.

### 6. Subscriptions, Billing & Payments
- `subscription_plans`: Recurring billing plans and cycles (monthly, quarterly, yearly).
- `subscriptions`: Active recurring customer subscriptions and renewal schedules.
- `invoices`: One-time and recurring invoice statements generated from quotes/orders.
- `payments`: Razorpay transaction records, order IDs, payment IDs, signatures, statuses (`created`, `completed`, `failed`, `refunded`).
- `credit_notes`: Credit notes issued for mid-cycle proration adjustments or refunds.

### 7. Analytics & System Audit
- `audit_logs`: Application activity audit trail (`user_id`, `action`, `resource`, `ip_address`).
- `deal_health_alerts`: Automated risk alerts and margin erosion warning triggers.
- `discount_history`: Historic discount trend logs for reporting analytics.

---

## Seed Data Numbering Convention

To simplify development and debugging, entity IDs follow a structured 100-series numbering convention:

| Series Range | Entity Domain | Example Primary Keys |
| :--- | :--- | :--- |
| `101 – 199` | System Users | `101` (Sales Rep), `102` (Sales Manager), `103` (Finance), `104` (Customer) |
| `201 – 299` | Customer Tiers | `201` (Bronze), `202` (Silver), `203` (Gold), `204` (Platinum) |
| `301 – 399` | Customers | `301` (Acme Corp), `302` (TechGlobal Ltd) |
| `401 – 499` | Product Categories | `401` (Hardware), `402` (Services), `403` (Subscription) |
| `501 – 599` | Catalog Products | `501` (Enterprise Server X), `502` (Implementation Service) |
| `601 – 699` | Subscription Plans | `601` (Enterprise Cloud Plan) |
| `701 – 799` | Warehouses | `701` (Main Central Warehouse), `702` (East Coast Depot) |
| `801 – 899` | Inventory Items | `801` (Main Depot Stock), `802` (East Depot Stock) |
| `901 – 999` | Upsell Rules | `901` (Server to Support Upsell) |
| `1101 – 1199` | Quotations | `1101` (QT-2026-001) |

---

## Setup & Migration Commands

### Prerequisites
Install `dbmate` database migration tool:

```bash
# macOS via Homebrew
brew install dbmate

# Windows via Scoop / Direct Binary Download
scoop install dbmate
```

### Database Environment Variable
Ensure `DATABASE_URL` is set in `backend/.env`:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/dealflow360?sslmode=disable"
```

### Running Migrations

Execute the following commands from the `backend/` directory:

1. Apply All Pending Migrations:
```bash
npm run dbmate
```
or
```bash
dbmate --migrations-dir ./db/migrations up
```

2. Check Migration Status:
```bash
npm run db:status
```

3. Rollback Last Migration:
```bash
npm run db:down
```

---

## Direct SQL Execution

If you prefer to initialize PostgreSQL manually using `psql` or a GUI client (pgAdmin / DBeaver):

```bash
# Create database
createdb -U postgres dealflow360

# Apply Schema DDL
psql -U postgres -d dealflow360 -f database/schema.sql

# Apply Seed Data DML
psql -U postgres -d dealflow360 -f database/seed.sql
```
