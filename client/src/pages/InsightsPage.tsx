import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  lowStockCount: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: string;
  recentSales: Array<{ 
    date: string; 
    total: number; 
    invoiceNumber: string;
    items: Array<{ qty: number; name: string; sellPrice: number }>;
  }>;
  topProducts: Array<{ 
    productName: string; 
    totalQty: number; 
    totalRevenue: number;
    _id: string;
  }>;
  lowStock: Array<{ 
    product: {
      name: string; 
      currentStock: number; 
      reorderThreshold: number;
      sku: string;
      category: string;
    };
    avgWeeklySales: number;
  }>;
  salesTrend: Array<{ period: string; sales: number; revenue: number; date: string }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  expensesByCategory: Array<{ category: string; amount: number; count: number }>;
  dailyMetrics: Array<{ day: string; revenue: number; sales: number; profit: number }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

export default function InsightsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [visibleCharts, setVisibleCharts] = useState({
    salesTrend: true,
    revenue: true,
    topProducts: true,
    categoryDist: true,
    expenses: true,
    lowStock: true
  });

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  const fetchData = async (showToast = true) => {
    try {
      if (showToast) setRefreshing(true);
      
      // Calculate date range based on selected timeframe
      const daysBack = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);
      const toDate = new Date();

      // Fetch data from multiple endpoints in parallel
      const [summaryRes, topProductsRes, lowStockRes, salesRes, expensesRes] = await Promise.all([
        api.getSummary({ 
          from: fromDate.toISOString(), 
          to: toDate.toISOString() 
        }),
        api.getTopProducts({ 
          period: selectedTimeframe, 
          limit: 10 
        }),
        api.getLowStock(),
        api.getSales({ 
          limit: 50, 
          startDate: fromDate.toISOString().split('T')[0],
          endDate: toDate.toISOString().split('T')[0]
        }),
        api.getExpenses({ 
          limit: 100,
          startDate: fromDate.toISOString().split('T')[0],
          endDate: toDate.toISOString().split('T')[0]
        })
      ]);

      // Process summary data
      const summary = summaryRes.data.summary;
      
      // Process sales data for trend analysis
      const salesData = salesRes.data.sales || [];
      const dailySalesMap = new Map<string, { revenue: number; count: number; totalItems: number }>();
      
      salesData.forEach((sale: any) => {
        const dateKey = new Date(sale.date).toLocaleDateString();
        const existing = dailySalesMap.get(dateKey) || { revenue: 0, count: 0, totalItems: 0 };
        const itemCount = sale.items?.reduce((sum: number, item: any) => sum + (item.qty || 0), 0) || 0;
        
        dailySalesMap.set(dateKey, {
          revenue: existing.revenue + (sale.total || 0),
          count: existing.count + 1,
          totalItems: existing.totalItems + itemCount
        });
      });

      // Create 7-day trend data
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString();
        const dayData = dailySalesMap.get(dateKey) || { revenue: 0, count: 0, totalItems: 0 };
        
        last7Days.push({
          period: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateKey,
          sales: dayData.count,
          revenue: dayData.revenue,
          profit: dayData.revenue * 0.2 // Estimate 20% profit margin
        });
      }

      // Process expenses by category
      const expensesData = expensesRes.data.expenses || [];
      const expensesByCategory = new Map<string, { amount: number; count: number }>();
      
      expensesData.forEach((expense: any) => {
        const category = expense.category || 'Other';
        const existing = expensesByCategory.get(category) || { amount: 0, count: 0 };
        expensesByCategory.set(category, {
          amount: existing.amount + (expense.amount || 0),
          count: existing.count + 1
        });
      });

      const expenseCategoryArray = Array.from(expensesByCategory.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count
      })).sort((a, b) => b.amount - a.amount);

      // Process top products data
      const topProducts = topProductsRes.data.topProducts || [];
      
      // Create category distribution from top products
      const categoryMap = new Map<string, number>();
      topProducts.forEach((product: any) => {
        const category = product.productName?.split(' ')[0] || 'Other'; // Simple categorization
        const existing = categoryMap.get(category) || 0;
        categoryMap.set(category, existing + (product.totalQty || 0));
      });

      const categoryDistribution = Array.from(categoryMap.entries())
        .slice(0, 6)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));

      // Process low stock data
      const lowStockData = lowStockRes.data.lowStockProducts || [];

      // Transform data for charts
      const transformedData: DashboardData = {
        totalRevenue: summary.revenue || 0,
        totalSales: summary.salesCount || 0,
        totalProducts: topProducts.length,
        lowStockCount: lowStockData.length,
        grossProfit: summary.grossProfit || 0,
        netProfit: summary.netProfit || 0,
        profitMargin: summary.revenue > 0 ? ((summary.grossProfit / summary.revenue) * 100).toFixed(1) : '0.0',
        recentSales: salesData.slice(0, 10),
        topProducts: topProducts,
        lowStock: lowStockData,
        salesTrend: last7Days,
        categoryDistribution: categoryDistribution,
        expensesByCategory: expenseCategoryArray,
        dailyMetrics: last7Days.map(item => ({
          day: item.period,
          revenue: item.revenue,
          sales: item.sales,
          profit: item.profit
        }))
      };

      setData(transformedData);
      if (showToast) toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error fetching insights data:', error);
      toast.error('Failed to load insights data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(false), 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const toggleChart = (chartKey: keyof typeof visibleCharts) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartKey]: !prev[chartKey]
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
              <PieChartIcon className="h-8 w-8 text-white" />
            </div>
            Visual Insights Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Real-time analytics and business intelligence</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${data?.totalRevenue?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-gray-500 mt-1">
                Profit Margin: {data?.profitMargin || '0.0'}%
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500 bg-green-50 p-3 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-blue-600">{data?.totalSales || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Avg: ${data?.totalRevenue && data?.totalSales 
                  ? (data.totalRevenue / Math.max(data.totalSales, 1)).toFixed(2) 
                  : '0.00'} per sale
              </p>
            </div>
            <ShoppingCart className="h-12 w-12 text-blue-500 bg-blue-50 p-3 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gross Profit</p>
              <p className="text-2xl font-bold text-purple-600">${data?.grossProfit?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-gray-500 mt-1">
                Net: ${data?.netProfit?.toFixed(2) || '0.00'}
              </p>
            </div>
            <Package className="h-12 w-12 text-purple-500 bg-purple-50 p-3 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">{data?.lowStockCount || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(data?.lowStockCount || 0) > 0 ? 'Needs attention' : 'All good'}
              </p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500 bg-red-50 p-3 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Chart Visibility</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(visibleCharts).map(([key, visible]) => {
            const labels = {
              salesTrend: 'Sales Trend',
              revenue: 'Revenue Analysis',
              topProducts: 'Top Products',
              categoryDist: 'Category Distribution',
              expenses: 'Expenses',
              lowStock: 'Stock Alerts'
            };
            return (
              <button
                key={key}
                onClick={() => toggleChart(key as keyof typeof visibleCharts)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  visible 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {labels[key as keyof typeof labels]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        {visibleCharts.salesTrend && (
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Sales Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue Analysis */}
        {visibleCharts.revenue && (
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Revenue Analysis</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.salesTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products */}
        {visibleCharts.topProducts && (
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Top Products</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.topProducts?.slice(0, 5) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQty" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Distribution */}
        {visibleCharts.categoryDist && (
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.categoryDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Expenses Chart */}
        {visibleCharts.expenses && (
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Expenses by Category</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.expensesByCategory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Bar dataKey="amount" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Low Stock Alerts */}
        {visibleCharts.lowStock && (
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Stock Alerts</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(data?.lowStock?.length ?? 0) > 0 ? (
                data!.lowStock!.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Threshold: {item.product.reorderThreshold}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{item.product.currentStock}</p>
                      <p className="text-xs text-red-500">units left</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>All products are well stocked!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Sale Value</span>
              <span className="font-semibold text-black">
                ${data?.totalRevenue && data?.totalSales 
                  ? (data.totalRevenue / Math.max(data.totalSales, 1)).toFixed(2) 
                  : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Products</span>
              <span className="font-semibold text-black">{data?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stock Health</span>
              <span className={`font-semibold ${(data?.lowStockCount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(data?.lowStockCount || 0) > 0 ? 'Needs Attention' : 'Good'}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Business Intelligence</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              {data?.topProducts?.[0] 
                ? `Your best-selling product is "${data.topProducts[0].productName}" with ${data.topProducts[0].totalQty} units sold, generating $${data.topProducts[0].totalRevenue.toFixed(2)} revenue.`
                : 'Add products and sales to see top performers.'}
            </p>
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              Total revenue of ${data?.totalRevenue?.toFixed(2) || '0.00'} across {data?.totalSales || 0} transactions with a {data?.profitMargin || '0.0'}% profit margin.
            </p>
            <p className="flex items-start gap-2">
              <span className={`w-2 h-2 ${(data?.lowStockCount || 0) > 0 ? 'bg-red-500' : 'bg-green-500'} rounded-full mt-2 flex-shrink-0`}></span>
              {(data?.lowStockCount || 0) > 0 
                ? `${data?.lowStockCount} products need restocking to maintain optimal inventory levels.`
                : 'All products are adequately stocked.'}
            </p>
            <p className="flex items-start gap-2">
              <span className={`w-2 h-2 ${(data?.netProfit || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full mt-2 flex-shrink-0`}></span>
              {(data?.netProfit || 0) >= 0 
                ? `Business is profitable with $${data?.netProfit?.toFixed(2)} net profit.`
                : `Business needs attention with $${Math.abs(data?.netProfit || 0).toFixed(2)} net loss.`}
            </p>
            <p className="flex items-start gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
              {data?.expensesByCategory?.[0]
                ? `Highest expense category is "${data.expensesByCategory[0].category}" with $${data.expensesByCategory[0].amount.toFixed(2)} spent.`
                : 'No expense data available for analysis.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}