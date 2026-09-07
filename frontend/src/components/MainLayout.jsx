import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page flex overflow-hidden relative text-text-main">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - responsive positioning */}
      <div className={`fixed md:relative z-50 h-full transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <div className="flex items-center justify-between md:hidden px-6 pt-6 mb-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-surface text-text-main rounded-full shadow-sm"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-xl tracking-tight text-text-main">Finance.</span>
          </div>
        </div>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
