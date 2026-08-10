import React from 'react';
import NutritionBadge from '../ui/NutritionBadge';
import { getGlycemicLoadCategory } from '../../utils/nutritionCalculator';

export const NutritionSnapshot = ({ nutrition }) => {
  const gl = nutrition?.glycemicLoad ?? 0;
  const glInfo = getGlycemicLoadCategory(gl);

  const gi = nutrition?.glycemicIndex;
  let giSublabel = 'Low';
  let giColor = 'text-primary';
  if (gi !== null && gi !== undefined) {
    if (gi >= 70) { giSublabel = 'High'; giColor = 'text-error'; }
    else if (gi >= 56) { giSublabel = 'Med'; giColor = 'text-tertiary'; }
    else { giSublabel = 'Low'; giColor = 'text-primary'; }
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 border border-outline-variant shadow-[0px_4px_20px_rgba(45,49,48,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md md:text-lg font-bold text-on-surface">
          Nutritional Snapshot
        </h3>
        <div className="flex items-center gap-1 text-on-surface-variant/70 text-xs">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span className="font-label-md">Portion-adjusted glycemic calculation</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <NutritionBadge
          label="Glycemic Index"
          value={nutrition?.glycemicIndex}
          sublabel={giSublabel}
          colorClass={giColor}
          title="Glycemic Index measures blood sugar spike speed (0-100)"
        />
        <NutritionBadge
          label="Glycemic Load"
          value={gl}
          sublabel={glInfo.label}
          colorClass={glInfo.colorClass}
          title="Glycemic Load measures total blood sugar impact based on portion size (GL = GI × Net Carbs / 100)"
        />
        <NutritionBadge
          label="Net Carbs"
          value={nutrition?.netCarbs}
          unit="g"
        />
        <NutritionBadge
          label="Fibers"
          value={nutrition?.fiber}
          unit="g"
        />
        <NutritionBadge
          label="Total Carbs"
          value={nutrition?.carbs}
          unit="g"
        />
        <NutritionBadge
          label="Protein"
          value={nutrition?.protein}
          unit="g"
        />
        <NutritionBadge
          label="Healthy Fats"
          value={nutrition?.fat}
          unit="g"
        />
        <NutritionBadge
          label="Energy"
          value={nutrition?.kcal}
          unit=" kcal"
        />
      </div>
    </div>
  );
};

export default NutritionSnapshot;
