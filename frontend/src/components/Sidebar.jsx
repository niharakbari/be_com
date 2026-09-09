import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, List, FolderHeart, Settings, Target, Repeat, PiggyBank } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const { settings } = useAuth();
  
  const budgetPath = settings?.budget_mode === 'yearly' ? '/yearly-budgets' : '/budgets';

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: List },
    { name: 'Recurring', path: '/recurring', icon: Repeat },
        { name: 'Categories', path: '/categories', icon: FolderHeart },
    { name: 'Savings', path: '/savings', icon: PiggyBank },
    { name: 'Budgets', path: budgetPath, icon: Target },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  return (
    <div className="w-[240px] shrink-0 bg-sidebar rounded-[40px] p-6 flex flex-col h-[calc(100vh-32px)] my-4 ml-4">
      {/* New Logo */}
      <div className="flex items-center justify-center px-4 mb-16 mt-4">
        <span className="font-bold text-2xl tracking-tight">Finance.</span>
      </div>
      
      <nav className="flex-col flex gap-2 flex-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) || (item.name === 'Budgets' && location.pathname.includes('budgets'));
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-4 px-6 py-4 rounded-[100px] transition-all duration-300 font-semibold ${
                isActive
                  ? 'bg-btn-primary text-btn-text' 
                  : 'text-text-main hover:bg-text-main/5'
              }`}
            >
              <item.icon size={20} strokeWidth={2.5} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
