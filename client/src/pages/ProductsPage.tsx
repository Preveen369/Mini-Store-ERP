import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search, X, AlertCircle } from 'lucide-react';
import type { Product } from '../types';
import { Pagination } from '../components/Pagination';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    costPrice: '',
    sellPrice: '',
    currentStock: '',
    reorderThreshold: '',
    unit: 'pcs',
  });

  useEffect(() => {
    loadProducts(1);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load products when debounced search or filters change
  useEffect(() => {
    if (!loading || debouncedSearch !== searchTerm) {
      loadProducts(1);
    }
  }, [debouncedSearch, categoryFilter]);

  const loadProducts = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getProducts({ 
        search: debouncedSearch, 
        category: categoryFilter,
        page,
        limit: 20
      });
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts(1);
  };

  const handlePageChange = (page: number) => {
    loadProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        costPrice: product.costPrice.toString(),
        sellPrice: product.sellPrice.toString(),
        currentStock: product.currentStock.toString(),
        reorderThreshold: product.reorderThreshold.toString(),
        unit: product.unit,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        category: '',
        costPrice: '',
        sellPrice: '',
        currentStock: '',
        reorderThreshold: '',
        unit: 'pcs',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        costPrice: parseFloat(formData.costPrice),
        sellPrice: parseFloat(formData.sellPrice),
        currentStock: parseInt(formData.currentStock),
        reorderThreshold: parseInt(formData.reorderThreshold),
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, data);
        toast.success('Product updated successfully');
      } else {
        await api.createProduct(data);
        toast.success('Product created successfully');
      }

      closeModal();
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      setProductToDelete(null);
      loadProducts();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete product';
      toast.error(errorMessage);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 btn w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field flex-1"
            />
            <button onClick={handleSearch} className="btn-primary btn flex-shrink-0">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              loadProducts();
            }}
            className="input-field w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table/Cards */}
      <div className="card">
        {loading ? (
          <div className="space-y-4 p-4 sm:p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-red-400 mb-4" />
            <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
            <button onClick={() => loadProducts(1)} className="btn-primary btn">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              {searchTerm || categoryFilter 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first product'}
            </p>
            {!searchTerm && !categoryFilter && (
              <button onClick={() => openModal()} className="btn-primary btn">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="space-y-3 p-3">
                {products.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openModal(product)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-semibold text-gray-900 ml-1">${product.costPrice.toFixed(2)}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">Sell:</span>
                        <span className="font-semibold text-gray-900 ml-1">${product.sellPrice.toFixed(2)}</span>
                      </div>
                      <div className="col-span-2 bg-gray-50 p-2 rounded flex justify-between items-center">
                        <span className="text-gray-600">Stock:</span>
                        <span
                          className={`px-2 py-1 rounded font-semibold ${
                            product.currentStock <= product.reorderThreshold
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {product.currentStock} {product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Selling Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.sellPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded ${
                            product.currentStock <= product.reorderThreshold
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {product.currentStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(product)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Edit product"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete product"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-black">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sell Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.sellPrice}
                      onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reorder Threshold *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.reorderThreshold}
                      onChange={(e) => setFormData({ ...formData, reorderThreshold: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="input-field w-full"
                      placeholder="e.g., pcs, kg, liters"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t">
                  <button type="button" onClick={closeModal} className="btn-secondary px-6 btn w-full sm:w-auto">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-6 btn w-full sm:w-auto">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal && productToDelete !== null}
        title="Delete Product?"
        message={`Are you sure you want to delete ${productToDelete?.name || 'this product'}?`}
        itemName={productToDelete ? `SKU: ${productToDelete.sku}` : ''}
        warningMessage="This product cannot be deleted if it has been used in sales or purchases."
        onConfirm={() => productToDelete && handleDelete(productToDelete._id)}
        onCancel={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
