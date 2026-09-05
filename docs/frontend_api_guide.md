# DealFlow360 Frontend Developer API Integration Guide

This guide provides frontend developers with detailed technical specifications for integrating with the DealFlow360 REST APIs.

---

## 1. Core Integration Setup

### Base URL
- **Development**: `http://localhost:5000/api` or `http://localhost:3023/api`
- **Production**: `https://your-domain.com/api`

### Mandatory Request Headers
All protected API requests must include the JWT authentication token in one of the following formats:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Alternatively, `x-access-token: <JWT_TOKEN>` header or HTTP-only cookie named `token` is supported.

---

## 2. Standardized Response & Error Formats

### Successful Response Format
All successful data payloads return JSON with HTTP status code `200` (OK) or `201` (Created):

```json
{
  "id": "1101",
  "quote_number": "QT-2026-001",
  "status": "pending_approval",
  "total_amount": 6390.0,
  "created_at": "2026-09-05T12:00:00.000Z"
}
```

### Standard Error Response Format
When an API call fails (HTTP `400`, `401`, `403`, `404`, `500`), the response body follows this schema:

```json
{
  "code": "permission_denied",
  "message": "Access denied. Insufficient permissions. Requires one of roles: admin, finance_ops",
  "details": null
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or invalid parameters.
- `401 Unauthorized`: Token missing, expired, or invalid.
- `403 Forbidden`: Authenticated user lacks required role permissions.
- `404 Not Found`: Requested resource or endpoint does not exist.
- `500 Internal Server Error`: Server exception.

---

## 3. Frontend Utility Helper Code Example

Below is a reusable JavaScript/TypeScript `fetch` wrapper module for frontend applications:

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

## 4. Complete API Endpoint Reference

### 4.1 Authentication Module

#### POST /auth/login
- **Access**: Public
- **Request Body**:
```json
{
  "email": "baraiyavishalbhai32@gmail.com",
  "password": "password123"
}
```
- **Response Payload (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "101",
    "full_name": "Sales Representative",
    "email": "baraiyavishalbhai32@gmail.com",
    "role": "sales_rep"
  }
}
```

#### GET /auth/me
- **Access**: All Authenticated Roles
- **Response Payload (200 OK)**: Returns profile of current logged-in user.

#### POST /auth/logout
- **Access**: All Authenticated Roles
- **Response Payload (200 OK)**: `{ "message": "Logged out successfully" }`

#### POST /auth/forgot-password
- **Request Body**: `{ "email": "user@example.com" }`
- **Response Payload (200 OK)**: `{ "message": "Reset link sent to email" }`

#### POST /auth/reset-password
- **Request Body**: `{ "token": "reset_token_xxx", "newPassword": "new_password_123" }`

---

### 4.2 Users Management Module

#### GET /users
- **Access**: `admin`, `sales_manager`, `finance_ops`
- **Query Params**: `page` (optional), `limit` (optional), `role` (optional)
- **Response Payload (200 OK)**: Array of user objects.

#### POST /users
- **Access**: `admin`
- **Request Body**:
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "role": "sales_rep",
  "password": "secure_password"
}
```

#### GET /users/:id
- **Access**: `admin`, `sales_manager`, `finance_ops`

#### PUT /users/:id
- **Access**: `admin`

#### DELETE /users/:id
- **Access**: `admin`

---

### 4.3 Customers & Tiers Module

#### GET /customers
- **Access**: `admin`, `sales_manager`, `finance_ops`, `sales_rep`
- **Response Payload (200 OK)**: List of customer profiles.

#### POST /customers
- **Access**: `admin`, `sales_manager`, `finance_ops`, `sales_rep`
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

#### GET /customer-tiers
- **Access**: All Authenticated Roles
- **Response Payload (200 OK)**:
```json
[
  { "id": "201", "tier_code": "bronze", "name": "Bronze Tier", "discount_ceiling_pct": 5.0 },
  { "id": "202", "tier_code": "silver", "name": "Silver Tier", "discount_ceiling_pct": 10.0 },
  { "id": "203", "tier_code": "gold", "name": "Gold Tier", "discount_ceiling_pct": 15.0 },
  { "id": "204", "tier_code": "platinum", "name": "Platinum Tier", "discount_ceiling_pct": 25.0 }
]
```

---

### 4.4 Catalog & Discount Governance Module

#### GET /categories
- **Access**: All Authenticated Roles

#### GET /products
- **Access**: All Authenticated Roles

#### GET /price-lists
- **Access**: All Authenticated Roles

#### GET /discount/rules
- **Access**: All Authenticated Roles

#### POST /discount/rules
- **Access**: `admin`, `finance_ops`
- **Request Body**:
```json
{
  "rule_name": "Enterprise Hardware Discount Cap",
  "category_type": "hardware",
  "max_discount_pct": 15.0
}
```

---

### 4.5 Quotations & Risk Pre-flight Engine

#### GET /quotations
- **Access**: All Authenticated Roles

#### POST /quotations
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
      "product_name": "Enterprise Server X",
      "category_type": "hardware",
      "quantity": 5,
      "unit_price": 1000.0,
      "cost_price": 700.0,
      "discount_pct": 12.0
    },
    {
      "product_id": "502",
      "product_name": "Implementation Service",
      "category_type": "service",
      "quantity": 1,
      "unit_price": 2000.0,
      "cost_price": 1200.0,
      "discount_pct": 18.0
    }
  ]
}
```
- **Response Payload (201 Created)**:
```json
{
  "id": "1102",
  "quote_number": "QT-2026-002",
  "blended_risk_score": 21.87,
  "status": "pending_approval",
  "requires_approval": true,
  "approval_levels": ["sales_manager", "finance_ops"],
  "total_amount": 6390.0,
  "overall_margin_pct": 33.33
}
```

#### POST /quotations/:id/re-evaluate-risk
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

---

### 4.6 Approvals Module

#### GET /approvals/pending
- **Access**: `sales_manager`, `finance_ops`, `admin`
- **Response Payload (200 OK)**: List of quotes requiring manager/finance approval.

#### POST /approvals/:id/approve
- **Access**: `sales_manager`, `finance_ops`, `admin`
- **Request Body**: `{ "comments": "Discount approved due to high annual contract value." }`

#### POST /approvals/:id/reject
- **Access**: `sales_manager`, `finance_ops`, `admin`
- **Request Body**: `{ "reason": "Margin below minimum threshold." }`

---

### 4.7 Negotiation Portal Module

#### GET /negotiations
- **Access**: All Authenticated Roles

#### POST /negotiations/:quoteId/counter
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**:
```json
{
  "proposed_discount_pct": 14.0,
  "customer_comments": "Can you offer 14% discount for 2-year commitment?"
}
```

#### POST /negotiations/:quoteId/accept
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`

---

### 4.8 Upsell & Cross-Sell Engine

#### GET /upsell-rules
- **Access**: All Authenticated Roles

#### POST /upsell/recommendations
- **Access**: All Authenticated Roles
- **Request Body**:
```json
{
  "current_cart_lines": [
    { "productId": "501", "quantity": 5, "unitPrice": 1000, "costPrice": 700, "discountPct": 10 }
  ]
}
```
- **Response Payload (200 OK)**:
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
      "reason": "Frequently bought together",
      "rankScore": 2.4
    }
  ]
}
```

---

### 4.9 Warehouses & Inventory Module

#### GET /warehouses
- **Access**: All Authenticated Roles

#### GET /inventory
- **Access**: All Authenticated Roles

#### POST /inventory/adjust
- **Access**: `admin`, `finance_ops`, `sales_manager`

---

### 4.10 Orders & Fulfillment Engine

#### GET /orders
- **Access**: All Authenticated Roles

#### GET /fulfillment/splits/:quoteId
- **Access**: All Authenticated Roles
- **Response Payload (200 OK)**:
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

---

### 4.11 Subscriptions, Invoices & Credit Notes Module

#### GET /subscriptions
- **Access**: All Authenticated Roles

#### GET /subscription-plans
- **Access**: All Authenticated Roles

#### GET /invoices
- **Access**: All Authenticated Roles

#### GET /invoices/:id
- **Access**: All Authenticated Roles
- **Response Payload (200 OK)**: Includes full hybrid billing schedule (one-time hardware vs recurring subscriptions).

#### GET /credit-notes
- **Access**: All Authenticated Roles

---

### 4.12 Payment Gateway APIs (Razorpay Integration)

#### POST /payments/create-order
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**:
```json
{
  "invoice_id": "inv_1101",
  "amount": 6390.0,
  "currency": "INR"
}
```
- **Response Payload (201 Created)**:
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

#### POST /payments/verify
- **Access**: `customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**:
```json
{
  "invoice_id": "inv_1101",
  "razorpay_order_id": "order_TYHNGvqLdMAi8I",
  "razorpay_payment_id": "pay_rzp_998877",
  "razorpay_signature": "hmac_signature_string"
}
```
- **Response Payload (200 OK)**:
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

#### POST /payments/webhook
- **Access**: Public / Gateway Webhook
- **Request Body**: Razorpay webhook payload (`event: payment.captured`)
- **Response Payload (200 OK)**: `{ "status": "ok", "received": true }`

#### GET /payments
- **Access**: `sales_manager`, `finance_ops`, `admin`
- **Response Payload (200 OK)**: Array of all payment transaction records.

#### GET /payments/:id
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`

#### GET /payments/:id/status
- **Access**: All Authenticated Roles (`customer`, `sales_rep`, `sales_manager`, `finance_ops`, `admin`)
- **Response Payload (200 OK)**:
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

#### POST /payments/:id/refund
- **Access**: `finance_ops`, `admin`
- **Request Body**:
```json
{
  "amount": 6390.0,
  "reason": "Customer requested order cancellation"
}
```
- **Response Payload (200 OK)**:
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund_id": "rfnd_101",
  "payment_id": "pay_101",
  "status": "refunded",
  "amount_refunded": 6390.0
}
```

---

### 4.13 Analytics, Reports & Deal Health Module

#### GET /dashboard/summary
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /reports/sales
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /deal-health/alerts
- **Access**: `sales_manager`, `finance_ops`, `admin`

#### GET /discount-history
- **Access**: `sales_manager`, `finance_ops`, `admin`

---

### 4.14 Interactive Channels & Audit Module

#### GET /whatsapp/menu
- **Access**: All Authenticated Roles

#### POST /email/send-quotation
- **Access**: `sales_rep`, `sales_manager`, `finance_ops`, `admin`
- **Request Body**: `{ "quotationId": "1101", "recipientEmail": "client@example.com" }`

#### GET /notifications
- **Access**: All Authenticated Roles

#### GET /audit
- **Access**: `sales_manager`, `finance_ops`, `admin`
