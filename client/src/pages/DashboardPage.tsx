import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, DollarSign, AlertTriangle, Package, ArrowUp, ArrowDown } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const formatProfit = (value: number | undefined) => {
    if (value === undefined || value === null) return '0.00';
    const absValue = Math.abs(value);
    return value < 0 ? `-$${absValue.toFixed(2)}` : `$${absValue.toFixed(2)}`;
  };

  const getProfitColor = (value: number | undefined) => {
    if (value === undefined || value === null) return 'text-gray-600';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Load critical data first (in parallel)
      const [summaryRes, topRes, lowStockRes] = await Promise.all([
        api.getSummary(),
        api.getTopProducts({ period: '7d', limit: 5 }),
        api.getLowStock(),
      ]);

      setSummary(summaryRes.data.summary);
      setTopProducts(topRes.data.topProducts);
      setLowStock(lowStockRes.data.lowStockProducts);

      // Mark main loading as complete
      setLoading(false);

      // Load AI insights in the background (non-blocking)
      loadInsights(summaryRes.data.summary, topRes.data.topProducts, lowStockRes.data.lowStockProducts);
    } catch (error: any) {
      toast.error('Failed to load dashboard');
      setLoading(false);
    }
  };

  const loadInsights = async (summaryData: any, topProductsData: any[], lowStockData: any[]) => {
    try {
      setInsightsLoading(true);
      const insightsRes = await api.generateDashboardInsights({
        ...summaryData,
        topProducts: topProductsData,
        lowStock: lowStockData,
      });
      setInsights(insightsRes.data.insights);
    } catch (error: any) {
      console.error('Failed to load AI insights:', error);
      // Don't show error toast for insights - it's not critical
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-red-50">
        {/* Hero Banner Skeleton */}
        <div className="bg-gradient-red-dark text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="h-10 bg-white/20 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-6 bg-white/20 rounded w-80 animate-pulse"></div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30">
                <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-red-50">
      {/* Hero Banner */}
      <div className="bg-gradient-red-dark text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-2">Welcome Back! 🎉</h1>
              <p className="text-sm sm:text-base md:text-lg opacity-90">Here's your business overview at a glance</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-white/30 w-full sm:w-auto">
              <div className="text-center">
                <p className="text-xs sm:text-sm opacity-90 mb-1">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold">${summary?.revenue?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Promotional Banner */}
        <div className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-xl sm:rounded-2xl shadow-xl-colored overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 md:p-8 gap-3 sm:gap-4">
            <div className="text-white text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1 sm:mb-2">📊 BUSINESS INSIGHTS</h2>
              <p className="text-sm sm:text-base md:text-lg font-semibold">Real-time analytics & AI-powered recommendations</p>
            </div>
            <div className="bg-white text-orange-600 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl font-bold text-base sm:text-xl md:text-2xl shadow-lg whitespace-nowrap">
              UP TO 50% GROWTH
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-4 sm:p-5 md:p-6 border-l-4 border-blue-500 transform hover:scale-105">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Revenue</h3>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                <DollarSign className="h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2">${summary?.revenue?.toFixed(2)}</p>
            <div className="flex items-center text-xs sm:text-sm text-green-600 font-medium">
              <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>12% from last month</span>
            </div>
          </div>

          <div className={`rounded-xl sm:rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-4 sm:p-5 md:p-6 border-l-4 transform hover:scale-105 ${summary?.grossProfit >= 0 ? 'bg-white border-green-500' : 'bg-red-50 border-red-500'}`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Gross Profit</h3>
              <div className={`p-2 sm:p-3 rounded-xl ${summary?.grossProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 ${summary?.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-2 ${getProfitColor(summary?.grossProfit)}`}>
              {formatProfit(summary?.grossProfit)}
            </p>
            <div className={`flex items-center text-xs sm:text-sm font-medium ${summary?.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary?.grossProfit >= 0 ? <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> : <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
              <span>{summary?.grossProfit >= 0 ? '8% increase' : 'Loss detected'}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-4 sm:p-5 md:p-6 border-l-4 border-red-500 transform hover:scale-105">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Expenses</h3>
              <div className="bg-red-100 p-2 sm:p-3 rounded-xl">
                <AlertTriangle className="h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 text-red-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-600 mb-1 sm:mb-2">${summary?.totalExpenses?.toFixed(2)}</p>
            <div className="flex items-center text-xs sm:text-sm text-red-600 font-medium">
              <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>3% reduced</span>
            </div>
          </div>

          <div className={`rounded-xl sm:rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-4 sm:p-5 md:p-6 transform hover:scale-105 ${summary?.netProfit >= 0 ? 'bg-gradient-blue' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">Net Profit</h3>
              <div className="bg-white/20 p-2 sm:p-3 rounded-xl">
                <Package className="h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-1 sm:mb-2">
              {formatProfit(summary?.netProfit)}
            </p>
            <div className="flex items-center text-xs sm:text-sm text-white font-medium">
              {summary?.netProfit >= 0 ? <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> : <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
              <span>{summary?.netProfit >= 0 ? '15% growth' : 'Operating at loss'}</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl sm:rounded-2xl shadow-xl p-1 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-gradient-purple p-2 sm:p-3 rounded-xl">
                <TrendingUp className="h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Today's AI Insights 🚀
              </h2>
            </div>
            {insightsLoading ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
              </div>
            ) : insights ? (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-gray-700 leading-relaxed mb-3 sm:mb-4 font-medium text-sm sm:text-base">
                  {insights.split('\n')[0]}
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {insights.split('\n').slice(1).filter(line => line.trim().startsWith('*')).map((bullet, index) => {
                    const cleanBullet = bullet.replace(/^\*\s*/, '');
                    const titleMatch = cleanBullet.match(/\*\*(.*?)\*\*:\s*(.*)/);
                    
                    if (titleMatch) {
                      const [, title, content] = titleMatch;
                      return (
                        <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border-l-4 border-purple-500 hover:shadow-md transition-all duration-200">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mt-1 sm:mt-1.5 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">{title}</h4>
                            <p className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base">{content}</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border-l-4 border-purple-500">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mt-1 sm:mt-1.5 flex-shrink-0"></div>
                          <p className="text-gray-700 leading-relaxed flex-1 text-xs sm:text-sm md:text-base">{cleanBullet}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic text-sm sm:text-base">Insights will appear here shortly...</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-4 sm:p-5 md:p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-gradient-blue p-2 sm:p-3 rounded-xl">
                <Package className="h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 text-white" />
              </div>
              <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">Top Products (Last 7 Days)</h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="bg-brand-blue text-white w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate">{product.productName}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs sm:text-sm text-gray-600">Qty:</span>
                    <span className="bg-blue-600 text-white px-2 py-1 sm:px-3 rounded-lg font-bold text-xs sm:text-sm">{product.totalQty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-4 sm:p-5 md:p-6 border-2 border-red-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-gradient-red p-2 sm:p-3 rounded-xl">
                <AlertTriangle className="h-4 w-4 sm:h-5 md:h-6 sm:w-5 md:w-6 text-white" />
              </div>
              <h2 className="text-base sm:text-lg md:text-2xl font-bold text-red-600">Low Stock Alerts ⚠️</h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {lowStock.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg sm:rounded-xl border border-red-200 hover:shadow-md transition-all duration-200">
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base truncate flex-1 min-w-0 mr-2">{item.product.name}</span>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className="text-xs sm:text-sm text-gray-600">Stock:</span>
                    <span className="bg-red-600 text-white px-2 py-1 sm:px-3 rounded-lg font-bold animate-pulse text-xs sm:text-sm">
                      {item.product.currentStock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Promotional Banner */}
        <div className="mt-4 sm:mt-6 md:mt-8 bg-gradient-ocean rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1 sm:mb-2">🎯 Same Day Delivery Available!</h3>
          <p className="text-sm sm:text-base md:text-lg opacity-90">Manage your orders efficiently with real-time tracking</p>
        </div>
      </div>
    </div>
  );
}
