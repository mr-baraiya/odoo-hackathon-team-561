# DealFlow360 Sales Analytics & Deal Health API

## Overview

The Sales Analytics & Deal Health API provides comprehensive performance analytics, margin erosion tracking, blended risk monitoring, and automated deal alerts across quotations and customer accounts.

---

## Endpoints

```http
GET /api/reports/sales
GET /api/deal-health/alerts
GET /api/discount-history
```

---

## Authentication & Authorization

- Required: Yes (HTTP Bearer JWT Token)
- Access Roles: `admin`, `sales_manager`, `finance_ops`

---

## 1. Sales Performance Report

### GET /api/reports/sales

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `from` | ISO Date | No | - | Start date filter (inclusive) |
| `to` | ISO Date | No | - | End date filter (inclusive) |
| `tier_code` | String | No | All | Filter by customer tier (`bronze`, `silver`, `gold`, `platinum`) |

#### Sample Response (200 OK)

```json
{
  "summary": {
    "total_quotations": 42,
    "total_revenue": 185400.00,
    "average_margin_pct": 34.2,
    "auto_approval_rate_pct": 68.5,
    "pending_approvals_count": 5
  },
  "by_tier": [
    { "tier_code": "gold", "deals_count": 18, "revenue": 94200.00, "avg_discount": 11.4 },
    { "tier_code": "platinum", "deals_count": 12, "revenue": 68000.00, "avg_discount": 18.2 }
  ]
}
```

---

## 2. Deal Health & Risk Alerts

### GET /api/deal-health/alerts

Identifies quotations exhibiting high blended risk scores, margin erosion below threshold, or pending dual-approval bottlenecks.

#### Sample Response (200 OK)

```json
{
  "alerts": [
    {
      "quote_id": "1102",
      "quote_number": "QT-2026-002",
      "customer_name": "Acme Corp",
      "blended_risk_score": 21.87,
      "alert_type": "HIGH_RISK_SCORE",
      "severity": "WARNING",
      "message": "Blended risk score 21.87 exceeds threshold 15. Requires dual approval.",
      "created_at": "2026-09-05T12:30:00.000Z"
    }
  ]
}
```

---

## 3. Historic Discount Audit Log

### GET /api/discount-history

Returns an audit record of line-level discount overrides and counter-proposal negotiations.

#### Sample Response (200 OK)

```json
{
  "history": [
    {
      "id": "1001",
      "quote_id": "1101",
      "product_sku": "HW-SRV-01",
      "original_discount_pct": 5.0,
      "requested_discount_pct": 14.0,
      "approved_discount_pct": 12.0,
      "approved_by_user_id": "102",
      "timestamp": "2026-09-05T14:15:00.000Z"
    }
  ]
}
```
