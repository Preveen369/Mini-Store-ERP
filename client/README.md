# 🌟 Mini-Store-ERP - Frontend Client

The **Mini-Store-ERP Client** is a modern, responsive React-based frontend application built with TypeScript and Vite. It provides an intuitive user interface for managing retail store operations including inventory, sales, purchases, expenses, and AI-powered business insights.

🔗 **Main Project**: [Main README](../README.md) | [Server README](../server/README.md)

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
│   │   ├── .... other pages
│   ├── store/              # Zustand state management
│   │   └── authStore.ts    # Authentication state
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.css             # Application styles
│   ├── App.tsx             # Main App component with routing
│   ├── index.css           # Global styles with Tailwind
│   └── main.tsx            # Application entry point
├── .env                    # Environment variables (not in git)
├   # Configuration files
├── .gitignore file, eslint.config.js, index.html, package.json, postcss.config.js,   
├──  tailwind.config.js, tsconfig.json, tsconfig.app.json, tsconfig.node.json, vite.config.ts        
└── README.md (client)      # This file
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
