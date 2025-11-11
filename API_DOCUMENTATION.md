# API Documentation

This document describes all REST API endpoints available in the Flowbit Analytics Backend.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: Configure via `NEXT_PUBLIC_API_BASE` environment variable

## Endpoints

### Health Check

#### `GET /health`

Check if the API server is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

### Statistics

#### `GET /stats`

Returns summary metrics for the overview cards.

**Response:**
```json
{
  "totalInvoicesProcessed": 1250,
  "totalSpendYTD": 245678.90,
  "documentsUploaded": 1300,
  "averageInvoiceValue": 196.54,
  "totalSpend": 245678.90
}
```

**Fields:**
- `totalInvoicesProcessed`: Number of invoices with status "processed"
- `totalSpendYTD`: Total spend from January 1st of current year to today
- `documentsUploaded`: Total count of all documents/invoices
- `averageInvoiceValue`: Average value of all invoices
- `totalSpend`: Total spend across all invoices (for backward compatibility)

---

### Invoice Trends

#### `GET /invoice-trends`

Returns monthly invoice count and spend trends.

**Response:**
```json
[
  {
    "month": "2024-01",
    "count": 45,
    "spend": 12345.67
  },
  {
    "month": "2024-02",
    "count": 52,
    "spend": 15678.90
  }
]
```

**Fields:**
- `month`: Month in YYYY-MM format
- `count`: Number of invoices in that month
- `spend`: Total spend in that month (EUR)

---

### Top Vendors

#### `GET /vendors/top10`

Returns top 10 vendors by total spend.

**Response:**
```json
[
  {
    "vendorName": "Acme Corporation",
    "totalSpend": 45678.90,
    "invoiceCount": 25
  },
  {
    "vendorName": "Tech Solutions Inc",
    "totalSpend": 34567.89,
    "invoiceCount": 18
  }
]
```

**Fields:**
- `vendorName`: Name of the vendor
- `totalSpend`: Total amount spent with this vendor (EUR)
- `invoiceCount`: Number of invoices from this vendor

**Note:** Results are sorted by `totalSpend` in descending order, limited to top 10.

---

### Category Spend

#### `GET /category-spend`

Returns spend breakdown grouped by category.

**Response:**
```json
[
  {
    "category": "Office Supplies",
    "total": 12345.67
  },
  {
    "category": "Software Licenses",
    "total": 9876.54
  },
  {
    "category": "Uncategorized",
    "total": 5432.10
  }
]
```

**Fields:**
- `category`: Category name (from line items)
- `total`: Total spend in this category (EUR)

**Note:** Results are sorted by `total` in descending order.

---

### Cash Outflow Forecast

#### `GET /cash-outflow`

Returns cash outflow forecast based on historical data.

**Query Parameters:**
- `months` (optional): Number of months to look back (default: 6)

**Example:**
```
GET /cash-outflow?months=6
```

**Response:**
```json
[
  {
    "month": "2024-01",
    "spend": 12345.67
  },
  {
    "month": "2024-02",
    "spend": 15678.90
  },
  {
    "month": "2024-03",
    "spend": 14567.89
  },
  {
    "month": "2024-07",
    "spend": 14197.82
  }
]
```

**Fields:**
- `month`: Month in YYYY-MM format
- `spend`: Forecasted spend for that month (EUR)

**Note:** The last entry is a forecast for the next month based on the average of historical months.

---

### Invoices List

#### `GET /invoices`

Returns a paginated list of invoices with optional search.

**Query Parameters:**
- `search` (optional): Search term for invoice ID or vendor name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Example:**
```
GET /invoices?search=ACME&page=1&limit=20
```

**Response:**
```json
[
  {
    "id": "uuid-here",
    "invoiceId": "INV-2024-001",
    "invoiceDate": "2024-01-15T00:00:00.000Z",
    "vendorName": "Acme Corporation",
    "invoiceTotal": 1234.56,
    "status": "processed"
  },
  {
    "id": "uuid-here-2",
    "invoiceId": "INV-2024-002",
    "invoiceDate": "2024-01-16T00:00:00.000Z",
    "vendorName": "Tech Solutions Inc",
    "invoiceTotal": 2345.67,
    "status": "processed"
  }
]
```

**Fields:**
- `id`: Unique invoice ID (UUID)
- `invoiceId`: Invoice number/identifier
- `invoiceDate`: Date of the invoice (ISO 8601)
- `vendorName`: Name of the vendor
- `invoiceTotal`: Total amount of the invoice (EUR)
- `status`: Invoice status (e.g., "processed", "pending")

**Note:** Results are sorted by `invoiceDate` in descending order (newest first).

---

### Chat with Data

#### `POST /chat-with-data`

Proxies natural language queries to the Vanna AI service for SQL generation and execution.

**Request Body:**
```json
{
  "query": "What are the top 5 vendors by total spend?"
}
```

**Response:**
```json
{
  "sql": "SELECT vendor_name, SUM(invoice_total) as total_spend FROM Invoice GROUP BY vendor_name ORDER BY total_spend DESC LIMIT 5;",
  "result": [
    {
      "vendor_name": "Acme Corporation",
      "total_spend": "45678.90"
    },
    {
      "vendor_name": "Tech Solutions Inc",
      "total_spend": "34567.89"
    }
  ]
}
```

**Fields:**
- `sql`: Generated SQL query
- `result`: Array of query results (each object represents a row)

**Error Response:**
```json
{
  "error": "Query is required"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad request (missing query or SQL execution error)
- `500`: Server error (Vanna service unavailable or other error)

**Note:** This endpoint forwards the request to the Vanna AI service configured via `VANNA_SERVICE_URL` environment variable.

---

## Error Handling

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error (database or service error)

---

## CORS

The API has CORS enabled for all origins in development. For production, configure allowed origins in `apps/api/src/index.ts`.

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting for production deployments.

---

## Authentication

Currently, there is no authentication required. For production, consider adding:
- API key authentication
- JWT tokens
- OAuth2

