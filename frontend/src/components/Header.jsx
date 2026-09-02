import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex flex-col xl:flex-row justify-between items-start gap-6 px-4 md:px-8 pt-4 md:pt-10 pb-4">
      <div>
        <h1 className="text-2xl md:text-[32px] font-bold tracking-tight mb-2">Hello, {user?.user_name || 'User'}!</h1>
        <p className="text-sm md:text-base text-gray-500 font-medium">All information about your finances in the sections below.</p>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 mt-2 w-full xl:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search something"
            className="bg-white rounded-[100px] pl-12 pr-6 py-3 w-full sm:w-[280px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
          />
        </div>
        
        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center relative shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:bg-gray-50">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.user_name || 'User'}`} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
