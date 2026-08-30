import React, { useState, useEffect } from 'react';
import { usePreferences } from '../context/UserPreferences';
import { getAllRecipes } from '../utils/recipeStore';
import { generateGroceryManifest } from '../utils/exportPipeline';
import { useOfflineMutation } from '../hooks/useOfflineMutation';

const categories = [
  { key: 'produce', title: 'Produce & Fresh Vegetables', icon: 'nutrition', color: 'text-emerald-700' },
  { key: 'proteins', title: 'Lean Proteins & Seafood', icon: 'set_meal', color: 'text-amber-800' },
  { key: 'dairy', title: 'Dairy & Plant Alternatives', icon: 'egg_alt', color: 'text-blue-700' },
  { key: 'pantry', title: 'Pantry & Whole Grains', icon: 'grain', color: 'text-amber-900' },
  { key: 'spices', title: 'Spices, Herbs & Oils', icon: 'eco', color: 'text-teal-700' },
  { key: 'other', title: 'Other Essentials', icon: 'inventory_2', color: 'text-stone-700' },
];

/**
 * GroceryList — Standalone Mobile-First Offline-Resilient Supermarket Shopping Manifest
 */
export const GroceryList = () => {
  const { mealPlan } = usePreferences();
  const { mutate, isOnline, pendingCount } = useOfflineMutation();
  const [recipes, setRecipes] = useState([]);
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
    let active = true;
    getAllRecipes().then((data) => {
      if (active) setRecipes(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const recipesMap = recipes.reduce((acc, r) => {
    acc[r.id] = r;
    return acc;
  }, {});

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const prescribedPlanShape = {
    scheduledSlots: DAYS.reduce((acc, day) => {
      acc[day.toLowerCase()] = {
        Breakfast: mealPlan[day]?.breakfast?.id || null,
        Lunch: mealPlan[day]?.lunch?.id || null,
        Dinner: mealPlan[day]?.dinner?.id || null,
      };
      return acc;
    }, {}),
  };

  const manifest = generateGroceryManifest(prescribedPlanShape, recipesMap);

  // Optimistic Toggle with Offline Sync Queue Mutation
  const toggleItem = async (itemKey) => {
    const nextState = !checkedItems[itemKey];
    
    // 1. Optimistic UI update (immediate)
    const updated = {
      ...checkedItems,
      [itemKey]: nextState,
    };
    setCheckedItems(updated);
    localStorage.setItem('glyco_grocery_checks', JSON.stringify(updated));

    // 2. Offline-aware background mutation call
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
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A2118] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <header className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-extrabold text-primary">
                  Grocery Manifest
                </h1>
                <span className="bg-sage-bg text-sage-text border border-sage-text/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">offline_pin</span>
                  Offline Ready
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-500 mt-0.5">
                Aggregated 7-day supermarket list scaled for your glycemic prescription.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy List'}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-3.5 py-2 text-stone-500 hover:text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-100 transition-colors"
            >
              Reset Checks
            </button>
          </div>
        </header>

        {/* Progress Bar */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs font-extrabold text-primary">
            <span>Shopping Progress</span>
            <span>{checkedCount} of {totalItems} Items Checked ({percentComplete}%)</span>
          </div>

          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </section>

        {/* Categorized Grocery List */}
        <main className="space-y-6">
          {totalItems === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-stone-400 space-y-2 border border-stone-200 shadow-xs">
              <span className="material-symbols-outlined text-5xl">shopping_cart_off</span>
              <p className="text-sm font-semibold">No scheduled meals found in your weekly prescription.</p>
            </div>
          ) : (
            categories.map(({ key, title, icon, color }) => {
              const items = manifest[key] || [];
              if (items.length === 0) return null;

              return (
                <article key={key} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                  <h2 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${color}`}>
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    {title} ({items.length})
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {items.map((item) => {
                      const itemKey = `${key}_${item.name}_${item.unit}`;
                      const isChecked = Boolean(checkedItems[itemKey]);

                      return (
                        <label
                          key={itemKey}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                              : 'bg-[#F6F4EE] border-stone-200/80 text-[#1A2118] hover:border-primary/40 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(itemKey)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                            />
                            <span className="text-xs font-bold truncate">{item.name}</span>
                          </div>
                          <span className="text-xs font-extrabold bg-white border border-stone-200 px-2.5 py-1 rounded-lg text-primary shrink-0">
                            {item.amount} {item.unit}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}
        </main>

      </div>
    </div>
  );
};

export default GroceryList;
