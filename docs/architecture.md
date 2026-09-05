# DealFlow360 — System Architecture & Technical Specification

DealFlow360 is an intelligent, self-governing B2B Sales Operations Platform designed to streamline quotation governance, enforce multi-tiered discount discipline, automate approval chains, calculate live margin deltas, execute multi-warehouse fulfillment splitting, process hybrid billing schedules, and manage integrated payment gateways.

---

## 1. System Architecture Overview

DealFlow360 follows a decoupled, layered micro-architecture featuring a Client Presentation Layer, an Express 5 REST API Gateway, Core Business Logic Engines, a Payment Gateway Layer, a Real-Time Event Bus, and a PostgreSQL Data Persistence Layer.

```mermaid
graph TD
    Client["Client Workspace (Vite + React 19 + Tailwind CSS)"] -->|REST API Requests| Gateway["API Gateway Layer (Express 5.x)"]
    Gateway -->|JWT Authentication| AuthMiddleware["Auth & RBAC Middleware"]
    
    subgraph "Express API Router Namespace (/api)"
        AuthMiddleware --> Routes["Modular Route Controllers (25 Modules)"]
    end

    subgraph "Self-Governing Core Engines"
        Routes --> RiskEngine["Blended Risk Score & Routing Engine (riskScoreEngine.js)"]
        Routes --> UpsellEngine["Live Upsell & Margin Impact Engine (upsellEngine.js)"]
        Routes --> FulfillmentEngine["Multi-Warehouse Stock Splitting Engine (fulfillmentEngine.js)"]
        Routes --> BillingEngine["Hybrid Billing & Proration Engine (billingEngine.js)"]
    end

    subgraph "External Integration Services"
        Routes --> PaymentService["Razorpay Payment Gateway Integration"]
        Routes --> EmailService["Nodemailer SMTP Email Service"]
        Routes --> WhatsAppService["Twilio WhatsApp Interactive Engine"]
    end

    subgraph "Data Storage & Event Layer"
        RiskEngine --> Database[("PostgreSQL Database (v14+)")]
        UpsellEngine --> Database
        FulfillmentEngine --> Database
        BillingEngine --> Database
        PaymentService --> Database
        Routes --> SocketBus["Socket.IO Real-time Event Bus"]
    end

    SocketBus -->|Live Websocket Notifications| Client
```

---

## 2. Complete Entity-Relationship Model (ERD)

The database persistence layer is modeled around 24 relational entities across 7 core functional domains:

```mermaid
erDiagram
    USERS ||--o{ QUOTATIONS : creates
    USERS ||--o{ AUDIT_LOGS : generates
    CUSTOMER_TIERS ||--o{ CUSTOMERS : segments
    CUSTOMERS ||--o{ QUOTATIONS : receives
    CUSTOMERS ||--o{ INVOICES : billed
    CATEGORIES ||--o{ PRODUCTS : classifies
    CATEGORIES ||--o{ DISCOUNT_RULES : governs
    PRODUCTS ||--o{ QUOTATION_LINES : items
    PRODUCTS ||--o{ INVENTORIES : tracked_in
    PRODUCTS ||--o{ UPSELL_RULES : base_product
    QUOTATIONS ||--o{ QUOTATION_LINES : contains
    QUOTATIONS ||--o{ APPROVALS : routes
    QUOTATIONS ||--o{ NEGOTIATIONS : subject_of
    QUOTATIONS ||--o{ ORDERS : converts_to
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ FULFILLMENT_SPLITS : fulfilled_by
    WAREHOUSES ||--o{ INVENTORIES : holds
    WAREHOUSES ||--o{ FULFILLMENT_SPLITS : ships_from
    QUOTATION_LINES ||--o{ SUBSCRIPTIONS : schedules
    SUBSCRIPTION_PLANS ||--o{ SUBSCRIPTIONS : dictates
    QUOTATIONS ||--o{ INVOICES : generates
    INVOICES ||--o{ PAYMENTS : accepts
    PAYMENTS ||--o{ CREDIT_NOTES : refunds
```

---

## 3. Core Business Logic Engines

DealFlow360 incorporates 4 specialized, self-governing business logic engines:

### 3.1 Blended Risk Score & Approval Routing Engine (`riskScoreEngine.js`)
Evaluates line-level and order-level discount excesses against customer tier ceilings and product category default limits.

- **Formula**:
  $$S_{\text{risk}} = \left( \sum w_i \cdot \text{Excess}_i \right) \times 10 + \max(0, \text{Disc}_{\text{order}} - \text{Ceiling}_{\text{tier}}) \times 5$$
  Where:
  $$w_i = \frac{\text{LineTotal}_i}{\text{Subtotal}}$$
  $$\text{Excess}_i = \max(0, \text{Disc}_i - \text{Ceiling}_{\text{cat}}, \text{Disc}_i - \text{Ceiling}_{\text{tier}})$$

- **Approval Routing Chains**:
  - $S_{\text{risk}} = 0$ & no violations: Status `approved` (Auto-Approved).
  - $0 < S_{\text{risk}} \le 15$: Requires `sales_manager` approval.
  - $S_{\text{risk}} > 15$: Dual approval chain (`sales_manager` $\rightarrow$ `finance_ops`).

---

### 3.2 Live Upsell & Margin Impact Engine (`upsellEngine.js`)
Evaluates cart co-purchase frequency rules and active product promotions to calculate real-time margin impact previews before items are added to a quote.

- **Formula**:
  $$\Delta \text{Margin}\% = \text{Margin}_{\text{new}}\% - \text{Margin}_{\text{current}}\%$$
  $$\text{RankScore} = \text{PromotedWeight} \cdot \text{CoPurchaseScore} \cdot \text{MarginFactor}$$

---

### 3.3 Multi-Warehouse Fulfillment & Backorder Engine (`fulfillmentEngine.js`)
Greedily allocates inventory across multiple depots sorted by shipping cost weight. If stock is insufficient at a single depot, it splits shipments automatically and computes backorders.

- **Greedy Allocation Strategy**:
  Sort warehouses $W = \{w_1, w_2, \dots, w_n\}$ where $\text{Weight}(w_1) \le \text{Weight}(w_2)$. Allocate $q_{\text{take}} = \min(q_{\text{remaining}}, \text{Stock}(w_i, p))$.

---

### 3.4 Hybrid Billing & Mid-Cycle Proration Engine (`billingEngine.js`)
Separates one-time hardware/service items from recurring SaaS subscriptions, generating 12-month billing schedules and computing exact mid-cycle proration adjustments.

- **Proration Formula**:
  $$\text{Adjustment}_{\text{net}} = \left( \frac{\text{Rate}_{\text{new}}}{D_{\text{cycle}}} \cdot D_{\text{remaining}} \right) - \left( \frac{\text{Rate}_{\text{orig}}}{D_{\text{cycle}}} \cdot D_{\text{remaining}} \right)$$

---

## 4. Payment Gateway Integration Architecture (Razorpay)

DealFlow360 integrates with Razorpay to provide secure end-to-end payment processing:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Sales Rep
    participant Express as Express API Gateway
    participant Razorpay as Razorpay API
    participant DB as PostgreSQL DB

    Customer->>Express: POST /api/payments/create-order { invoice_id, amount }
    Express->>Razorpay: razorpay.orders.create({ amount, currency, receipt })
    Razorpay-->>Express: Returns razorpay_order_id
    Express->>DB: Record Payment Intent (status: created)
    Express-->>Customer: Return order_id & key_id

    Customer->>Razorpay: Customer completes payment on Razorpay Checkout Widget
    Razorpay-->>Customer: Returns razorpay_payment_id & razorpay_signature

    alt Direct Synchronous Verification
        Customer->>Express: POST /api/payments/verify { order_id, payment_id, signature }
        Express->>Express: Validate HMAC-SHA256 (order_id + '|' + payment_id, secret)
        Express->>DB: Update Payment -> completed & Invoice -> PAID
        Express-->>Customer: Success (Invoice Paid)
    else Asynchronous Webhook Notification
        Razorpay->>Express: POST /api/payments/webhook (payment.captured)
        Express->>Express: Verify Header x-razorpay-signature
        Express->>DB: Update Payment -> completed & Invoice -> PAID
        Express-->>Razorpay: Return HTTP 200 OK
    end
```

---

## 5. Security & Role-Based Access Control (RBAC) Matrix

DealFlow360 implements strict HTTP Bearer JWT verification (`authenticateJWT`) and role-based permissions (`authorizeRoles`).

| Domain | Endpoint / API | Admin | Sales Manager | Finance Ops | Sales Rep | Customer |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Auth** | `/auth/login`, `/auth/me`, `/logout` | Yes | Yes | Yes | Yes | Yes |
| **Users** | `GET /users`, `POST /users`, `DELETE` | Yes | View Only | View Only | No | No |
| **Customers** | `GET /customers`, `POST /customers` | Yes | Yes | Yes | Yes | No |
| **Tiers** | `GET /customer-tiers`, `POST`, `DELETE` | Yes | View Only | Yes | View Only | View Only |
| **Catalog** | `GET /products`, `GET /categories` | Yes | Yes | Yes | Yes | Yes |
| **Quotations**| `GET /quotations`, `POST /quotations` | Yes | Yes | Yes | Yes | View Only |
| **Approvals** | `GET /approvals`, `POST /approve` | Yes | Yes | Yes | No | No |
| **Portal** | `GET /negotiations`, `POST /counter` | Yes | Yes | Yes | Yes | Yes |
| **Payments** | `POST /payments/create-order` | Yes | Yes | Yes | Yes | Yes |
| **Payments** | `POST /payments/verify` | Yes | Yes | Yes | Yes | Yes |
| **Payments** | `GET /payments` (List All) | Yes | Yes | Yes | No | No |
| **Payments** | `POST /payments/:id/refund` | Yes | No | Yes | No | No |
| **Audit** | `GET /audit`, `GET /reports/sales` | Yes | Yes | Yes | No | No |

---

## 6. Future Expansion Roadmap

1. **Enterprise ERP Sync Adapters**: Webhook adapters for real-time general ledger posting into SAP, Oracle NetSuite, and QuickBooks.
2. **Predictive AI Discount Optimization**: Machine learning models predicting deal closure probability at various discount percentages.
3. **Multi-Currency Real-Time Exchange Rates**: Dynamic FX table integration with automated currency hedging adjustments.
