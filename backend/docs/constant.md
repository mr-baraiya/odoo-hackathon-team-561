[HOME](./index.md)

# DealFlow360 System Constants & Enums

---

## User System Roles

- `admin`: System-wide administrative access
- `sales_manager`: Managerial approvals, discount ceiling overrides, pipeline reports
- `finance_ops`: Financial approvals, price lists, invoices, credit notes, payment refunds
- `sales_rep`: Quotation drafting, line item management, customer directory lookup
- `customer`: Customer portal access, counter-proposal submission, payment execution

---

## Customer Tiers & Ceiling Percentages

- `bronze`: 5.0% discount ceiling
- `silver`: 10.0% discount ceiling
- `gold`: 15.0% discount ceiling
- `platinum`: 25.0% discount ceiling

---

## Product Category Types

- `hardware`: One-time physical inventory products
- `service`: Professional implementation, maintenance, or consulting services
- `subscription`: Recurring SaaS software subscription products

---

## Quotation Lifecycle Statuses

- `draft`: Initial quote composition by sales rep
- `pending_approval`: Requires manager or dual-approval based on blended risk score
- `approved`: Formally approved and ready for customer signature/conversion
- `rejected`: Approval denied by manager or finance ops
- `fulfilled`: Order generated and stock split allocated

---

## Payment Gateway & Transaction Statuses

- `created`: Razorpay payment intent initialized
- `completed`: HMAC-SHA256 signature verified or webhook `payment.captured` received
- `failed`: Payment attempt failed or rejected by gateway
- `refunded`: Full or partial refund issued via payment gateway
