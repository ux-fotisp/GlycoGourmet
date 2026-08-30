import React, { useState, useEffect } from 'react';
import { useOfflineMutation } from '../../hooks/useOfflineMutation';

const categories = [
  { key: 'produce', title: 'Produce & Fresh Vegetables', icon: 'nutrition', color: 'text-emerald-700' },
  { key: 'proteins', title: 'Lean Proteins & Seafood', icon: 'set_meal', color: 'text-amber-800' },
  { key: 'dairy', title: 'Dairy & Plant Alternatives', icon: 'egg_alt', color: 'text-blue-700' },
  { key: 'pantry', title: 'Pantry & Whole Grains', icon: 'grain', color: 'text-amber-900' },
  { key: 'spices', title: 'Spices, Herbs & Oils', icon: 'eco', color: 'text-teal-700' },
  { key: 'other', title: 'Other Essentials', icon: 'inventory_2', color: 'text-stone-700' },
];

/**
 * GroceryListModal — Interactive, categorized 7-day grocery shopping checklist with offline mutation support.
 */
export const GroceryListModal = ({ isOpen, onClose, manifest }) => {
  const { mutate } = useOfflineMutation();
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('glyco_grocery_checks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleItem = async (itemKey) => {
    const nextState = !checkedItems[itemKey];
    const updated = {
      ...checkedItems,
      [itemKey]: nextState,
    };
    setCheckedItems(updated);
    localStorage.setItem('glyco_grocery_checks', JSON.stringify(updated));

    // Offline-resilient sync mutation
    await mutate('/api/grocery-checks', 'POST', {
      itemKey,
      checked: nextState,
      updatedAt: new Date().toISOString(),
    });
  };

  const clearAll = async () => {
    setCheckedItems({});
    localStorage.removeItem('glyco_grocery_checks');
    await mutate('/api/grocery-checks/reset', 'POST', {
      timestamp: Date.now(),
    });
  };

  let totalItems = 0;
  let checkedCount = 0;

  categories.forEach(({ key }) => {
    const items = manifest[key] || [];
    items.forEach((item) => {
      totalItems++;
      const itemKey = `${key}_${item.name}_${item.unit}`;
      if (checkedItems[itemKey]) {
        checkedCount++;
      }
    });
  });

  const percentComplete = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const handleCopyText = () => {
    let text = '📋 GlycoGourmet 7-Day Grocery Shopping Manifest\n\n';
    categories.forEach(({ key, title }) => {
      const items = manifest[key] || [];
      if (items.length > 0) {
        text += `== ${title.toUpperCase()} ==\n`;
        items.forEach((item) => {
          const itemKey = `${key}_${item.name}_${item.unit}`;
          const isDone = checkedItems[itemKey] ? '[X]' : '[ ]';
          text += `${isDone} ${item.name}: ${item.amount} ${item.unit}\n`;
        });
        text += '\n';
      }
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in print:p-0 print:bg-transparent font-sans">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden font-sans text-[#1A2118] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        
        {/* Header */}
        <div className="p-6 bg-[#F6F4EE] border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B3B22] text-[#D8E8CB] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#1B3B22]">7-Day Grocery Manifest</h2>
              <p className="text-xs font-semibold text-[#2D5A34]">
                Aggregated shopping list scaled for your weekly glycemic target
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            aria-label="Close Grocery List Modal"
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer print:hidden"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Shopping Progress Bar & Actions */}
        <div className="px-6 py-3.5 bg-white border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div 
                className="h-full bg-[#1B3B22] transition-all duration-300 rounded-full"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#1B3B22] whitespace-nowrap">
              {checkedCount} / {totalItems} items ({percentComplete}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="text-[11px] font-bold text-stone-500 hover:text-stone-800 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Reset Checks
            </button>
            <button
              onClick={handleCopyText}
              className="text-[11px] font-bold text-[#1B3B22] bg-[#D8E8CB] hover:bg-[#c6dead] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy List'}
            </button>
            <button
              onClick={() => window.print()}
              className="text-[11px] font-bold text-white bg-[#1B3B22] hover:bg-[#2D5A34] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">print</span>
              Print
            </button>
          </div>
        </div>

        {/* Categorized List */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-stone-100">
          {totalItems === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <span className="material-symbols-outlined text-4xl">shopping_cart_off</span>
              <p className="text-sm font-semibold">No scheduled meals found in your weekly plan.</p>
            </div>
          ) : (
            categories.map(({ key, title, icon, color }) => {
              const items = manifest[key] || [];
              if (items.length === 0) return null;

              return (
                <div key={key} className="pt-4 first:pt-0 space-y-3">
                  <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${color}`}>
                    <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    {title} ({items.length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((item) => {
                      const itemKey = `${key}_${item.name}_${item.unit}`;
                      const isChecked = Boolean(checkedItems[itemKey]);

                      return (
                        <label
                          key={itemKey}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                              : 'bg-[#F6F4EE] border-stone-200/80 text-[#1A2118] hover:border-[#1B3B22]/40 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(itemKey)}
                              className="w-4 h-4 rounded text-[#1B3B22] focus:ring-[#1B3B22] cursor-pointer accent-[#1B3B22]"
                            />
                            <span className="text-xs font-bold truncate">{item.name}</span>
                          </div>
                          <span className="text-xs font-extrabold bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[#1B3B22] shrink-0">
                            {item.amount} {item.unit}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F6F4EE] border-t border-stone-200 flex justify-between items-center shrink-0 print:hidden">
          <span className="text-[11px] font-semibold text-[#2D5A34] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">offline_pin</span>
            Available offline during grocery shopping
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1B3B22] text-white rounded-xl text-xs font-bold hover:bg-[#2D5A34] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryListModal;
