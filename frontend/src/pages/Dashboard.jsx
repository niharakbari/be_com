import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, List, FolderHeart, Calendar, BarChart2 } from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    weeklyIncome: 0,
    weeklyExpense: 0,
    chartData: Array(7).fill({ incomePct: 0, expensePct: 0 })
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await transactionApi.getAll();
        const allTransactions = res.data.data || (Array.isArray(res.data) ? res.data : []);
        
        let inc = 0;
        let exp = 0;
        let wInc = 0;
        let wExp = 0;
        const cData = Array(7).fill({ income: 0, expense: 0 }).map(() => ({ income: 0, expense: 0 }));

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0,0,0,0);

        allTransactions.forEach(t => {
          const amt = Number(t.amount);
          const tDate = new Date(t.transaction_date);
          const type = t.type;

          if (type === 'income') inc += amt;
          if (type === 'expense') exp += amt;

          if (tDate >= startOfWeek) {
            if (type === 'income') wInc += amt;
            if (type === 'expense') wExp += amt;

            let dayIdx = tDate.getDay() - 1;
            if (dayIdx === -1) dayIdx = 6;
            
            if (type === 'income') cData[dayIdx].income += amt;
            if (type === 'expense') cData[dayIdx].expense += amt;
          }
        });

        const maxVal = Math.max(...cData.map(d => Math.max(d.income, d.expense)), 1);
        const normalizedChart = cData.map(d => ({
          incomePct: Math.max(2, (d.income / maxVal) * 100),
          expensePct: Math.max(2, (d.expense / maxVal) * 100)
        }));

        setStats({
          balance: inc - exp,
          totalIncome: inc,
          totalExpense: exp,
          weeklyIncome: wInc,
          weeklyExpense: wExp,
          chartData: normalizedChart
        });
        
        setTransactions(allTransactions.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const { balance, totalIncome, totalExpense, weeklyIncome, weeklyExpense, chartData } = stats;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      {/* Left Column */}
      <div className="col-span-1 xl:col-span-8 flex flex-col gap-8">
        
        {/* Net Balance Card */}
        <div className="bg-[var(--color-primary)] rounded-[32px] p-6 sm:p-8 pb-10 relative overflow-hidden">
          <p className="text-sm font-semibold mb-2 opacity-80">Net Balance</p>
          <h2 className="text-4xl sm:text-[56px] font-bold tracking-tight mb-8 leading-none">₹ {balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          
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
          <h3 className="text-2xl font-bold mb-6">Recent transactions</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map(t => (
                <div key={t.id} className="bg-white rounded-3xl p-4 px-4 sm:px-6 flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                       {t.type === 'income' ? <ArrowUpRight size={18} strokeWidth={2.5} className="text-green-500" /> : <ArrowDownRight size={18} strokeWidth={2.5} className="text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-[15px] sm:text-[17px] truncate">{t.category_name || 'Uncategorized'}</p>
                        {t.payment_mode_name && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 text-gray-400 rounded border border-gray-100 whitespace-nowrap hidden sm:inline-block">
                            {t.payment_mode_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 font-medium truncate">
                        {new Date(t.transaction_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                        {t.note && <span className="text-gray-400 ml-1.5 font-normal truncate">· {t.note}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-[15px] sm:text-[17px] text-gray-900`}>
                      {t.type === 'expense' ? '- ' : '+ '}₹ {Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No transactions yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
        
        {/* Income / Expense Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
           <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
             <div className="flex justify-between items-center mb-6">
               <span className="font-bold text-lg">Total Income</span>
               <span className="font-bold text-lg">:</span>
             </div>
             <p className="text-sm text-gray-500 font-medium mb-1">Total</p>
             <h3 className="text-2xl font-bold">₹ {totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
           </div>
           
           <div className="bg-[var(--color-primary)] rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
             <div className="flex justify-between items-center mb-6">
               <span className="font-bold text-lg">Total Expense</span>
               <span className="font-bold text-lg">:</span>
             </div>
             <p className="text-sm text-gray-600 font-medium mb-1">Total</p>
             <h3 className="text-2xl font-bold">₹ {totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
           </div>
        </div>

        {/* Statistics Chart */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h3 className="text-2xl font-bold">Statistics</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-gray-100 rounded-full p-1 flex">
                <button className="bg-black text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full">Weekly</button>
                <button className="text-gray-500 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full">Monthly</button>
              </div>
              <button className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <Calendar size={16} />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center text-white">
                <BarChart2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-end gap-2 h-[200px] mb-8 border-b-2 border-gray-50 overflow-x-auto">
             <div className="flex justify-between items-end h-full px-2 min-w-[300px]">
               {chartData.map((day, idx) => (
                 <div key={idx} className="flex gap-1 items-end h-full w-full justify-center">
                    <div className="w-2 sm:w-4 bg-black rounded-t-sm" style={{height: `${day.expensePct}%`}}></div>
                    <div className="w-2 sm:w-4 bg-[var(--color-primary)] rounded-t-sm" style={{height: `${day.incomePct}%`}}></div>
                 </div>
               ))}
             </div>
             <div className="flex justify-between text-[10px] sm:text-xs font-semibold text-gray-400 px-2 mt-2 min-w-[300px]">
               <span className="text-center w-full">Mon</span><span className="text-center w-full">Tue</span><span className="text-center w-full">Wed</span><span className="text-center w-full">Thu</span><span className="text-center w-full">Fri</span><span className="text-center w-full">Sat</span><span className="text-center w-full">Sun</span>
             </div>
          </div>
          
          {/* Small summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Income</p>
                <p className="font-bold text-[14px] sm:text-[15px]">₹ {weeklyIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div className="w-8 h-8 shrink-0 rounded-full bg-black text-white flex items-center justify-center transform rotate-45">
                <ArrowDownRight size={16} />
              </div>
            </div>
            
            <div className="bg-[#EBF0FF] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Expenses</p>
                <p className="font-bold text-[14px] sm:text-[15px]">₹ {weeklyExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center transform rotate-45">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
