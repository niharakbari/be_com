import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, List, FolderHeart, Calendar, BarChart2, Target, Repeat } from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { statisticsApi } from '../api/statisticsApi';
import { budgetApi } from '../api/budgetApi';
import { recurringTransactionApi } from '../api/recurringTransactionApi';
import { categoryApi } from '../api/categoryApi';
import { Link, useNavigate } from 'react-router-dom';
import CategorySelect from '../components/ui/CategorySelect';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const handleBudgetClick = (b) => {
    const y = b.budget_year;
    const m = b.budget_month - 1;
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const startStr = new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const endStr = new Date(lastDay.getTime() - (lastDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    navigate(`/transactions?categoryId=${b.category_id || ''}&startDate=${startStr}&endDate=${endStr}`);
  };

  const [loading, setLoading] = useState(true);
  
  // Dashboard Overall Stats
  const [overallStats, setOverallStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [todayStats, setTodayStats] = useState({ totalIncome: 0, totalExpense: 0 });
  const [monthStats, setMonthStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  
  // Chart Stats
  const [chartView, setChartView] = useState('Weekly');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  
  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurrings, setRecurrings] = useState([]);
  

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const localDate = new Date();
        const today = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        const y = localDate.getFullYear();
        const m = localDate.getMonth();
        const firstDay = new Date(y, m, 1);
        const lastDay = new Date(y, m + 1, 0);
        const firstDayStr = new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const lastDayStr = new Date(lastDay.getTime() - (lastDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        const [overallRes, todayRes, monthRes, transRes, budgetRes, recRes] = await Promise.all([
          statisticsApi.getStatistics().catch(() => ({ data: { data: { totalIncome: 0, totalExpense: 0, netBalance: 0 } } })),
          statisticsApi.getStatistics({ startDate: today, endDate: today }).catch(() => ({ data: { data: { totalIncome: 0, totalExpense: 0 } } })),
          statisticsApi.getStatistics({ startDate: firstDayStr, endDate: lastDayStr }).catch(() => ({ data: { data: { totalIncome: 0, totalExpense: 0, netBalance: 0 } } })),
          transactionApi.getAll({ limit: 5 }).catch(() => ({ data: { data: { transactions: [] } } })),
          budgetApi.getUsage().catch(() => ({ data: { data: [] } })),
          recurringTransactionApi.getAll().catch(() => ({ data: { data: [] } }))
        ]);
        
        setOverallStats(overallRes.data?.data || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
        setTodayStats(todayRes.data?.data || { totalIncome: 0, totalExpense: 0 });
        setMonthStats(monthRes.data?.data || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
        
        const transData = transRes.data?.data || {};
        setTransactions(Array.isArray(transData) ? transData.slice(0, 5) : (transData.transactions || []).slice(0, 5));
        
        const bData = budgetRes.data?.data || [];
        bData.sort((a,b) => b.usagePercentage - a.usagePercentage);
        setBudgets(bData.slice(0, 2));
        
        const rData = recRes.data?.data || [];
        const activeR = rData.filter(r => r.is_active && r.next_occurrence_date);
        activeR.sort((a,b) => new Date(a.next_occurrence_date) - new Date(b.next_occurrence_date));
        setRecurrings(activeR.slice(0, 2));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const now = new Date();
        let startDate, endDate;
        let numDays = 7;
        
        if (chartView === 'Weekly') {
          const day = now.getDay() === 0 ? 7 : now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day + 1);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          numDays = endDate.getDate();
        }
        
        // Use timezone offset to ensure dates remain accurate when converting to ISOString locally
        const startStr = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const endStr = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        const res = await statisticsApi.getBreakdown({
          groupBy: 'date',
          startDate: startStr,
          endDate: endStr
        });
        
        const rawData = res.data?.data || [];
        const chartArr = Array(numDays).fill(0).map(() => ({ incomePct: 0, expensePct: 0, rawIncome: 0, rawExpense: 0 }));
        let maxVal = 0;
        
        rawData.forEach(item => {
           // We use item.transaction_date directly which should be YYYY-MM-DD from the backend
           const tDateStr = item.transaction_date.split('T')[0];
           const d = new Date(tDateStr + 'T00:00:00');
           
           let idx = 0;
           if (chartView === 'Weekly') {
             idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
           } else {
             idx = d.getDate() - 1;
           }
           
           if (idx >= 0 && idx < numDays) {
             const inc = Number(item.total_income) || 0;
             const exp = Number(item.total_expense) || 0;
             chartArr[idx].rawIncome += inc;
             chartArr[idx].rawExpense += exp;
             maxVal = Math.max(maxVal, chartArr[idx].rawIncome, chartArr[idx].rawExpense);
           }
        });
        
        if (maxVal > 0) {
          chartArr.forEach(d => {
            d.incomePct = Math.max(2, (d.rawIncome / maxVal) * 100);
            d.expensePct = Math.max(2, (d.rawExpense / maxVal) * 100);
          });
        }
        
        setChartData(chartArr);
      } catch (err) {
        console.error(err);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [chartView]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      {/* Left Column */}
      <div className="col-span-1 xl:col-span-8 flex flex-col gap-8">
        
        {/* Net Balance Card */}
        <div className="bg-sidebar rounded-[32px] p-6 sm:p-8 pb-10 relative overflow-hidden">
          <p className="text-sm font-semibold mb-2 opacity-80 text-text-main">Net Balance</p>
          <h2 className="text-4xl sm:text-[56px] font-bold tracking-tight mb-8 leading-none text-text-main">₹ {Number(overallStats.netBalance).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link to="/transactions?action=quickAdd&type=income" className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <ArrowUpRight size={24} />
              </div>
              <span className="text-xs sm:text-sm font-semibold">Income</span>
            </Link>
            
            <Link to="/transactions?action=quickAdd&type=expense" className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <ArrowDownRight size={24} />
              </div>
              <span className="text-xs sm:text-sm font-semibold">Expense</span>
            </Link>

            <Link to="/transactions" className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <List size={24} />
              </div>
              <span className="text-xs sm:text-sm font-semibold">List</span>
            </Link>
            
            <Link to="/categories" className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <FolderHeart size={24} />
              </div>
              <span className="text-xs sm:text-sm font-semibold">Categories</span>
            </Link>
          </div>
        </div>

        {/* Transactions List */}
        <div>
          <h3 className="text-2xl font-bold mb-6 text-text-main">Recent transactions</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-page h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-page rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-page rounded col-span-2"></div>
                      <div className="h-2 bg-page rounded col-span-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map(t => (
                <div key={t.id} className="bg-surface rounded-3xl p-4 px-4 sm:px-6 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-page flex items-center justify-center">
                       {t.type === 'income' ? <ArrowUpRight size={18} strokeWidth={2.5} className="text-green-500" /> : <ArrowDownRight size={18} strokeWidth={2.5} className="text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-[15px] sm:text-[17px] truncate text-text-main">{t.category_name || 'Uncategorized'}</p>
                        {t.payment_mode_name && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-page text-text-muted rounded border border-border-main whitespace-nowrap hidden sm:inline-block">
                            {t.payment_mode_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-text-muted font-medium truncate">
                        {new Date(t.transaction_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
                        {t.note && <span className="text-text-muted ml-1.5 font-normal truncate">· {t.note}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-[15px] sm:text-[17px] text-text-main`}>
                      {t.type === 'expense' ? '- ' : '+ '}₹ {Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted">No transactions yet.</p>
            )}
            
            {transactions.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Link to="/transactions" className="px-8 py-3 bg-surface border border-border-main text-text-main rounded-full font-semibold hover:bg-page transition-colors shadow-sm text-sm">
                  View All Transactions
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
        
        {/* Income / Expense Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
           <div className="bg-surface border border-border-main rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
             <div className="flex justify-between items-center mb-6">
               <span className="font-bold text-lg text-text-main">Total Income</span>
               <span className="font-bold text-lg text-text-main">:</span>
             </div>
             <p className="text-sm text-text-muted font-medium mb-1">Total</p>
             <h3 className="text-2xl font-bold text-text-main">₹ {Number(overallStats.totalIncome).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
           </div>
           
           <div className="bg-sidebar rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
             <div className="flex justify-between items-center mb-6">
               <span className="font-bold text-lg text-text-main">Total Expense</span>
               <span className="font-bold text-lg text-text-main">:</span>
             </div>
             <p className="text-sm text-text-muted font-medium mb-1">Total</p>
             <h3 className="text-2xl font-bold text-text-main">₹ {Number(overallStats.totalExpense).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
           </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-surface rounded-[32px] p-6 sm:p-8 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-border-main flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-text-main">Financial Overview</h3>
          </div>
          
          <div className="bg-page border border-border-main rounded-2xl p-4 mb-8">
             <p className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">This Month</p>
             <div className="flex justify-between items-end mb-2">
               <div>
                 <p className="text-[10px] sm:text-xs font-bold text-text-muted mb-0.5">Income</p>
                 <p className="text-sm font-bold text-green-500">₹{Number(monthStats.totalIncome).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] sm:text-xs font-bold text-text-muted mb-0.5">Expense</p>
                 <p className="text-sm font-bold text-text-main">₹{Number(monthStats.totalExpense).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
               </div>
             </div>
             <div className="pt-2 mt-2 border-t border-border-main flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted">Net Remaining</span>
                <span className={`font-bold ${monthStats.netBalance < 0 ? 'text-red-500' : 'text-text-main'}`}>
                  {monthStats.netBalance < 0 ? '-' : ''}₹{Math.abs(Number(monthStats.netBalance)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
             </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-text-main">Active Budgets</h4>
              {budgets.length > 0 && <Link to="/budgets" className="text-xs font-semibold text-btn-primary hover:underline">View All</Link>}
            </div>
            
            {budgets.length > 0 ? (
              <div className="space-y-5 overflow-y-auto pr-2 pb-4">
                {budgets.slice(0, 4).map(b => (
                  <div key={b.id} onClick={() => handleBudgetClick(b)} className="group cursor-pointer hover:bg-page p-3 -mx-3 rounded-2xl transition-colors">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-text-main truncate pr-2">{b.category_name || 'Overall'}</span>
                      <span className={`font-bold ${b.status === 'exceeded' ? 'text-red-500' : b.status === 'near_limit' ? 'text-amber-500' : 'text-text-muted'}`}>
                        {Number(b.usagePercentage).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-bold text-text-muted uppercase">Limit: ₹{Number(b.amount).toLocaleString()}</span>
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${b.status === 'exceeded' ? 'text-red-500' : b.status === 'near_limit' ? 'text-amber-500' : 'text-text-main'}`}>
                         {b.status === 'exceeded' ? 'Exceeded' : b.status === 'near_limit' ? 'Near Limit' : 'Normal'}
                       </span>
                    </div>
                    <div className="w-full bg-page rounded-full h-2 overflow-hidden border border-border-main relative">
                      <div 
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${b.status === 'exceeded' ? 'bg-red-500' : b.status === 'near_limit' ? 'bg-amber-500' : 'bg-btn-primary'}`} 
                        style={{ width: `${Math.min(Number(b.usagePercentage || 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {budgets.length > 4 && (
                  <div className="text-center pt-2">
                     <Link to="/budgets" className="text-xs font-bold text-text-muted hover:text-text-main transition-colors">+{budgets.length - 4} more budgets</Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center py-6 bg-page rounded-2xl border border-border-main/50">
                 <p className="text-sm font-medium mb-1">No budgets found.</p>
                 <p className="text-xs mb-3">Set limits to track your spending.</p>
                 <Link to="/budgets" className="text-xs font-semibold px-4 py-2 bg-surface border border-border-main rounded-full hover:text-text-main transition-colors">Create Budget</Link>
              </div>
            )}
          </div>
          
          {/* Today's summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="bg-page rounded-2xl p-4 flex items-center justify-between border border-border-main">
              <div>
                <p className="text-xs font-semibold text-text-muted mb-1">Today's Income</p>
                <p className="font-bold text-[14px] sm:text-[15px] text-text-main">₹ {Number(todayStats.totalIncome).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div className="w-8 h-8 shrink-0 rounded-full bg-btn-primary text-btn-text flex items-center justify-center transform rotate-45">
                <ArrowDownRight size={16} />
              </div>
            </div>
            
            <div className="bg-sidebar rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted mb-1">Today's Expenses</p>
                <p className="font-bold text-[14px] sm:text-[15px] text-text-main">₹ {Number(todayStats.totalExpense).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div className="w-8 h-8 shrink-0 rounded-full bg-black text-white flex items-center justify-center transform rotate-45">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
