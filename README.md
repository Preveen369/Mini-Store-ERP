# 🌟 Mini-Store-ERP - MERN Store Management System

![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)
![Frontend](https://img.shields.io/badge/Frontend-React-orange.svg)
![Backend](https://img.shields.io/badge/Backend-Node.js-red.svg)
![Backend](https://img.shields.io/badge/Backend-Express.js-aqua.svg)
![Database](https://img.shields.io/badge/Database-MongoDB-emerald.svg)
![Language](https://img.shields.io/badge/Language-TypeScript-yellow.svg)
![AI](https://img.shields.io/badge/AI-Groq_LLM-purple.svg)


The **Mini-Store-ERP** is a comprehensive full-stack MERN (MongoDB, Express.js, React, Node.js) Enterprise Resource Planning system designed for small retail stores. It features modern inventory management, real-time sales tracking, AI-powered business insights via Groq LLM, and automated PDF invoice generation. Built with TypeScript for type safety, it offers a responsive dashboard with charts, secure JWT authentication with role-based access control, and natural language query processing.

🔗 **Related Documentations**: [Client README](./client/README.md) | [Server README](./server/README.md)

🔗 **Live Project**: <https://mini-store-erp-app.onrender.com/>

---

## 🚀 Core Features

- **🔐 Authentication & Authorization**: Secure JWT-based authentication with role-based access control (Admin/Cashier)
- **📦 Product Management**: Complete CRUD operations, real-time stock tracking, reorder alerts, and vendor management
- **🛒 Purchase Management**: Track supplier purchases with automatic stock updates and transaction history
- **💰 Sales & POS**: Fast POS interface with automatic stock deduction, PDF invoices, and multiple payment methods
- **📊 Reports & Analytics**: Real-time revenue tracking, COGS calculation, top products analysis, and visual charts
- **🤖 AI-Powered Insights**: Natural language queries, automated business insights, and smart reorder suggestions via Groq LLM
- **📄 PDF Generation**: Server-side invoice generation and client-side report export
- **🎨 Modern UI**: Responsive TailwindCSS design with interactive dashboard and real-time data visualization

---

## 📷 Screenshots

Below are some screenshots showcasing the **Mini-Store-ERP** interface:

<!-- Add your screenshots here when available -->
*Screenshots coming soon*

---

## 📽️ Project Demo

Below is the project demo video of the **Mini-Store-ERP** interface:

<!-- Add your demo video link here when available -->
*Demo video coming soon*

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **LLM Integration**: Groq API (LLaMA models)
- **PDF Generation**: jsPDF
- **Security**: Helmet, CORS, Rate Limiting, express-validator
- **Dev Tools**: nodemon, ts-node

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Framework**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **PDF Export**: jsPDF, jsPDF-AutoTable
- **Notifications**: React Hot Toast

---

## 📁 Project Structure

```plaintext
mini-store-erp/
├── client/                # Frontend React application (see Client README)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages/routes
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # API client and utilities
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Backend Node.js/Express application (see Server README)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose data models
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Business logic services
│   │   └── utils/         # Utility functions
│   └── package.json       # Backend dependencies
├── diagram.txt            # Database relationship diagram
├── LICENSE                # MIT License file
└── README.md              # Main project documentation
```

---

## 🧪 Installation & Setup

### 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)
- A Groq API Account (for AI features) - Get your free API key at [Groq Console](https://console.groq.com)
- Postman or similar API testing tool (optional, for testing)

### 🧑‍💻 Steps to Run

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mini-store-erp.git
   cd mini-store-erp
   ```

2. **Set up the backend**
   - Follow the instructions in the [Server README](./server/README.md) to configure and run the backend.

3. **Set up the frontend**
   - Follow the instructions in the [Client README](./client/README.md) to configure and run the frontend.

4. **Access the Application**
   - Project Link: [https://mini-store-erp-app.onrender.com/]

---

## ➡️ Connecting Frontend, Backend, and MongoDB

For detailed instructions on connecting the frontend, backend, and MongoDB, refer to the [Server README](./server/README.md) and [Client README](./client/README.md) for specific configurations.

### Quick Configuration Overview

1. **MongoDB Connection**: Configure `MONGODB_URI` in server `.env` file
2. **API Communication**: Set `VITE_API_URL` in client `.env` file
3. **CORS Setup**: Configure `CORS_ORIGIN` in server `.env` to match frontend URL
4. **Groq API**: Add `GROQ_API_KEY` in server `.env` for AI features

---

## 🚀 Deployment

### Deployment on Render (Recommended)

#### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `cd server; npm install; tsc`
   - **Start Command**: `cd server; npm start`
4. Add environment variables from server `.env` file
5. Deploy and note the backend URL

#### Frontend Deployment

1. Create a new Static Site on Render
2. Configure build settings:
   - **Build Command**: `cd client; npm run build`
   - **Publish Directory**: `client/dist`
3. Add environment variable:
   - `VITE_API_URL`: Your deployed backend URL
4. Deploy the frontend

For detailed deployment instructions, see:
- **Frontend**: [Client README](./client/README.md)
- **Backend**: [Server README](./server/README.md)

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact
For queries or suggestions:
- 📩 Email: [spreveen123@gmail.com](mailto:spreveen123@gmail.com)
- 🌐 LinkedIn: [www.linkedin.com/in/preveen-s](https://www.linkedin.com/in/preveen-s/)

---

## 🌟 Show Your Support
If you like this project, please consider giving it a ⭐ on GitHub!

---

**Built with ❤️ using MERN Stack + AI**

