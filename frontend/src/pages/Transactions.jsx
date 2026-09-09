import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Search, X, Target, Download, Loader2 } from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { categoryApi } from '../api/categoryApi';
import { budgetApi } from '../api/budgetApi';
import { paymentModeApi } from '../api/paymentModeApi';
import Modal from '../components/ui/Modal';
import CategorySelect from '../components/ui/CategorySelect';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef } from 'react';


const BudgetInsightPreview = ({ type, categoryId, date, amount, budgetsUsage }) => {
  if (type !== 'expense' || !categoryId || !date) return null;
  
  const selectedDate = new Date(date);
  if (isNaN(selectedDate)) return null;
  const m = selectedDate.getMonth() + 1;
  const y = selectedDate.getFullYear();
  
  const applicableBudgets = budgetsUsage.filter(b => b.budget_month === m && b.budget_year === y);
  const catBudget = applicableBudgets.find(b => b.category_id === Number(categoryId));
  const overallBudget = applicableBudgets.find(b => b.category_id === null);

  if (!catBudget && !overallBudget) return null;

  const renderInsight = (budget) => {
    const limit = Number(budget.amount) || 0;
    const spent = Number(budget.spent) || 0;
    const inputAmount = Number(amount) || 0;
    const projectedSpent = spent + inputAmount;
    const projectedRemaining = limit - projectedSpent;
    const projectedUsagePct = limit > 0 ? (projectedSpent / limit) * 100 : 0;
    const isExceeded = projectedRemaining < 0;
    
    return (
      <div key={budget.id} className="bg-page border border-border-main rounded-2xl p-4 w-full sm:w-1/2 flex-1">
         <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-text-main flex items-center gap-1.5">
               <Target size={14} className="text-btn-primary" />
               {budget.category_name || "Overall Budget"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isExceeded ? 'bg-red-500/10 text-red-500' : projectedUsagePct >= 80 ? 'bg-amber-500/10 text-amber-500' : 'bg-surface border border-border-main text-text-muted'}`}>
              {isExceeded ? 'Exceeded' : projectedUsagePct >= 80 ? 'Near Limit' : 'Normal'}
            </span>
         </div>
         <div className="flex justify-between items-end mb-1.5 mt-2 text-sm">
            <div>
              <span className="text-text-muted text-xs font-semibold block mb-0.5">Limit</span>
              <span className="font-bold text-text-main">₹{limit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="text-center">
              <span className="text-text-muted text-xs font-semibold block mb-0.5">Spent</span>
              <span className="font-bold text-text-main">₹{spent.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="text-right">
              <span className="text-text-muted text-xs font-semibold block mb-0.5">Projected Remaining</span>
              <span className={`font-bold ${isExceeded ? 'text-red-500' : 'text-text-main'}`}>
                {isExceeded ? '-' : ''}₹{Math.abs(projectedRemaining).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </span>
            </div>
         </div>
         <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden border border-border-main relative mt-2">
           <div 
             className={`absolute top-0 left-0 h-1.5 rounded-full transition-all duration-300 ${isExceeded ? 'bg-red-500' : projectedUsagePct >= 80 ? 'bg-amber-500' : 'bg-btn-primary'}`} 
             style={{ width: `${Math.min(projectedUsagePct, 100)}%` }}
           ></div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full mt-4 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
       {catBudget && renderInsight(catBudget)}
       {overallBudget && renderInsight(overallBudget)}
    </div>
  );
};

export default function Transactions() {
  const location = useLocation();
  const navigate = useNavigate();
  const amountInputRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [budgetsUsage, setBudgetsUsage] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
    // Quick Add state
  const initialFormState = {
    transaction_type: 'expense',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: '',
    payment_mode_id: '',
    description: ''
  };
  const [quickAddData, setQuickAddData] = useState(initialFormState);
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  // Modal Form state
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('DESC');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterPaymentModeId, setFilterPaymentModeId] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(false);

  const handleCreateCategory = async (name, type) => {
    const res = await categoryApi.create({ name, type });
    const catRes = await categoryApi.getAll();
    setCategories(catRes.data.data || []);
    return res.data.data;
  };

  const fetchMetadata = async () => {
    try {
      const [catRes, payRes, budgetRes] = await Promise.all([
        categoryApi.getAll(),
        paymentModeApi.getAll().catch(() => ({ data: { data: [] } })),
        budgetApi.getUsage().catch(() => ({ data: { data: [] } }))
      ]);
      setCategories(catRes.data.data || []);
      setPaymentModes(payRes.data.data || payRes.data || []);
      setBudgetsUsage(budgetRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch metadata', error);
    }
  };

  const handleClearFilters = () => {
    setActiveTab('all');
    setFilterCategoryId('');
    setFilterPaymentModeId('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setOrder('DESC');
    setSearchTerm('');
    setPage(1);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, sortBy, order };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (filterCategoryId) params.categoryId = filterCategoryId;
      if (filterPaymentModeId) params.paymentModeId = filterPaymentModeId;
      if (activeTab !== 'all') params.type = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await transactionApi.getAll(params);
      const data = res.data?.data || {};
      
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
      
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalRecords(data.pagination.total || 0);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const [searchTrigger, setSearchTrigger] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = { sortBy, order };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (filterCategoryId) params.categoryId = filterCategoryId;
      if (filterPaymentModeId) params.paymentModeId = filterPaymentModeId;
      if (activeTab !== 'all') params.type = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await transactionApi.export(params);
      
      // Determine filename from Content-Disposition if present
      let filename = 'transactions.csv';
      const disposition = res.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      } else {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        filename = `transactions-${yyyy}-${mm}-${dd}.csv`;
      }

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to export transactions.');
    } finally {
      setExportLoading(false);
    }
  };

  const isSearchMounted = useRef(false);

  // Use a debounced effect for searchTerm
  useEffect(() => {
    if (!isSearchMounted.current) {
      isSearchMounted.current = true;
      return;
    }
    const timeoutId = setTimeout(() => {
      setPage(1);
      setSearchTrigger(prev => prev + 1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [page, activeTab, startDate, endDate, sortBy, order, filterCategoryId, filterPaymentModeId, searchTrigger]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    let hasFilters = false;
    if (params.has('categoryId')) {
      setFilterCategoryId(params.get('categoryId'));
      hasFilters = true;
    }
    
    if (params.has('startDate')) {
      setStartDate(params.get('startDate'));
      hasFilters = true;
    }
    
    if (params.has('endDate')) {
      setEndDate(params.get('endDate'));
      hasFilters = true;
    }
    
    if (hasFilters) {
      // Force tab to all so expenses/income from that category show up correctly
      setActiveTab('all');
      // Clean up URL so refresh doesn't trigger it again
      navigate('/transactions', { replace: true });
    }

    if (params.get('action') === 'quickAdd') {
      const type = params.get('type');
      if (type === 'income' || type === 'expense') {
        setQuickAddData(prev => ({ ...prev, transaction_type: type }));
        setActiveTab(type);
      }
      
      // Auto-focus amount input
      setTimeout(() => {
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
      }, 100);
      
      // Clean up URL so refresh doesn't trigger it again
      navigate('/transactions', { replace: true });
    }
  }, [location.search, navigate]);

  const openAddModal = () => {
    setEditingTransaction(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTransaction(t);
    setFormData({
      transaction_type: t.type,
      amount: t.amount,
      transaction_date: new Date(t.transaction_date).toISOString().split('T')[0],
      category_id: t.category_id || '',
      payment_mode_id: t.payment_mode_id || '',
      description: t.note || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await transactionApi.delete(id);
        fetchTransactions();
      } catch (err) {
        alert('Failed to delete transaction');
      }
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });


  const handleQuickAddChange = (e) => {
    const { name, value } = e.target;
    if (name === 'transaction_type') {
      setQuickAddData({ ...quickAddData, transaction_type: value, category_id: '' });
    } else {
      setQuickAddData({ ...quickAddData, [name]: value });
    }
  };

  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    setQuickAddLoading(true);
    try {
      const payload = {
        amount: Number(quickAddData.amount),
        category_id: quickAddData.category_id ? Number(quickAddData.category_id) : null,
        payment_mode_id: quickAddData.payment_mode_id ? Number(quickAddData.payment_mode_id) : null,
        transaction_date: quickAddData.transaction_date,
        note: quickAddData.description || ''
      };
      await transactionApi.create(payload);
      setQuickAddData(initialFormState);
      fetchTransactions();
      fetchMetadata();
      window.dispatchEvent(new Event('refreshNotifications'));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setQuickAddLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        amount: Number(formData.amount),
        category_id: formData.category_id ? Number(formData.category_id) : null,
        payment_mode_id: formData.payment_mode_id ? Number(formData.payment_mode_id) : null,
        transaction_date: formData.transaction_date,
        note: formData.description || ''
      };

      if (editingTransaction) {
        await transactionApi.update(editingTransaction.id, payload);
      } else {
        await transactionApi.create(payload);
      }
      setIsModalOpen(false);
      fetchTransactions();
      fetchMetadata();
      window.dispatchEvent(new Event('refreshNotifications'));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === formData.transaction_type);
  const quickAddFilteredCategories = categories.filter(c => c.type === quickAddData.transaction_type);

  const displayedTransactions = transactions;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Transactions</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-surface rounded-full pl-10 pr-4 py-3 w-[200px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] placeholder-text-muted text-text-main"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            disabled={exportLoading}
            onClick={handleExport} 
            className="bg-surface border border-border-main text-text-main px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-page transition-colors disabled:opacity-50"
          >
            {exportLoading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />} 
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={openAddModal} className="bg-btn-primary text-btn-text px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-btn-primary-hover transition-colors">
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 bg-surface p-2 rounded-full shadow-[0_2px_10px_rgb(0,0,0,0.02)] w-fit border border-border-main">
          
        <button onClick={() => { setActiveTab('all'); setPage(1); }} className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'all' ? 'bg-btn-primary text-btn-text shadow-md' : 'bg-transparent text-text-muted hover:bg-page'}`}>All</button>
        <button onClick={() => { setActiveTab('income'); setPage(1); setQuickAddData({...quickAddData, transaction_type: 'income', category_id: ''}); }} className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'income' ? 'bg-btn-primary text-btn-text shadow-md' : 'bg-transparent text-text-muted hover:bg-page'}`}>Income</button>
        <button onClick={() => { setActiveTab('expense'); setPage(1); setQuickAddData({...quickAddData, transaction_type: 'expense', category_id: ''}); }} className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'expense' ? 'bg-btn-primary text-btn-text shadow-md' : 'bg-transparent text-text-muted hover:bg-page'}`}>Expense</button>
      
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-surface p-2 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main">
          <select 
            className="bg-page px-3 py-1.5 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main cursor-pointer" 
            value={filterCategoryId} 
            onChange={e => { setFilterCategoryId(e.target.value); setPage(1); }} 
          >
            <option value="">All Categories</option>
            {categories.filter(c => activeTab === 'all' ? true : c.type === activeTab).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select 
            className="bg-page px-3 py-1.5 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main cursor-pointer" 
            value={filterPaymentModeId} 
            onChange={e => { setFilterPaymentModeId(e.target.value); setPage(1); }} 
          >
            <option value="">All Payment Modes</option>
            {paymentModes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <div className="h-6 w-px bg-border-main mx-1 hidden sm:block"></div>
          
          <input 
            type="date" 
            className="bg-page px-3 py-1.5 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main" 
            value={startDate} 
            onChange={e => { setStartDate(e.target.value); setPage(1); }} 
          />
          <span className="text-text-muted text-sm font-medium">to</span>
          <input 
            type="date" 
            className="bg-page px-3 py-1.5 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main" 
            value={endDate} 
            onChange={e => { setEndDate(e.target.value); setPage(1); }} 
          />
          
          <div className="h-6 w-px bg-border-main mx-1"></div>
          
          <select 
            className="bg-page px-3 py-1.5 rounded-lg border-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main cursor-pointer" 
            value={`${sortBy}-${order}`} 
            onChange={e => { 
              const [s, o] = e.target.value.split('-'); 
              setSortBy(s); 
              setOrder(o); 
              setPage(1); 
            }}
          >
            <option value="date-DESC">Newest First</option>
            <option value="date-ASC">Oldest First</option>
            <option value="amount-DESC">Amount: High to Low</option>
            <option value="amount-ASC">Amount: Low to High</option>
          </select>
          
          {(filterCategoryId || filterPaymentModeId || startDate || endDate || sortBy !== 'date' || order !== 'DESC' || activeTab !== 'all' || searchTerm !== '') && (
            <button 
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ml-1"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>
      
      <form onSubmit={handleQuickAddSubmit} className="bg-surface rounded-[32px] p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6 flex flex-col w-full border border-border-main">
        <div 
          className="flex md:hidden justify-between items-center cursor-pointer mb-2"
          onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)}
        >
          <span className="font-bold text-[17px] text-text-main">Quick Add Transaction</span>
          <span className="text-text-muted bg-page rounded-full p-1.5">{isQuickAddExpanded ? '−' : '+'}</span>
        </div>
        <div className={`flex-col md:flex-row flex-wrap xl:flex-nowrap gap-4 items-start md:items-end w-full ${isQuickAddExpanded ? 'flex' : 'hidden md:flex'}`}>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-1">
          <label className="block text-xs font-semibold mb-1.5 text-text-muted ml-1">Type</label>
          <select name="transaction_type" className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium h-[46px] text-text-main" value={quickAddData.transaction_type} onChange={handleQuickAddChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-1">
          <label className="block text-xs font-semibold mb-1.5 text-text-muted ml-1">Amount</label>
          <input ref={amountInputRef} type="number" step="0.01" name="amount" className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium h-[46px] placeholder-text-muted text-text-main" placeholder="0.00" value={quickAddData.amount} onChange={handleQuickAddChange} required />
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[1.5]">
          <label className="block text-xs font-semibold mb-1.5 text-text-muted ml-1">Category</label>
          <CategorySelect 
            categories={quickAddFilteredCategories} 
            value={quickAddData.category_id} 
            onChange={(val) => setQuickAddData({...quickAddData, category_id: val})}
            onCreate={(name) => handleCreateCategory(name, quickAddData.transaction_type)}
          />
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[1.2]">
          <label className="block text-xs font-semibold mb-1.5 text-text-muted ml-1">Pay Mode</label>
          <select name="payment_mode_id" className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium h-[46px] text-text-main" value={quickAddData.payment_mode_id} onChange={handleQuickAddChange} required>
            <option value="" disabled>Select...</option>
            {paymentModes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[1.2]">
          <label className="block text-xs font-semibold mb-1.5 text-text-muted ml-1">Date</label>
          <input type="date" name="transaction_date" className="w-full bg-page border-none rounded-2xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium h-[46px] text-text-main" value={quickAddData.transaction_date} onChange={handleQuickAddChange} required />
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[2]">
          <label className="block text-xs font-semibold mb-1.5 text-text-muted ml-1">Description</label>
          <input type="text" name="description" className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium h-[46px] placeholder-text-muted text-text-main" placeholder="Note..." value={quickAddData.description} onChange={handleQuickAddChange} />
        </div>
        <div className="w-full xl:w-auto mt-2 xl:mt-0">
          <button type="submit" disabled={quickAddLoading} className="w-full xl:w-auto bg-btn-primary text-btn-text px-8 py-3 rounded-2xl font-semibold hover:bg-btn-primary-hover transition-colors disabled:opacity-70 h-[46px] whitespace-nowrap">
            {quickAddLoading ? '...' : 'Save'}
          </button>
        </div>
        </div>
        <BudgetInsightPreview 
          type={quickAddData.transaction_type}
          categoryId={quickAddData.category_id}
          date={quickAddData.transaction_date}
          amount={quickAddData.amount}
          budgetsUsage={budgetsUsage}
        />
      </form>
      <div className="flex-1 bg-surface rounded-[32px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main overflow-hidden flex flex-col text-text-main">
        {loading ? (
           <div className="animate-pulse space-y-4">
             {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-page rounded-2xl w-full"></div>)}
           </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {displayedTransactions.length > 0 ? displayedTransactions.map(t => (
              <div key={t.id} className="bg-page rounded-2xl p-4 px-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shadow-sm shrink-0">
                    {t.type === 'income' ? <ArrowUpRight size={18} strokeWidth={2.5} className="text-green-500" /> : <ArrowDownRight size={18} strokeWidth={2.5} className="text-red-500" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-[17px] truncate text-text-main">{t.category_name || 'Uncategorized'}</p>
                      {t.payment_mode_name && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-surface text-text-muted rounded border border-border-main whitespace-nowrap hidden sm:inline-block">
                          {t.payment_mode_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted font-medium truncate">
                      {new Date(t.transaction_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
                      {t.note && <span className="text-text-muted/60 ml-1.5 font-normal truncate">· {t.note}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`font-bold text-[17px] text-text-main`}>
                      {t.type === 'expense' ? '- ' : '+ '}₹ {Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(t)} className="p-2 text-text-muted hover:text-text-main bg-surface rounded-full shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-text-muted hover:text-red-500 bg-surface rounded-full shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-text-muted">No transactions found.</div>
            )}
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-main">
              <span className="text-sm text-text-muted font-medium">
                Showing {transactions.length} of {totalRecords} transactions
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-text-main">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(page - 1)} 
                    className="px-4 py-2 text-sm font-semibold bg-page text-text-main rounded-full hover:bg-border-main disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={page === totalPages} 
                    onClick={() => setPage(page + 1)} 
                    className="px-4 py-2 text-sm font-semibold bg-page text-text-main rounded-full hover:bg-border-main disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? "Edit Transaction" : "New Transaction"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">Type</label>
              <select name="transaction_type" className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-text-main" value={formData.transaction_type} onChange={handleChange}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">Amount</label>
              <input type="number" step="0.01" name="amount" className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main" value={formData.amount} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">Date</label>
              <input type="date" name="transaction_date" className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main" value={formData.transaction_date} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-muted">Category</label>
              <CategorySelect 
                categories={filteredCategories} 
                value={formData.category_id} 
                onChange={(val) => setFormData({...formData, category_id: val})}
                onCreate={(name) => handleCreateCategory(name, formData.transaction_type)}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-1">Payment Mode (Optional)</label>
             <select name="payment_mode_id" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none" value={formData.payment_mode_id} onChange={handleChange} required>
               <option value="" disabled>Select...</option>
               {paymentModes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <input type="text" name="description" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={formData.description} onChange={handleChange} />
          </div>

          <BudgetInsightPreview 
             type={formData.transaction_type}
             categoryId={formData.category_id}
             date={formData.transaction_date}
             amount={formData.amount}
             budgetsUsage={budgetsUsage}
          />
          <button type="submit" disabled={formLoading} className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-900 disabled:opacity-70 transition-colors mt-4">
            {formLoading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
