# 🌟 Mini-Store-ERP - Backend Server

The **Mini-Store-ERP Backend Server** is a robust, scalable RESTful API built with Node.js, Express.js, and TypeScript. It powers the complete retail store management system with secure authentication, comprehensive inventory management, sales tracking, AI-powered business insights using Groq LLM, and automated PDF invoice generation. The server implements industry-standard security practices including JWT authentication, rate limiting, input validation, and MongoDB injection prevention.

🔗 **Main Project**: [Main README](../README.md) | [Client README](../client/README.md)

---

## ✨ Features

**🔐 Authentication & Authorization:** Secure JWT-based authentication with role-based access control (Admin/Cashier)
**📦 Product Management:** Complete CRUD operations, real-time stock tracking, reorder alerts, and vendor management
**🛒 Purchase Management:** Track supplier purchases with automatic stock updates and transaction history
**💰 Sales & POS:** Fast POS interface with automatic stock deduction, PDF invoices, and multiple payment methods
**📊 Reports & Analytics:** Real-time revenue tracking, COGS calculation, top products analysis, and visual charts
**🤖 AI-Powered Insights:** Natural language queries, automated business insights, and smart reorder suggestions via Groq LLM
**📄 PDF Generation:** Server-side invoice generation and client-side report export
**🎨 Modern UI:** Responsive TailwindCSS design with interactive dashboard and real-time data visualization

---

## 📂 Project Structure

```plaintext
server/
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.ts       # MongoDB connection setup
│   │   └── index.ts          # Environment variables config
│   ├── controllers/          # Route controllers (business logic)
│   │   ├── authController.ts         # Authentication logic
│   │   ├── expenseController.ts      # Expense management
│   │   ├── llmController.ts          # AI/LLM endpoints
│   │   ├── productController.ts      # Product CRUD
│   │   ├── purchaseController.ts     # Purchase management
│   │   ├── reportController.ts       # Analytics & reports
│   │   └── saleController.ts         # Sales & invoicing
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts           # JWT authentication middleware
│   │   ├── errorHandler.ts   # Global error handler
│   │   └── validator.ts      # Request validation
│   ├── models/               # Mongoose data models
│   │   ├── Expense.ts        # Expense schema
│   │   ├── Product.ts        # Product schema
│   │   ├── Purchase.ts       # Purchase schema
│   │   ├── Sale.ts           # Sale schema
│   │   ├── Setting.ts        # Settings schema
│   │   ├── StockTransaction.ts # Stock audit trail
│   │   ├── User.ts           # User schema
│   │   └── index.ts          # Model exports
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.ts     # /auth endpoints
│   │   ├── expenseRoutes.ts  # /expenses endpoints
│   │   ├── llmRoutes.ts      # /llm endpoints
│   │   ├── productRoutes.ts  # /products endpoints
│   │   ├── purchaseRoutes.ts # /purchases endpoints
│   │   ├── reportRoutes.ts   # /reports endpoints
│   │   └── saleRoutes.ts     # /sales endpoints
│   ├── services/             # Business logic services
│   │   ├── groqService.ts    # Groq LLM integration
│   │   └── pdfService.ts     # PDF generation service
│   ├── utils/                # Utility functions
│   │   ├── cache.ts          # Caching utilities
│   │   ├── crypto.ts         # Encryption helpers
│   │   ├── jwt.ts            # JWT token utilities
│   │   └── settings.ts       # Settings management
│   ├── app.ts                # Express app configuration
│   └── index.ts              # Server entry point
├── public/                   # Static files (PDFs, uploads)
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── nodemon.json              # Nodemon configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── RATE_LIMITS.md            # Rate limiting documentation
└── README.md                 # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **MongoDB**: Local installation or MongoDB Atlas account
- **Groq API Key**: Get free API key at [Groq Console](https://console.groq.com)

### Installation Steps

1. **Navigate to server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Or create a new `.env` file with the following variables:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database
   MONGODB_URI=mongodb://localhost:27017/mini-store-erp

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=24h

   # Groq AI Configuration
   GROQ_API_KEY=your-groq-api-key-here

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Optional: OTP Configuration (if using)
   OTP_SECRET=your-otp-secret-key
   ```

   **Environment Variables Explained:**
   - `NODE_ENV`: Environment (development/production)
   - `PORT`: Server port (default: 5000)
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT signing (use strong random string)
   - `JWT_EXPIRE`: JWT token expiration time
   - `GROQ_API_KEY`: Your Groq API key for AI features
   - `CORS_ORIGIN`: Frontend URL for CORS (comma-separated for multiple origins)

4. **Start MongoDB** (if running locally)

   ```bash
   # Windows
   mongod

   # Linux/Mac
   sudo systemctl start mongod
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

   Server will start at <http://localhost:5000>

6. **Build for production**

   ```bash
   npm run build
   ```

7. **Run production server**

   ```bash
   npm start
   ```

---

## 📜 Available Scripts

### Development

```bash
# Start development server with auto-reload
npm run dev
```

### Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests (when implemented)
npm test
```

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
  "supplier": {
    "name": "ABC Wholesale",
    "contact": "+1234567890",
    "address": "123 Supply St"
  },
  "items": [
    {
      "productId": "64abc...",
      "qty": 50,
      "unitPrice": 12.50
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
  supplier: {
    name: string (required)
    contact: string
    address: string
  }
  items: [{
    productId: ObjectId (ref: Product, required)
    qty: number (required)
    unitPrice: number (required)
  }]
  totalAmount: number (required)
  invoiceRef: string
  date: Date (required)
  createdBy: ObjectId (ref: User)
  createdAt: Date
}
```

### Sale Model

```typescript
{
  invoiceNumber: string (unique, auto-generated)
  customer: {
    name: string
    phone: string
    email: string
  }
  items: [{
    productId: ObjectId (ref: Product, required)
    productName: string
    qty: number (required)
    sellPrice: number (required)
  }]
  subtotal: number (required)
  taxes: number (default: 0)
  discount: number (default: 0)
  total: number (required)
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit'
  pdfUrl: string
  notes: string
  createdBy: ObjectId (ref: User)
  createdAt: Date
}
```

### StockTransaction Model

```typescript
{
  productId: ObjectId (ref: Product, required)
  type: 'purchase' | 'sale' | 'adjustment' (required)
  qty: number (required)
  unitPrice: number (required)
  referenceId: ObjectId  // saleId or purchaseId
  referenceType: 'Sale' | 'Purchase' | 'Adjustment'
  note: string
  createdBy: ObjectId (ref: User)
  createdAt: Date
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

## 🚀 Deployment

### Deployment on Render

1. **Create Web Service** on Render

2. **Connect Repository**
   - Link your GitHub repository
   - Select the `server` directory as root

3. **Configure Build Settings:**
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`

4. **Set Environment Variables:**
   Add all variables from `.env`:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `JWT_SECRET=<strong-random-string>`
   - `GROQ_API_KEY=<your-groq-key>`
   - `CORS_ORIGIN=<your-frontend-url>`

5. **Deploy**
   - Render will automatically build and deploy
   - Note the deployment URL for frontend configuration

### MongoDB Atlas Setup

1. **Create Account**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Free tier available
3. **Create Database User**: Set username and password
4. **Whitelist IP**: Add `0.0.0.0/0` for Render access
5. **Get Connection String**: Copy MongoDB URI
6. **Update Environment**: Add to Render environment variables

### Health Check Endpoint

```http
GET /api/v1/health
```

Use this endpoint for uptime monitoring.

---

## 🧪 Testing

Use **Postman** or **Thunder Client** to test API endpoints. Import endpoints from the API documentation above.

---

---

## 🐛 Troubleshooting

**MongoDB Connection Error**: Ensure MongoDB is running and `MONGODB_URI` is correct in `.env`

**JWT Authentication Error**: Verify `JWT_SECRET` is set and token is sent as `Authorization: Bearer <token>`

**Groq API Error**: Check `GROQ_API_KEY` in `.env` file and verify it's active

**CORS Error**: Set `CORS_ORIGIN` to match frontend URL in `.env`

**Port Already in Use**: Change `PORT` in `.env` or kill the process: `npx kill-port 5000`

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 📧 Support

For issues or questions:

- 📩 Email: <your-email@example.com>
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/mini-store-erp/issues)
- 📖 Docs: [Main README](../README.md)

---

**Built with ❤️ using Node.js + TypeScript + Express.js + MongoDB**


