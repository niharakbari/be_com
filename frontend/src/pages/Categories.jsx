import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { categoryApi } from '../api/categoryApi';
import Modal from '../components/ui/Modal';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [formLoading, setFormLoading] = useState(false);

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [replacementId, setReplacementId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [newReplacementName, setNewReplacementName] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      openAddModal();
      navigate('/categories', { replace: true });
    }
  }, [location.search, navigate]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setType('expense');
    setValidationErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setValidationErrors([]);
    setIsModalOpen(true);
  };

  const initiateDelete = async (cat) => {
    setCategoryToDelete(cat);
    setUsageData(null);
    setReplacementId('');
    setNewReplacementName('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
    setUsageLoading(true);

    try {
      const res = await categoryApi.getUsage(cat.id);
      setUsageData(res.data.data);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to fetch category usage');
    } finally {
      setUsageLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      if (usageData?.total > 0) {
        let finalReplacementId = replacementId;
        
        // If user wants to create a new category on the fly
        if (replacementId === 'NEW') {
          const createRes = await categoryApi.create({
            name: newReplacementName.trim(),
            type: categoryToDelete.type
          });
          finalReplacementId = createRes.data.data.id;
        }

        await categoryApi.reassignAndDelete(categoryToDelete.id, finalReplacementId);
      } else {
        await categoryApi.delete(categoryToDelete.id);
      }
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setValidationErrors([]);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, { name, type });
      } else {
        await categoryApi.create({ name, type });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || 'Failed to save category');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Filter available replacement categories (same type, excluding the one being deleted)
  const availableReplacements = categories.filter(
    c => categoryToDelete && c.type === categoryToDelete.type && c.id !== categoryToDelete.id
  );

  const renderCategoryCard = (cat) => (
    <div key={cat.id} className="bg-surface rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main">
      <div className="font-semibold text-text-main">{cat.name}</div>
      <div className="flex gap-2">
        <button onClick={() => openEditModal(cat)} className="p-2 text-text-muted hover:text-text-main bg-page rounded-full transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => initiateDelete(cat)} className="p-2 text-text-muted hover:text-red-500 bg-page rounded-full transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-text-main">Categories</h2>
        <button onClick={openAddModal} className="bg-btn-primary text-btn-text px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-btn-primary-hover transition-colors">
          <Plus size={20} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-page rounded-2xl w-full"></div>
          <div className="h-20 bg-page rounded-2xl w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-main">
              <div className="w-3 h-3 rounded-full bg-green-500"></div> Income
            </h3>
            <div className="space-y-3">
              {incomeCategories.length > 0 ? incomeCategories.map(renderCategoryCard) : <p className="text-text-muted text-sm">No income categories.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-main">
              <div className="w-3 h-3 rounded-full bg-red-500"></div> Expense
            </h3>
            <div className="space-y-3">
              {expenseCategories.length > 0 ? expenseCategories.map(renderCategoryCard) : <p className="text-text-muted text-sm">No expense categories.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? "Edit Category" : "New Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm">
              <ul className="list-disc pl-5">
                {validationErrors.map((err, i) => <li key={i}>{err.message}</li>)}
              </ul>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1 text-text-main">Name</label>
            <input
              type="text"
              className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-main">Type</label>
            <select
              className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-text-main"
              value={type}
              onChange={e => setType(e.target.value)}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={formLoading}
            className="w-full bg-btn-primary text-btn-text rounded-full py-4 font-semibold hover:bg-btn-primary-hover disabled:opacity-70 transition-colors mt-4"
          >
            {formLoading ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </Modal>

      {/* Delete / Reassign Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Category">
        {usageLoading ? (
          <div className="text-center p-8 text-text-muted">Loading usage data...</div>
        ) : (
          <div className="space-y-4">
            {deleteError && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm">{deleteError}</div>
            )}
            
            {usageData?.total > 0 ? (
              <>
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 p-4 rounded-2xl text-sm flex gap-3">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold mb-1">This category is in use!</p>
                    <ul className="list-disc pl-4 space-y-0.5 opacity-90">
                      {usageData.transactions > 0 && <li>{usageData.transactions} transactions</li>}
                      {usageData.recurring_transactions > 0 && <li>{usageData.recurring_transactions} recurring transactions</li>}
                      {usageData.budgets > 0 && <li>{usageData.budgets} budgets</li>}
                      {usageData.yearly_budgets > 0 && <li>{usageData.yearly_budgets} yearly budgets</li>}
                    </ul>
                    <p className="mt-2">Please select a replacement category to reassign these items.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-text-main">Replacement Category</label>
                  <select
                    className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-text-main"
                    value={replacementId}
                    onChange={e => {
                      setReplacementId(e.target.value);
                      if (e.target.value !== 'NEW') setNewReplacementName('');
                    }}
                  >
                    <option value="" disabled>Select a category...</option>
                    {availableReplacements.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="NEW" className="font-semibold text-[var(--color-primary)]">+ Create New Category</option>
                  </select>

                  {replacementId === 'NEW' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        className="w-full bg-page border-2 border-border-main rounded-2xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] text-text-main"
                        placeholder={`New ${categoryToDelete?.type} category name`}
                        value={newReplacementName}
                        onChange={e => setNewReplacementName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-page text-text-main rounded-full py-3 font-semibold hover:bg-page/80 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={deleteLoading || !replacementId || (replacementId === 'NEW' && !newReplacementName.trim())}
                    className="flex-1 bg-red-500 text-white rounded-full py-3 font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deleteLoading ? 'Processing...' : 'Reassign & Delete'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-text-main mb-6">Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-page text-text-main rounded-full py-3 font-semibold hover:bg-page/80 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-500 text-white rounded-full py-3 font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
