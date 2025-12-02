# 🌟 Mini-Store-ERP - Backend (Server)

The **Mini-Store-ERP Backend Server** is a robust, scalable RESTful API built with Node.js, Express.js, and TypeScript. It powers the complete retail store management system with secure authentication, comprehensive inventory management, sales tracking, AI-powered business insights using Groq LLM, and automated PDF invoice generation. The server implements industry-standard security practices including JWT authentication, rate limiting, input validation, and MongoDB injection prevention.

🔗 **Main Project**: [Main README](../README.md) | [Client README](../client/README.md)

---

## ✨ Features

- **🔐 Authentication & Authorization**: Secure JWT-based authentication with role-based access control (Admin/Cashier)
- **📦 Product Management**: Complete CRUD operations, real-time stock tracking, reorder alerts, and vendor management
- **🛒 Purchase Management**: Track supplier purchases with automatic stock updates and transaction history
- **💰 Sales & POS**: Fast POS interface with automatic stock deduction, PDF invoices, and multiple payment methods
- **📊 Reports & Analytics**: Real-time revenue tracking, COGS calculation, top products analysis, and visual charts
- **🤖 AI-Powered Insights**: Natural language queries, automated business insights, and smart reorder suggestions via Groq LLM
- **📄 PDF Generation**: Server-side invoice generation and client-side report export
- **🎨 Modern UI**: Responsive TailwindCSS design with interactive dashboard and real-time data visualization

---

## 🛠️ Tech Stack

### Backend (Server)
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **LLM Integration**: Groq API (LLaMA models)
- **PDF Generation**: jsPDF
- **Security**: Helmet, CORS, Rate Limiting, express-validator
- **Dev Tools**: nodemon, ts-node

---

## 📂 Project Structure

```plaintext
server/
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.ts       # MongoDB connection setup
│   │   └── index.ts          # Environment variables config
│   ├── controllers/          # Route controllers (business logic)
│   │   ├── authController.ts, expenseController.ts,  llmController.ts,        
│   │   ├── productController.ts, purchaseController.ts,   
│   │   └── reportController.ts, saleController.ts   
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts, errorHandler.ts, validator.ts  
│   ├── models/               # Mongoose data models
│   │   ├── Expense.ts,Product.ts, Purchase.ts,       
│   │   ├── Sale.ts, Setting.ts, StockTransaction.ts,
│   │   ├── User.ts, index.ts       
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.ts, expenseRoutes.ts,  llmRoutes.ts,        
│   │   ├── productRoutes.ts, purchaseRoutes.ts,   
│   │   └── reportRoutes.ts, saleRoutes.ts   
│   ├── services/             # Business logic services
│   │   ├── groqService.ts    # Groq LLM integration
│   │   └── pdfService.ts     # PDF generation service
│   ├── utils/                # Utility functions
│   │   ├── cache.ts, crypto.ts,       
│   │   ├── jwt.ts, settings.ts       
│   ├── app.ts                # Express app configuration
│   └── index.ts              # Server entry point
├── public/                   # Static files (PDFs, uploads)
├── .env                      # Environment variables (not in git)
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

   Create a new `.env` file with the following variables:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database
   MONGODB_URI=your-mongodb-url-connection-link

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
     - Development: `http://localhost:5173`
     - Production: Your deployed frontend URL (e.g., `https://your-app.onrender.com`)

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

**Important**: After deploying both frontend and backend:
1. Update the backend's `CORS_ORIGIN` environment variable with your deployed frontend URL
2. Update the frontend's `vite.config.ts` proxy target with your deployed backend URL
3. This ensures proper communication between your deployed applications

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

## 🐛 Troubleshooting

- **MongoDB Connection Error**: Ensure MongoDB is running and `MONGODB_URI` is correct in `.env`
- **JWT Authentication Error**: Verify `JWT_SECRET` is set and token is sent as `Authorization: Bearer <token>`
- **Groq API Error**: Check `GROQ_API_KEY` in `.env` file and verify it's active
- **CORS Error**: Set `CORS_ORIGIN` to match frontend URL in `.env`
- **Port Already in Use**: Change `PORT` in `.env` or kill the process: `npx kill-port 5000`

---

## 🤝 Contributing

Pull requests are welcome! Feel free to fork the repository and suggest improvements.

Steps to contribute:
```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature-name
# 3. Commit your changes
git commit -m "Add feature description"
# 4. Push to GitHub
git push origin feature-name
# 5. Open a Pull Request
```

---

## 📧 Contact
For queries or suggestions:
- 📩 Email: [spreveen123@gmail.com](mailto:spreveen123@gmail.com)
- 🌐 LinkedIn: [www.linkedin.com/in/preveen-s-17250529b/](https://www.linkedin.com/in/preveen-s-17250529b/)

---

## 🌟 Show Your Support
If you like this project, please consider giving it a ⭐ on GitHub!
