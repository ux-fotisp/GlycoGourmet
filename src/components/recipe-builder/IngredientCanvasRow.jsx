import React from 'react';
import { PREP_STATES } from '../../utils/nutritionCalculator';
import { normalizeUnitToGrams } from '../../utils/provenanceAdapters';
import { validateIngredientLine } from '../../utils/provenanceEvaluator';

const PROVENANCE_LABELS = {
  internal_verified: 'Verified database',
  usda_fooddata_central: 'USDA-sourced',
  user_entered: 'User-entered',
  needs_review: 'Needs review',
};

const PROVENANCE_BADGE_CLASSES = {
  internal_verified: 'bg-primary/10 text-primary border-primary/20',
  usda_fooddata_central: 'bg-sky-50 text-sky-700 border-sky-200',
  user_entered: 'bg-amber-50 text-amber-700 border-amber-200',
  needs_review: 'bg-orange-50 text-orange-700 border-orange-200',
};

const SUPPORTED_UNITS = [
  { value: 'g', label: 'g (grams)' },
  { value: 'oz', label: 'oz (ounces)' },
  { value: 'kg', label: 'kg (kilograms)' },
  { value: 'lb', label: 'lb (pounds)' },
  { value: 'ml', label: 'ml (milliliters)' },
  { value: 'cup', label: 'cup (cups)' },
  { value: 'tbsp', label: 'tbsp (tablespoons)' },
  { value: 'tsp', label: 'tsp (teaspoons)' },
  { value: 'fl oz', label: 'fl oz (fluid ounces)' },
  { value: 'piece', label: 'piece (count)' },
  { value: 'clove', label: 'clove (count)' },
  { value: 'bunch', label: 'bunch (count)' },
  { value: 'slice', label: 'slice (count)' },
];

/**
 * IngredientCanvasRow — Accessible Individual Recipe Ingredient Line Component
 */
export const IngredientCanvasRow = ({
  line,
  index,
  totalCount,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  if (!line) return null;

  const provenanceLabel = PROVENANCE_LABELS[line.source] || 'Needs review';
  const badgeClass = PROVENANCE_BADGE_CLASSES[line.source] || PROVENANCE_BADGE_CLASSES.needs_review;

  const handleQuantityChange = (val) => {
    const qty = parseFloat(val);
    const newQty = isNaN(qty) ? 0 : qty;
    const normalizedGrams = normalizeUnitToGrams(newQty, line.unit);
    const updated = {
      ...line,
      quantity: newQty,
      normalizedGrams,
    };
    updated.validation = validateIngredientLine(updated);
    onUpdate(updated);
  };

  const handleUnitChange = (newUnit) => {
    const normalizedGrams = normalizeUnitToGrams(line.quantity, newUnit);
    const updated = {
      ...line,
      unit: newUnit,
      normalizedGrams,
    };
    updated.validation = validateIngredientLine(updated);
    onUpdate(updated);
  };

  const handlePrepStateChange = (newPrepState) => {
    const updated = {
      ...line,
      prepState: newPrepState,
    };
    onUpdate(updated);
  };

  const isConversionIncomplete = line.normalizedGrams === null || line.normalizedGrams === undefined;
  const isCarbContributor = (line.nutritionPer100g?.carbohydrateG ?? 0) > 0.5;
  const isMissingGi = isCarbContributor && (line.glycemicIndex === null || line.glycemicIndex === undefined || line.giEvidenceStatus === 'unavailable');

  return (
    <div
      data-testid={`ingredient-row-${line.id || index}`}
      className="bg-white p-4 rounded-xl border border-outline-variant/40 shadow-xs space-y-3 transition-all hover:border-primary/40"
    >
      {/* Top Header: Number, Display Name, Provenance Badge, and Reorder Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/15 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-on-surface truncate" title={line.displayName}>
              {line.displayName}
            </h4>
          </div>
          <span
            data-testid="provenance-badge"
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wide ${badgeClass}`}
          >
            {provenanceLabel}
          </span>
        </div>

        {/* Action Controls: Move Up, Move Down, Remove */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`Move ${line.displayName} up`}
            className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
            aria-label={`Move ${line.displayName} down`}
            className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${line.displayName}`}
            className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-error/10 hover:text-error text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer ml-1"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Input Fields Grid: Quantity, Unit, PrepState */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Quantity */}
        <div>
          <label
            htmlFor={`qty-${line.id || index}`}
            className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
          >
            Quantity
          </label>
          <input
            id={`qty-${line.id || index}`}
            type="number"
            min="0.1"
            step="any"
            aria-label={`${line.displayName} quantity`}
            value={line.quantity ?? ''}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg px-3 h-9 text-xs font-semibold outline-none transition-all"
          />
        </div>

        {/* Unit */}
        <div>
          <label
            htmlFor={`unit-${line.id || index}`}
            className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
          >
            Unit
          </label>
          <select
            id={`unit-${line.id || index}`}
            aria-label={`${line.displayName} unit`}
            value={line.unit || 'g'}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg px-2.5 h-9 text-xs font-semibold outline-none transition-all cursor-pointer"
          >
            {SUPPORTED_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prep State */}
        <div>
          <label
            htmlFor={`prep-${line.id || index}`}
            className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1"
          >
            Preparation State
          </label>
          <select
            id={`prep-${line.id || index}`}
            aria-label={`${line.displayName} preparation state`}
            value={line.prepState || 'raw'}
            onChange={(e) => handlePrepStateChange(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg px-2.5 h-9 text-xs font-semibold outline-none transition-all cursor-pointer"
          >
            {PREP_STATES.map((ps) => (
              <option key={ps.value} value={ps.value}>
                {ps.label} {ps.giMultiplier !== 1.0 ? `(${ps.giMultiplier}x GI)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incomplete Conversion or Missing GI Feedback */}
      {isConversionIncomplete && (
        <div
          role="alert"
          data-testid="incomplete-conversion-alert"
          className="bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 flex items-start gap-2 text-amber-900 text-xs"
        >
          <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
          <div className="space-y-0.5">
            <p className="font-semibold">
              {['cup', 'ml', 'tbsp', 'tsp', 'fl oz'].includes(line.unit)
                ? 'Volume unit requires ingredient-specific density'
                : ['piece', 'clove', 'bunch', 'slice', 'item', 'serving'].includes(line.unit)
                ? 'Count unit requires ingredient-specific gram weight'
                : 'Cannot calculate gram weight for this unit'}
            </p>
            <p className="text-[11px] text-amber-800">
              Select a direct mass unit (g, oz, kg, lb) or provide verified conversion metadata to enable complete nutrition calculation.
            </p>
          </div>
        </div>
      )}

      {isMissingGi && !isConversionIncomplete && (
        <div
          role="alert"
          data-testid="missing-gi-alert"
          className="bg-orange-50 border border-orange-200/80 rounded-lg p-2 flex items-center gap-2 text-orange-900 text-xs"
        >
          <span className="material-symbols-outlined text-orange-600 text-[16px] shrink-0">info</span>
          <span>Glycemic Index unavailable for carbohydrate contributor ({line.nutritionPer100g?.carbohydrateG}g carbs/100g). Recipe GL will be marked as estimated.</span>
        </div>
      )}

      {/* Macro details preview */}
      {line.nutritionPer100g && (
        <div className="flex flex-wrap items-center justify-between text-[11px] text-on-surface-variant bg-surface-container-low/40 px-3 py-1.5 rounded-lg font-mono">
          <span>{line.nutritionPer100g.energyKcal ?? 0} kcal / 100g</span>
          <span>Carbs: {line.nutritionPer100g.carbohydrateG ?? 0}g</span>
          <span>Protein: {line.nutritionPer100g.proteinG ?? 0}g</span>
          <span>Fat: {line.nutritionPer100g.fatG ?? 0}g</span>
          <span>GI: {line.glycemicIndex !== null && line.glycemicIndex !== undefined ? line.glycemicIndex : (line.giEvidenceStatus === 'not_applicable' ? 'N/A' : 'Unspecified')}</span>
        </div>
      )}
    </div>
  );
};

export default IngredientCanvasRow;
