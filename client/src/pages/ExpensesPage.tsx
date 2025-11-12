import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, X, Receipt, Search, Calendar, AlertCircle, Filter, Trash2 } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

interface Expense {
  _id: string;
  category: string;
  amount: number;
  note?: string;
  date: string;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Marketing',
  'Transportation',
  'Office Supplies',
  'Maintenance',
  'Insurance',
  'Tax',
  'Other',
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
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
    category: '',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadExpenses();
  }, [categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!loading || debouncedSearch !== searchTerm) {
      loadExpenses(1);
    }
  }, [debouncedSearch, dateRange.startDate, dateRange.endDate]);

  const loadExpenses = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError('');
      const params: any = { page, limit: 20 };
      
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      const response = await api.getExpenses(params);
      setExpenses(response.data.expenses);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load expenses');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadExpenses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setDateRange({ startDate: '', endDate: '' });
    setCategoryFilter('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        note: formData.note,
        date: formData.date,
      };

      await api.createExpense(data);
      toast.success('Expense recorded successfully');
      setShowModal(false);
      setFormData({
        category: '',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to record expense');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteExpense(id);
      toast.success('Expense deleted successfully');
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      loadExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete expense');
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    }
  };

  const openDeleteModal = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getAverageExpense = () => {
    return expenses.length > 0 ? getTotalExpenses() / expenses.length : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Expenses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 btn w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add Expense</span>
        </button>
      </div>
      <div className="card mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Search by Description
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
              Category
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field w-full pl-9 sm:pl-10"
              >
                <option value="">All</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
        {(searchTerm || categoryFilter || dateRange.startDate || dateRange.endDate) && (
          <div className="mt-3 sm:mt-4">
            <button onClick={clearFilters} className="btn-secondary btn-sm text-xs sm:text-sm">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {!loading && expenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="card bg-red-50 border-l-4 border-red-500">
            <p className="text-xs sm:text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">${getTotalExpenses().toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{pagination.total} records</p>
          </div>
          <div className="card">
            <p className="text-xs sm:text-sm text-gray-500">Page Total</p>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">
              ${getTotalExpenses().toFixed(2)}
            </p>
          </div>
          <div className="card sm:col-span-2 lg:col-span-1">
            <p className="text-xs sm:text-sm text-gray-500">Average Expense</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              ${getAverageExpense().toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 sm:h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-red-400 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-red-600 mb-3 sm:mb-4">{error}</p>
            <button onClick={() => loadExpenses(1)} className="btn-primary btn text-sm sm:text-base">
              Try Again
            </button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Receipt className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              No expenses found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">
              {searchTerm || categoryFilter || dateRange.startDate || dateRange.endDate
                ? 'Try adjusting your search or filters'
                : 'Start recording your first expense'}
            </p>
            {!searchTerm && !categoryFilter && !dateRange.startDate && !dateRange.endDate && (
              <button onClick={() => setShowModal(true)} className="btn-primary btn w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                Add Your First Expense
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3 p-3 sm:p-4">
              {expenses.map((expense) => (
                <div key={expense._id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {expense.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-red-600">
                        ${expense.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => openDeleteModal(expense)}
                        className="text-red-600 hover:text-red-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {expense.note && (
                    <p className="text-sm text-gray-600 line-clamp-2">{expense.note}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {expense.note || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDeleteModal(expense)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete expense"
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-2">
                  <Receipt className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Add Expense</span>
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="">Select Category</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field w-full"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="input-field w-full"
                    placeholder="Optional notes about this expense..."
                  />
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
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal && expenseToDelete !== null}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense?"
        itemName={expenseToDelete ? `${expenseToDelete.category} - $${expenseToDelete.amount.toFixed(2)}` : ''}
        warningMessage="This will recalculate your net profit in reports."
        onConfirm={() => expenseToDelete && handleDelete(expenseToDelete._id)}
        onCancel={() => {
          setShowDeleteModal(false);
          setExpenseToDelete(null);
        }}
      />
    </div>
  );
}
