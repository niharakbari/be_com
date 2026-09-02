import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[32px] w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-white rounded-full border-t-transparent animate-spin" style={{animationDuration: '3s'}} />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
