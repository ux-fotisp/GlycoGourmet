import React, { useState, useMemo, useId } from 'react';
import {
  VALID_CATEGORIES,
  VALID_UNITS,
  saveCustomIngredient,
  generateCustomId,
  validateCustomIngredient,
} from '../../utils/ingredientStore';

// State for pending warning save
let pendingSaveRef = null;

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

/** ─── Nutritional field definitions ─────────────────────────────────── */
const NUTRITION_FIELDS = [
  { key: 'kcal', label: 'Calories', unit: 'kcal', icon: 'bolt', required: true },
  { key: 'protein', label: 'Protein', unit: 'g', icon: 'fitness_center', required: true },
  { key: 'fat', label: 'Fat', unit: 'g', icon: 'opacity', required: true },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', icon: 'bakery_dining', required: true },
  { key: 'fiber', label: 'Dietary Fiber', unit: 'g', icon: 'grass', required: true },
  { key: 'glycemicIndex', label: 'Glycemic Index', unit: '', icon: 'speed', required: false },
];

/**
 * CustomIngredientModal — Inline creation of Tier 2 custom ingredients.
 *
 * Props:
 *   onSave(newIngredientId: string)  — called after successful save
 *   onClose()                        — called on cancel or backdrop click
 */
export const CustomIngredientModal = ({ onSave, onClose }) => {
  const baseId = useId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [giNA, setGiNA] = useState(false);       // "N/A" toggle for GI
  const [fieldErrors, setFieldErrors] = useState({});    // field-level errors
  const [globalError, setGlobalError] = useState(null);
  const [similarWarning, setSimilarWarning] = useState(null); // pending warning
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  /** Check if the form has any user-entered content */
  const isFormDirty = useMemo(() => {
    return (
      form.name.trim() !== '' ||
      form.category !== '' ||
      form.defaultAmount !== '' ||
      form.nutrition.kcal !== '' ||
      form.nutrition.protein !== '' ||
      form.nutrition.fat !== '' ||
      form.nutrition.carbs !== '' ||
      form.nutrition.fiber !== '' ||
      form.nutrition.glycemicIndex !== ''
    );
  }, [form]);

  /** Called on backdrop click, header 'X' button, or 'Cancel' button */
  const handleRequestClose = () => {
    if (isFormDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  /** Live-derived read-only values */
  const derived = useMemo(() => {
    const carbs = parseFloat(form.nutrition.carbs) || 0;
    const fiber = parseFloat(form.nutrition.fiber) || 0;
    const gi = giNA ? null : (parseFloat(form.nutrition.glycemicIndex) || null);
    const netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
    const gl = gi !== null ? Math.round((gi * netCarbs) / 100 * 10) / 10 : null;
    return { netCarbs, gl };
  }, [form.nutrition.carbs, form.nutrition.fiber, form.nutrition.glycemicIndex, giNA]);

  /** Preview of auto-generated ID */
  const previewId = useMemo(
    () => form.name.trim() ? generateCustomId(form.name) : 'custom-…',
    [form.name]
  );

  // ─── Handlers ────────────────────────────────────────────────────────────

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const setNutrition = (key, value) => {
    setForm(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [key]: value },
    }));
    setFieldErrors(prev => ({ ...prev, [`nutrition.${key}`]: undefined }));
  };

  const _doSave = async (payload) => {
    setIsSaving(true);
    try {
      const result = await saveCustomIngredient(payload);

      if (!result.ok) {
        // Map store errors back to field-level display
        const newErrors = {};
        (result.errors || []).forEach(err => { newErrors['_global'] = err; });
        setFieldErrors(newErrors);
        setGlobalError(result.errors?.join(' ') || 'Save failed.');
        return;
      }

      onSave(result.ingredient.id);
    } catch (err) {
      setGlobalError(err?.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);
    setSimilarWarning(null);

    const payload = {
      ...form,
      nutrition: {
        ...form.nutrition,
        glycemicIndex: giNA ? null : (form.nutrition.glycemicIndex === '' ? null : parseFloat(form.nutrition.glycemicIndex)),
      },
    };

    // Client-side pre-validation for immediate field feedback
    const { valid, errors } = validateCustomIngredient(payload);
    if (!valid) {
      const mapped = {};
      errors.forEach(err => { mapped['_global'] = err; });
      setFieldErrors(mapped);
      setGlobalError(errors.join(' '));
      return;
    }

    // Store validation + similarity check via async Snappi POST
    setIsSaving(true);
    try {
      const result = await saveCustomIngredient(payload);

      if (!result.ok) {
        setGlobalError(result.errors?.join(' ') || 'Save failed.');
        return;
      }

      if (result.warning === 'similar_to_system') {
        // Hold the save, ask the user to confirm
        setSimilarWarning(payload.name.trim());
        pendingSaveRef = payload;
        return;
      }

      onSave(result.ingredient.id);
    } catch (err) {
      setGlobalError(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDespiteWarning = () => {
    if (pendingSaveRef) _doSave(pendingSaveRef);
    setSimilarWarning(null);
    pendingSaveRef = null;
  };

  const handleCancelWarning = () => {
    setSimilarWarning(null);
    pendingSaveRef = null;
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Create Custom Ingredient"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
            <h2 className="font-display text-base font-bold text-on-surface">
              Create Custom Ingredient
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 aspect-square rounded-full bg-surface-container-high/60 hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 pb-4 space-y-5">

            {/* Similarity warning banner */}
            {similarWarning && (
              <div className="rounded-xl border border-tertiary/30 bg-tertiary-container/10 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">warning</span>
                  <p className="text-sm text-on-surface">
                    <span className="font-bold">"{similarWarning}"</span> already exists as a system ingredient.
                    Are you sure you want to create a custom entry with the same name?
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelWarning}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface border border-outline-variant bg-white hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDespiteWarning}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-on-primary bg-tertiary hover:bg-tertiary-container cursor-pointer transition-colors"
                  >
                    Create Anyway
                  </button>
                </div>
              </div>
            )}

            {/* Global error */}
            {globalError && !similarWarning && (
              <div className="rounded-xl border border-error/30 bg-error-container/30 px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-error text-[18px] shrink-0">error</span>
                <p className="text-xs text-error font-medium">{globalError}</p>
              </div>
            )}

            {/* ── Identity ── */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Identity
              </h3>

              {/* Name */}
              <div className="space-y-1">
                <label htmlFor={`${baseId}-name`} className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Name <span className="text-error">*</span>
                </label>
                <input
                  id={`${baseId}-name`}
                  type="text"
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="e.g. Almond Flour"
                  className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg h-11 px-4 text-sm outline-none transition-all"
                />
                {/* Auto-generated ID preview */}
                {form.name.trim() && (
                  <p className="text-[10px] text-on-surface-variant/70 font-mono pl-1">
                    ID preview: <span className="text-primary font-bold">{previewId.replace(/-\d+$/, '-…')}</span>
                    <span className="ml-2 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans font-bold">CUSTOM</span>
                  </p>
                )}
              </div>

              {/* Category + Default Amount/Unit row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${baseId}-category`} className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Category <span className="text-error">*</span>
                  </label>
                  <select
                    id={`${baseId}-category`}
                    required
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg h-11 px-3 text-sm outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select category…</option>
                    {VALID_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
                    Default Serving <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={`${baseId}-amount`}
                      type="number"
                      required
                      min="0.01"
                      step="any"
                      placeholder="100"
                      value={form.defaultAmount}
                      onChange={(e) => setField('defaultAmount', e.target.value)}
                      aria-label="Default amount"
                      className="w-20 bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg h-11 px-3 text-sm outline-none transition-all"
                    />
                    <select
                      id={`${baseId}-unit`}
                      value={form.defaultUnit}
                      onChange={(e) => setField('defaultUnit', e.target.value)}
                      aria-label="Default unit"
                      className="flex-1 bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg h-11 px-2 text-sm outline-none transition-all cursor-pointer"
                    >
                      {VALID_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Nutritional Metrics ── */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Nutritional Metrics
                <span className="text-[9px] ml-2 text-on-surface-variant/60 normal-case font-normal">per default serving</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {NUTRITION_FIELDS.map(({ key, label, unit, icon, required }) => {
                  const isGI = key === 'glycemicIndex';
                  return (
                    <div key={key} className="space-y-1">
                      <label
                        htmlFor={`${baseId}-${key}`}
                        className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-primary text-[14px] aspect-square">{icon}</span>
                        {label}
                        {required && <span className="text-error">*</span>}
                        {isGI && (
                          <label className="flex items-center gap-1 ml-auto cursor-pointer">
                            <input
                              type="checkbox"
                              checked={giNA}
                              onChange={(e) => setGiNA(e.target.checked)}
                              className="w-3 h-3 accent-primary cursor-pointer"
                              aria-label="Set Glycemic Index to N/A"
                            />
                            <span className="text-[9px] text-on-surface-variant/70 font-normal normal-case">N/A</span>
                          </label>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          id={`${baseId}-${key}`}
                          type="number"
                          required={required}
                          min="0"
                          max={isGI ? 100 : undefined}
                          step="any"
                          disabled={isGI && giNA}
                          value={isGI && giNA ? '' : (form.nutrition[key] ?? '')}
                          onChange={(e) => setNutrition(key, e.target.value)}
                          placeholder={isGI && giNA ? 'N/A' : '0'}
                          className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg h-11 px-3 text-sm outline-none transition-all disabled:bg-surface-container-high/40 disabled:text-on-surface-variant/50 disabled:cursor-not-allowed"
                        />
                        {unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-on-surface-variant/60 font-semibold pointer-events-none">
                            {unit}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Live Derived Values ── */}
            <section>
              <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary text-[18px] aspect-square">calculate</span>
                  <span className="text-on-surface-variant text-xs font-medium">Net Carbs</span>
                  <span className="font-bold text-primary text-base">{derived.netCarbs}<span className="text-xs font-normal ml-0.5">g</span></span>
                </div>
                <div className="w-px h-8 bg-outline-variant/40 shrink-0" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-tertiary text-[18px] aspect-square">monitor_heart</span>
                  <span className="text-on-surface-variant text-xs font-medium">GL</span>
                  <span className="font-bold text-tertiary text-base">
                    {derived.gl !== null ? derived.gl : <span className="text-on-surface-variant/50 text-xs">N/A</span>}
                  </span>
                </div>
                <p className="text-[9px] text-on-surface-variant/50 ml-auto leading-tight">
                  Auto-derived<br />from inputs
                </p>
              </div>
            </section>

          </div>

          {/* ── Footer actions ── */}
          <div className="px-6 py-4 border-t border-outline-variant/20 flex gap-3 justify-end shrink-0 bg-surface-container-lowest">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-full border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !!similarWarning}
              className="h-11 px-6 rounded-full bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving
                ? <><span className="material-symbols-outlined text-[16px] aspect-square animate-spin">progress_activity</span> Saving…</>
                : <><span className="material-symbols-outlined text-[16px] aspect-square">add_circle</span> Create Ingredient</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomIngredientModal;
