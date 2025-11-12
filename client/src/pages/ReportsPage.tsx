import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, Search, Sparkles } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [insights, setInsights] = useState<string>('');

  const [period, setPeriod] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Only load reports on initial mount with default period
    loadReports();
  }, []); // Remove dependencies to prevent auto-loading

  const loadReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (period !== 'custom') {
        params.period = period;
      } else if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const [summaryRes, topRes, lowStockRes] = await Promise.all([
        api.getSummary(params),
        api.getTopProducts({ ...params, limit: 10 }),
        api.getLowStock(),
      ]);

      setSummary(summaryRes.data.summary);
      setTopProducts(topRes.data.topProducts);
      setLowStock(lowStockRes.data.lowStockProducts);

      // Generate AI insights in background
      setInsightsLoading(true);
      try {
        const insightsRes = await api.generateReportsInsights({
          ...summaryRes.data.summary,
          topProducts: topRes.data.topProducts,
          lowStock: lowStockRes.data.lowStockProducts,
        }, period !== 'custom' ? period : `${startDate} to ${endDate}`);
        setInsights(insightsRes.data.insights);
      } catch (error) {
        console.error('Failed to load AI insights:', error);
        // Don't fail the whole page if insights fail
      } finally {
        setInsightsLoading(false);
      }
    } catch (error: any) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const profitMargin = summary && summary.revenue > 0
    ? ((summary.grossProfit / summary.revenue) * 100).toFixed(2)
    : '0';

  const formatProfit = (value: number | undefined) => {
    if (value === undefined || value === null) return '0.00';
    const absValue = Math.abs(value);
    return value < 0 ? `-$${absValue.toFixed(2)}` : `$${absValue.toFixed(2)}`;
  };

  const getProfitColor = (value: number | undefined) => {
    if (value === undefined || value === null) return 'text-gray-600';
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
      
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium mb-2">
              <strong>Want to dig deeper into your data?</strong>
            </p>
            <p className="text-sm text-blue-700 leading-relaxed">
              Ask questions like "Why are my profits low this month?" or "Which products should I focus on?" 
              using our{' '}
              <a href="/ai-assistant" className="text-blue-600 hover:text-blue-800 underline font-semibold">
                AI Assistant
              </a>
              {' '}for personalized explanations and actionable advice.
            </p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-field w-full"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </>
          )}

          <button onClick={loadReports} className="btn-primary btn flex items-center gap-2">
            <Search className="h-5 w-5" />
            <span>Load Reports</span>
          </button>
        </div>
      </div>

      {loading && !summary ? (
        <div className="text-center py-12">
          <div className="text-xl">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="card bg-blue-50 border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${summary?.revenue?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className={`card ${summary?.grossProfit >= 0 ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
              <h3 className="text-sm font-medium text-gray-500">Gross Profit</h3>
              <p className={`text-2xl font-bold ${getProfitColor(summary?.grossProfit)}`}>
                {formatProfit(summary?.grossProfit)}
              </p>
            </div>

            <div className="card bg-red-50 border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-500">Expenses</h3>
              <p className="text-2xl font-bold text-red-600">
                ${summary?.totalExpenses?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className={`card ${summary?.netProfit >= 0 ? 'bg-purple-50 border-l-4 border-purple-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
              <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
              <p className={`text-2xl font-bold ${getProfitColor(summary?.netProfit)}`}>
                {formatProfit(summary?.netProfit)}
              </p>
            </div>

            <div className="card bg-yellow-50 border-l-4 border-yellow-500">
              <h3 className="text-sm font-medium text-gray-500">Profit Margin</h3>
              <p className={`text-2xl font-bold ${getProfitColor(summary?.grossProfit)}`}>
                {summary?.grossProfit < 0 ? '-' : ''}{profitMargin}%
              </p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="card mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-500">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-900">
              <Sparkles className="h-6 w-6" />
              Strategic AI Analysis
            </h2>
            {insightsLoading ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-300 mb-4">
                  <div className="h-4 bg-purple-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-200 rounded-full animate-pulse flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-purple-100 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-5/6"></div>
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-4/6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : insights ? (
              <div className="space-y-4">
                {/* Parse and display the strategic insights */}
                {insights.split('\n').map((line, index) => {
                  const trimmedLine = line.trim();
                  
                  // Handle main title/heading
                  if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && index < 3) {
                    return (
                      <div key={index} className="text-center mb-6">
                        <h3 className="text-lg font-bold text-purple-800 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-lg">
                          {trimmedLine.replace(/\*\*/g, '')}
                        </h3>
                      </div>
                    );
                  }
                  
                  // Handle numbered insights (1. **Title**: Content)
                  const numberedMatch = trimmedLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*:\s*(.*)/);
                  if (numberedMatch) {
                    const [, number, title, content] = numberedMatch;
                    return (
                      <div key={index} className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {number}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2 text-lg">{title}</h4>
                            <p className="text-gray-700 leading-relaxed">{content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle simple bullet points (2. **Title**: Content format)
                  const bulletMatch = trimmedLine.match(/^(\d+)\.\s*(.*)/);
                  if (bulletMatch) {
                    const [, number, content] = bulletMatch;
                    return (
                      <div key={index} className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {number}
                          </div>
                          <p className="text-gray-700 leading-relaxed flex-1">{content}</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Handle regular paragraphs
                  if (trimmedLine && !trimmedLine.startsWith('Based on') && index > 0) {
                    return (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-400">
                        <p className="text-gray-700 leading-relaxed italic">{trimmedLine}</p>
                      </div>
                    );
                  }
                  
                  // Handle opening paragraph
                  if (trimmedLine.startsWith('Based on')) {
                    return (
                      <div key={index} className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-300 mb-4">
                        <p className="text-gray-800 leading-relaxed font-medium text-center">{trimmedLine}</p>
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic text-center py-8">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-lg font-medium mb-2">Strategic Analysis Loading...</p>
                <p className="text-sm">Insights will appear here shortly...</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="card">
              <h2 className="text-xl black font-semibold mb-4 flex items-center gap-2 text-green-600">
                <TrendingUp className="h-6 w-6" />
                Top Selling Products
              </h2>
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded"
                    >
                      <div>
                        <p className="text-lg font-bold text-gray-600">{product.productName}</p>
                        <p className="text-sm text-gray-600">
                          Quantity Sold: {product.totalQty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${product.totalRevenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Low Stock Alerts
              </h2>
              {lowStock.length === 0 ? (
                <p className="text-gray-500 text-center py-4">All products are well stocked</p>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-red-50 rounded border-l-4 border-red-500"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          {item.product.currentStock}
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {item.product.minStockLevel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
