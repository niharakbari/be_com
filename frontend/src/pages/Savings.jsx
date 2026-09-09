import React, { useState, useEffect } from 'react';
import { PiggyBank, Plus, Edit2, Trash2, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { savingsApi } from '../api/savingsApi';
import Modal from '../components/ui/Modal';

export default function Savings() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const [formData, setFormData] = useState({
    month: currentMonth,
    year: currentYear,
    goal: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from(new Array(5), (_, i) => currentYear - 1 + i);

  const fetchSavings = async () => {
    try {
      setLoading(true);
      const res = await savingsApi.getAll();
      setSavings(res.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      month: currentMonth,
      year: currentYear,
      goal: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      month: item.saving_month,
      year: item.saving_year,
      goal: item.savings_goal
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this savings goal?')) {
      try {
        await savingsApi.delete(id);
        fetchSavings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.goal) return;
    
    try {
      setFormLoading(true);
      
      const payload = {
        savingMonth: Number(formData.month),
        savingYear: Number(formData.year),
        savingsGoal: Number(formData.goal)
      };

      if (editingId) {
        await savingsApi.update(editingId, { savingsGoal: payload.savingsGoal });
      } else {
        await savingsApi.create(payload);
      }
      
      setIsModalOpen(false);
      fetchSavings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const currentMonthRecord = savings.find(s => s.saving_month === currentMonth && s.saving_year === currentYear);
  const historyRecords = savings.filter(s => s.id !== currentMonthRecord?.id)
                                 .sort((a, b) => {
                                   if (a.saving_year !== b.saving_year) return b.saving_year - a.saving_year;
                                   return b.saving_month - a.saving_month;
                                 });

  const renderStatus = (item) => {
    if (item.actual_saving === null) {
      return (
        <span className="text-xs font-bold px-2.5 py-1 bg-surface border border-border-main rounded-full text-blue-500 flex items-center gap-1.5 uppercase tracking-wider w-fit">
          <Clock size={14} /> In Progress
        </span>
      );
    }
    
    const actual = Number(item.actual_saving);
    const goal = Number(item.savings_goal);
    
    if (actual >= goal) {
      return (
        <span className="text-xs font-bold px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 flex items-center gap-1.5 uppercase tracking-wider w-fit">
          <TrendingUp size={14} /> Goal Achieved
        </span>
      );
    } else {
      return (
        <span className="text-xs font-bold px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 flex items-center gap-1.5 uppercase tracking-wider w-fit">
          <TrendingDown size={14} /> Below Goal
        </span>
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-text-main">Monthly Savings</h2>
        <button 
          onClick={openAddModal}
          className="bg-btn-primary text-btn-text px-6 py-3 rounded-full font-semibold hover:bg-btn-primary-hover transition-colors shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center gap-2"
        >
          <Plus size={20} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="flex-1 bg-surface rounded-[32px] p-6 sm:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main overflow-hidden flex flex-col">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-page rounded-2xl w-full"></div>
            <div className="h-64 bg-page rounded-2xl w-full mt-8"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 pb-6">
            
            {/* Current Month Banner */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                <PiggyBank className="text-btn-primary" size={24} />
                Current Month ({monthNames[currentMonth - 1]} {currentYear})
              </h3>
              
              {currentMonthRecord ? (
                <div className="bg-page rounded-3xl p-6 md:p-8 border border-border-main shadow-sm relative group overflow-hidden">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(currentMonthRecord)} className="p-2 text-text-muted hover:text-text-main bg-surface rounded-full shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(currentMonthRecord.id)} className="p-2 text-text-muted hover:text-red-500 bg-surface rounded-full shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <p className="text-sm font-semibold text-text-muted mb-1 uppercase tracking-wider">Savings Goal</p>
                      <p className="text-3xl font-bold text-text-main">₹{Number(currentMonthRecord.savings_goal).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    
                    <div className="h-px w-full md:h-12 md:w-px bg-border-main"></div>
                    
                    <div>
                      <p className="text-sm font-semibold text-text-muted mb-1 uppercase tracking-wider">Actual Saving</p>
                      <p className="text-3xl font-bold text-text-main">
                        {currentMonthRecord.actual_saving === null 
                          ? <span className="text-text-muted/50">--</span>
                          : `₹${Number(currentMonthRecord.actual_saving).toLocaleString(undefined, {minimumFractionDigits: 2})}`
                        }
                      </p>
                    </div>

                    <div className="h-px w-full md:h-12 md:w-px bg-border-main"></div>
                    
                    <div className="flex flex-col gap-2">
                       {renderStatus(currentMonthRecord)}
                       {currentMonthRecord.actual_saving !== null && (
                         <div className="text-sm font-medium mt-1">
                           {Number(currentMonthRecord.actual_saving) >= Number(currentMonthRecord.savings_goal) ? (
                             <span className="text-green-500">+{Number(currentMonthRecord.actual_saving - currentMonthRecord.savings_goal).toLocaleString()} surplus</span>
                           ) : (
                             <span className="text-red-500">-{Number(currentMonthRecord.savings_goal - currentMonthRecord.actual_saving).toLocaleString()} shortfall</span>
                           )}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-page rounded-3xl p-8 border border-border-main/50 border-dashed flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 text-text-muted">
                    <PiggyBank size={32} />
                  </div>
                  <p className="text-text-main font-semibold mb-1">No goal set for {monthNames[currentMonth - 1]}</p>
                  <p className="text-sm text-text-muted mb-4">Set a monthly savings goal to track your progress.</p>
                  <button onClick={openAddModal} className="text-sm font-semibold text-btn-primary hover:underline">Set Goal Now</button>
                </div>
              )}
            </div>

            {/* History List */}
            <div>
              <h3 className="text-lg font-bold text-text-main mb-4">Savings History</h3>
              {historyRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {historyRecords.map(item => (
                    <div key={item.id} className="bg-page rounded-3xl p-6 border border-border-main shadow-sm flex flex-col justify-between group">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-lg font-bold text-text-main">{monthNames[item.saving_month - 1]}</h4>
                          <p className="text-sm text-text-muted font-medium">{item.saving_year}</p>
                        </div>
                        <div className="flex gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item)} className="p-2 text-text-muted hover:text-text-main bg-surface rounded-full shadow-sm">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-text-muted hover:text-red-500 bg-surface rounded-full shadow-sm">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-text-muted">Goal</span>
                          <span className="font-bold text-text-main">₹{Number(item.savings_goal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-border-main/50">
                          <span className="text-sm font-semibold text-text-muted">Actual</span>
                          <span className="font-bold text-text-main">
                            {item.actual_saving === null ? '--' : `₹${Number(item.actual_saving).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-end pt-1">
                          {renderStatus(item)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-text-muted bg-page rounded-3xl border border-border-main">
                  <p className="text-sm font-medium">No previous savings records found.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Savings Goal' : 'New Savings Goal'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-muted mb-1.5">Month</label>
              <select
                required
                disabled={editingId} // Usually can't change month/year after creation, just goal
                className="w-full bg-page border border-border-main rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-btn-primary disabled:opacity-50"
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
              >
                {monthNames.map((m, i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-muted mb-1.5">Year</label>
              <select
                required
                disabled={editingId}
                className="w-full bg-page border border-border-main rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-btn-primary disabled:opacity-50"
                value={formData.year}
                onChange={e => setFormData({...formData, year: e.target.value})}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Savings Goal Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              className="w-full bg-page border border-border-main rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-btn-primary"
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-btn-primary text-btn-text py-3 rounded-xl font-bold mt-2 disabled:opacity-70 hover:bg-btn-primary-hover transition-colors shadow-sm"
          >
            {formLoading ? 'Saving...' : (editingId ? 'Update Goal' : 'Create Goal')}
          </button>
        </form>
      </Modal>
    </div>
  );
}
