import React from 'react';
import IngredientRow from './IngredientRow';
import MetabolicCalculationBox from './MetabolicCalculationBox';

/**
 * IngredientsMatrix - Interactive ingredient matrix with portion stepper and calculation callout box.
 */
export const IngredientsMatrix = ({
  ingredients = [],
  metabolicCalculation = {},
  onServingChange,
  servings = 2,
}) => {
  const defaultIngredients = [
    { id: 1, name: 'Broccoli Florets (Fresh)', gi: 15, prepState: 'Steamed', prepMultiplier: '1.02', amount: 150 * (servings / 2), unit: 'g', netCarbs: 6 * (servings / 2) },
    { id: 2, name: 'Wild Atlantic Salmon', gi: 0, prepState: 'Roasted', prepMultiplier: '1.15', amount: 180 * (servings / 2), unit: 'g', netCarbs: 0 },
    { id: 3, name: 'Edamame Beans (Shelled)', gi: 18, prepState: 'Boiled', prepMultiplier: '1.20', amount: 80 * (servings / 2), unit: 'g', netCarbs: 4 * (servings / 2) },
    { id: 4, name: 'Extra Virgin Olive Oil', gi: 0, prepState: 'Raw', prepMultiplier: '1.00', amount: 20 * (servings / 2), unit: 'ml', netCarbs: 0 },
    { id: 5, name: 'Avocado (Hass)', gi: 10, prepState: 'Raw', prepMultiplier: '1.00', amount: 75 * (servings / 2), unit: 'g', netCarbs: 2 * (servings / 2) },
  ];

  const activeIngredients = ingredients && ingredients.length > 0 ? ingredients : defaultIngredients;

  return (
    <section className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200 shadow-xs space-y-6 font-sans text-[#1A2118]">
      {/* Header with Serving Stepper */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sage-text text-[20px]">grocery</span>
          <h3 className="text-xs font-extrabold tracking-wider text-primary uppercase">
            Ingredients Matrix
          </h3>
        </div>

        {/* Serving Stepper */}
        <div className="flex items-center gap-2 bg-[#F6F4EE] border border-stone-200 rounded-2xl p-1 shadow-2xs">
          <button
            type="button"
            aria-label="Decrease servings"
            onClick={() => onServingChange && onServingChange(Math.max(1, servings - 1))}
            className="w-8 h-8 rounded-xl bg-white border border-stone-200/80 hover:bg-stone-100 flex items-center justify-center font-extrabold text-primary transition-colors cursor-pointer"
          >
            &minus;
          </button>
          <span className="px-3 text-xs font-extrabold text-primary select-none whitespace-nowrap">
            {servings} Servings
          </span>
          <button
            type="button"
            aria-label="Increase servings"
            onClick={() => onServingChange && onServingChange(servings + 1)}
            className="w-8 h-8 rounded-xl bg-white border border-stone-200/80 hover:bg-stone-100 flex items-center justify-center font-extrabold text-primary transition-colors cursor-pointer"
          >
            &#43;
          </button>
        </div>
      </div>

      {/* Ingredient Rows List */}
      <div className="space-y-1 divide-y divide-stone-100">
        {activeIngredients.map((item, idx) => (
          <IngredientRow
            key={item.id || idx}
            index={idx + 1}
            gi={item.gi ?? item.glycemicIndex ?? 15}
            name={item.name || item.title || 'Ingredient'}
            prepState={item.prepState || 'Raw'}
            prepMultiplier={item.prepMultiplier || '1.00'}
            amount={Math.round(item.amount * 10) / 10}
            unit={item.unit || 'g'}
            netCarbs={Math.round((item.netCarbs || 0) * 10) / 10}
          />
        ))}
      </div>

      {/* Embedded Metabolic Calculation Box */}
      <MetabolicCalculationBox
        compositeGI={metabolicCalculation?.compositeGI ?? 22}
        netCarbsTotal={metabolicCalculation?.netCarbsTotal ?? 18}
        resultGL={metabolicCalculation?.resultGL ?? 4}
      />
    </section>
  );
};

export default IngredientsMatrix;

