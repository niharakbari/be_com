import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { categoryApi } from '../api/categoryApi';
import { paymentModeApi } from '../api/paymentModeApi';
import Modal from '../components/ui/Modal';
import CategorySelect from '../components/ui/CategorySelect';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function Transactions() {
  const location = useLocation();
  const navigate = useNavigate();
  const amountInputRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
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
  const [activeTab, setActiveTab] = useState('all');
  const [isQuickAddExpanded, setIsQuickAddExpanded] = useState(false);

  const handleCreateCategory = async (name, type) => {
    const res = await categoryApi.create({ name, type });
    const catRes = await categoryApi.getAll();
    setCategories(catRes.data.data || []);
    return res.data.data;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes, payRes] = await Promise.all([
        transactionApi.getAll(),
        categoryApi.getAll(),
        paymentModeApi.getAll().catch(() => ({ data: { data: [] } })) // Fallback if no endpoint
      ]);
      setTransactions(Array.isArray(transRes.data.data) ? transRes.data.data : transRes.data.data.transactions || []);
      setCategories(catRes.data.data || []);
      setPaymentModes(payRes.data.data || payRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
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
        fetchData();
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
      fetchData();
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
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === formData.transaction_type);
  const quickAddFilteredCategories = categories.filter(c => c.type === quickAddData.transaction_type);

  const displayedTransactions = transactions.filter(t => {
    const matchesSearch = (t.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || t.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Transactions</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-white rounded-full pl-10 pr-4 py-3 w-[200px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={openAddModal} className="bg-black text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-900 transition-colors">
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('all')} className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'all' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-500 hover:bg-black/5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'}`}>All</button>
        <button onClick={() => { setActiveTab('income'); setQuickAddData({...quickAddData, transaction_type: 'income', category_id: ''}); }} className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'income' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-500 hover:bg-black/5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'}`}>Income</button>
        <button onClick={() => { setActiveTab('expense'); setQuickAddData({...quickAddData, transaction_type: 'expense', category_id: ''}); }} className={`px-6 py-2 rounded-full font-semibold transition-colors ${activeTab === 'expense' ? 'bg-black text-white shadow-md' : 'bg-white text-gray-500 hover:bg-black/5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'}`}>Expense</button>
      </div>

      
      <form onSubmit={handleQuickAddSubmit} className="bg-white rounded-[32px] p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6 flex flex-col w-full">
        <div 
          className="flex md:hidden justify-between items-center cursor-pointer mb-2"
          onClick={() => setIsQuickAddExpanded(!isQuickAddExpanded)}
        >
          <span className="font-bold text-[17px]">Quick Add Transaction</span>
          <span className="text-gray-400 bg-gray-50 rounded-full p-1.5">{isQuickAddExpanded ? '−' : '+'}</span>
        </div>
        <div className={`flex-col md:flex-row flex-wrap xl:flex-nowrap gap-4 items-start md:items-end w-full ${isQuickAddExpanded ? 'flex' : 'hidden md:flex'}`}>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-1">
          <label className="block text-xs font-semibold mb-1.5 text-gray-500 ml-1">Type</label>
          <select name="transaction_type" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium h-[46px]" value={quickAddData.transaction_type} onChange={handleQuickAddChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-1">
          <label className="block text-xs font-semibold mb-1.5 text-gray-500 ml-1">Amount</label>
          <input ref={amountInputRef} type="number" step="0.01" name="amount" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium h-[46px]" placeholder="0.00" value={quickAddData.amount} onChange={handleQuickAddChange} required />
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[1.5]">
          <label className="block text-xs font-semibold mb-1.5 text-gray-500 ml-1">Category</label>
          <CategorySelect 
            categories={quickAddFilteredCategories} 
            value={quickAddData.category_id} 
            onChange={(val) => setQuickAddData({...quickAddData, category_id: val})}
            onCreate={(name) => handleCreateCategory(name, quickAddData.transaction_type)}
          />
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[1.2]">
          <label className="block text-xs font-semibold mb-1.5 text-gray-500 ml-1">Pay Mode</label>
          <select name="payment_mode_id" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none text-sm font-medium h-[46px]" value={quickAddData.payment_mode_id} onChange={handleQuickAddChange} required>
            <option value="" disabled>Select...</option>
            {paymentModes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[1.2]">
          <label className="block text-xs font-semibold mb-1.5 text-gray-500 ml-1">Date</label>
          <input type="date" name="transaction_date" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium h-[46px]" value={quickAddData.transaction_date} onChange={handleQuickAddChange} required />
        </div>
        <div className="w-full md:w-[calc(50%-8px)] xl:flex-[2]">
          <label className="block text-xs font-semibold mb-1.5 text-gray-500 ml-1">Description</label>
          <input type="text" name="description" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium h-[46px]" placeholder="Note..." value={quickAddData.description} onChange={handleQuickAddChange} />
        </div>
        <div className="w-full xl:w-auto mt-2 xl:mt-0">
          <button type="submit" disabled={quickAddLoading} className="w-full xl:w-auto bg-black text-white px-8 py-3 rounded-2xl font-semibold hover:bg-gray-900 transition-colors disabled:opacity-70 h-[46px] whitespace-nowrap">
            {quickAddLoading ? '...' : 'Save'}
          </button>
        </div>
        </div>
      </form>
      <div className="flex-1 bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
        {loading ? (
           <div className="animate-pulse space-y-4">
             {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full"></div>)}
           </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {displayedTransactions.length > 0 ? displayedTransactions.map(t => (
              <div key={t.id} className="bg-[var(--color-surface)] rounded-2xl p-4 px-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                    {t.type === 'income' ? <ArrowUpRight size={18} strokeWidth={2.5} className="text-green-500" /> : <ArrowDownRight size={18} strokeWidth={2.5} className="text-red-500" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-[17px] truncate">{t.category_name || 'Uncategorized'}</p>
                      {t.payment_mode_name && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-gray-400 rounded border border-gray-100 whitespace-nowrap hidden sm:inline-block">
                          {t.payment_mode_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium truncate">
                      {new Date(t.transaction_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                      {t.note && <span className="text-gray-400 ml-1.5 font-normal truncate">· {t.note}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`font-bold text-[17px] ${t.type === 'expense' ? 'text-gray-900' : 'text-gray-900'}`}>
                      {t.type === 'expense' ? '- ' : '+ '}₹ {Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(t)} className="p-2 text-gray-400 hover:text-black bg-white rounded-full shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500">No transactions found.</div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? "Edit Transaction" : "New Transaction"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select name="transaction_type" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none" value={formData.transaction_type} onChange={handleChange}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input type="number" step="0.01" name="amount" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={formData.amount} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" name="transaction_date" className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={formData.transaction_date} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
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

          <button type="submit" disabled={formLoading} className="w-full bg-black text-white rounded-full py-4 font-semibold hover:bg-gray-900 disabled:opacity-70 transition-colors mt-4">
            {formLoading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
