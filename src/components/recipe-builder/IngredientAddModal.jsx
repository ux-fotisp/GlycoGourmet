import React, { useState, useEffect, useRef } from 'react';
import { getIngredientsRegistry, getCustomIngredients } from '../../utils/ingredientStore';
import { searchUSDAFoods } from '../../services/usdaClient';
import CustomIngredientFormModal from './CustomIngredientFormModal';
import {
  adaptInternalIngredient,
  adaptUsdaFood,
  adaptCustomIngredient,
} from '../../utils/provenanceAdapters';

/**
 * Generate a unique action-time line ID at the UI boundary.
 */
function generateLineId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `line_${crypto.randomUUID()}`;
  }
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * IngredientAddModal — Accessible Multi-Source Ingredient Selection Dialog
 */
export const IngredientAddModal = ({ isOpen, onClose, onSelect, triggerRef }) => {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'usda' | 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const createCustomBtnRef = useRef(null);

  // USDA search state
  const [usdaResults, setUsdaResults] = useState([]);
  const [isUsdaSearching, setIsUsdaSearching] = useState(false);
  const [usdaError, setUsdaError] = useState(null);

  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  // Focus trap & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 50);

    const triggerEl = triggerRef?.current;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerEl) {
        triggerEl.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const catalogIngredients = getIngredientsRegistry();
  const customIngredients = getCustomIngredients();

  const filteredCatalog = catalogIngredients.filter((ing) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      ing.name?.toLowerCase().includes(q) ||
      ing.category?.toLowerCase().includes(q)
    );
  });

  const handleUsdaSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsUsdaSearching(true);
    setUsdaError(null);

    try {
      const results = await searchUSDAFoods(searchQuery);
      setUsdaResults(results);
    } catch (_err) {
      setUsdaError('Failed to fetch USDA database items. Please check network.');
    } finally {
      setIsUsdaSearching(false);
    }
  };

  const handleSelectInternal = (ingredient) => {
    const lineId = generateLineId();
    const adapted = adaptInternalIngredient(ingredient, {
      id: lineId,
      quantity: ingredient.defaultAmount || 100,
      unit: ingredient.defaultUnit || 'g',
      prepState: ingredient.defaultPrepState || 'raw',
    });
    onSelect(adapted);
    onClose();
  };

  const handleSelectUsda = (usdaFood) => {
    const lineId = generateLineId();
    const adapted = adaptUsdaFood(usdaFood, {
      id: lineId,
      quantity: 100,
      unit: 'g',
      prepState: 'raw',
    });
    onSelect(adapted);
    onClose();
  };

  const handleSelectCustom = (customIng) => {
    const lineId = generateLineId();
    const adapted = adaptCustomIngredient(customIng, {
      id: lineId,
      quantity: customIng.defaultAmount || 100,
      unit: customIng.defaultUnit || 'g',
      prepState: customIng.defaultPrepState || 'raw',
    });
    onSelect(adapted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4 animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ingredient-modal-title"
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-outline-variant/30 flex flex-col gap-4 overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 px-6 py-4">
          <div>
            <h3 id="add-ingredient-modal-title" className="font-display text-base font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Add Recipe Ingredient
            </h3>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Select verified catalog ingredients, USDA items, or existing custom ingredients.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Multi-Source Navigation Tabs */}
        <div className="px-6 flex gap-2 border-b border-outline-variant/20 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Verified Database ({catalogIngredients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'usda'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            USDA FoodData Central
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            User-Entered Custom ({customIngredients.length})
          </button>
        </div>

        {/* Tab 1: Verified Catalog */}
        {activeTab === 'catalog' && (
          <div className="px-6 space-y-3 flex-1 overflow-y-auto">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[18px]">
                search
              </span>
              <input
                ref={firstInputRef}
                type="text"
                placeholder="Search verified catalog by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl pl-9 pr-3 h-10 text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto pr-1">
              {filteredCatalog.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-6 text-center col-span-2">
                  No verified ingredients found matching "{searchQuery}".
                </p>
              ) : (
                filteredCatalog.map((ing) => (
                  <div
                    key={ing.id}
                    onClick={() => handleSelectInternal(ing)}
                    className="p-3 bg-surface-container-low/40 hover:bg-primary/5 hover:border-primary/50 border border-outline-variant/30 rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                        {ing.name}
                      </span>
                      <span className="text-[10px] font-semibold text-primary/80 uppercase">
                        {ing.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                      <span>{ing.nutrition?.kcal ?? ing.kcal ?? 0} kcal</span>
                      <span>{ing.nutrition?.carbs ?? ing.carbs ?? 0}g carbs</span>
                      <span>GI: {ing.nutrition?.glycemicIndex ?? ing.glycemicIndex ?? 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: USDA FoodData Central */}
        {activeTab === 'usda' && (
          <div className="px-6 space-y-3 flex-1 overflow-y-auto">
            <form onSubmit={handleUsdaSearch} className="flex gap-2">
              <input
                ref={firstInputRef}
                type="text"
                placeholder="Search USDA FoodData Central (e.g. Salmon, Broccoli, Oats)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-surface-container-low border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl px-3 h-10 text-xs outline-none"
              />
              <button
                type="submit"
                disabled={isUsdaSearching || !searchQuery.trim()}
                className="px-4 h-10 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                {isUsdaSearching ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Searching...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    Search USDA
                  </>
                )}
              </button>
            </form>

            {usdaError && (
              <p className="text-xs text-error">{usdaError}</p>
            )}

            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {usdaResults.length === 0 && !isUsdaSearching && (
                <p className="text-xs text-on-surface-variant italic py-6 text-center">
                  Search USDA FoodData Central database to import nutrient lab standards.
                </p>
              )}

              {usdaResults.map((food) => (
                <div
                  key={food.fdcId}
                  onClick={() => handleSelectUsda(food)}
                  className="p-3 bg-surface-container-low/40 hover:bg-primary/5 hover:border-primary/50 border border-outline-variant/30 rounded-xl cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="space-y-0.5 max-w-[75%]">
                    <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      {food.description}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      FDC #{food.fdcId} • {food.brandOwner || 'Foundation Food'}
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-mono shrink-0">
                    <span className="font-bold text-primary block">{food.kcal} kcal</span>
                    <span className="text-[10px] text-on-surface-variant">{food.carbs}g carbs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: User-Entered Custom */}
        {activeTab === 'custom' && (
          <div className="px-6 space-y-3 flex-1 overflow-y-auto">
            {/* Action header to create new custom ingredient */}
            <div className="flex flex-wrap justify-between items-center bg-surface-container-low/60 p-3 rounded-xl border border-outline-variant/20 gap-2">
              <div>
                <p className="text-xs font-bold text-on-surface">Custom User Ingredients</p>
                <p className="text-[11px] text-on-surface-variant">Create and select user-entered ingredients with complete nutrition.</p>
              </div>
              <button
                ref={createCustomBtnRef}
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Create New Custom Ingredient
              </button>
            </div>

            {customIngredients.length === 0 ? (
              <div data-testid="custom-empty-state" className="py-10 text-center text-on-surface-variant space-y-2">
                <span className="material-symbols-outlined text-[36px] opacity-40">assignment_late</span>
                <p className="text-xs font-semibold">You haven't added any custom ingredients yet.</p>
                <p className="text-[11px] text-on-surface-variant/80 max-w-sm mx-auto">
                  Click "Create New Custom Ingredient" above to enter nutrition facts from your package label.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-1">
                {customIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    onClick={() => handleSelectCustom(ing)}
                    className="p-3 bg-surface-container-low/40 hover:bg-primary/5 hover:border-primary/50 border border-outline-variant/30 rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                        {ing.name}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 uppercase">
                        Custom
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                      <span>{ing.nutrition?.kcal ?? ing.kcal ?? 0} kcal</span>
                      <span>{ing.nutrition?.carbs ?? ing.carbs ?? 0}g carbs</span>
                      <span>GI: {ing.nutrition?.glycemicIndex ?? ing.glycemicIndex ?? 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-outline-variant/20 px-6 py-3 bg-surface-container-low/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-high rounded-xl text-on-surface font-bold text-xs hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Patient-Safe Custom Ingredient Creation Modal */}
      <CustomIngredientFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(adaptedLine) => {
          setIsCreateModalOpen(false);
          onSelect(adaptedLine);
        }}
        triggerRef={createCustomBtnRef}
      />
    </div>
  );
};

export default IngredientAddModal;
