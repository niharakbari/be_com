import { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { yearlyBudgetApi } from '../api/yearlyBudgetApi';
import { categoryApi } from '../api/categoryApi';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

export default function YearlyBudgets() {
  const navigate = useNavigate();
  
  const handleCardClick = (b) => {
    const y = b.budget_year;
    const startStr = `${y}-01-01`;
    const endStr = `${y}-12-31`;
    
    navigate(`/transactions?categoryId=${b.category_id || ''}&startDate=${startStr}&endDate=${endStr}`);
  };

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [formData, setFormData] = useState({
    category_id: '', // empty means overall
    amount: '',
    budget_month: new Date().getMonth() + 1,
    budget_year: new Date().getFullYear()
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const openAddModal = () => {
    setEditingBudget(null);
    setFormData({
      category_id: '',
      amount: '',
      budget_year: selectedYear
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id || '',
      amount: budget.amount,
      budget_year: budget.budget_year
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      await yearlyBudgetApi.delete(id);
      fetchMetadata();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        category_id: formData.category_id ? Number(formData.category_id) : null,
        amount: Number(formData.amount),
        budget_year: Number(formData.budget_year)
      };

      if (editingBudget) {
        await yearlyBudgetApi.update(editingBudget.id, payload);
      } else {
        await yearlyBudgetApi.create(payload);
      }
      setIsModalOpen(false);
      fetchMetadata();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(5), (_, i) => currentYear - 1 + i); // prev year to +3 years

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const displayedBudgets = budgets;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h2 className="text-3xl font-bold tracking-tight text-text-main">Yearly Budgets</h2>
          
          <div className="flex items-center gap-3 bg-surface border border-border-main rounded-full px-2 py-1 shadow-sm w-fit">
            <button onClick={handlePrevYear} className="p-1.5 hover:bg-page rounded-full transition-colors text-text-muted hover:text-text-main">
               <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-text-main min-w-[80px] text-center">
              {selectedYear}
            </span>
            <button onClick={handleNextYear} className="p-1.5 hover:bg-page rounded-full transition-colors text-text-muted hover:text-text-main">
               <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openAddModal}
            className="bg-btn-primary text-btn-text px-4 sm:px-6 py-3 rounded-full font-semibold hover:bg-btn-primary-hover transition-colors shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Yearly Budget</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-[32px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main overflow-hidden flex flex-col">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-page rounded-2xl w-full"></div>)}
          </div>
        ) : displayedBudgets.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBudgets.map(b => (
                <div key={b.id} onClick={() => handleCardClick(b)} className="bg-page rounded-3xl p-6 border border-border-main shadow-sm flex flex-col justify-between group cursor-pointer hover:border-btn-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shadow-sm">
                       <Target size={24} className="text-primary" />
                    </div>
                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(b); }} className="p-2 text-text-muted hover:text-text-main bg-surface rounded-full shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} className="p-2 text-text-muted hover:text-red-500 bg-surface rounded-full shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-surface border border-border-main rounded-full text-text-muted inline-block mb-3">
                      {b.budget_year}
                    </span>
                    <h3 className="text-xl font-bold text-text-main mb-1 truncate">
                      {b.category_name || "Overall Budget"}
                    </h3>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border-main">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-sm font-semibold text-text-muted mb-0.5">Budget</p>
                        <p className="text-[15px] font-bold text-text-main">₹ {Number(b.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-text-muted mb-0.5">Spent</p>
                        <p className="text-[15px] font-bold text-text-main">₹ {Number(b.spent || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1.5 mt-3">
                      <span className="text-xs font-bold text-text-muted">
                        Remaining: <span className={Number(b.remaining) < 0 ? 'text-red-500' : 'text-text-main'}>
                          {Number(b.remaining) < 0 ? '-' : ''}₹ {Math.abs(Number(b.remaining || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </span>
                      </span>
                      <span className={`text-xs font-bold ${b.status === 'exceeded' ? 'text-red-500' : b.status === 'near_limit' ? 'text-amber-500' : 'text-btn-primary'}`}>
                        {Number(b.usagePercentage || 0).toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-surface rounded-full h-2 mb-1.5 overflow-hidden border border-border-main relative">
                      <div 
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${b.status === 'exceeded' ? 'bg-red-500' : b.status === 'near_limit' ? 'bg-amber-500' : 'bg-btn-primary'}`} 
                        style={{ width: `${Math.min(Number(b.usagePercentage || 0), 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-right">
                       <span className={`text-[10px] uppercase tracking-wider font-bold ${b.status === 'exceeded' ? 'text-red-500' : b.status === 'near_limit' ? 'text-amber-500' : 'text-btn-primary'}`}>
                         {b.status === 'exceeded' ? 'Exceeded' : b.status === 'near_limit' ? 'Near Limit' : 'Normal'}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <div className="w-20 h-20 bg-page rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Target size={40} className="text-border-main" />
            </div>
            <p className="text-lg font-medium">No yearly budgets configured for {selectedYear}.</p>
            <p className="text-sm mt-1 mb-6">Yearly budgets help you track spending across the full year.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={openAddModal}
                className="px-6 py-2.5 bg-btn-primary text-btn-text font-semibold rounded-full hover:bg-btn-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>Add Yearly Budget</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBudget ? "Edit Budget" : "New Budget"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium">{formError}</div>}
          
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted">Target (Optional)</label>
            <select 
              className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main appearance-none cursor-pointer h-[46px]"
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Overall Budget (All Expenses)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-text-muted mt-1.5 ml-2">Leave blank to set a limit across all expenses.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted">Amount Limit (₹)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main h-[46px]"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted">Year</label>
            <select 
              className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main appearance-none cursor-pointer h-[46px]"
              value={formData.budget_year}
              onChange={e => setFormData({...formData, budget_year: e.target.value})}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={formLoading} 
            className="w-full bg-btn-primary text-btn-text rounded-full py-3.5 font-bold hover:bg-btn-primary-hover disabled:opacity-70 transition-colors mt-6 h-[52px]"
          >
            {formLoading ? 'Saving...' : 'Save Budget'}
          </button>
        </form>
      </Modal>

      
    </div>
  );
}
