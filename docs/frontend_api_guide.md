# DealFlow360 Frontend Developer API Integration Guide & Comprehensive Reference

This document serves as the complete, authoritative technical specification for all REST API endpoints provided by the **DealFlow360 B2B Sales Operations Platform**.

---

## 1. Core Integration Setup

### Base URLs
- **Local Development**: `http://localhost:5000/api`
- **Alternative Local Port**: `http://localhost:3023/api`
- **Production Server**: `https://your-domain.com/api`

### Request Headers
All protected endpoints require a valid JSON Web Token (JWT) provided via the standard HTTP Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

*Alternative header support*: `x-access-token: <JWT_TOKEN>` or HTTP-only `token` cookie.

### Strict CORS Policy
Cross-Origin Resource Sharing (CORS) is strictly restricted to the URL defined in the `FRONTEND_URL` environment variable (default: `http://localhost:5173`). Requests originating from unauthorized browser origins will be rejected with an HTTP CORS policy violation error.

---

## 2. Standardized Response & Error Schema

### Success Response Format (HTTP 200 OK / 201 Created)
```json
{
  "id": "1101",
  "quote_number": "QT-2026-001",
  "status": "pending_approval",
  "total_amount": 6390.00,
  "created_at": "2026-09-05T12:00:00.000Z"
}
```

### Standardized Error Schema (HTTP 400, 401, 403, 404, 500)
```json
{
  "code": "permission_denied",
  "message": "Access denied. Insufficient permissions. Requires one of roles: admin, finance_ops",
  "details": null
}
```

---

## 3. Reusable Frontend Fetch Helper

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.code = data?.code;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export default apiRequest;
```

---

## 4. Complete Detailed API Endpoints Reference

### 4.0 System Health & Connectivity

#### GET /health or GET /api/health
- **Access**: Public / Unauthenticated
- **Description**: Returns server status, uptime in seconds, database connection health, and node memory heap statistics.
- **Response (200 OK)**:
```json
{
  "status": "healthy",
  "service": "dealflow360",
  "environment": "dev",
  "uptime_seconds": 245,
  "timestamp": "2026-09-05T13:45:00.000Z",
  "database": { "status": "connected", "engine": "postgresql" },
  "memory": { "heapUsed": "18.42 MB", "heapTotal": "34.12 MB", "rss": "72.10 MB" }
}
```

#### GET /ping
- **Access**: Public
- **Description**: Simple ping-pong endpoint for quick network validation.
- **Response (200 OK)**: `pong (DealFlow360)`

---

### 4.1 Authentication & Session Management

#### POST /api/auth/login
- **Access**: Public
- **Request Body**:
```json
{
  "email": "baraiyavishalbhai32@gmail.com",
  "password": "password123"
}
```
- **Response (200 OK)**:
```json
{
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "101",
    "full_name": "Sales Representative",
    "email": "baraiyavishalbhai32@gmail.com",
    "role": "sales_rep"
  }
}
```

#### GET /api/auth/me
- **Access**: All Authenticated Roles (`admin`, `sales_manager`, `finance_ops`, `sales_rep`, `customer`)
- **Response (200 OK)**: Returns full profile of current authenticated user.

#### POST /api/auth/logout
- **Access**: All Authenticated Roles
- **Response (200 OK)**: `{ "message": "Successfully logged out." }`

#### POST /api/auth/forgot-password
- **Access**: Public
- **Request Body**: `{ "email": "user@example.com" }`
- **Response (200 OK)**: `{ "message": "Password reset token generated and sent to email." }`

#### POST /api/auth/reset-password
- **Access**: Public
- **Request Body**: `{ "token": "reset_1772870400000_abc123", "newPassword": "newPassword123" }`
- **Response (200 OK)**: `{ "message": "Password updated successfully." }`

#### POST /api/auth/magic-link
- **Access**: Public
- **Request Body**: `{ "email": "customer@company.com" }`
- **Response (200 OK)**: `{ "message": "Magic link token generated", "token": "magic_token_xxx" }`

---

### 4.2 Users Management Module

#### GET /api/users
- **Access**: `admin`, `sales_manager`, `finance_ops`
- **Response (200 OK)**: Array of user records with assigned RBAC roles.

#### POST /api/users
- **Access**: `admin`
- **Request Body**:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "sales_rep",
  "password": "password123"
}
```
- **Response (201 Created)**: Created user object.

#### GET /api/users/:id
- **Access**: `admin`, `sales_manager`, `finance_ops`

#### PUT /api/users/:id
- **Access**: `admin`

#### DELETE /api/users/:id
- **Access**: `admin`
- **Response (200 OK)**: `{ "message": "User deleted successfully", "id": "104" }`

---

### 4.3 Customers Directory & Relations

#### GET /api/customers
- **Access**: `admin`, `sales_manager`, `finance_ops`, `sales_rep`
- **Response (200 OK)**: List of customer profiles with tier assignments and sales rep IDs.

#### POST /api/customers
- **Access**: `admin`, `sales_manager`, `sales_rep`
- **Request Body**:
```json
{
  "company_name": "Acme Corp",
  "contact_person": "John Smith",
  "email": "john@acme.com",
  "phone": "+919876543210",
  "tier_id": "203"
}
```

#### GET /api/customers/:id
- **Access**: `admin`, `sales_manager`, `finance_ops`, `sales_rep`

#### PUT /api/customers/:id
- **Access**: `admin`, `sales_manager`, `sales_rep`

#### DELETE /api/customers/:id
- **Access**: `admin`

#### GET /api/customers/:id/quotations
- **Access**: `admin`, `sales_manager`, `finance_ops`, `sales_rep`, `customer`

#### GET /api/customers/:id/orders
- **Access**: `admin`, `sales_manager`, `finance_ops`, `sales_rep`, `customer`

#### GET /api/customers/:id/invoices
- **Access**: `admin`, `sales_manager`, `finance_ops`, `sales_rep`, `customer`

---

### 4.4 Customer Tiers & Governance

#### GET /api/customer-tiers
- **Access**: All Authenticated Roles
- **Response (200 OK)**:
```json
[
  { "id": "201", "tier_code": "bronze", "name": "Bronze Tier", "discount_ceiling_pct": 5.0 },
  { "id": "202", "tier_code": "silver", "name": "Silver Tier", "discount_ceiling_pct": 10.0 },
  { "id": "203", "tier_code": "gold", "name": "Gold Tier", "discount_ceiling_pct": 15.0 },
  { "id": "204", "tier_code": "platinum", "name": "Platinum Tier", "discount_ceiling_pct": 25.0 }
]
```

#### POST /api/customer-tiers
- **Access**: `admin`

---

### 4.5 Product Catalog & Variants

#### GET /api/categories
- **Access**: All Authenticated Roles

#### GET /api/categories/:id
- **Access**: All Authenticated Roles

#### POST /api/categories
- **Access**: `admin`
- **Request Body**: `{ "name": "Software SaaS", "category_type": "subscription", "discount_ceiling_pct": 20.0 }`

#### PUT /api/categories/:id
- **Access**: `admin`

#### DELETE /api/categories/:id
- **Access**: `admin`

#### GET /api/products
- **Access**: All Authenticated Roles

#### GET /api/products/:id
- **Access**: All Authenticated Roles

#### POST /api/products
- **Access**: `admin`
- **Request Body**:
```json
{
  "sku": "HW-SRV-02",
  "name": "Rack Server Pro",
  "category_id": "401",
  "base_price": 2500.0,
  "cost_price": 1800.0,
  "tax_rate_pct": 18.0
}
```

#### PUT /api/products/:id
- **Access**: `admin`

#### DELETE /api/products/:id
- **Access**: `admin`

#### PATCH /api/products/:id/status
- **Access**: `admin`

#### PATCH /api/products/:id/promotion
- **Access**: `admin`, `sales_manager`

#### GET /api/products/:id/variants
- **Access**: All Authenticated Roles

#### POST /api/products/:id/variants
- **Access**: `admin`

#### PUT /api/products/:id/variants/:variantId
- **Access**: `admin`

#### DELETE /api/products/:id/variants/:variantId
- **Access**: `admin`

---

### 4.6 Price Lists & Custom Discount Rules

#### GET /api/price-lists
- **Access**: All Authenticated Roles

#### POST /api/price-lists
- **Access**: `admin`, `finance_ops`

#### GET /api/price-lists/:id
- **Access**: All Authenticated Roles

#### GET /api/discount/rules (or /api/discount-rules)
- **Access**: All Authenticated Roles

#### POST /api/discount/rules
- **Access**: `admin`, `finance_ops`
- **Request Body**:
```json
{
  "rule_name": "Enterprise Hardware Cap",
  "category_type": "hardware",
  "max_discount_pct": 15.0
}
```

#### DELETE /api/discount/rules/:id
- **Access**: `admin`, `finance_ops`

---

### 4.7 Quotations & Real-Time Risk Engine

#### GET /api/quotations
- **Access**: All Authenticated Roles

#### GET /api/quotations/:id
- **Access**: All Authenticated Roles

#### POST /api/quotations
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**:
```json
{
  "customer_id": "301",
  "customer_tier_code": "gold",
  "order_discount_pct": 2.0,
  "line_items": [
    {
      "product_id": "501",
      "category_type": "hardware",
      "quantity": 5,
      "unit_price": 1000.0,
      "cost_price": 700.0,
      "discount_pct": 12.0
    }
  ]
}
```
- **Response (201 Created)**:
```json
{
  "id": "1102",
  "quote_number": "QT-2026-002",
  "blended_risk_score": 21.87,
  "status": "pending_approval",
  "requires_approval": true,
  "approval_levels": ["sales_manager", "finance_ops"],
  "total_amount": 6390.00,
  "overall_margin_pct": 33.33
}
```

#### PUT /api/quotations/:id
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

#### DELETE /api/quotations/:id
- **Access**: `admin`

#### POST /api/quotations/:id/re-evaluate-risk
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

---

### 4.8 Multi-Tier Approval Workflow

#### GET /api/approvals/pending
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### POST /api/approvals/:id/approve
- **Access**: `sales_manager`, `finance_ops`, `admin`
- **Request Body**: `{ "comments": "Approved due to high volume deal size." }`

#### POST /api/approvals/:id/reject
- **Access**: `sales_manager`, `finance_ops`, `admin`
- **Request Body**: `{ "reason": "Margin fell below minimum corporate floor." }`

---

### 4.9 Customer Portal Negotiations

#### GET /api/negotiations
- **Access**: All Authenticated Roles

#### POST /api/negotiations/:quoteId/counter
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**:
```json
{
  "proposed_discount_pct": 14.0,
  "customer_comments": "Can you offer 14% discount for 2-year commitment?"
}
```

#### POST /api/negotiations/:quoteId/accept
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`

---

### 4.10 Live Upsell & Recommendation Engine

#### GET /api/upsell-rules
- **Access**: All Authenticated Roles

#### POST /api/upsell/recommendations
- **Access**: All Authenticated Roles
- **Request Body**:
```json
{
  "current_cart_lines": [
    { "productId": "501", "quantity": 5, "unitPrice": 1000, "costPrice": 700, "discountPct": 10 }
  ]
}
```
- **Response (200 OK)**:
```json
{
  "currentMarginPct": 33.33,
  "suggestions": [
    {
      "productId": "601",
      "productName": "Cloud SaaS Subscription",
      "price": 500,
      "standaloneMarginPct": 80.0,
      "marginDeltaPct": 4.17,
      "isMarginPositive": true,
      "rankScore": 2.4
    }
  ]
}
```

---

### 4.11 Multi-Warehouse Inventory & Fulfillment

#### GET /api/warehouses
- **Access**: All Authenticated Roles

#### POST /api/warehouses
- **Access**: `admin`

#### GET /api/inventory
- **Access**: All Authenticated Roles

#### POST /api/inventory/adjust
- **Access**: `admin`, `finance_ops`, `sales_manager`

#### GET /api/fulfillment/splits/:quoteId
- **Access**: All Authenticated Roles
- **Response (200 OK)**:
```json
{
  "status": "fulfilled",
  "totalShipmentCount": 2,
  "totalEstimatedShipmentCost": 90.0,
  "fulfillmentSplits": [
    {
      "quotationLineId": "1201",
      "warehouseId": "701",
      "warehouseName": "Main Central Warehouse",
      "quantityFulfilled": 5,
      "estimatedShipmentCost": 62.5
    },
    {
      "quotationLineId": "1201",
      "warehouseId": "702",
      "warehouseName": "East Coast Depot",
      "quantityFulfilled": 2,
      "estimatedShipmentCost": 27.5
    }
  ],
  "backorders": []
}
```

#### POST /api/fulfillment/ship
- **Access**: `admin`, `sales_manager`, `finance_ops`

---

### 4.12 Orders, Billing, Invoices & Subscriptions

#### GET /api/orders
- **Access**: All Authenticated Roles

#### GET /api/orders/:id
- **Access**: All Authenticated Roles

#### POST /api/orders
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

#### GET /api/subscriptions
- **Access**: All Authenticated Roles

#### GET /api/subscription-plans
- **Access**: All Authenticated Roles

#### POST /api/subscriptions
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

#### GET /api/invoices
- **Access**: All Authenticated Roles

#### GET /api/invoices/:id
- **Access**: All Authenticated Roles

#### POST /api/invoices
- **Access**: `finance_ops`, `admin`

#### GET /api/credit-notes
- **Access**: All Authenticated Roles

#### POST /api/credit-notes
- **Access**: `finance_ops`, `admin`

---

### 4.13 Payment Gateway Integration (Razorpay)

#### POST /api/payments/create-order
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**:
```json
{
  "invoice_id": "inv_1101",
  "amount": 6390.00,
  "currency": "INR"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "order_id": "order_TYHNGvqLdMAi8I",
  "razorpay_order_id": "order_TYHNGvqLdMAi8I",
  "amount": 6390.0,
  "currency": "INR",
  "invoice_id": "inv_1101",
  "key_id": "rzp_test_ZFxDYdxbnGTEtC",
  "razorpay_order": {
    "id": "order_TYHNGvqLdMAi8I",
    "amount": 639000,
    "currency": "INR",
    "status": "created"
  }
}
```

#### POST /api/payments/verify
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**:
```json
{
  "invoice_id": "inv_1101",
  "razorpay_order_id": "order_TYHNGvqLdMAi8I",
  "razorpay_payment_id": "pay_rzp_998877",
  "razorpay_signature": "hmac_sha256_signature_string"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Payment verified successfully and invoice marked as PAID",
  "payment_id": "pay_101",
  "razorpay_payment_id": "pay_rzp_998877",
  "invoice_id": "inv_1101",
  "status": "completed"
}
```

#### POST /api/payments/webhook
- **Access**: Public / Gateway Webhook
- **Request Body**: Razorpay webhook payload (`event: payment.captured`)
- **Response (200 OK)**: `{ "status": "ok", "received": true }`

#### GET /api/payments
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /api/payments/:id
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

#### GET /api/payments/:id/status
- **Access**: All Authenticated Roles
- **Response (200 OK)**:
```json
{
  "id": "pay_101",
  "invoice_id": "inv_1101",
  "order_id": "order_TYHNGvqLdMAi8I",
  "amount": 6390.0,
  "currency": "INR",
  "status": "completed",
  "payment_method": "razorpay",
  "paid_at": "2026-09-05T13:00:00.000Z"
}
```

#### POST /api/payments/:id/refund
- **Access**: `finance_ops`, `admin`
- **Request Body**:
```json
{
  "amount": 6390.0,
  "reason": "Customer requested cancellation"
}
```

---

### 4.14 Analytics, Audit & Interactive Communication Channels

#### GET /api/dashboard/summary
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /api/reports/sales
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /api/deal-health/alerts
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /api/discount-history
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /api/whatsapp/menu
- **Access**: All Authenticated Roles

#### POST /api/whatsapp/interact
- **Access**: All Authenticated Roles

#### POST /api/email/send-quotation
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

#### GET /api/notifications
- **Access**: All Authenticated Roles

#### GET /api/audit
- **Access**: `sales_manager`, `finance_ops`, `admin`
