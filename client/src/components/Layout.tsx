import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  BarChart3,
  Bot,
  LogOut, 
  Menu,
  User,
  PieChart
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Purchases', href: '/purchases', icon: TrendingUp },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Visual Insights', href: '/insights', icon: PieChart },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation */}
      <nav className="bg-gradient-red shadow-lg fixed top-0 left-0 right-0 z-50 lg:relative">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-white hover:bg-white/20 active:bg-white/30 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <h1 className="text-base sm:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                <div className="bg-white text-brand-red px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg font-extrabold text-xs sm:text-base">
                  MINI STORE
                </div>
                <span className="text-white hidden sm:inline text-sm sm:text-base">ERP</span>
              </h1>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <div className="flex items-center gap-1 sm:gap-2 text-white bg-white/10 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline truncate max-w-[100px] md:max-w-none">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-14 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 top-14 lg:top-0 z-40 w-64 sm:w-72 lg:w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out border-r border-gray-200 overflow-y-auto`}
        >
          <nav className="mt-3 lg:mt-5 px-2 sm:px-3 space-y-1 sm:space-y-2 pb-20 lg:pb-5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 touch-manipulation ${
                    active
                      ? 'bg-gradient-red text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 hover:text-brand-red active:bg-blue-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-brand-red'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm top-14 lg:top-0"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  );
}
