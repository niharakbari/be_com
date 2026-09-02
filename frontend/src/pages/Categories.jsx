import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
      // Clean up the URL so it doesn't reopen on refresh
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.delete(id);
        fetchCategories();
      } catch (error) {
        alert('Failed to delete category');
      }
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

  const renderCategoryCard = (cat) => (
    <div key={cat.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-50">
      <div className="font-semibold">{cat.name}</div>
      <div className="flex gap-2">
        <button onClick={() => openEditModal(cat)} className="p-2 text-gray-400 hover:text-black bg-gray-50 rounded-full transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Categories</h2>
        <button onClick={openAddModal} className="bg-black text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-900 transition-colors">
          <Plus size={20} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
          <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div> Income
            </h3>
            <div className="space-y-3">
              {incomeCategories.length > 0 ? incomeCategories.map(renderCategoryCard) : <p className="text-gray-500 text-sm">No income categories.</p>}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div> Expense
            </h3>
            <div className="space-y-3">
              {expenseCategories.length > 0 ? expenseCategories.map(renderCategoryCard) : <p className="text-gray-500 text-sm">No expense categories.</p>}
            </div>
          </div>
        </div>
      )}

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
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
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
            className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-900 disabled:opacity-70 transition-colors mt-4"
          >
            {formLoading ? 'Saving...' : 'Save Category'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
