# 🌟 Mini-Store-ERP - Frontend Client

The **Mini-Store-ERP Client** is a modern, responsive React-based frontend application built with TypeScript and Vite. It provides an intuitive user interface for managing retail store operations including inventory, sales, purchases, expenses, and AI-powered business insights.

🔗 **Main Project**: [Main README](../README.md) | [Server README](../server/README.md)

---

## ✨ Features

### 🎨 User Interface
- **Modern Design**: Clean and intuitive interface built with TailwindCSS
- **Responsive Layout**: Fully responsive design that works on desktop, tablet, and mobile
- **Dark Mode Ready**: Component structure supports easy dark mode implementation
- **Toast Notifications**: Real-time user feedback with React Hot Toast
- **Loading States**: Smooth loading indicators for better UX

### 📊 Dashboard
- **Real-time Analytics**: Live revenue, profit, and sales metrics
- **Visual Charts**: Interactive charts and graphs using Recharts
- **Quick Stats**: Key performance indicators at a glance
- **Top Products**: Visual representation of best-selling items
- **Low Stock Alerts**: Immediate visibility of products needing reorder
- **AI Insights**: Automated business insights powered by Groq LLM

### 📦 Product Management
- **Product Catalog**: Browse and search products with filters
- **CRUD Operations**: Create, read, update, and delete products
- **Stock Tracking**: Real-time stock level monitoring
- **Category Filtering**: Organize products by categories
- **Search Functionality**: Fast text-based product search
- **Pagination**: Efficient data loading with paginated views

### 💰 Sales Management
- **POS Interface**: Fast and intuitive point-of-sale system
- **Invoice Generation**: Professional PDF invoices with jsPDF
- **Customer Tracking**: Record customer information for each sale
- **Payment Methods**: Support for cash, card, UPI, and credit
- **Sales History**: Complete transaction history with filters
- **Discount Calculator**: Easy discount application

### 🛒 Purchase Management
- **Purchase Entry**: Record supplier purchases efficiently
- **Supplier Tracking**: Maintain supplier information
- **Stock Updates**: Automatic stock level updates
- **Purchase History**: Complete purchase transaction records

### 💸 Expense Tracking
- **Expense Recording**: Track business expenses by category
- **Date Filtering**: Filter expenses by date range
- **Category Management**: Organize expenses by type
- **Expense Reports**: Generate expense summaries

### 📈 Reports & Analytics
- **Summary Reports**: Revenue, profit, and COGS analysis
- **Top Products**: Best-selling product analytics
- **Date Range Selection**: Custom period reporting
- **PDF Export**: Download reports as PDF documents
- **Visual Analytics**: Charts and graphs for data visualization

### 🤖 AI Assistant
- **Natural Language Queries**: Ask questions in plain English
- **Business Insights**: Get AI-powered recommendations
- **Conversational Interface**: Chat-like interaction with data
- **Smart Suggestions**: Reorder and optimization recommendations

### 🔐 Authentication
- **Login/Register**: Secure user authentication
- **JWT Tokens**: Token-based session management
- **Protected Routes**: Route guards for authenticated pages
- **Persistent Sessions**: Auto-login with stored tokens
- **Logout Functionality**: Secure session termination

---

## 🛠️ Tech Stack

### Core Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server

### UI & Styling
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Hot Toast**: Elegant toast notifications

### Routing & State
- **React Router v6**: Client-side routing
- **Zustand**: Lightweight state management

### Data & APIs
- **Axios**: HTTP client for API requests
- **RESTful API Integration**: Backend communication

### Charts & Visualization
- **Recharts**: Composable charting library

### PDF Generation
- **jsPDF**: Client-side PDF generation
- **jsPDF-AutoTable**: Table generation for reports
- **html2canvas**: HTML to canvas conversion

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## 📂 Project Structure

```plaintext
client/
├── public/                  # Static assets
│   └── vite.svg
├── src/
│   ├── assets/             # Images and static resources
│   │   └── react.svg
│   ├── components/         # Reusable UI components
│   │   ├── DeleteConfirmationModal.tsx
│   │   ├── Layout.tsx
│   │   └── Pagination.tsx
│   ├── lib/                # Libraries and utilities
│   │   └── api.ts          # Axios API client
│   ├── pages/              # Application pages/routes
│   │   ├── AIAssistantPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── InsightsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── PurchasesPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SalesPage.tsx
│   ├── store/              # Zustand state management
│   │   └── authStore.ts    # Authentication state
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.css             # Application styles
│   ├── App.tsx             # Main App component with routing
│   ├── index.css           # Global styles with Tailwind
│   └── main.tsx            # Application entry point
├── .env                    # Environment variables (not in git)
├── .gitignore              # Git ignore rules
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.app.json       # App-specific TypeScript config
├── tsconfig.node.json      # Node-specific TypeScript config
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Running backend server (see [Server README](../server/README.md))

### Installation Steps

1. **Navigate to client directory**

   ```bash
   cd client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   Create a `.env` file in the client directory:

   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

   **Environment Variables:**
   - `VITE_API_URL`: Backend API base URL (required)

4. **Start development server**

   ```bash
   npm run dev
   ```

   The application will open at <http://localhost:5173>

5. **Build for production**

   ```bash
   npm run build
   ```

   Production files will be in the `dist/` directory

---

## 📜 Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality

```bash
# Run ESLint
npm run lint
```

---

## 🔌 API Integration

The client communicates with the backend API using Axios. API configuration is in `src/lib/api.ts`.

**Base URL**: Configured via `VITE_API_URL` environment variable

**Features**: Automatic JWT token attachment, global error handling, request/response interceptors

---

## 🚀 Deployment

### Deployment on Render

1. **Create a new Static Site** on Render

2. **Connect your GitHub repository**

3. **Configure build settings:**
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. **Add environment variables:**
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-api.onrender.com/api/v1`)

5. **Deploy**: Render will automatically build and deploy your application

### Deployment on Vercel / Netlify

Similar process - set `VITE_API_URL` environment variable to your backend URL.

---

## � Troubleshooting

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

---

**Built with ❤️ using React + TypeScript + Vite**


