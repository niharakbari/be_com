import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function CategorySelect({ categories, value, onChange, onCreate, className }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedCategory = categories.find(c => c.id == value);

  return (
    <div className={`relative ${className || ''}`}>
      <div 
        className="w-full bg-[var(--color-surface)] border-none rounded-2xl px-4 py-3 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] h-[46px]"
        tabIndex="0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-black font-medium text-sm md:text-base truncate" : "text-gray-500 text-sm md:text-base"}>
          {value ? selectedCategory?.name || 'Select...' : 'Select...'}
        </span>
        <span className="text-gray-400 text-xs ml-2">▼</span>
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-[100%] left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-72">
            {!isCreating ? (
              <>
                <div className="p-3 border-b border-gray-50">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1 min-h-[100px]">
                  {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                    categories
                      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(c => (
                        <div 
                          key={c.id}
                          className={`px-4 py-3 hover:bg-[var(--color-surface)] rounded-xl cursor-pointer text-sm font-semibold transition-colors flex items-center justify-between ${value == c.id ? 'bg-[var(--color-surface)]' : ''}`}
                          onClick={() => handleSelect(c.id)}
                        >
                          {c.name}
                          {value == c.id && <span className="text-blue-500 text-xs">✓</span>}
                        </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">No categories found.</div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-white rounded-xl text-sm font-semibold transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreating(true);
                    }}
                  >
                    <Plus size={16} /> Add Category
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="New category name"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-900 disabled:opacity-70 rounded-xl text-sm font-semibold transition-colors"
                    onClick={async () => {
                      if (!newName.trim() || !onCreate) return;
                      setIsSaving(true);
                      try {
                        const newCat = await onCreate(newName.trim());
                        if (newCat && newCat.id) {
                          onChange(newCat.id);
                          setIsOpen(false);
                          setSearchTerm('');
                          setIsCreating(false);
                          setNewName('');
                        }
                      } catch (error) {
                        alert(error.response?.data?.message || 'Failed to create category');
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    {isSaving ? '...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
