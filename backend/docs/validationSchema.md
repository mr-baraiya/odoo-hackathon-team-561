[HOME](./index.md)

# DealFlow360 Joi Validation Schemas

---

## Authentication Schemas

### User Login
- `email`: Required, valid email string
- `password`: Required, min 3 characters, max 100 characters

### Password Reset
- `token`: Required string
- `newPassword`: Required, min 6 characters, max 100 characters

---

## Customer Management Schemas

### Create Customer
- `company_name`: Required string, max 255 characters
- `contact_person`: Required string, max 255 characters
- `email`: Required, valid email string
- `phone`: Optional string, formatted phone number
- `tier_id`: Required string or integer primary key

---

## Quotation & Risk Scoring Schemas

### Create Quotation
- `customer_id`: Required string/integer primary key
- `customer_tier_code`: Required string (`bronze`, `silver`, `gold`, `platinum`)
- `order_discount_pct`: Optional number, min 0.0, max 100.0
- `line_items`: Required array of items (min 1 item)
  - `product_id`: Required string/integer primary key
  - `category_type`: Required string (`hardware`, `service`, `subscription`)
  - `quantity`: Required integer, min 1
  - `unit_price`: Required number, min 0.0
  - `cost_price`: Required number, min 0.0
  - `discount_pct`: Optional number, min 0.0, max 100.0

---

## Negotiation & Counter Proposal Schemas

### Submit Counter Offer
- `proposed_discount_pct`: Required number, min 0.0, max 100.0
- `customer_comments`: Optional string, max 1000 characters

---

## Payment Gateway Schemas

### Create Payment Order
- `invoice_id`: Required string/integer primary key
- `amount`: Required number, greater than 0
- `currency`: Optional string, default `INR`

### Verify Payment Signature
- `invoice_id`: Required string/integer primary key
- `razorpay_order_id`: Required string
- `razorpay_payment_id`: Required string
- `razorpay_signature`: Required string
