import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, X, DollarSign, Search, Calendar, AlertCircle, Eye, Download, Trash2 } from 'lucide-react';
import type { Product, Sale } from '../types';
import { Pagination } from '../components/Pagination';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi' | 'credit',
    discount: '0',
    items: [{ productId: '', qty: '', sellPrice: '' }],
  });

  useEffect(() => {
    loadData();
    loadProducts();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load sales when search or filters change
  useEffect(() => {
    if (!loading || debouncedSearch !== searchTerm) {
      loadData(1);
    }
  }, [debouncedSearch, dateRange.startDate, dateRange.endDate]);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 100 });
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const loadData = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError('');
      const params: any = { page, limit: 20 };
      
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      const response = await api.getSales(params);
      setSales(response.data.sales);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load sales');
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewInvoice = (sale: Sale) => {
    setSelectedSale(sale);
    setShowInvoiceModal(true);
  };

  const printInvoice = async () => {
    if (!selectedSale) return;
    
    try {
      const response = await api.downloadInvoicePDF(selectedSale._id);
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedSale.invoiceNumber}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice PDF downloaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to download invoice PDF');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setDateRange({ startDate: '', endDate: '' });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSale(id);
      toast.success('Sale deleted successfully. Inventory has been restored.');
      setShowDeleteModal(false);
      setSaleToDelete(null);
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete sale';
      toast.error(errorMessage);
      setShowDeleteModal(false);
      setSaleToDelete(null);
    }
  };

  const openDeleteModal = (sale: Sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', qty: '', sellPrice: '' }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill sell price from product
    if (field === 'productId' && value) {
      const product = products.find((p) => p._id === value);
      if (product) {
        newItems[index].sellPrice = product.sellPrice.toString();
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Check stock availability
    for (const item of formData.items) {
      const product = products.find((p) => p._id === item.productId);
      if (product && parseInt(item.qty) > product.currentStock) {
        toast.error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}`);
        return;
      }
    }

    try {
      const data = {
        customer: formData.customerName || formData.customerPhone ? {
          name: formData.customerName,
          phone: formData.customerPhone,
        } : undefined,
        paymentMethod: formData.paymentMethod,
        discount: parseFloat(formData.discount),
        items: formData.items.map((item) => ({
          productId: item.productId,
          qty: parseInt(item.qty),
          sellPrice: parseFloat(item.sellPrice),
        })),
      };

      await api.createSale(data);
      toast.success('Sale recorded successfully');
      setShowModal(false);
      setFormData({
        customerName: '',
        customerPhone: '',
        paymentMethod: 'cash',
        discount: '0',
        items: [{ productId: '', qty: '', sellPrice: '' }],
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record sale');
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.sellPrice) || 0;
      return sum + qty * price;
    }, 0);
    const discount = parseFloat(formData.discount) || 0;
    return subtotal - discount;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sales</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 btn w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Record Sale</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Search by Invoice or Customer
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-9 sm:pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input-field w-full pl-9 sm:pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input-field w-full pl-9 sm:pl-10"
              />
            </div>
          </div>
        </div>
        {(searchTerm || dateRange.startDate || dateRange.endDate) && (
          <div className="mt-3 sm:mt-4">
            <button onClick={clearFilters} className="btn-secondary btn-sm text-xs sm:text-sm">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!loading && sales.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="card p-4">
            <p className="text-xs sm:text-sm text-gray-500">Total Sales</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{pagination.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs sm:text-sm text-gray-500">Page Revenue</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              ${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs sm:text-sm text-gray-500">Average Sale</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              ${(sales.reduce((sum, s) => sum + s.total, 0) / sales.length).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="card">
        {loading ? (
          <div className="space-y-4 p-4 sm:p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 sm:h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-red-400 mb-4" />
            <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
            <button onClick={() => loadData(1)} className="btn-primary btn">
              Try Again
            </button>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 px-4">
            <DollarSign className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              No sales found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              {searchTerm || dateRange.startDate || dateRange.endDate
                ? 'Try adjusting your search or filters'
                : 'Start recording your first sale'}
            </p>
            {!searchTerm && !dateRange.startDate && !dateRange.endDate && (
              <button onClick={() => setShowModal(true)} className="btn-primary btn">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                Record Your First Sale
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-6">
              {sales.map((sale) => (
                <div key={sale._id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">#{sale.invoiceNumber}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(sale.createdAt).toLocaleDateString()} at{' '}
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </p>
                      {sale.customer?.name && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Customer: {sale.customer.name}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        ${sale.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize mb-1 sm:mb-2">{sale.paymentMethod}</p>
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => viewInvoice(sale)}
                          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center gap-1 p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View invoice"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(sale)}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm flex items-center gap-1 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete sale"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="text-xs sm:text-sm text-gray-600 flex justify-between">
                        <span className="truncate mr-2">
                          {item.name} x {item.qty}
                        </span>
                        <span className="flex-shrink-0">${(item.qty * item.sellPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {sale.discount > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Discount: -${sale.discount.toFixed(2)}</p>
                  )}
                </div>
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Create Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-2">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                  Record Sale
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      required
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="input-field w-full"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold">Items</h3>
                    <button type="button" onClick={addItem} className="btn-secondary btn text-xs sm:text-sm w-full sm:w-auto">
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => {
                      const selectedProduct = products.find((p) => p._id === item.productId);
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="grid grid-cols-1 gap-2 sm:gap-3">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Product *
                              </label>
                              <select
                                required
                                value={item.productId}
                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                className="input-field w-full text-xs sm:text-sm"
                              >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                  <option key={product._id} value={product._id}>
                                    {product.name} ({product.sku}) - Stock: {product.currentStock}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                  Quantity *
                                </label>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  max={selectedProduct?.currentStock || undefined}
                                  value={item.qty}
                                  onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                  className="input-field w-full text-xs sm:text-sm"
                                />
                                {selectedProduct && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Max: {selectedProduct.currentStock}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                  Sell Price *
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  required
                                  min="0"
                                  value={item.sellPrice}
                                  onChange={(e) => updateItem(index, 'sellPrice', e.target.value)}
                                  className="input-field w-full text-xs sm:text-sm"
                                />
                              </div>
                            </div>

                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-900 text-xs sm:text-sm font-medium flex items-center gap-1 justify-center p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary px-6 btn w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-6 btn w-full sm:w-auto">
                    Record Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 print:hidden">
                <h2 className="text-xl sm:text-2xl font-bold text-black">Invoice Details</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={printInvoice} className="btn-secondary flex items-center gap-2 btn text-xs sm:text-sm flex-1 sm:flex-initial">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 md:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-black">INVOICE</h1>
                  <p className="text-base sm:text-xl text-black">#{selectedSale.invoiceNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600">Date:</p>
                    <p className="font-semibold text-black">{new Date(selectedSale.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time:</p>
                    <p className="font-semibold text-black">{new Date(selectedSale.createdAt).toLocaleTimeString()}</p>
                  </div>
                  {selectedSale.customer?.name && (
                    <>
                      <div>
                        <p className="text-gray-600">Customer:</p>
                        <p className="font-semibold text-black truncate">{selectedSale.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone:</p>
                        <p className="font-semibold text-black">{selectedSale.customer.phone || '-'}</p>
                      </div>
                    </>
                  )}
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-600">Payment Method:</p>
                    <p className="font-semibold capitalize text-black">{selectedSale.paymentMethod}</p>
                  </div>
                </div>

                <div className="overflow-x-auto mb-4 sm:mb-6">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left text-black">Item</th>
                        <th className="px-2 sm:px-4 py-2 text-right text-black">Qty</th>
                        <th className="px-2 sm:px-4 py-2 text-right text-black hidden sm:table-cell">Price</th>
                        <th className="px-2 sm:px-4 py-2 text-right text-black">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-2 sm:px-4 py-2 text-black">
                            <div className="truncate max-w-[120px] sm:max-w-none">{item.name}</div>
                            <div className="text-xs text-gray-500 sm:hidden">${item.sellPrice.toFixed(2)} each</div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 text-right text-black">{item.qty}</td>
                          <td className="px-2 sm:px-4 py-2 text-right text-black hidden sm:table-cell">${item.sellPrice.toFixed(2)}</td>
                          <td className="px-2 sm:px-4 py-2 text-right text-black font-semibold">${(item.qty * item.sellPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1 sm:space-y-2 border-t pt-3 sm:pt-4 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-black">${selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedSale.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Discount:</span>
                      <span className="font-semibold text-red-600">-${selectedSale.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-semibold text-black">${selectedSale.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg md:text-xl font-bold border-t pt-2">
                    <span className="text-black">Total:</span>
                    <span className="text-green-600">${selectedSale.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-700">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal && saleToDelete !== null}
        title="Delete Sale?"
        message={`Are you sure you want to delete this sale?`}
        itemName={saleToDelete ? `Invoice: ${saleToDelete.invoiceNumber} - Total: $${saleToDelete.total.toFixed(2)}` : ''}
        warningMessage="This will restore the inventory for all items in this sale. Reports will be recalculated."
        onConfirm={() => saleToDelete && handleDelete(saleToDelete._id)}
        onCancel={() => {
          setShowDeleteModal(false);
          setSaleToDelete(null);
        }}
      />
    </div>
  );
}
