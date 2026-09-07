import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="bg-surface p-8 rounded-[32px] w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border-main text-text-main">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-sm">
            <div className={`w-6 h-6 border-4 border-white rounded-full ${isAuthLoading ? 'border-t-transparent animate-spin' : ''}`} />
          </div>
        </div>
        <Outlet context={{ setIsAuthLoading }} />
      </div>
    </div>
  );
}
