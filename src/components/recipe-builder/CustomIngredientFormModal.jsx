import React, { useState, useRef, useEffect, useId } from 'react';
import {
  VALID_CATEGORIES,
  saveCustomIngredient,
} from '../../utils/ingredientStore';
import { adaptCustomIngredient } from '../../utils/provenanceAdapters';
import { PREP_STATES } from '../../utils/nutritionCalculator';

export const MASS_UNITS = ['g', 'oz', 'kg', 'lb'];

export const CATEGORY_LABELS = {
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

const EMPTY_FORM = {
  name: '',
  category: 'vegetable',
  defaultAmount: '100',
  defaultUnit: 'g',
  defaultPrepState: 'raw',
  kcal: '',
  protein: '',
  fat: '',
  carbs: '',
  fiber: '',
  glycemicIndex: '',
};

/**
 * CustomIngredientFormModal — Patient-Safe Custom Ingredient Creation
 *
 * Dedicated modal for creating private custom ingredients with complete core macronutrients.
 * Strictly avoids marketing/clinical claims and enforces non-coercion of missing GI.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   onCreated: (adaptedLine: object) => void
 *   triggerRef?: React.RefObject
 */
export const CustomIngredientFormModal = ({
  isOpen,
  onClose,
  onCreated,
  triggerRef,
}) => {
  const baseId = useId();
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = triggerRef?.current || document.activeElement;

    // Focus name input on open
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errs = {};

    // 1. Name validation
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      errs.name = 'Ingredient name is required';
    } else if (trimmedName.length > 80) {
      errs.name = 'Ingredient name must be 80 characters or fewer';
    }

    // 2. Category validation
    if (!form.category || !VALID_CATEGORIES.includes(form.category)) {
      errs.category = 'Category is required';
    }

    // 3. Amount validation
    const parsedAmount = parseFloat(form.defaultAmount);
    if (form.defaultAmount === '' || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.defaultAmount = 'Amount must be a positive number';
    }

    // 4. Unit validation (mass only)
    if (!form.defaultUnit || !MASS_UNITS.includes(form.defaultUnit)) {
      errs.defaultUnit = 'Unit must be a valid mass unit (g, oz, kg, lb)';
    }

    // 5. Core nutrients validation (required >= 0)
    const nutrientFields = [
      { key: 'kcal', label: 'Calories' },
      { key: 'carbs', label: 'Carbohydrates' },
      { key: 'fiber', label: 'Dietary Fiber' },
      { key: 'protein', label: 'Protein' },
      { key: 'fat', label: 'Total Fat' },
    ];

    nutrientFields.forEach(({ key, label }) => {
      const valStr = String(form[key]).trim();
      if (valStr === '') {
        errs[key] = `${label} is required`;
        return;
      }
      const num = parseFloat(valStr);
      if (isNaN(num)) {
        errs[key] = `${label} must be a valid number`;
      } else if (num < 0) {
        errs[key] = `${label} cannot be negative`;
      }
    });

    // 6. Carb & Fiber anomaly detection
    const parsedCarbs = parseFloat(form.carbs);
    const parsedFiber = parseFloat(form.fiber);
    if (!isNaN(parsedCarbs) && !isNaN(parsedFiber) && parsedFiber > parsedCarbs) {
      errs.fiber = 'Dietary fiber cannot exceed total carbohydrates';
    }

    // 7. Optional Glycemic Index validation
    const giStr = String(form.glycemicIndex).trim();
    if (giStr !== '') {
      const parsedGi = parseFloat(giStr);
      if (isNaN(parsedGi)) {
        errs.glycemicIndex = 'Glycemic Index must be a valid number';
      } else if (parsedGi < 0 || parsedGi > 100) {
        errs.glycemicIndex = 'Glycemic Index must be between 0 and 100';
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const carbs = parseFloat(form.carbs);
      const fiber = parseFloat(form.fiber);
      const giStr = String(form.glycemicIndex).trim();
      const gi = giStr !== '' ? parseFloat(giStr) : null;

      const rawInput = {
        name: form.name.trim(),
        category: form.category,
        defaultAmount: parseFloat(form.defaultAmount) || 100,
        defaultUnit: form.defaultUnit || 'g',
        defaultPrepState: form.defaultPrepState || 'raw',
        nutrition: {
          kcal: parseFloat(form.kcal) || 0,
          carbs,
          fiber,
          protein: parseFloat(form.protein) || 0,
          fat: parseFloat(form.fat) || 0,
          glycemicIndex: gi,
        },
      };

      const result = await saveCustomIngredient(rawInput);
      if (!result.ok || !result.ingredient) {
        setGlobalError(
          result.errors?.join(', ') || 'Failed to save custom ingredient.'
        );
        setIsSubmitting(false);
        return;
      }

      // Adapt to standard ProvenanceReadyRecipeIngredientLine
      const lineId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'line-' + Math.random().toString(36).substring(2, 9);

      const adaptedLine = adaptCustomIngredient(result.ingredient, {
        id: lineId,
        quantity: result.ingredient.defaultAmount || 100,
        unit: result.ingredient.defaultUnit || 'g',
        prepState: form.defaultPrepState || 'raw',
      });

      if (typeof onCreated === 'function') {
        onCreated(adaptedLine);
      }

      onClose();
    } catch (err) {
      setGlobalError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${baseId}-title`}
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] my-auto"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              edit_note
            </span>
            <div>
              <h2
                id={`${baseId}-title`}
                className="font-display font-bold text-base text-primary"
              >
                Create Custom Ingredient
              </h2>
              <p className="text-[11px] text-on-surface-variant font-medium">
                Enter truthful nutritional values per portion from product labeling.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close custom ingredient modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Global Error Banner */}
          {globalError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-start gap-2"
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{globalError}</span>
            </div>
          )}

          {/* 1. Basic Details */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor={`${baseId}-name`}
                className="block font-bold text-on-surface mb-1"
              >
                Ingredient Name <span className="text-error">*</span>
              </label>
              <input
                ref={nameInputRef}
                id={`${baseId}-name`}
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Organic Almond Flour, Wild Blueberries"
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
                className={`w-full bg-surface-container-low border rounded-xl px-3 h-10 text-xs outline-none transition-all ${
                  errors.name
                    ? 'border-error focus:ring-2 focus:ring-error/20'
                    : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
              {errors.name && (
                <p id={`${baseId}-name-error`} role="alert" className="text-[11px] text-error mt-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`${baseId}-category`}
                  className="block font-bold text-on-surface mb-1"
                >
                  Category <span className="text-error">*</span>
                </label>
                <select
                  id={`${baseId}-category`}
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  aria-required="true"
                  className="w-full bg-surface-container-low border border-outline-variant focus:border-primary rounded-xl px-3 h-10 text-xs outline-none"
                >
                  {VALID_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-prepState`}
                  className="block font-bold text-on-surface mb-1"
                >
                  Default Preparation
                </label>
                <select
                  id={`${baseId}-prepState`}
                  value={form.defaultPrepState}
                  onChange={(e) => handleChange('defaultPrepState', e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant focus:border-primary rounded-xl px-3 h-10 text-xs outline-none"
                >
                  {PREP_STATES.map((prep) => (
                    <option key={prep.value} value={prep.value}>
                      {prep.label} ({prep.multiplier}x GI)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Default Portion & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`${baseId}-amount`}
                  className="block font-bold text-on-surface mb-1"
                >
                  Base Portion Amount <span className="text-error">*</span>
                </label>
                <input
                  id={`${baseId}-amount`}
                  type="number"
                  step="any"
                  min="0.1"
                  value={form.defaultAmount}
                  onChange={(e) => handleChange('defaultAmount', e.target.value)}
                  placeholder="100"
                  aria-required="true"
                  aria-invalid={Boolean(errors.defaultAmount)}
                  aria-describedby={errors.defaultAmount ? `${baseId}-amount-error` : undefined}
                  className={`w-full bg-surface-container-low border rounded-xl px-3 h-10 text-xs outline-none ${
                    errors.defaultAmount
                      ? 'border-error focus:ring-2 focus:ring-error/20'
                      : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                {errors.defaultAmount && (
                  <p id={`${baseId}-amount-error`} role="alert" className="text-[11px] text-error mt-1 font-medium">
                    {errors.defaultAmount}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${baseId}-unit`}
                  className="block font-bold text-on-surface mb-1"
                >
                  Base Unit (Mass Only) <span className="text-error">*</span>
                </label>
                <select
                  id={`${baseId}-unit`}
                  value={form.defaultUnit}
                  onChange={(e) => handleChange('defaultUnit', e.target.value)}
                  aria-required="true"
                  className="w-full bg-surface-container-low border border-outline-variant focus:border-primary rounded-xl px-3 h-10 text-xs outline-none font-mono"
                >
                  {MASS_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u} (mass)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Core Macronutrients */}
          <div className="pt-2 border-t border-outline-variant/20 space-y-3">
            <h3 className="font-bold text-xs text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">nutrition</span>
              Core Macronutrients (per base portion)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Calories */}
              <div>
                <label htmlFor={`${baseId}-kcal`} className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Calories (kcal) <span className="text-error">*</span>
                </label>
                <input
                  id={`${baseId}-kcal`}
                  type="number"
                  step="any"
                  min="0"
                  value={form.kcal}
                  onChange={(e) => handleChange('kcal', e.target.value)}
                  placeholder="0"
                  aria-required="true"
                  aria-invalid={Boolean(errors.kcal)}
                  aria-describedby={errors.kcal ? `${baseId}-kcal-error` : undefined}
                  className={`w-full bg-surface-container-low border rounded-xl px-3 h-9 text-xs outline-none ${
                    errors.kcal ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {errors.kcal && (
                  <p id={`${baseId}-kcal-error`} role="alert" className="text-[10px] text-error mt-0.5">
                    {errors.kcal}
                  </p>
                )}
              </div>

              {/* Total Carbs */}
              <div>
                <label htmlFor={`${baseId}-carbs`} className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Carbohydrates (g) <span className="text-error">*</span>
                </label>
                <input
                  id={`${baseId}-carbs`}
                  type="number"
                  step="any"
                  min="0"
                  value={form.carbs}
                  onChange={(e) => handleChange('carbs', e.target.value)}
                  placeholder="0"
                  aria-required="true"
                  aria-invalid={Boolean(errors.carbs)}
                  aria-describedby={errors.carbs ? `${baseId}-carbs-error` : undefined}
                  className={`w-full bg-surface-container-low border rounded-xl px-3 h-9 text-xs outline-none ${
                    errors.carbs ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {errors.carbs && (
                  <p id={`${baseId}-carbs-error`} role="alert" className="text-[10px] text-error mt-0.5">
                    {errors.carbs}
                  </p>
                )}
              </div>

              {/* Dietary Fiber */}
              <div>
                <label htmlFor={`${baseId}-fiber`} className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Dietary Fiber (g) <span className="text-error">*</span>
                </label>
                <input
                  id={`${baseId}-fiber`}
                  type="number"
                  step="any"
                  min="0"
                  value={form.fiber}
                  onChange={(e) => handleChange('fiber', e.target.value)}
                  placeholder="0"
                  aria-required="true"
                  aria-invalid={Boolean(errors.fiber)}
                  aria-describedby={errors.fiber ? `${baseId}-fiber-error` : undefined}
                  className={`w-full bg-surface-container-low border rounded-xl px-3 h-9 text-xs outline-none ${
                    errors.fiber ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {errors.fiber && (
                  <p id={`${baseId}-fiber-error`} role="alert" className="text-[10px] text-error mt-0.5">
                    {errors.fiber}
                  </p>
                )}
              </div>

              {/* Protein */}
              <div>
                <label htmlFor={`${baseId}-protein`} className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Protein (g) <span className="text-error">*</span>
                </label>
                <input
                  id={`${baseId}-protein`}
                  type="number"
                  step="any"
                  min="0"
                  value={form.protein}
                  onChange={(e) => handleChange('protein', e.target.value)}
                  placeholder="0"
                  aria-required="true"
                  aria-invalid={Boolean(errors.protein)}
                  aria-describedby={errors.protein ? `${baseId}-protein-error` : undefined}
                  className={`w-full bg-surface-container-low border rounded-xl px-3 h-9 text-xs outline-none ${
                    errors.protein ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {errors.protein && (
                  <p id={`${baseId}-protein-error`} role="alert" className="text-[10px] text-error mt-0.5">
                    {errors.protein}
                  </p>
                )}
              </div>

              {/* Fat */}
              <div>
                <label htmlFor={`${baseId}-fat`} className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Total Fat (g) <span className="text-error">*</span>
                </label>
                <input
                  id={`${baseId}-fat`}
                  type="number"
                  step="any"
                  min="0"
                  value={form.fat}
                  onChange={(e) => handleChange('fat', e.target.value)}
                  placeholder="0"
                  aria-required="true"
                  aria-invalid={Boolean(errors.fat)}
                  aria-describedby={errors.fat ? `${baseId}-fat-error` : undefined}
                  className={`w-full bg-surface-container-low border rounded-xl px-3 h-9 text-xs outline-none ${
                    errors.fat ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {errors.fat && (
                  <p id={`${baseId}-fat-error`} role="alert" className="text-[10px] text-error mt-0.5">
                    {errors.fat}
                  </p>
                )}
              </div>

              {/* Glycemic Index (Optional) */}
              <div>
                <label htmlFor={`${baseId}-gi`} className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                  Glycemic Index (0-100) <span className="text-on-surface-variant/60 font-normal">(Optional)</span>
                </label>
                <input
                  id={`${baseId}-gi`}
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={form.glycemicIndex}
                  onChange={(e) => handleChange('glycemicIndex', e.target.value)}
                  placeholder="Leave empty if unknown"
                  aria-invalid={Boolean(errors.glycemicIndex)}
                  aria-describedby={errors.glycemicIndex ? `${baseId}-gi-error` : undefined}
                  className={`w-full bg-surface-container-low border rounded-xl px-3 h-9 text-xs outline-none ${
                    errors.glycemicIndex ? 'border-error' : 'border-outline-variant focus:border-primary'
                  }`}
                />
                {errors.glycemicIndex && (
                  <p id={`${baseId}-gi-error`} role="alert" className="text-[10px] text-error mt-0.5">
                    {errors.glycemicIndex}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Honest Data Scope & Non-Clinical Disclaimer */}
          <div className="p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/30 text-[11px] text-on-surface-variant leading-relaxed">
            <span className="font-bold block text-on-surface mb-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Data Scope & Provenance Note
            </span>
            <p>
              Note: This ingredient's nutrition values were entered by a user and have not been independently verified. It may be visible to other users of this catalog.
            </p>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Save & Add to Recipe
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomIngredientFormModal;
