import React, { useState, useEffect } from 'react';
import { categoryApi } from '../api/categoryApi';
import { budgetApi } from '../api/budgetApi';
import { yearlyBudgetApi } from '../api/yearlyBudgetApi';
import { Check, Clock, ChevronRight, ChevronLeft, Plus, X, Loader2, Target, TrendingUp, PiggyBank, Edit3, Briefcase, Coffee, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_INCOME = ['Salary', 'Freelance', 'Business', 'Investments', 'Rental'];
const SUGGESTED_EXPENSES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Housing', 'Utilities', 'Health'];

export default function Onboarding({ onComplete }) {
  const { user, updateUserSettings } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [budgetPref, setBudgetPref] = useState('monthly');
  const [budgetAmount, setBudgetAmount] = useState('');
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const toggleCategory = async (name, type) => {
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase() && c.type === type);
    if (existing) {
      setActionLoading(existing.id);
      try {
        await categoryApi.delete(existing.id);
        setCategories(categories.filter(c => c.id !== existing.id));
      } catch (err) {
        console.error(err);
      }
      setActionLoading(false);
    } else {
      setActionLoading(name);
      try {
        const res = await categoryApi.create({ name, type });
        setCategories([...categories, res.data?.data || { id: Date.now(), name, type }]);
      } catch (err) {
        console.error(err);
      }
      setActionLoading(false);
    }
  };

  const handleAddCustomCategory = async (type) => {
    if (!newCategoryName.trim()) return;
    setActionLoading('custom');
    try {
      const res = await categoryApi.create({ name: newCategoryName.trim(), type });
      setCategories([...categories, res.data?.data || { id: Date.now(), name: newCategoryName.trim(), type }]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    }
    setActionLoading(false);
  };

  const handleFinishSetup = async () => {
    setLoading(true);
    if (budgetPref === 'monthly' && budgetAmount && Number(budgetAmount) > 0) {
      try {
        const now = new Date();
        if (budgetPref === 'monthly') {
          await budgetApi.create({
            category_id: null,
            amount: Number(budgetAmount),
            budget_month: now.getMonth() + 1,
            budget_year: now.getFullYear()
          });
        } else {
          await yearlyBudgetApi.create({
            category_id: null,
            amount: Number(budgetAmount),
            budget_year: now.getFullYear()
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    try {
      await updateUserSettings({ budget_mode: budgetPref });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setStep(7); // Success step
  };

  const visualStep = step === 1 ? 1 : step === 2 ? 2 : step === 3 ? 3 : step === 4 || step === 5 ? 4 : step >= 6 ? 5 : 1;
  const progressLabels = ['Welcome', 'Income', 'Expenses', 'Budget', 'Review'];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex gap-4 mb-10 relative">
              <div className="absolute inset-0 bg-btn-primary/20 blur-3xl rounded-full"></div>
              <div className="w-16 h-16 bg-surface border border-border-main rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 z-10">
                <Target className="text-btn-primary" size={32} />
              </div>
              <div className="w-20 h-20 bg-btn-primary text-btn-text rounded-2xl flex items-center justify-center shadow-xl z-20 -mt-4">
                <TrendingUp size={40} />
              </div>
              <div className="w-16 h-16 bg-surface border border-border-main rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 z-10">
                <PiggyBank className="text-btn-primary" size={32} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-text-main mb-6 tracking-tight">
              Take control of your money.
            </h1>
            <p className="text-xl text-text-muted mb-12 max-w-lg leading-relaxed">
              Track. Plan. Save. Build better financial habits starting today.
            </p>
            
            <button 
              onClick={handleNext}
              className="bg-btn-primary text-btn-text px-10 py-4 rounded-full font-bold text-lg hover:bg-btn-primary-hover transition-all shadow-[0_0_40px_rgb(var(--color-primary)/0.4)] hover:shadow-[0_0_60px_rgb(var(--color-primary)/0.6)] hover:scale-105 flex items-center gap-3"
            >
              Get Started <ArrowRight size={20} />
            </button>
          </div>
        );

      case 2:
      case 3:
        const currentType = step === 2 ? 'income' : 'expense';
        const suggestions = step === 2 ? SUGGESTED_INCOME : SUGGESTED_EXPENSES;
        const currentCats = categories.filter(c => c.type === currentType);
        const activeNames = currentCats.map(c => c.name.toLowerCase());

        return (
          <div className="flex flex-col h-full max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4 tracking-tight">
              {step === 2 ? 'Where does your money come from?' : 'Where does your money go?'}
            </h2>
            <p className="text-lg text-text-muted mb-10">Select or add your most common {step === 2 ? 'income sources' : 'expenses'}.</p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              {suggestions.map(sug => {
                const isSelected = activeNames.includes(sug.toLowerCase());
                const isLoading = actionLoading === sug;
                return (
                  <button
                    key={sug}
                    onClick={() => toggleCategory(sug, currentType)}
                    disabled={actionLoading && !isLoading}
                    className={`px-6 py-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between min-w-[160px] ${
                      isSelected 
                        ? 'border-btn-primary bg-btn-primary/5 text-btn-primary shadow-sm shadow-btn-primary/10 scale-[1.02]' 
                        : 'border-border-main bg-surface text-text-main hover:border-text-muted hover:bg-page'
                    }`}
                  >
                    <span className="font-bold text-lg">{sug}</span>
                    {isLoading ? <Loader2 size={18} className="animate-spin opacity-50" /> : isSelected && <Check size={20} />}
                  </button>
                );
              })}
              
              {/* Custom categories not in suggestions */}
              {currentCats.filter(c => !suggestions.map(s=>s.toLowerCase()).includes(c.name.toLowerCase())).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name, currentType)}
                  disabled={actionLoading && actionLoading !== cat.id}
                  className="px-6 py-4 rounded-2xl border-2 border-btn-primary bg-btn-primary/5 text-btn-primary shadow-sm shadow-btn-primary/10 scale-[1.02] text-left transition-all flex items-center justify-between min-w-[160px]"
                >
                  <span className="font-bold text-lg">{cat.name}</span>
                  {actionLoading === cat.id ? <Loader2 size={18} className="animate-spin opacity-50" /> : <Check size={20} />}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {isAddingCategory ? (
                <div className="flex gap-3 max-w-sm animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text"
                    placeholder="Custom category name..."
                    autoFocus
                    className="flex-1 bg-surface border-2 border-border-main rounded-2xl px-5 py-3 text-text-main font-medium focus:outline-none focus:border-btn-primary"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustomCategory(currentType)}
                  />
                  <button 
                    disabled={actionLoading === 'custom'}
                    onClick={() => handleAddCustomCategory(currentType)}
                    className="bg-btn-primary text-btn-text px-6 py-3 rounded-2xl font-bold"
                  >
                    {actionLoading === 'custom' ? <Loader2 size={20} className="animate-spin" /> : 'Add'}
                  </button>
                  <button 
                    onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                    className="bg-surface border-2 border-border-main text-text-muted px-6 py-3 rounded-2xl font-bold hover:text-text-main"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="px-6 py-4 rounded-2xl border-2 border-dashed border-border-main text-text-muted hover:text-text-main hover:border-text-muted transition-all flex items-center justify-center gap-2 font-bold min-w-[160px]"
                >
                  <Plus size={20} /> Add Custom
                </button>
              )}
            </div>
            
            <div className="flex justify-between mt-auto pt-10">
              <button onClick={handleBack} className="flex items-center gap-2 text-text-muted hover:text-text-main font-bold px-6 py-3 rounded-full transition-colors hover:bg-page">
                <ChevronLeft size={20} /> Back
              </button>
              <button onClick={handleNext} className="flex items-center gap-2 bg-text-main text-surface font-bold px-8 py-3 rounded-full hover:opacity-90 transition-all shadow-md hover:scale-105">
                Continue <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col h-full max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4 tracking-tight">How do you want to manage your budget?</h2>
            <p className="text-lg text-text-muted mb-10">Choose a timeframe that works best for your financial planning.</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <label className={`block cursor-pointer border-2 rounded-[32px] p-8 transition-all group ${budgetPref === 'monthly' ? 'border-btn-primary bg-btn-primary/5 shadow-lg shadow-btn-primary/10 scale-[1.02]' : 'border-border-main bg-surface hover:border-text-muted'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${budgetPref === 'monthly' ? 'bg-btn-primary text-btn-text' : 'bg-page text-text-muted'}`}>
                     <Clock size={28} className={budgetPref === 'monthly' ? '' : 'hidden'}/>
                     <svg className={budgetPref !== 'monthly' ? '' : 'hidden'} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${budgetPref === 'monthly' ? 'border-btn-primary bg-btn-primary text-btn-text' : 'border-border-main'}`}>
                    {budgetPref === 'monthly' && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-text-main mb-2">Monthly</h3>
                <p className="text-text-muted font-medium">Plan and track spending month by month. Best for regular tracking.</p>
              </label>
              
              <label className={`block cursor-pointer border-2 rounded-[32px] p-8 transition-all group ${budgetPref === 'yearly' ? 'border-btn-primary bg-btn-primary/5 shadow-lg shadow-btn-primary/10 scale-[1.02]' : 'border-border-main bg-surface hover:border-text-muted'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${budgetPref === 'yearly' ? 'bg-btn-primary text-btn-text' : 'bg-page text-text-muted'}`}>
                     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${budgetPref === 'yearly' ? 'border-btn-primary bg-btn-primary text-btn-text' : 'border-border-main'}`}>
                    {budgetPref === 'yearly' && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-text-main mb-2">Yearly</h3>
                <p className="text-text-muted font-medium mb-4">Plan your budget for the entire year to manage long-term goals.</p>
                
              </label>
            </div>

            <div className="flex justify-between mt-auto pt-10">
              <button onClick={handleBack} className="flex items-center gap-2 text-text-muted hover:text-text-main font-bold px-6 py-3 rounded-full transition-colors hover:bg-page">
                <ChevronLeft size={20} /> Back
              </button>
              <button onClick={handleNext} className="flex items-center gap-2 bg-text-main text-surface font-bold px-8 py-3 rounded-full hover:opacity-90 transition-all shadow-md hover:scale-105">
                Continue <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 5:
                const curD = new Date();
        const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        return (
          <div className="flex flex-col h-full max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4 tracking-tight">Let's create your first budget.</h2>
            <p className="text-lg text-text-muted mb-10">Set a high-level spending limit for {budgetPref === 'monthly' ? `${mNames[curD.getMonth()]} ${curD.getFullYear()}` : curD.getFullYear()}.</p>
            
            <div className="bg-surface border-2 border-border-main rounded-[32px] p-10 mb-8 flex flex-col items-center justify-center shadow-sm">
              <p className="text-lg font-bold text-text-main mb-8 px-4 py-1.5 bg-page rounded-full border border-border-main">
                {budgetPref === 'monthly' ? `${mNames[curD.getMonth()]} ${curD.getFullYear()}` : curD.getFullYear()}
              </p>
              <div className="flex items-center justify-center gap-4 w-full max-w-sm border-b-2 border-border-main focus-within:border-btn-primary transition-colors pb-4">
                <span className="text-4xl md:text-5xl font-extrabold text-text-muted">₹</span>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="bg-transparent text-5xl md:text-6xl font-extrabold text-text-main outline-none w-full text-center"
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(e.target.value)}
                />
              </div>
              <p className="text-sm text-text-muted mt-6 font-semibold uppercase tracking-widest">Overall {budgetPref === 'monthly' ? 'Monthly' : 'Yearly'} Limit</p>
            </div>

            <div className="flex justify-between mt-auto pt-10">
              <button onClick={handleBack} className="flex items-center gap-2 text-text-muted hover:text-text-main font-bold px-6 py-3 rounded-full transition-colors hover:bg-page">
                <ChevronLeft size={20} /> Back
              </button>
              <div className="flex gap-4">
                <button onClick={handleNext} className="text-text-muted hover:text-text-main font-bold px-6 py-3 rounded-full transition-colors hover:bg-page hidden sm:block">
                  Skip for now
                </button>
                <button onClick={handleNext} className="flex items-center gap-2 bg-text-main text-surface font-bold px-8 py-3 rounded-full hover:opacity-90 transition-all shadow-md hover:scale-105">
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-4 tracking-tight">Review your setup</h2>
            <p className="text-lg text-text-muted mb-10">Make sure everything looks good before you jump in.</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8 overflow-y-auto pr-2 pb-4">
              <div className="bg-surface border border-border-main rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-3"><Briefcase size={24} className="text-text-muted"/> Income Categories</h3>
                  <button onClick={() => setStep(2)} className="text-btn-primary hover:underline text-sm font-bold flex items-center gap-1"><Edit3 size={16}/> Edit</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c=>c.type === 'income').length === 0 ? <p className="text-text-muted text-sm">None configured</p> : 
                    categories.filter(c=>c.type === 'income').map(c => (
                      <span key={c.id} className="bg-page border border-border-main px-3 py-1.5 rounded-full text-sm font-semibold text-text-main">{c.name}</span>
                    ))}
                </div>
              </div>

              <div className="bg-surface border border-border-main rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-text-main flex items-center gap-3"><Coffee size={24} className="text-text-muted"/> Expense Categories</h3>
                  <button onClick={() => setStep(3)} className="text-btn-primary hover:underline text-sm font-bold flex items-center gap-1"><Edit3 size={16}/> Edit</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c=>c.type === 'expense').length === 0 ? <p className="text-text-muted text-sm">None configured</p> : 
                    categories.filter(c=>c.type === 'expense').map(c => (
                      <span key={c.id} className="bg-page border border-border-main px-3 py-1.5 rounded-full text-sm font-semibold text-text-main">{c.name}</span>
                    ))}
                </div>
              </div>

              <div className="bg-surface border border-border-main rounded-3xl p-6 shadow-sm md:col-span-2 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold text-text-main mb-2">Budgeting Strategy</h3>
                  <p className="text-text-muted font-medium">
                    {budgetPref === 'monthly' ? 'Monthly tracking with overall budget limit.' : 'Yearly tracking with overall annual budget limit.'}
                  </p>
                </div>
                
                {budgetPref === 'monthly' && budgetAmount && Number(budgetAmount) > 0 && (
                  <div className="bg-page border border-border-main rounded-2xl px-6 py-4 text-center">
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Starting Limit</p>
                    <p className="text-2xl font-extrabold text-text-main">₹{Number(budgetAmount).toLocaleString()}</p>
                  </div>
                )}
                <button onClick={() => setStep(4)} className="text-btn-primary hover:underline text-sm font-bold flex items-center gap-1 shrink-0"><Edit3 size={16}/> Edit Preference</button>
              </div>
            </div>

            <div className="flex justify-between mt-auto pt-6 border-t border-border-main">
              <button onClick={handleBack} className="flex items-center gap-2 text-text-muted hover:text-text-main font-bold px-6 py-3 rounded-full transition-colors hover:bg-page">
                <ChevronLeft size={20} /> Back
              </button>
              <button disabled={loading} onClick={handleFinishSetup} className="flex items-center gap-2 bg-btn-primary text-btn-text font-bold px-8 py-4 rounded-full hover:bg-btn-primary-hover transition-all shadow-[0_0_20px_rgb(var(--color-primary)/0.3)] hover:shadow-[0_0_40px_rgb(var(--color-primary)/0.5)] hover:scale-105 disabled:opacity-50">
                {loading ? <Loader2 size={24} className="animate-spin" /> : 'Finish & Launch'} 
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
              <div className="w-24 h-24 bg-green-500 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/20 relative z-10 transform rotate-3">
                <Check size={48} strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-text-main mb-6 tracking-tight">You're all set!</h2>
            <p className="text-xl text-text-muted mb-12 leading-relaxed">Your premium finance workspace has been configured and is ready for action.</p>
            <button 
              onClick={onComplete}
              className="bg-text-main text-surface px-12 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:scale-105 flex items-center gap-3"
            >
              Go to Dashboard <ArrowRight size={20} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-page md:bg-black/40 md:backdrop-blur-md flex items-center justify-center md:p-6 lg:p-12">
      <div className="bg-page md:bg-surface md:border border-border-main md:rounded-[40px] w-full h-full md:h-auto md:min-h-[75vh] max-w-6xl md:shadow-2xl flex flex-col relative overflow-hidden transition-all">
        
        {/* Header / Progress Indicator */}
        <header className="px-6 md:px-12 py-6 md:border-b border-border-main flex items-center justify-between sticky top-0 z-50 bg-page md:bg-surface/80 backdrop-blur-sm">
          <div className="font-bold text-2xl tracking-tight text-text-main">Finance.</div>
          
          <div className="hidden md:flex items-center gap-8">
             {progressLabels.map((label, idx) => {
               const isActive = visualStep === idx + 1;
               const isPast = visualStep > idx + 1;
               return (
                 <div key={label} className={`flex items-center gap-2.5 transition-colors duration-500 ${isActive ? 'text-text-main' : isPast ? 'text-btn-primary' : 'text-text-muted/60'}`}>
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${isActive ? 'bg-text-main text-surface' : isPast ? 'bg-btn-primary text-btn-text' : 'bg-page border-2 border-border-main text-text-muted'}`}>
                     {isPast ? <Check size={12} strokeWidth={3} /> : idx + 1}
                   </div>
                   <span className="text-sm font-bold tracking-wide">{label}</span>
                 </div>
               );
             })}
          </div>
          
          {/* Mobile progress fraction */}
          <div className="md:hidden font-bold text-sm text-text-muted bg-surface border border-border-main px-3 py-1 rounded-full">
            Step {visualStep} of 5
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 flex flex-col justify-center">
          {renderStepContent()}
        </div>
        
      </div>
    </div>
  );
}
