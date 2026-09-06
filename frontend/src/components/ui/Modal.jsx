import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-surface rounded-[32px] p-6 sm:p-8 w-full max-w-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] m-4 relative max-h-[90vh] overflow-y-auto border border-border-main text-text-main">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-text-main">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-page rounded-full transition-colors text-text-main">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
