import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { getIngredientsRegistry, getIngredientsRegistryAsync, isCustomIngredient, invalidateIngredientCache } from '../../utils/ingredientStore';
import { PREP_STATES, DEFAULT_PREP_STATE } from '../../utils/nutritionCalculator';
import CustomIngredientDrawer from './CustomIngredientDrawer';

const CATEGORY_MAP = {
  protein: { label: 'Protein / Meat', icon: 'set_meal' },
  grain: { label: 'Grains & Seeds', icon: 'grain' },
  vegetable: { label: 'Vegetables', icon: 'eco' },
  fruit: { label: 'Fruits', icon: 'nutrition' },
  dairy: { label: 'Dairy & Milk', icon: 'water_drop' },
  cheese: { label: 'Cheeses', icon: 'breakfast_dining' },
  legume: { label: 'Legumes & Nuts', icon: 'spa' },
  fat: { label: 'Healthy Fats & Oils', icon: 'opacity' },
  seasoning: { label: 'Herbs & Seasonings', icon: 'skillet' }
};

const GI_SEGMENTS = [
  { id: 'all', label: 'All Impact Levels' },
  { id: 'low', label: 'Gentle GI (≤55)', maxGi: 55, color: 'bg-primary/10 text-primary border-primary/20' },
  { id: 'med', label: 'Moderate GI (56-69)', minGi: 56, maxGi: 69, color: 'bg-tertiary-container/10 text-tertiary border-tertiary/20' },
  { id: 'high', label: 'High GI (70+)', minGi: 70, color: 'bg-error-container text-error border-error/20' },
];

/**
 * Modern Segmented Ingredient Selector with rich pre-selection previews & category filters.
 */
export const IngredientSelector = ({ ingredients = [], onChange, onAdd, onRemove }) => {
  const [pickerIndex, setPickerIndex] = useState(null); // Index of row being picked
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');
  const [pickerGiSegment, setPickerGiSegment] = useState('all');

  // Custom ingredient drawer state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [pendingPickerIndex, setPendingPickerIndex] = useState(null);
  const [pulsingRowIndex, setPulsingRowIndex] = useState(null);

  // refreshKey triggers re-read of registry when a custom ingredient is saved
  const [refreshKey, setRefreshKey] = useState(0);
  const [ingredientsList, setIngredientsList] = useState(() => getIngredientsRegistry());

  // Async load from Snappi on mount and when refreshKey changes
  useEffect(() => {
    let cancelled = false;
    getIngredientsRegistryAsync().then((list) => {
      if (!cancelled) setIngredientsList(list);
    }).catch(() => {
      // Fallback: synchronous local registry already loaded in initial state
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Group ingredients by category
  const categorizedIngredients = useMemo(() => {
    const groups = {};
    ingredientsList.forEach(ing => {
      const cat = ing.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ing);
    });
    return groups;
  }, [ingredientsList]);

  // Filtered ingredients for the segmented picker
  const filteredIngredients = useMemo(() => {
    return ingredientsList.filter(ing => {
      // 1. Search Query Filter
      const q = pickerSearch.toLowerCase().trim();
      const matchesSearch = !q || ing.name.toLowerCase().includes(q) || ing.category.toLowerCase().includes(q);

      // 2. Category Segment Filter
      const matchesCategory = pickerCategory === 'all' || ing.category === pickerCategory;

      // 3. Glycemic Index Segment Filter
      const gi = ing.nutrition?.glycemicIndex;
      let matchesGi = true;
      if (pickerGiSegment === 'low') {
        matchesGi = gi !== null && gi !== undefined && gi <= 55;
      } else if (pickerGiSegment === 'med') {
        matchesGi = gi !== null && gi !== undefined && gi >= 56 && gi <= 69;
      } else if (pickerGiSegment === 'high') {
        matchesGi = gi !== null && gi !== undefined && gi >= 70;
      }

      return matchesSearch && matchesCategory && matchesGi;
    });
  }, [ingredientsList, pickerSearch, pickerCategory, pickerGiSegment]);

  const handleSelectIngredient = useCallback((ingredientId, targetIndex) => {
    const idx = targetIndex ?? pickerIndex;
    if (idx === null) return;
    const all = getIngredientsRegistry();
    const selected = all.find(ing => ing.id === ingredientId);
    const list = [...ingredients];
    list[idx] = {
      ingredientId,
      amount: selected?.defaultAmount || 100,
      unit: selected?.defaultUnit || 'g',
      prepState: selected?.defaultPrepState || list[idx]?.prepState || DEFAULT_PREP_STATE
    };
    onChange(list);
    setPickerIndex(null);
    setPickerSearch('');
  }, [pickerIndex, ingredients, onChange]);

  /** Open the CustomIngredientModal from within the picker */
  const handleOpenCustomModal = () => {
    setPendingPickerIndex(pickerIndex);
    setPickerIndex(null);    // Close the picker overlay
    setShowCustomModal(true); // Open the modal
  };

  /** Called by drawer on successful save — auto-selects the new ingredient and pulses the row */
  const handleCustomSaved = (newIngredientId) => {
    setShowCustomModal(false);
    invalidateIngredientCache();
    setRefreshKey(k => k + 1);
    const targetIdx = pendingPickerIndex ?? pickerIndex ?? 0;
    setTimeout(() => {
      handleSelectIngredient(newIngredientId, targetIdx);
      setPulsingRowIndex(targetIdx);
      setPendingPickerIndex(null);
      setTimeout(() => setPulsingRowIndex(null), 2500);
    }, 150);
  };

  const handleRowChange = (index, field, value) => {
    const list = [...ingredients];
    list[index] = {
      ...list[index],
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    };
    onChange(list);
  };

  const handleAddNewRow = () => {
    onAdd();
    // Auto-open picker for the newly added row
    setPickerIndex(ingredients.length);
  };

  const getGiBadgeClass = (gi) => {
    if (gi === null || gi === undefined) return 'bg-surface-container-high text-on-surface-variant';
    if (gi <= 55) return 'bg-primary/10 text-primary border-primary/20';
    if (gi <= 69) return 'bg-tertiary-container/10 text-tertiary border-tertiary/20';
    return 'bg-error-container text-error border-error/20';
  };

  return (
    <>
      {/* Custom Ingredient Slide-Over Drawer */}
      <CustomIngredientDrawer
        isOpen={showCustomModal}
        onSave={handleCustomSaved}
        onClose={() => { setShowCustomModal(false); setPendingPickerIndex(null); }}
      />
      <div className="bg-white p-5 md:p-6 rounded-xl border border-outline-variant/40 shadow-[0px_4px_20px_rgba(45,49,48,0.05)] space-y-4">
        <div className="border-b border-outline-variant/20 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              Recipe Ingredients ({ingredients.length})
            </h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              Select, segment, and fine-tune ingredients for blood-sugar optimization.
            </p>
          </div>
        </div>

        {/* Selected Ingredients List */}
        <div className="space-y-3">
          {ingredients.map((item, idx) => {
            const selectedIng = ingredientsList.find(ing => ing.id === item.ingredientId);
            const catInfo = selectedIng ? CATEGORY_MAP[selectedIng.category] : null;

            return (
              <div
                key={idx}
                className={`bg-surface-container-low/50 p-3.5 rounded-xl border relative flex flex-col gap-3 transition-all ${
                  pulsingRowIndex === idx
                    ? 'ring-2 ring-primary border-primary duration-300 shadow-md'
                    : 'border-outline-variant/30'
                }`}
              >
                {/* Top Row: Item Number & Remove */}
                <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    Ingredient #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    aria-label={`Remove ingredient ${idx + 1}`}
                    className="text-on-surface-variant/65 hover:text-error transition-colors cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    <span className="text-[10px]">Remove</span>
                  </button>
                </div>

                {/* Main Ingredient Card Trigger */}
                <div
                  onClick={() => setPickerIndex(idx)}
                  className="bg-white p-3 rounded-lg border border-outline-variant/40 hover:border-primary/50 cursor-pointer transition-all shadow-sm hover:shadow group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 aspect-square shrink-0 rounded-lg bg-primary/5 border border-primary/15 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">
                        {catInfo?.icon || 'eco'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                        {selectedIng?.name || 'Tap to choose ingredient...'}
                      </h4>
                      <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                        {selectedIng?.category || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {selectedIng ? (
                    <div className="flex items-center gap-2 text-[10px] font-medium text-on-surface-variant flex-wrap">
                      <span className="bg-surface-container-high/60 px-2 py-0.5 rounded font-bold">
                        {Math.round((selectedIng.nutrition.kcal * ((item.amount || 0) / (selectedIng.defaultAmount || 100))) * 10) / 10} kcal
                      </span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold border border-primary/20">
                        {Math.max(0, Math.round((((selectedIng.nutrition.carbs || 0) - (selectedIng.nutrition.fiber || 0)) * ((item.amount || 0) / (selectedIng.defaultAmount || 100))) * 10) / 10)}g Net Carbs
                      </span>
                      {selectedIng.nutrition.glycemicIndex !== null && (
                        <span className={`px-2 py-0.5 rounded font-bold border ${getGiBadgeClass(selectedIng.nutrition.glycemicIndex)}`}>
                          GI {selectedIng.nutrition.glycemicIndex}
                        </span>
                      )}
                      <span className="material-symbols-outlined text-[16px] text-primary ml-1">swap_horiz</span>
                    </div>
                  ) : (
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      Select <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </span>
                  )}
                </div>

                {/* Amount, Unit & Prep State */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-on-surface-variant/70 uppercase block mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleRowChange(idx, 'amount', e.target.value)}
                      aria-label={`Ingredient ${idx + 1} amount`}
                      className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg px-3 h-9 font-body-md text-xs outline-none"
                      min="0.1"
                      step="any"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-on-surface-variant/70 uppercase block mb-1">
                      Unit
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                      aria-label={`Ingredient ${idx + 1} unit`}
                      className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg px-2 h-9 font-body-md text-xs outline-none cursor-pointer"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="oz">oz</option>
                      <option value="cup">cup</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="piece">piece</option>
                      <option value="bunch">bunch</option>
                      <option value="clove">clove</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-on-surface-variant/70 uppercase block mb-1">
                      Preparation State
                    </label>
                    <select
                      value={item.prepState || DEFAULT_PREP_STATE}
                      onChange={(e) => handleRowChange(idx, 'prepState', e.target.value)}
                      aria-label={`Ingredient ${idx + 1} preparation state`}
                      className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg px-2 h-9 font-body-md text-xs outline-none cursor-pointer"
                    >
                      {PREP_STATES.map(ps => (
                        <option key={ps.value} value={ps.value}>
                          {ps.label} {ps.giMultiplier !== 1.0 ? `(GI ×${ps.giMultiplier})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-on-surface-variant/80 italic flex items-center gap-1 mt-1 font-normal">
                      <span className="material-symbols-outlined text-[13px] text-primary shrink-0">info</span>
                      Roasting/Boiling increases starch digestibility, slightly adjusting effective GI
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          data-testid="add-ingredient-slot-btn"
          onClick={handleAddNewRow}
          className="w-full bg-surface-container-high/60 py-3 rounded-lg font-label-md text-primary uppercase text-[11px] font-bold hover:bg-surface-container-high transition-colors cursor-pointer border border-dashed border-primary/30 flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Add Ingredient Slot
        </button>

        {/* ── Segmented Ingredient Picker Modal ───────────────────────────────────── */}
        {pickerIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-fade-in">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Segmented Ingredient Selection"
              className="bg-white rounded-2xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 overflow-hidden max-h-[90vh]"
            >
              {/* Modal Top Bar */}
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">manage_search</span>
                    Select Ingredient for Slot #{pickerIndex + 1}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                    Filter by category or glycemic impact range before making your choice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerIndex(null)}
                  aria-label="Close ingredient picker"
                  className="w-8 h-8 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Search Input Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[18px] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  placeholder={`Search ${ingredientsList.length}+ ingredients by name, category, or nutrient...`}
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-surface-container-low/60 border border-outline-variant/70 focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-xl pl-9 pr-8 h-10 text-xs font-sans outline-none"
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Segmented Filter Controls */}
              <div className="space-y-2.5 border-b border-outline-variant/20 pb-3">
                {/* Segment 1: Food Categories (Horizontally Scrollable Strip) */}
                <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto hide-scrollbar py-1 px-0.5 scroll-smooth whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setPickerCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${pickerCategory === 'all'
                      ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary/30'
                      : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20'
                      }`}
                  >
                    <span className={`w-5 h-5 aspect-square rounded-md flex items-center justify-center shrink-0 text-[13px] ${pickerCategory === 'all' ? 'bg-white/20 text-on-primary' : 'bg-primary/10 text-primary'
                      }`}>
                      <span className="material-symbols-outlined text-[14px] leading-none shrink-0">apps</span>
                    </span>
                    <span>All</span>
                    <span className="opacity-75 font-mono text-[10px]">({ingredientsList.length})</span>
                  </button>

                  {Object.entries(CATEGORY_MAP).map(([catKey, info]) => {
                    const count = (categorizedIngredients[catKey] || []).length;
                    if (count === 0) return null;
                    const isSelected = pickerCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setPickerCategory(catKey)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${isSelected
                          ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary/30'
                          : 'bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20'
                          }`}
                      >
                        <span className={`w-5 h-5 aspect-square rounded-md flex items-center justify-center shrink-0 text-[13px] ${isSelected ? 'bg-white/20 text-on-primary' : 'bg-primary/10 text-primary'
                          }`}>
                          <span className="material-symbols-outlined text-[14px] leading-none shrink-0">{info.icon}</span>
                        </span>
                        <span>{info.label.split(' ')[0]}</span>
                        <span className="opacity-75 font-mono text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Segment 2: Glycemic Impact Ranges */}
                <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5 whitespace-nowrap">
                  <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase mr-1 shrink-0">
                    GI Segment:
                  </span>
                  {GI_SEGMENTS.map(seg => (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => setPickerGiSegment(seg.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border shrink-0 ${pickerGiSegment === seg.id
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-white text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low'
                        }`}
                    >
                      {seg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Grid with Macro Cards */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[50vh]">
                {filteredIngredients.length === 0 ? (
                  <div className="py-12 text-center text-on-surface-variant space-y-2">
                    <span className="material-symbols-outlined text-[36px] opacity-40">search_off</span>
                    <p className="text-xs font-semibold">No ingredients match your current segments.</p>
                    <button
                      type="button"
                      onClick={() => { setPickerSearch(''); setPickerCategory('all'); setPickerGiSegment('all'); }}
                      className="text-xs text-primary font-bold underline cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredIngredients.map(ing => {
                      const catInfo = CATEGORY_MAP[ing.category] || {};
                      const isCurrent = ingredients[pickerIndex]?.ingredientId === ing.id;
                      const isCustom = isCustomIngredient(ing.id);

                      return (
                        <div
                          key={ing.id}
                          onClick={() => handleSelectIngredient(ing.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${isCurrent
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-outline-variant/30 bg-white hover:border-primary/50 hover:bg-surface-container-low/30'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[20px]">
                                {catInfo.icon || 'eco'}
                              </span>
                              <div>
                                <h5 className="text-xs font-bold text-on-surface leading-snug flex items-center gap-1.5">
                                  {ing.name}
                                  {isCustom && (
                                    <span className="inline-flex items-center gap-0.5 text-[8px] font-bold bg-tertiary/10 text-tertiary border border-tertiary/20 px-1 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                                      <span className="material-symbols-outlined text-[10px] aspect-square">person</span>
                                      Custom
                                    </span>
                                  )}
                                </h5>
                                <span className="text-[9px] text-on-surface-variant uppercase font-semibold">
                                  {ing.category}
                                </span>
                              </div>
                            </div>

                            {ing.nutrition?.glycemicIndex !== null && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getGiBadgeClass(ing.nutrition.glycemicIndex)}`}>
                                GI {ing.nutrition.glycemicIndex}
                              </span>
                            )}
                          </div>

                          {/* Macro details bar */}
                          <div className="grid grid-cols-4 gap-1 text-[9px] bg-surface-container-high/40 p-1.5 rounded-lg text-center font-mono">
                            <div>
                              <span className="block text-[8px] text-on-surface-variant font-sans">Kcal</span>
                              <span className="font-bold">{ing.nutrition?.kcal}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-on-surface-variant font-sans">Carbs</span>
                              <span className="font-bold">{ing.nutrition?.carbs}g</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-on-surface-variant font-sans">Net C</span>
                              <span className="font-bold text-primary">{ing.nutrition?.netCarbs}g</span>
                            </div>
                            <div>
                              <span className="block text-[8px] text-on-surface-variant font-sans">Protein</span>
                              <span className="font-bold">{ing.nutrition?.protein}g</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Create Custom Ingredient — always visible ── */}
              <div className="border-t border-outline-variant/15 pt-3">
                <button
                  type="button"
                  onClick={handleOpenCustomModal}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/40 bg-primary/3 hover:bg-primary/8 text-primary font-bold text-xs uppercase tracking-wider transition-all cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[18px] aspect-square group-hover:scale-110 transition-transform">add_circle</span>
                  Create Custom Ingredient
                </button>
              </div>

              {/* Modal Bottom Status Bar */}
              <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3 text-xs text-on-surface-variant font-medium">
                <span>Showing {filteredIngredients.length} of {ingredientsList.length} ingredients</span>
                <button
                  type="button"
                  onClick={() => setPickerIndex(null)}
                  className="px-4 py-1.5 bg-surface-container-high rounded-lg text-on-surface font-bold text-xs hover:bg-surface-container-highest transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IngredientSelector;
