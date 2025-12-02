# 🌟 Mini-Store-ERP - API and DB Documentation

The **Mini-Store-ERP API and DB Documentation**  provides details on available REST API endpoints, request/response formats, and the underlying database schema for building integrations or understanding backend data models.

Use this documentation to:
- 🪄 Explore authentication, product, purchase, sales, expense, report, and AI endpoints.
- 🪄 Review example requests and responses for each API route.
- 🪄 Understand the structure of database models for users, products, transactions, and more.

For questions or feedback, refer to the project repository

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "cashier"  // optional: "admin" or "cashier"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "cashier"
  }
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Request OTP (Optional)

```http
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Product Endpoints

#### Get All Products

```http
GET /api/v1/products?page=1&limit=20&search=coffee&category=beverages
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name or SKU
- `category`: Filter by category

#### Get Product by ID

```http
GET /api/v1/products/:id
Authorization: Bearer <token>
```

#### Create Product (Admin only)

```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "PRD001",
  "name": "Premium Coffee Beans",
  "category": "Beverages",
  "costPrice": 12.50,
  "sellPrice": 18.00,
  "unit": "kg",
  "currentStock": 100,
  "reorderThreshold": 20,
  "vendor": {
    "name": "Coffee Suppliers Inc.",
    "contact": "+1234567890"
  }
}
```

#### Update Product (Admin only)

```http
PUT /api/v1/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "sellPrice": 19.50,
  "currentStock": 120
}
```

#### Delete Product (Admin only)

```http
DELETE /api/v1/products/:id
Authorization: Bearer <token>
```

### Purchase Endpoints

#### Create Purchase (Admin only)

```http
POST /api/v1/purchases
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplier": "ABC Wholesale",
  "items": [
    {
      "productId": "64abc...",
      "qty": 50,
      "costPrice": 12.50
    }
  ],
  "invoiceRef": "INV-2025-001",
  "date": "2025-11-12"
}
```

#### Get All Purchases

```http
GET /api/v1/purchases?page=1&limit=20
Authorization: Bearer <token>
```

### Sales Endpoints

#### Create Sale

```http
POST /api/v1/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "64abc...",
      "qty": 2,
      "sellPrice": 18.00
    }
  ],
  "customer": {
    "name": "Jane Smith",
    "phone": "+1234567890",
    "email": "jane@example.com"
  },
  "paymentMethod": "cash",  // "cash", "card", "upi", "credit"
  "discount": 5.00,
  "taxes": 2.50,
  "notes": "Regular customer"
}
```

**Response:**

```json
{
  "success": true,
  "sale": {
    "_id": "...",
    "invoiceNumber": "INV-2025-001",
    "subtotal": 36.00,
    "discount": 5.00,
    "taxes": 2.50,
    "total": 33.50,
    "pdfUrl": "/public/invoices/INV-2025-001.pdf"
  }
}
```

#### Get All Sales

```http
GET /api/v1/sales?page=1&limit=20&from=2025-11-01&to=2025-11-12
Authorization: Bearer <token>
```

#### Get Sale by ID

```http
GET /api/v1/sales/:id
Authorization: Bearer <token>
```

### Expense Endpoints

#### Create Expense (Admin only)

```http
POST /api/v1/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "Utilities",
  "amount": 150.00,
  "note": "Monthly electricity bill",
  "date": "2025-11-12"
}
```

#### Get All Expenses

```http
GET /api/v1/expenses?from=2025-11-01&to=2025-11-30&category=Utilities
Authorization: Bearer <token>
```

### Report Endpoints

#### Get Summary Report

```http
GET /api/v1/reports/summary?from=2025-11-01&to=2025-11-12
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "summary": {
    "totalRevenue": 15000.00,
    "totalCogs": 9000.00,
    "grossProfit": 6000.00,
    "totalExpenses": 2000.00,
    "netProfit": 4000.00,
    "totalSales": 150,
    "topProducts": [...]
  }
}
```

#### Get Top Products

```http
GET /api/v1/reports/top-products?period=7d&limit=10
Authorization: Bearer <token>
```

**Period Options:**
- `7d`: Last 7 days
- `30d`: Last 30 days
- `90d`: Last 90 days
- `custom`: Use `from` and `to` parameters

#### Get Low Stock Items

```http
GET /api/v1/reports/low-stock
Authorization: Bearer <token>
```

### LLM (AI) Endpoints

#### Natural Language Query

```http
POST /api/v1/llm/nlq
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "Show me profit for last week"
}
```

**Example Queries:**
- "What were my sales yesterday?"
- "Which products are low on stock?"
- "Show top selling items this month"
- "Calculate profit for last week"

#### Generate Business Insights

```http
POST /api/v1/llm/insights
Authorization: Bearer <token>
Content-Type: application/json

{
  "context": {
    "revenue": 12800.00,
    "grossProfit": 4200.00,
    "topProducts": [...],
    "lowStock": [...]
  }
}
```

**Response:**

```json
{
  "success": true,
  "insights": "Based on your sales data, here are key insights:\n1. Revenue is up 15% compared to last week...\n2. Consider restocking Product XYZ..."
}
```

---

## 🗄️ Database Schema

### User Model

```typescript
{
  email: string (unique, required)
  passwordHash: string (required)
  name: string (required)
  phone: string
  role: 'admin' | 'cashier' (default: 'cashier')
  otpSecret: string (optional)
  isActive: boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

### Product Model

```typescript
{
  sku: string (unique, required)
  name: string (required)
  category: string
  costPrice: number (required)
  sellPrice: number (required)
  unit: string (required)
  currentStock: number (default: 0)
  reorderThreshold: number (default: 10)
  vendor: {
    name: string
    contact: string
    address: string
  }
  isActive: boolean (default: true)
  createdBy: ObjectId (ref: User)
  updatedBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

### Purchase Model

```typescript
{
  supplier: string (required)
  items: [{
    productId: ObjectId (ref: Product, required)
    qty: number (required)
    costPrice: number (required)
  }]
  totalAmount: number (required)
  invoiceRef: string
  date: Date (required)
  createdBy: ObjectId (ref: User, required)
  createdAt: Date
  updatedAt: Date
}
```

### Sale Model

```typescript
{
  invoiceNumber: string (unique, required)
  customer: {
    name: string
    phone: string
  }
  items: [{
    productId: ObjectId (ref: Product, required)
    name: string (required)
    qty: number (required)
    sellPrice: number (required)
    costPrice: number (required)
  }]
  subtotal: number (required)
  taxes: number (default: 0)
  discount: number (default: 0)
  total: number (required)
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit' (required)
  date: Date (default: Date.now)
  createdBy: ObjectId (ref: User, required)
  pdfUrl: string
  createdAt: Date
  updatedAt: Date
}
```

### StockTransaction Model

```typescript
{
  productId: ObjectId (ref: Product, required)
  type: 'purchase' | 'sale' | 'adjustment' (required)
  qty: number (required)
  unitPrice: number (required)
  saleId: ObjectId (ref: Sale, optional)
  purchaseId: ObjectId (ref: Purchase, optional)
  createdBy: ObjectId (ref: User, optional) // For manual adjustments
  note: string // For adjustment reasons
  date: Date (default: Date.now)
  createdAt: Date
  updatedAt: Date
}
```

### Expense Model

```typescript
{
  category: string (required)
  amount: number (required)
  note: string
  date: Date (required)
  createdBy: ObjectId (ref: User)
  createdAt: Date
}
```

### Setting Model

```typescript
{
  key: string (unique, required)
  value: any (required)
  description: string
  updatedBy: ObjectId (ref: User)
  updatedAt: Date
}
```

---

## 🧪 Testing

Use **Postman** or **Thunder Client** to test API endpoints. Import endpoints from the API documentation above.

---