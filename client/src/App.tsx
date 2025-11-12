import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import PurchasesPage from './pages/PurchasesPage';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import InsightsPage from './pages/InsightsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import Layout from './components/Layout';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
