import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  VALID_CATEGORIES,
  VALID_UNITS,
  saveCustomIngredient,
  generateCustomId,
  validateCustomIngredient,
} from '../../utils/ingredientStore';
import UsdaIngredientSearch from './UsdaIngredientSearch';

const CATEGORY_LABELS = {
  protein: 'Protein / Meat',
  grain: 'Grains & Seeds',
  vegetable: 'Vegetables',
  fruit: 'Fruits',
  dairy: 'Dairy & Milk',
  cheese: 'Cheeses',
  legume: 'Legumes & Nuts',
  fat: 'Healthy Fats & Oils',
  seasoning: 'Herbs & Seasonings',
};

const EMPTY_NUTRITION = {
  kcal: '',
  protein: '',
  fat: '',
  carbs: '',
  fiber: '',
  glycemicIndex: '',
};

const EMPTY_FORM = {
  name: '',
  category: '',
  defaultAmount: '',
  defaultUnit: 'g',
  defaultPrepState: 'raw',
  nutrition: { ...EMPTY_NUTRITION },
};

const NUTRITION_FIELDS = [
  { key: 'kcal', label: 'Calories', unit: 'kcal', icon: 'bolt', required: true },
  { key: 'protein', label: 'Protein', unit: 'g', icon: 'fitness_center', required: true },
  { key: 'fat', label: 'Fat', unit: 'g', icon: 'opacity', required: true },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', icon: 'bakery_dining', required: true },
  { key: 'fiber', label: 'Dietary Fiber', unit: 'g', icon: 'grass', required: true },
  { key: 'glycemicIndex', label: 'Glycemic Index', unit: '', icon: 'speed', required: false },
];

/**
 * CustomIngredientDrawer — Non-Blocking Right Slide-Over Panel for Recipe Authoring (Flow 2)
 *
 * Props:
 *   isOpen: boolean
 *   onSave(newIngredientId: string) — called after successful save
 *   onClose() — called on close request
 */
export const CustomIngredientDrawer = ({ isOpen, onSave, onSaveAndSelect, onClose }) => {
  const nameInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [giNA, setGiNA] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [similarWarning, setSimilarWarning] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Focus Lock & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body background scrolling without clearing parent editor state
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Shift accessibility focus to first text input
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = originalStyle;
      clearTimeout(timer);
    };
  }, [isOpen]);

  const calculatedNetCarbs = useMemo(() => {
    const c = parseFloat(form.nutrition.carbs) || 0;
    const f = parseFloat(form.nutrition.fiber) || 0;
    return Math.max(0, Math.round((c - f) * 10) / 10);
  }, [form.nutrition.carbs, form.nutrition.fiber]);

  const calculatedGL = useMemo(() => {
    if (giNA || calculatedNetCarbs <= 0) return 0;
    const gi = parseFloat(form.nutrition.glycemicIndex) || 0;
    return Math.round((gi * calculatedNetCarbs) / 100 * 10) / 10;
  }, [giNA, calculatedNetCarbs, form.nutrition.glycemicIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSimilarWarning(null);
    setGlobalError(null);

    if (name.startsWith('nutrition.')) {
      const nutKey = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        nutrition: { ...prev.nutrition, [nutKey]: value },
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectUSDAFood = (food) => {
    setForm(prev => ({
      ...prev,
      name: prev.name.trim() ? prev.name : food.name,
      nutrition: {
        kcal: food.kcal,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        fiber: food.fiber,
        glycemicIndex: food.glycemicIndex ?? '',
      },
    }));
  };

  const executeSave = async (/* forceDuplicate = false */) => {
    setGlobalError(null);
    setIsSaving(true);

    try {
      const customId = generateCustomId(form.name);
      const ingredientData = {
        id: customId,
        name: form.name.trim(),
        category: form.category,
        defaultAmount: parseFloat(form.defaultAmount) || 100,
        defaultUnit: form.defaultUnit || 'g',
        defaultPrepState: form.defaultPrepState || 'raw',
        kcal: parseFloat(form.nutrition.kcal) || 0,
        protein: parseFloat(form.nutrition.protein) || 0,
        fat: parseFloat(form.nutrition.fat) || 0,
        carbs: parseFloat(form.nutrition.carbs) || 0,
        fiber: parseFloat(form.nutrition.fiber) || 0,
        netCarbs: calculatedNetCarbs,
        glycemicIndex: giNA ? null : (form.nutrition.glycemicIndex !== '' ? parseFloat(form.nutrition.glycemicIndex) : null),
        glycemicLoad: calculatedGL,
        isUserAuthored: true,
        nutrition: {
          kcal: parseFloat(form.nutrition.kcal) || 0,
          protein: parseFloat(form.nutrition.protein) || 0,
          fat: parseFloat(form.nutrition.fat) || 0,
          carbs: parseFloat(form.nutrition.carbs) || 0,
          fiber: parseFloat(form.nutrition.fiber) || 0,
          netCarbs: calculatedNetCarbs,
          glycemicIndex: giNA ? null : (form.nutrition.glycemicIndex !== '' ? parseFloat(form.nutrition.glycemicIndex) : null),
          glycemicLoad: calculatedGL,
        },
      };

      const result = await saveCustomIngredient(ingredientData);
      const savedId = result.id || customId;

      setForm(EMPTY_FORM);
      setGiNA(false);
      if (typeof onSaveAndSelect === "function") { onSaveAndSelect(ingredientData); } if (typeof onSave === "function") { onSave(savedId); }
      onClose();
    } catch (err) {
      setGlobalError(err.message || 'Failed to save ingredient to Strapi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateCustomIngredient(form);
    if (!validation.isValid) {
      const firstErr = Object.values(validation.errors)[0];
      setGlobalError(firstErr);
      return;
    }
    executeSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed inset-y-0 right-0 w-full max-w-md bg-surface-container-lowest shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-in-out border-l border-outline-variant/30"
        role="dialog"
        aria-modal="true"
        aria-label="Create Custom Ingredient"
      >
        {/* Drawer Header */}
        <header className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0 bg-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
            <h2 className="font-display text-base font-bold text-on-surface">
              Create Custom Ingredient
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-10 h-10 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* USDA Live Search Tool */}
          <UsdaIngredientSearch
            initialQuery={form.name}
            onSelectFood={handleSelectUSDAFood}
          />

          {/* Global Error Banner */}
          {globalError && (
            <div className="rounded-xl border border-error/30 bg-error-container/30 px-4 py-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px] shrink-0">error</span>
              <p className="text-xs text-error font-medium">{globalError}</p>
            </div>
          )}

          {/* Identity Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Identity & Defaults
            </h3>

            {/* Name Input */}
            <div className="space-y-1">
              <label htmlFor="drawer-name" className="block text-xs font-bold text-on-surface">
                Ingredient Name <span className="text-error">*</span>
              </label>
              <input
                ref={nameInputRef}
                id="drawer-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Organic Almond Flour"
                className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label htmlFor="drawer-category" className="block text-xs font-bold text-on-surface">
                Food Category <span className="text-error">*</span>
              </label>
              <select
                id="drawer-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                required
              >
                <option value="" disabled>Select category...</option>
                {VALID_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Amount & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="drawer-amount" className="block text-xs font-bold text-on-surface">
                  Default Base Amount <span className="text-error">*</span>
                </label>
                <input
                  id="drawer-amount"
                  name="defaultAmount"
                  type="number"
                  step="any"
                  min="0.1"
                  value={form.defaultAmount}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="drawer-unit" className="block text-xs font-bold text-on-surface">
                  Base Unit
                </label>
                <select
                  id="drawer-unit"
                  name="defaultUnit"
                  value={form.defaultUnit}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                >
                  {VALID_UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Nutritional Metrics Section */}
          <section className="space-y-4 border-t border-outline-variant/20 pt-4">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Nutritional Values (Per Base Amount)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {NUTRITION_FIELDS.map(field => (
                <div key={field.key} className="space-y-1">
                  <label htmlFor={`drawer-nut-${field.key}`} className="block text-xs font-bold text-on-surface flex items-center justify-between">
                    <span>{field.label} {field.required && <span className="text-error">*</span>}</span>
                    {field.unit && <span className="text-[10px] text-on-surface-variant">({field.unit})</span>}
                  </label>
                  <input
                    id={`drawer-nut-${field.key}`}
                    name={`nutrition.${field.key}`}
                    type="number"
                    step="any"
                    min="0"
                    value={form.nutrition[field.key]}
                    onChange={handleChange}
                    disabled={field.key === 'glycemicIndex' && giNA}
                    placeholder="0"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-40 transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Net Carbs & Derived GL Indicators */}
            <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-outline-variant/30 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-on-surface">Calculated Net Carbs: </span>
                  <span className="text-primary font-extrabold">{calculatedNetCarbs}g</span>
                </div>
                <div>
                  <span className="font-bold text-on-surface">Derived 100g GL: </span>
                  <span className="text-tertiary font-extrabold">{calculatedGL}</span>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant/80 italic flex items-center gap-1 font-normal pt-1">
                <span className="material-symbols-outlined text-[13px] text-primary shrink-0">info</span>
                Roasting/Boiling increases starch digestibility, slightly adjusting effective GI
              </p>
            </div>
          </section>

          {/* Drawer Footer Actions */}
          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-xl border border-outline-variant text-on-surface text-xs font-bold hover:bg-surface-container-low cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all shadow-md flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Saving to Strapi...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  Save & Select Ingredient
                </>
              )}
            </button>
          </div>

        </form>
      </aside>
    </div>
  );
};

export default CustomIngredientDrawer;
