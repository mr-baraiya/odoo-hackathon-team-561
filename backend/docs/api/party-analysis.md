# Party Analysis by Items API

## Overview

This API endpoint provides comprehensive analysis of party data by items with profit calculations. It analyzes sales transactions for a specific party and calculates profit margins based on purchase prices and sale rates.

## Endpoint

```
GET /api/parties/:party_id/analysis-by-items
```

## Authentication

- **Required**: Yes (Private Route)
- **Permission**: `party.read` for the party's company
- **Access**: Available to all authenticated users with party read permissions

## URL Parameters

| Parameter  | Type | Required | Description                                   |
| ---------- | ---- | -------- | --------------------------------------------- |
| `party_id` | UUID | Yes      | The unique identifier of the party to analyze |

## Query Parameters

| Parameter         | Type     | Required | Default    | Description                                 |
| ----------------- | -------- | -------- | ---------- | ------------------------------------------- |
| `from`            | ISO Date | No       | -          | Start date for analysis (inclusive)         |
| `to`              | ISO Date | No       | -          | End date for analysis (inclusive)           |
| `order_by`        | String   | No       | `quantity` | Sort order: `quantity`, `profit`, or `rate` |
| `order_direction` | String   | No       | `desc`     | Sort direction: `asc` or `desc`             |
| `limit`           | Number   | No       | `30`       | Maximum number of results (1-100)           |
| `offset`          | Number   | No       | `0`        | Number of results to skip                   |

## Request Examples

### Basic Request

```bash
GET /api/parties/123e4567-e89b-12d3-a456-426614174000/analysis-by-items
```

### With Date Range and Sorting

```bash
GET /api/parties/123e4567-e89b-12d3-a456-426614174000/analysis-by-items?from=2024-01-01&to=2024-12-31&order_by=profit&order_direction=desc&limit=50
```

### With Pagination

```bash
GET /api/parties/123e4567-e89b-12d3-a456-426614174000/analysis-by-items?limit=20&offset=40
```

## Response Structure

### Success Response (200)

```json
{
  "party": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "ABC Company",
    "type": "customer",
    "company_id": "456e7890-e89b-12d3-a456-426614174000"
  },
  "filters": {
    "from": "2024-01-01T00:00:00.000Z",
    "to": "2024-12-31T23:59:59.999Z",
    "order_by": "profit",
    "order_direction": "desc",
    "is_black": false
  },
  "summary": {
    "total_products": 25,
    "total_quantity_sold": 150.5,
    "total_sales_amount": 75000.0,
    "unique_products_sold": 20,
    "average_rate_per_unit": 498.34
  },
  "data": [
    {
      "product_id": "789e0123-e89b-12d3-a456-426614174000",
      "product_name": "Gold Ring 18K",
      "category_name": "Rings",
      "metal_category_name": "Gold",
      "purchase_price": 400.0,
      "product_price": 500.0,
      "transaction_count": 5,
      "total_quantity": 10.5,
      "avg_rate": 520.0,
      "avg_discount": 5.0,
      "avg_gst": 18.0,
      "total_sale_amount": 5460.0,
      "total_cost_amount": 4200.0,
      "total_profit": 1260.0,
      "avg_profit_per_unit": 120.0,
      "profit_margin_percentage": 30.0,
      "last_sale_date": "2024-12-15T10:30:00.000Z",
      "first_sale_date": "2024-01-10T14:20:00.000Z"
    }
  ],
  "pagination": {
    "limit": 30,
    "offset": 0,
    "total": 25
  }
}
```

## Response Fields

### Party Information

- `id`: Unique party identifier
- `name`: Party name
- `type`: Party type (company, customer, supplier)
- `company_id`: Associated company ID

### Filters Applied

- `from`: Start date filter
- `to`: End date filter
- `order_by`: Sort field used
- `order_direction`: Sort direction used
- `is_black`: Black/white transaction filter

### Summary Statistics

- `total_products`: Total number of products sold
- `total_quantity_sold`: Total quantity sold across all products
- `total_sales_amount`: Total sales revenue
- `unique_products_sold`: Number of unique products sold
- `average_rate_per_unit`: Average sale rate per unit

### Product Analysis Data

- `product_id`: Unique product identifier
- `product_name`: Product name
- `category_name`: Product category
- `metal_category_name`: Metal category
- `purchase_price`: Product purchase price
- `product_price`: Product list price
- `transaction_count`: Number of transactions for this product
- `total_quantity`: Total quantity sold
- `avg_rate`: Average sale rate
- `avg_discount`: Average discount percentage applied
- `avg_gst`: Average GST percentage applied
- `total_sale_amount`: Total sales amount for this product
- `total_cost_amount`: Total cost amount for this product
- `total_profit`: Total profit for this product
- `avg_profit_per_unit`: Average profit per unit
- `profit_margin_percentage`: Profit margin percentage
- `last_sale_date`: Date of last sale
- `first_sale_date`: Date of first sale

### Pagination

- `limit`: Results per page
- `offset`: Results skipped
- `total`: Total number of results

## Business Logic

### Profit Calculation

- **Total Profit**: `(sale_price - purchase_price) × quantity`
- **Profit Margin**: `(total_profit / total_cost_amount) × 100`
- **Average Profit per Unit**: `total_profit / total_quantity`

### Transaction Types

- **Sales**: Positive quantity and amounts
- **Sale Returns**: Negative quantity and amounts (deducted from totals)

### Filtering

- Only includes products with net positive quantity sold
- Filters by transaction type (sale, sale_return)
- Only includes transactions where `affect_inventory = true`
- Supports date range filtering

### Sorting Options

1. **Quantity** (default): Orders by highest quantity sold
2. **Profit**: Orders by highest profit margin
3. **Rate**: Orders by highest sale rate

## Error Responses

### 404 - Party Not Found

```json
{
  "error": "NOT_FOUND",
  "message": "Party not found."
}
```

### 403 - Permission Denied

```json
{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions to access this party."
}
```

### 400 - Validation Error

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request parameters",
  "details": [...]
}
```

## Use Cases

1. **Sales Analysis**: Analyze which products are most profitable for a specific customer
2. **Profit Optimization**: Identify products with highest profit margins
3. **Customer Insights**: Understand customer buying patterns and preferences
4. **Inventory Planning**: Plan inventory based on customer demand
5. **Pricing Strategy**: Adjust pricing based on profit margins

## Performance Considerations

- Uses optimized SQL queries with CTEs (Common Table Expressions)
- Implements proper indexing on party_id, date, and transaction_type
- Supports pagination for large datasets
- Filters data at database level for optimal performance

## Security

- Validates party ownership and company permissions
- Ensures users can only access parties within their company
- Implements proper input validation and sanitization
- Uses parameterized queries to prevent SQL injection
