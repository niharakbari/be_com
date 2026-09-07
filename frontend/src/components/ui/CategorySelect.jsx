import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function CategorySelect({ categories, value, onChange, onCreate, className }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleQuickCreate = async (nameToCreate) => {
    if (!onCreate) return;
    setIsSaving(true);
    try {
      const newCat = await onCreate(nameToCreate);
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
  };

  const handleSelect = (id) => {
    onChange(id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedCategory = categories.find(c => c.id == value);

  return (
    <div className={`relative ${className || ''}`}>
      <div 
        className="w-full bg-page border-none rounded-2xl px-4 py-3 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] h-[46px]"
        tabIndex="0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-text-main font-medium text-sm md:text-base truncate" : "text-text-muted text-sm md:text-base"}>
          {value ? selectedCategory?.name || 'Select...' : 'Select...'}
        </span>
        <span className="text-text-muted text-xs ml-2">▼</span>
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-[100%] left-0 w-full mt-2 bg-surface rounded-2xl shadow-xl border border-border-main z-50 overflow-hidden flex flex-col max-h-72 text-text-main">
            {!isCreating ? (
              <>
                <div className="p-3 border-b border-border-main">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-page text-text-main placeholder-text-muted rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
                          className={`px-4 py-3 hover:bg-page rounded-xl cursor-pointer text-sm font-semibold transition-colors flex items-center justify-between ${value == c.id ? 'bg-page' : ''}`}
                          onClick={() => handleSelect(c.id)}
                        >
                          {c.name}
                          {value == c.id && <span className="text-blue-500 text-xs">✓</span>}
                        </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-text-muted text-center">No categories found.</div>
                  )}
                </div>
                <div className="p-2 border-t border-border-main bg-page/50">
                  <button
                    type="button"
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-surface rounded-xl text-sm font-semibold transition-colors text-text-main disabled:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (searchTerm.trim()) {
                        handleQuickCreate(searchTerm.trim());
                      } else {
                        setIsCreating(true);
                      }
                    }}
                  >
                    <Plus size={16} /> {isSaving ? 'Saving...' : (searchTerm.trim() ? `Add "${searchTerm.trim()}"` : 'Add Category')}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="New category name"
                    className="w-full bg-page text-text-main placeholder-text-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 bg-page text-text-main hover:bg-page/80 rounded-xl text-sm font-semibold transition-colors"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-btn-primary text-btn-text hover:bg-btn-primary-hover disabled:opacity-70 rounded-xl text-sm font-semibold transition-colors"
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
