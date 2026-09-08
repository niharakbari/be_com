import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Repeat, CheckCircle, XCircle, Clock } from 'lucide-react';
import { recurringTransactionApi } from '../api/recurringTransactionApi';
import { categoryApi } from '../api/categoryApi';
import { paymentModeApi } from '../api/paymentModeApi';
import Modal from '../components/ui/Modal';

export default function RecurringTransactions() {
  const [recurrings, setRecurrings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const initialFormState = {
    category_id: '',
    payment_mode_id: '',
    amount: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    note: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, catRes, payRes] = await Promise.all([
        recurringTransactionApi.getAll().catch(() => ({ data: { data: [] } })),
        categoryApi.getAll().catch(() => ({ data: { data: [] } })),
        paymentModeApi.getAll().catch(() => ({ data: { data: [] } }))
      ]);
      setRecurrings(recRes.data?.data || []);
      setCategories((catRes.data?.data || []).filter(c => c.type === 'expense'));
      setPaymentModes(payRes.data?.data || payRes.data || []);
    } catch (err) {
      console.error('Failed to fetch recurring transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id || '',
      payment_mode_id: item.payment_mode_id || '',
      amount: item.amount,
      frequency: item.frequency,
      start_date: item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '',
      note: item.note || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) return;
    try {
      await recurringTransactionApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      if (item.is_active) {
        await recurringTransactionApi.deactivate(item.id);
      } else {
        await recurringTransactionApi.activate(item.id);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        category_id: formData.category_id ? Number(formData.category_id) : null,
        payment_mode_id: formData.payment_mode_id ? Number(formData.payment_mode_id) : null,
        amount: Number(formData.amount),
        frequency: formData.frequency,
        start_date: formData.start_date,
        note: formData.note
      };

      if (editingItem) {
        await recurringTransactionApi.update(editingItem.id, payload);
      } else {
        await recurringTransactionApi.create(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-text-main">Recurring Transactions</h2>
        <button 
          onClick={openAddModal}
          className="bg-btn-primary text-btn-text px-6 py-3 rounded-full font-semibold hover:bg-btn-primary-hover transition-colors shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-2"
        >
          <Plus size={20} />
          <span>New Recurring</span>
        </button>
      </div>

      <div className="flex-1 bg-surface rounded-[32px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main overflow-hidden flex flex-col">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-page rounded-2xl w-full"></div>)}
          </div>
        ) : recurrings.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recurrings.map(item => (
                <div key={item.id} className={`bg-page rounded-3xl p-6 border shadow-sm flex flex-col justify-between group transition-colors duration-300 ${item.is_active ? 'border-border-main' : 'border-border-main/50 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shadow-sm">
                       <Repeat size={24} className={item.is_active ? 'text-btn-primary' : 'text-text-muted'} />
                    </div>
                    <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggleActive(item)} className="p-2 text-text-muted hover:text-text-main bg-surface rounded-full shadow-sm" title={item.is_active ? 'Deactivate' : 'Activate'}>
                        {item.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button onClick={() => openEditModal(item)} className="p-2 text-text-muted hover:text-text-main bg-surface rounded-full shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-text-muted hover:text-red-500 bg-surface rounded-full shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${item.is_active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-surface border border-border-main text-text-muted'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-surface border border-border-main rounded text-text-muted uppercase tracking-wider">
                        {item.frequency}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-main mb-1 truncate">
                      {item.category_name || "Uncategorized"}
                    </h3>
                    {item.note && <p className="text-sm text-text-muted truncate">{item.note}</p>}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border-main">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-sm font-semibold text-text-muted mb-0.5">Amount</p>
                        <p className="text-[17px] font-bold text-text-main">₹ {Number(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-text-muted mb-0.5">Pay Mode</p>
                        <p className="text-sm font-medium text-text-main">{item.payment_mode_name || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-border-main/50 text-xs font-medium text-text-muted">
                       <div className="flex items-center gap-1.5">
                         <Clock size={14} className="opacity-70 shrink-0" />
                         {item.next_occurrence_date ? (
                           <span>Next: {new Date(item.next_occurrence_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}</span>
                         ) : (
                           <span>Starts: {new Date(item.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}</span>
                         )}
                       </div>
                       <div className="text-[10px] text-text-muted/70 uppercase tracking-wider font-bold shrink-0">
                         Started: {new Date(item.start_date).toLocaleDateString(undefined, {month: 'short', year: 'numeric', timeZone: 'UTC'})}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <div className="w-20 h-20 bg-page rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Repeat size={40} className="text-border-main" />
            </div>
            <p className="text-lg font-medium">No recurring transactions yet.</p>
            <p className="text-sm mt-1 mb-6">Automate your fixed expenses (like rent or subscriptions).</p>
            <button 
              onClick={openAddModal}
              className="px-6 py-2.5 border border-border-main text-text-main font-semibold rounded-full hover:bg-page transition-colors"
            >
              Add your first recurring expense
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Recurring Transaction" : "New Recurring Transaction"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium">{formError}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-muted">Category</label>
              <select 
                className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main appearance-none cursor-pointer h-[46px]"
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
                required
              >
                <option value="" disabled>Select...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-muted">Amount (₹)</label>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                required
                className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main h-[46px]"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-muted">Frequency</label>
              <select 
                className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main appearance-none cursor-pointer h-[46px]"
                value={formData.frequency}
                onChange={e => setFormData({...formData, frequency: e.target.value})}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-text-muted">Payment Mode</label>
              <select 
                className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main appearance-none cursor-pointer h-[46px]"
                value={formData.payment_mode_id}
                onChange={e => setFormData({...formData, payment_mode_id: e.target.value})}
                required
              >
                <option value="" disabled>Select...</option>
                {paymentModes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted">Start Date</label>
            <input 
              type="date" 
              required
              className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main h-[46px]"
              value={formData.start_date}
              onChange={e => setFormData({...formData, start_date: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-muted">Note (Optional)</label>
            <input 
              type="text" 
              className="w-full bg-page border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-text-main h-[46px]"
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              placeholder="e.g. Netflix Subscription"
            />
          </div>

          <button 
            type="submit" 
            disabled={formLoading} 
            className="w-full bg-btn-primary text-btn-text rounded-full py-3.5 font-bold hover:bg-btn-primary-hover disabled:opacity-70 transition-colors mt-6 h-[52px]"
          >
            {formLoading ? 'Saving...' : 'Save Recurring Transaction'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
