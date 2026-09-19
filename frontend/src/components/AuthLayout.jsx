import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AuthLayout() {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main transition-colors shadow-sm z-10"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="bg-surface p-8 rounded-[32px] w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-main text-text-main">
        <div className="flex justify-center mb-10 relative">
          {/* Crisp, Solid Floating Badge Logo */}
          <div className="flex items-center font-sans select-none tracking-[0.15em] mb-2">
            <span 
              className="text-4xl font-bold text-text-main uppercase"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              P
            </span>
            <span className="text-4xl font-thin text-text-muted mx-2">|</span>
            <span 
              className="text-4xl font-bold text-text-main uppercase"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              F
            </span>
          </div>
          
          {/* Loading Spinner */}
          {isAuthLoading && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <div className="w-5 h-5 border-2 border-text-muted border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <Outlet context={{ setIsAuthLoading }} />
      </div>
    </div>
  );
}
