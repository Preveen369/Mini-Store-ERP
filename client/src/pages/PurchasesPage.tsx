import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, X, ShoppingCart, Search, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import type { Product, Purchase } from '../types';
import { Pagination } from '../components/Pagination';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
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
    supplier: '',
    invoiceRef: '',
    items: [{ productId: '', qty: '', costPrice: '' }],
  });

  useEffect(() => {
    loadData();
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!loading || debouncedSearch !== searchTerm) {
      loadData(1);
    }
  }, [debouncedSearch, dateRange.startDate, dateRange.endDate]);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 100 });
      console.log('Products loaded:', response.data);
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        console.log('Products set in state:', response.data.products.length);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error(error.response?.data?.error || 'Failed to load products');
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

      const response = await api.getPurchases(params);
      setPurchases(response.data.purchases);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load purchases');
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setDateRange({ startDate: '', endDate: '' });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePurchase(id);
      toast.success('Purchase deleted successfully. Inventory has been adjusted.');
      setShowDeleteModal(false);
      setPurchaseToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete purchase');
      setShowDeleteModal(false);
      setPurchaseToDelete(null);
    }
  };

  const openDeleteModal = (purchase: Purchase) => {
    setPurchaseToDelete(purchase);
    setShowDeleteModal(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', qty: '', costPrice: '' }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'productId' && value) {
      const product = products.find((p) => p._id === value);
      if (product) {
        newItems[index].costPrice = product.costPrice.toString();
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        supplier: formData.supplier,
        invoiceRef: formData.invoiceRef,
        items: formData.items.map((item) => ({
          productId: item.productId,
          qty: parseInt(item.qty),
          costPrice: parseFloat(item.costPrice),
        })),
      };

      await api.createPurchase(data);
      toast.success('Purchase recorded successfully');
      setShowModal(false);
      setFormData({
        supplier: '',
        invoiceRef: '',
        items: [{ productId: '', qty: '', costPrice: '' }],
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record purchase');
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.costPrice) || 0;
      return sum + qty * price;
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Purchases</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 btn w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Record Purchase</span>
        </button>
      </div>
      <div className="card mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Search by Supplier or Invoice
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

      {!loading && purchases.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="card">
            <p className="text-xs sm:text-sm text-gray-500">Total Purchases</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{pagination.total}</p>
          </div>
          <div className="card">
            <p className="text-xs sm:text-sm text-gray-500">Page Total</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              ${purchases.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2)}
            </p>
          </div>
          <div className="card sm:col-span-2 lg:col-span-1">
            <p className="text-xs sm:text-sm text-gray-500">Average Purchase</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              ${(purchases.reduce((sum, p) => sum + p.totalAmount, 0) / purchases.length).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 sm:h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-red-400 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">{error}</p>
            <button onClick={() => loadData(1)} className="btn-primary btn text-sm sm:text-base">
              Try Again
            </button>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              No purchases found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
              {searchTerm || dateRange.startDate || dateRange.endDate
                ? 'Try adjusting your search or filters'
                : 'Start recording your first purchase'}
            </p>
            {!searchTerm && !dateRange.startDate && !dateRange.endDate && (
              <button onClick={() => setShowModal(true)} className="btn-primary btn w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                Record Your First Purchase
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
              {purchases.map((purchase) => {
                const items = purchase.items as any[];
                return (
                  <div key={purchase._id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(purchase.createdAt).toLocaleDateString()} at{' '}
                          {new Date(purchase.createdAt).toLocaleTimeString()}
                        </p>
                        {purchase.supplier && (
                          <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                            Supplier: {purchase.supplier}
                          </p>
                        )}
                        {purchase.invoiceRef && (
                          <p className="text-xs text-gray-500 truncate">Ref: {purchase.invoiceRef}</p>
                        )}
                      </div>
                      <div className="flex sm:flex-col sm:text-right items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
                        <p className="text-lg sm:text-xl font-bold text-blue-600">
                          ${purchase.totalAmount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => openDeleteModal(purchase)}
                          className="text-red-600 hover:text-red-800 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Delete purchase"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {items.map((item, idx) => {
                        const productName = item.productId?.name || 'Unknown Product';
                        return (
                          <div key={idx} className="text-xs sm:text-sm text-gray-600 flex justify-between gap-2">
                            <span className="truncate">
                              {productName} x {item.qty}
                            </span>
                            <span className="flex-shrink-0">${(item.qty * item.costPrice).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="truncate">Record Purchase</span>
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Invoice Reference
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceRef}
                      onChange={(e) => setFormData({ ...formData, invoiceRef: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold">Items</h3>
                    <button type="button" onClick={addItem} className="btn-secondary btn w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              Product *
                            </label>
                            <select
                              required
                              value={item.productId}
                              onChange={(e) => updateItem(index, 'productId', e.target.value)}
                              className="input-field w-full"
                            >
                              <option value="">Select Product</option>
                              {products.map((product) => (
                                <option key={product._id} value={product._id}>
                                  {product.name} ({product.sku})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Quantity *
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                className="input-field w-full"
                              />
                            </div>

                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Cost Price *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                required
                                min="0"
                                value={item.costPrice}
                                onChange={(e) => updateItem(index, 'costPrice', e.target.value)}
                                className="input-field w-full"
                              />
                            </div>
                          </div>

                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900 text-xs sm:text-sm flex items-center gap-1 min-h-[44px]"
                            >
                              <X className="h-4 w-4" />
                              Remove Item
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary px-6 btn w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-6 btn w-full sm:w-auto order-1 sm:order-2">
                    Record Purchase
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal && purchaseToDelete !== null}
        title="Delete Purchase?"
        message="Are you sure you want to delete this purchase?"
        itemName={purchaseToDelete ? `Ref: ${purchaseToDelete.invoiceRef || 'N/A'} - Total: $${purchaseToDelete.totalAmount.toFixed(2)}` : ''}
        warningMessage="This will reduce inventory for all items in this purchase. Ensure you have sufficient stock."
        onConfirm={() => purchaseToDelete && handleDelete(purchaseToDelete._id)}
        onCancel={() => {
          setShowDeleteModal(false);
          setPurchaseToDelete(null);
        }}
      />
    </div>
  );
}
