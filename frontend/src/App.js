import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, Filter, X, Edit2, Trash2, Calendar, Tag, DollarSign, FileText, BarChart3, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [filters, setFilters] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
    category: 'other'
  });

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        // Fallback to default categories if API fails
        setCategories([
          { id: 1, name: 'food', color: '#ef4444' },
          { id: 2, name: 'travel', color: '#3b82f6' },
          { id: 3, name: 'bills', color: '#f59e0b' },
          { id: 4, name: 'entertainment', color: '#8b5cf6' },
          { id: 5, name: 'shopping', color: '#ec4899' },
          { id: 6, name: 'health', color: '#10b981' },
          { id: 7, name: 'other', color: '#6b7280' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to default categories if API fails
      setCategories([
        { id: 1, name: 'food', color: '#ef4444' },
        { id: 2, name: 'travel', color: '#3b82f6' },
        { id: 3, name: 'bills', color: '#f59e0b' },
        { id: 4, name: 'entertainment', color: '#8b5cf6' },
        { id: 5, name: 'shopping', color: '#ec4899' },
        { id: 6, name: 'health', color: '#10b981' },
        { id: 7, name: 'other', color: '#6b7280' }
      ]);
    }
  };

  const fetchExpenses = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams(filterParams);
      const response = await fetch(`${API_URL}/expenses?${params}`);
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (groupBy = 'total') => {
    try {
      const params = new URLSearchParams({ group_by: groupBy, ...filters });
      const response = await fetch(`${API_URL}/reports/summary?${params}`);
      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      console.log('Submitting expense:', formData);
      
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (data.success) {
        setShowAddModal(false);
        resetForm();
        fetchExpenses(filters);
      } else {
        const errorMsg = data.errors?.join(', ') || data.error;
        console.error('API Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/expenses/${currentExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setCurrentExpense(null);
        resetForm();
        fetchExpenses(filters);
      } else {
        setError(data.errors?.join(', ') || data.error);
      }
    } catch (err) {
      setError('Failed to update expense');
      console.error('Error updating expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchExpenses(filters);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete expense');
      console.error('Error deleting expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      amount: expense.amount,
      date: expense.date,
      note: expense.note || '',
      category: expense.category
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      note: '',
      category: 'other'
    });
  };

  const applyFilters = () => {
    fetchExpenses(filters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({});
    fetchExpenses();
    setShowFilterModal(false);
  };

  const openReportModal = () => {
    fetchSummary('category');
    setShowReportModal(true);
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <Wallet size={32} />
            <h1>Expense Tracker</h1>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <DollarSign size={20} />
              <div>
                <div className="stat-label">Total Spent</div>
                <div className="stat-value">₹{totalExpenses.toFixed(2)}</div>
              </div>
            </div>
            <div className="stat-card">
              <FileText size={20} />
              <div>
                <div className="stat-label">Total Expenses</div>
                <div className="stat-value">{expenses.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="toolbar">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={20} />
            Add Expense
          </button>
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={() => setShowFilterModal(true)}>
              <Filter size={20} />
              Filter
              {Object.keys(filters).length > 0 && (
                <span className="badge">{Object.keys(filters).length}</span>
              )}
            </button>
            <button className="btn btn-secondary" onClick={openReportModal}>
              <BarChart3 size={20} />
              Reports
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <X size={16} onClick={() => setError(null)} style={{ cursor: 'pointer' }} />
            {error}
          </div>
        )}

        {loading && expenses.length === 0 ? (
          <div className="loading">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <TrendingUp size={64} />
            <h2>No expenses yet</h2>
            <p>Start tracking your expenses by adding your first entry</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <PlusCircle size={20} />
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="expenses-grid">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-card">
                <div className="expense-header">
                  <div className="expense-category" style={{ backgroundColor: getCategoryColor(expense.category) }}>
                    <Tag size={16} />
                    {expense.category}
                  </div>
                  <div className="expense-actions">
                    <button className="icon-btn" onClick={() => openEditModal(expense)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDeleteExpense(expense.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="expense-amount">₹{expense.amount.toFixed(2)}</div>
                <div className="expense-date">
                  <Calendar size={14} />
                  {format(new Date(expense.date), 'MMM dd, yyyy')}
                </div>
                {expense.note && (
                  <div className="expense-note">{expense.note}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      {showAddModal && (
        <Modal title="Add Expense" onClose={() => { setShowAddModal(false); resetForm(); }}>
          <form onSubmit={handleAddExpense}>
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.length === 0 ? (
                  <option value="other">Loading categories...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Add a note (optional)"
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && (
        <Modal title="Edit Expense" onClose={() => { setShowEditModal(false); setCurrentExpense(null); resetForm(); }}>
          <form onSubmit={handleUpdateExpense}>
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.length === 0 ? (
                  <option value="other">Loading categories...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Add a note (optional)"
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setCurrentExpense(null); resetForm(); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Expense'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <Modal title="Filter Expenses" onClose={() => setShowFilterModal(false)}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value || undefined })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value || undefined })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              Clear
            </button>
            <button type="button" className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </Modal>
      )}

      {/* Report Modal */}
      {showReportModal && summary && (
        <Modal title="Expense Reports" onClose={() => setShowReportModal(false)}>
          <div className="report-section">
            <h3>Overall Summary</h3>
            <div className="report-stats">
              <div className="report-stat">
                <div className="report-label">Total Spent</div>
                <div className="report-value">₹{summary.total.toFixed(2)}</div>
              </div>
              <div className="report-stat">
                <div className="report-label">Total Expenses</div>
                <div className="report-value">{summary.count}</div>
              </div>
            </div>
          </div>
          
          {summary.by_category && (
            <div className="report-section">
              <h3>By Category</h3>
              <div className="category-breakdown">
                {Object.entries(summary.by_category).map(([category, data]) => (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <div className="category-name" style={{ color: getCategoryColor(category) }}>
                        <Tag size={14} />
                        {category}
                      </div>
                      <div className="category-count">{data.count} expenses</div>
                    </div>
                    <div className="category-amount">₹{data.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">
        {children}
      </div>
    </div>
  </div>
);

export default App;
