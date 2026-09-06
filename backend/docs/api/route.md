[Home](./../index.md)

# DealFlow360 REST API Endpoint Catalog

---

## Endpoint Index

- [System Health & Connectivity](#system-health--connectivity)
- [Authentication & Session Management](#authentication--session-management)
- [User Identity & Roles](#user-identity--roles)
- [Customers Directory & Tiers](#customers-directory--tiers)
- [Product Catalog & Price Lists](#product-catalog--price-lists)
- [Quotations & Risk Engine](#quotations--risk-engine)
- [Approval Workflows](#approval-workflows)
- [Customer Portal Negotiations](#customer-portal-negotiations)
- [Upsell & Recommendations](#upsell--recommendations)
- [Inventory & Fulfillment Splits](#inventory--fulfillment-splits)
- [Orders, Invoices & Subscriptions](#orders-invoices--subscriptions)
- [Razorpay Payment Gateway](#razorpay-payment-gateway)
- [Analytics & System Audit](#analytics--system-audit)

---

## System Health & Connectivity

- `GET` `/health` or `/api/health`: Server uptime, memory heap, and PostgreSQL database status.
- `GET` `/ping`: Ping-pong response check.

---

## Authentication & Session Management

- `POST` `/api/auth/login`: Authenticate credentials and issue JWT bearer token.
- `GET` `/api/auth/me`: Retrieve current user profile from bearer token.
- `POST` `/api/auth/logout`: Terminate session token.
- `POST` `/api/auth/forgot-password`: Initiate password reset workflow.
- `POST` `/api/auth/reset-password`: Complete password reset using reset token.
- `POST` `/api/auth/magic-link`: Generate passwordless customer portal token.

---

## User Identity & Roles

- `GET` `/api/users`: List system users and assigned RBAC roles.
- `POST` `/api/users`: Create new user record (`admin` only).
- `GET` `/api/users/:id`: Fetch user record details.
- `PUT` `/api/users/:id`: Update user record (`admin` only).
- `DELETE` `/api/users/:id`: Remove user record (`admin` only).

---

## Customers Directory & Tiers

- `GET` `/api/customers`: List customer accounts with assigned tiers.
- `POST` `/api/customers`: Register new customer account.
- `GET` `/api/customers/:id`: Fetch customer profile details.
- `PUT` `/api/customers/:id`: Update customer details.
- `DELETE` `/api/customers/:id`: Delete customer record (`admin` only).
- `GET` `/api/customer-tiers`: List tier discount ceilings (`bronze`, `silver`, `gold`, `platinum`).

---

## Product Catalog & Price Lists

- `GET` `/api/categories`: List product category hierarchy and ceilings.
- `POST` `/api/categories`: Create product category (`admin` only).
- `GET` `/api/products`: List catalog products and SKUs.
- `POST` `/api/products`: Create catalog product (`admin` only).
- `GET` `/api/price-lists`: List price books and tier rates.

---

## Quotations & Risk Engine

- `GET` `/api/quotations`: List quotations across statuses.
- `POST` `/api/quotations`: Draft quotation and calculate blended risk score.
- `GET` `/api/quotations/:id`: Fetch quotation details and line items.
- `PUT` `/api/quotations/:id`: Update quotation line items.
- `POST` `/api/quotations/:id/re-evaluate-risk`: Recalculate risk score after edit.

---

## Approval Workflows

- `GET` `/api/approvals/pending`: List pending manager/finance approval requests.
- `POST` `/api/approvals/:id/approve`: Grant quotation approval.
- `POST` `/api/approvals/:id/reject`: Deny quotation approval with reason.

---

## Customer Portal Negotiations

- `GET` `/api/negotiations`: Fetch quotation counter-proposal history.
- `POST` `/api/negotiations/:quoteId/counter`: Submit counter-discount request.
- `POST` `/api/negotiations/:quoteId/accept`: Accept quotation terms.

---

## Upsell & Recommendations

- `GET` `/api/upsell-rules`: List co-purchase frequency rules.
- `POST` `/api/upsell/recommendations`: Calculate real-time margin delta preview for cart items.

---

## Inventory & Fulfillment Splits

- `GET` `/api/warehouses`: List distribution depots and shipping weight costs.
- `GET` `/api/inventory`: Check stock levels across warehouses.
- `GET` `/api/fulfillment/splits/:quoteId`: Calculate greedy warehouse allocation splits and backorders.

---

## Orders, Invoices & Subscriptions

- `GET` `/api/orders`: List confirmed customer orders.
- `POST` `/api/orders`: Convert approved quote to order.
- `GET` `/api/invoices`: List one-time and recurring invoices.
- `GET` `/api/subscriptions`: List SaaS subscription schedules.
- `GET` `/api/credit-notes`: List proration credit notes.

---

## Razorpay Payment Gateway

- `POST` `/api/payments/create-order`: Create Razorpay payment order for an invoice.
- `POST` `/api/payments/verify`: Validate HMAC-SHA256 signature and set invoice status to `PAID`.
- `POST` `/api/payments/webhook`: Asynchronous gateway webhook callback listener (`payment.captured`).
- `POST` `/api/payments/:id/refund`: Execute payment refund via gateway.

---

## Analytics & System Audit

- `GET` `/api/dashboard/summary`: Platform metrics and revenue summaries.
- `GET` `/api/reports/sales`: Sales pipeline performance reports.
- `GET` `/api/deal-health/alerts`: Automated risk and margin erosion alerts.
- `GET` `/api/audit`: Application audit log trail.
