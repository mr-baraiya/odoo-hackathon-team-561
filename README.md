# DealFlow360 — Intelligent B2B Sales Operations Platform

DealFlow360 is an enterprise-grade, self-governing B2B Sales Operations Platform. It enforces multi-tiered discount discipline, automates approval routing chains, calculates real-time margin deltas, greedily splits multi-warehouse fulfillment stock, handles hybrid recurring subscription billing, and manages integrated payment gateway transactions.

---

## Key Platform Features

### 1. Blended Risk Score & Discount Governance
- Calculates real-time blended risk scores based on line-level item discounts, product category ceilings, and customer tier limits.
- Automatically routes quotes requiring authorization to `sales_manager` or dual-approval chains (`sales_manager` -> `finance_ops`).

### 2. Live Upsell & Margin Impact Engine
- Evaluates cart co-purchase frequency rules and active promotions.
- Provides real-time margin delta previews before items are added to a quotation.

### 3. Multi-Warehouse Stock Splitting
- Greedily allocates stock across multiple depots prioritized by shipping cost efficiency.
- Automatically splits partial fulfillments across warehouses and manages backorders.

### 4. Hybrid Billing & Mid-Cycle Proration
- Separates one-time hardware/service invoices from recurring SaaS subscription lines.
- Computes exact mid-cycle proration adjustments and issues automated credit notes upon plan modifications or cancellations.

### 5. Razorpay Payment Gateway Integration
- Creates Razorpay payment orders, verifies HMAC-SHA256 signatures, receives asynchronous webhooks (`payment.captured`), and processes refunds.
- Automatically transitions invoice statuses to `PAID` upon verified payment completion.

### 6. Interactive Customer Negotiation Portal
- Enables B2B customers to review quotes, submit counter-discount proposals, and trigger real-time risk re-evaluations.

---

## Repository Structure

```text
DealFlow360/
├── backend/                  # Node.js & Express 5 REST API Server
│   ├── config/               # Environment loader, Joi schemas, constants & error dictionaries
│   ├── db/                   # Seed data, migrations & schema files
│   ├── middleware/           # JWT authentication, RBAC authorization, error handling
│   ├── routes/               # 25 modular REST API route controllers
│   ├── service/              # 4 core business logic engines & background services
│   ├── types/                # Global JSDoc type definitions
│   ├── utils/                # Helper utilities (JWT, error formatting, phone/currency formatters)
│   ├── .env                  # Environment configuration
│   ├── package.json          # Node package manifest
│   └── README.md             # Backend service manual
├── database/                 # PostgreSQL Database DDL/DML & Migration Guide
│   ├── schema.sql            # Consolidated PostgreSQL schema definition
│   ├── seed.sql              # Initial system seed data SQL
│   └── README.md             # Database architecture & Dbmate migration manual
├── docs/                     # Technical Platform Documentation
│   ├── architecture.md       # System Architecture, ERD Diagrams & Math Specifications
│   └── frontend_api_guide.md # Comprehensive Frontend Developer API Integration Guide
└── scripts/                  # Automated Test & Verification Suites
    ├── verify_dealflow.js        # End-to-End core logic engine test
    ├── verify_security_rbac.js   # Security & RBAC permission guard test
    ├── verify_api_suite.js       # Complete 30-module REST API suite test
    └── verify_payment_gateway.js # Payment gateway order/verify/webhook/refund test
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- PostgreSQL (v14.0 or higher)
- Dbmate CLI (`scoop install dbmate` or `brew install dbmate`)

### 1. Environment Configuration
Navigate to the `backend/` directory and configure environment variables:

```bash
cd backend
cp .env.example .env
```

Ensure `.env` contains your database connection string and API keys:

```env
SERVER_PORT = 5000
JWT_SECRET = dealflow360_super_secret_jwt_key_2026
DATABASE_URL = "postgres://postgres:postgres@localhost:5432/dealflow360?sslmode=disable"

# Razorpay Configuration
RAZORPAY_KEY_ID = rzp_test_ZFxDYdxbnGTEtC
RAZORPAY_KEY_SECRET = Gkmmmqm0L3trSvm4KwLMGoen
```

### 2. Install Dependencies & Run Migrations
From inside the `backend/` directory:

```bash
npm install
npm run dbmate
```

### 3. Start the Server
- Development Mode (Hot Reload):
```bash
npm run dev
```

- Production Mode:
```bash
npm start
```

The API server will run at `http://localhost:5000/api`.

---

## Verification & Automated Test Suites

DealFlow360 includes automated verification test suites covering logic engines, security, REST endpoints, and payment flows:

```bash
# Run Core Business Logic Engine Test
npm test

# Run Security & Role-Based Access Control (RBAC) Guard Test
node ../scripts/verify_security_rbac.js

# Run 30-Module REST API Integration Test
node ../scripts/verify_api_suite.js

# Run Payment Gateway Integration Test
node ../scripts/verify_payment_gateway.js
```

---

## Role-Based Access Control (RBAC) Overview

| System Role | Primary Permissions |
| :--- | :--- |
| **admin** | System-wide administrative access, user creation/deletion, global settings. |
| **sales_manager** | Team oversight, quotation approval/rejection, discount ceiling overrides, pipeline reports. |
| **finance_ops** | Financial approvals, price lists, invoice management, credit notes, payment refunds. |
| **sales_rep** | Quotation drafting, line item management, customer directory lookup, counter-proposal responses. |
| **customer** | Customer portal access, quotation confirmation, counter-offer submission, invoice payment. |

---

## Platform Documentation Links

- [System Architecture & Data Model (docs/architecture.md)](./docs/architecture.md)
- [Frontend Developer API Integration Guide (docs/frontend_api_guide.md)](./docs/frontend_api_guide.md)
- [Backend Service Manual (backend/README.md)](./backend/README.md)
- [Database Architecture & Migrations Guide (database/README.md)](./database/README.md)
