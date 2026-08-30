/**
 * src/utils/exportPipeline.js
 * Clinical Export Pipeline: Grocery Manifests, Clinical Reports, and FHIR Telemetry
 */

import { calculateDailyRollup } from '../services/metabolicEngine';

/**
 * 1. Generates an aggregated, categorized grocery manifest across a 7-day PrescribedMealPlan.
 * Scales ingredient amounts by servingsMultiplier and respects applied swap rules.
 */
export function generateGroceryManifest(prescribedPlan, recipesMap = {}, ingredientsMap = {}) {
  if (!prescribedPlan || !prescribedPlan.scheduledSlots) {
    return { produce: [], proteins: [], dairy: [], pantry: [], other: [] };
  }

  const aggregatedMap = new Map();

  const days = Object.values(prescribedPlan.scheduledSlots);
  for (const daySlots of days) {
    if (!daySlots) continue;

    const slotItems = Array.isArray(daySlots) 
      ? daySlots.map((item) => (typeof item === 'string' ? { recipeId: item, servingsMultiplier: 1 } : item))
      : Object.entries(daySlots).map(([occasion, recipeId]) => ({ occasion, recipeId, servingsMultiplier: 1 }));

    for (const slot of slotItems) {
      if (!slot || !slot.recipeId) continue;
      const recipe = recipesMap[slot.recipeId];
      if (!recipe || !Array.isArray(recipe.ingredients)) continue;

      const multiplier = slot.servingsMultiplier || 1;

      for (const lineItem of recipe.ingredients) {
        const activeIngredientId = lineItem.ingredientId || lineItem.id || lineItem.name;
        const ingDetails = ingredientsMap[activeIngredientId] || lineItem.ingredient || {};
        
        const rawAmount = (Number(lineItem.amount) || 0) * multiplier;
        const unit = lineItem.unit || ingDetails.defaultUnit || 'g';
        const name = ingDetails.name || lineItem.name || activeIngredientId || 'Ingredient';
        const category = (ingDetails.category || lineItem.category || 'pantry').toLowerCase();

        const key = `${name.toLowerCase()}_${unit}`;
        if (aggregatedMap.has(key)) {
          aggregatedMap.get(key).amount += rawAmount;
        } else {
          aggregatedMap.set(key, {
            id: activeIngredientId,
            name,
            amount: rawAmount,
            unit,
            category,
          });
        }
      }
    }
  }

  const result = { produce: [], proteins: [], dairy: [], pantry: [], other: [] };
  
  for (const item of aggregatedMap.values()) {
    item.amount = Math.round(item.amount * 10) / 10;
    if (['vegetable', 'fruit', 'produce', 'greens', 'fresh'].includes(item.category)) {
      result.produce.push(item);
    } else if (['protein', 'meat', 'seafood', 'poultry', 'legume', 'fish', 'eggs'].includes(item.category)) {
      result.proteins.push(item);
    } else if (['dairy', 'cheese', 'yogurt', 'milk'].includes(item.category)) {
      result.dairy.push(item);
    } else if (['grain', 'pantry', 'seasoning', 'fat', 'fats_oils', 'baking', 'condiments', 'oil', 'spice', 'nuts', 'seeds'].includes(item.category)) {
      result.pantry.push(item);
    } else {
      result.other.push(item);
    }
  }

  return result;
}

/**
 * 2. Generates an exportable clinical summary report.
 */
export function generateClinicalSummaryReport(clientProfile, calibration, prescribedPlan, recipesMap = {}) {
  const patientName = clientProfile?.patientName || clientProfile?.name || 'Client';
  const subtype = clientProfile?.diabeticSubtype || 'Metabolic Optimization';
  const glTarget = calibration?.glTargetDaily || 45;
  const bolusOffset = calibration?.bolusOffsetMinutes || 15;
  const weekStart = prescribedPlan?.weekStartDate || new Date().toISOString().slice(0, 10);

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const daySummaries = [];

  let weeklyTotalGL = 0;
  let activeDaysCount = 0;

  for (const day of daysOfWeek) {
    const daySlots = prescribedPlan?.scheduledSlots?.[day];
    if (!daySlots) continue;

    const slotItems = Array.isArray(daySlots) 
      ? daySlots.map((item) => (typeof item === 'string' ? { recipeId: item } : item))
      : Object.entries(daySlots).map(([occasion, recipeId]) => ({ occasion, recipeId }));
    if (slotItems.length === 0) continue;

    const rollup = calculateDailyRollup(
      Array.isArray(daySlots) 
        ? daySlots.reduce((acc, id, idx) => ({ ...acc, [`meal_${idx}`]: typeof id === 'string' ? id : id.recipeId }), {})
        : daySlots, 
      recipesMap
    );
    const dayGL = rollup.cumulativeDailyGL || rollup.glycemicLoad || 0;
    
    weeklyTotalGL += dayGL;
    activeDaysCount++;

    daySummaries.push({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      gl: dayGL,
      netCarbs: rollup.netCarbs,
      protein: rollup.protein,
      fiber: rollup.fiber,
      fat: rollup.fat,
      kcal: rollup.kcal,
      status: dayGL <= glTarget ? 'STABLE' : 'OVER_BUDGET',
    });
  }

  const avgGL = activeDaysCount > 0 ? Math.round((weeklyTotalGL / activeDaysCount) * 10) / 10 : 0;
  const adherenceRate = activeDaysCount > 0 
    ? Math.round((daySummaries.filter(d => d.status === 'STABLE').length / activeDaysCount) * 100) 
    : 100;

  return {
    patientName,
    subtype,
    glTarget,
    bolusOffset,
    weekStart,
    avgGL,
    adherenceRate,
    daySummaries,
  };
}

/**
 * 3. Exports an HL7 FHIR R4 Bundle containing Glycemic Load Observations.
 */
export function exportFHIRMetabolicTelemetry(clientProfile, prescribedPlan) {
  const patientId = clientProfile?.patientUserId || clientProfile?.id || 'anonymous-patient';
  const planId = prescribedPlan?.id || 'plan-export';
  const date = prescribedPlan?.weekStartDate || new Date().toISOString().slice(0, 10);

  const observations = Object.entries(prescribedPlan?.cumulativeDailyGL || {}).map(([day, glValue], idx) => ({
    resourceType: 'Observation',
    id: `${planId}-gl-${day}`,
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'dietary',
        display: 'Dietary',
      }],
    }],
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: '9843-4',
        display: 'Carbohydrate intake / Glycemic Load equivalent',
      }],
      text: 'Calculated Glycemic Load',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: `${date}T0${idx + 1}:00:00Z`,
    valueQuantity: {
      value: glValue,
      unit: 'GL units',
      system: 'http://unitsofmeasure.org',
      code: '{GL}',
    },
  }));

  return {
    resourceType: 'Bundle',
    id: `bundle-${planId}`,
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: observations.map((obs) => ({
      fullUrl: `urn:uuid:${obs.id}`,
      resource: obs,
    })),
  };
}
