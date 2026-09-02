/**
 * provenanceEvaluator.js — Pure Deterministic Recipe Nutrition Completeness Engine
 *
 * Evaluates recipe ingredient lines against strict medical safety and data-integrity rules:
 *   1. "Missing data is not zero": Missing core nutrients (kcal, carbs, fiber, protein, fat)
 *      or unit normalization failure halt nutrition calculation (status: "incomplete").
 *   2. "No false precision": Missing Glycemic Index on carbohydrate-contributing ingredients
 *      is never coerced to 0; it keeps nutrition calculable but flags GL as unavailable (status: "estimated").
 *   3. Pure function invariant: Zero side effects, no storage/API calls, non-mutating.
 */

export const REQUIRED_CORE_NUTRIENTS = [
  { key: 'energyKcal', label: 'Energy (kcal)' },
  { key: 'carbohydrateG', label: 'Carbohydrates (g)' },
  { key: 'fiberG', label: 'Dietary Fiber (g)' },
  { key: 'proteinG', label: 'Protein (g)' },
  { key: 'fatG', label: 'Total Fat (g)' },
];

/**
 * Validates a single provenance-ready ingredient line item.
 *
 * @param {object} line - ProvenanceReadyRecipeIngredientLine
 * @returns {{ status: 'complete' | 'incomplete' | 'needs_review', reasons: string[] }}
 */
export function validateIngredientLine(line) {
  if (!line || typeof line !== 'object') {
    return {
      status: 'incomplete',
      reasons: ['Ingredient line is null or not an object'],
    };
  }

  const reasons = [];

  // 1. Quantity validation
  const quantity = line.quantity;
  if (typeof quantity !== 'number' || !isFinite(quantity) || quantity <= 0) {
    reasons.push('Invalid or non-positive quantity');
  }

  // 2. Gram normalization validation
  const normalizedGrams = line.normalizedGrams;
  if (typeof normalizedGrams !== 'number' || !isFinite(normalizedGrams) || normalizedGrams <= 0) {
    reasons.push('Cannot normalize unit to grams');
  }

  // 3. Core macronutrient presence
  const nutrition = line.nutritionPer100g;
  if (!nutrition || typeof nutrition !== 'object') {
    reasons.push('Missing nutrition profile per 100g');
  } else {
    for (const nutrient of REQUIRED_CORE_NUTRIENTS) {
      const val = nutrition[nutrient.key];
      if (val === null || val === undefined || typeof val !== 'number' || !isFinite(val) || val < 0) {
        reasons.push(`Missing required nutrient: ${nutrient.key}`);
      }
    }
  }

  if (reasons.length > 0) {
    return { status: 'incomplete', reasons };
  }

  if (line.source === 'needs_review' || line.giEvidenceStatus === 'needs_review') {
    return { status: 'needs_review', reasons: ['Ingredient requires manual provenance review'] };
  }

  return { status: 'complete', reasons: [] };
}

/**
 * Pure deterministic evaluator for recipe ingredient completeness.
 *
 * @param {Array<object>} lines - Array of ProvenanceReadyRecipeIngredientLine
 * @returns {{
 *   status: 'complete' | 'estimated' | 'incomplete',
 *   missingNutritionLines: string[],
 *   missingGiLines: string[],
 *   warnings: string[],
 *   canCalculateNutrition: boolean,
 *   canCalculateGl: boolean
 * }}
 */
export function evaluateRecipeNutritionCompleteness(lines = []) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return {
      status: 'incomplete',
      missingNutritionLines: [],
      missingGiLines: [],
      warnings: ['Recipe contains no ingredient lines'],
      canCalculateNutrition: false,
      canCalculateGl: false,
    };
  }

  const missingNutritionLines = [];
  const missingGiLines = [];
  const warnings = [];

  for (const line of lines) {
    const lineId = line?.id || line?.displayName || 'unknown-line';
    const validation = validateIngredientLine(line);

    if (validation.status === 'incomplete') {
      missingNutritionLines.push(lineId);
      validation.reasons.forEach((reason) => {
        warnings.push(`[${line?.displayName || lineId}]: ${reason}`);
      });
      continue;
    }

    if (validation.status === 'needs_review') {
      warnings.push(`[${line?.displayName || lineId}]: Marked for review (${line.source})`);
    }

    // Check Glycemic Index evidence for carbohydrate contributors
    const carbs = line.nutritionPer100g?.carbohydrateG ?? 0;
    const isCarbContributor = carbs > 0.5;

    if (isCarbContributor) {
      const hasValidGi =
        typeof line.glycemicIndex === 'number' &&
        isFinite(line.glycemicIndex) &&
        line.glycemicIndex >= 0 &&
        line.giEvidenceStatus === 'available';

      if (!hasValidGi) {
        missingGiLines.push(lineId);
        warnings.push(
          `[${line?.displayName || lineId}]: Glycemic Index unavailable for carbohydrate-contributing ingredient (${carbs}g carbs/100g)`
        );
      }
    } else {
      // Non-carb contributor: giEvidenceStatus can be 'not_applicable' or 'available'
      if (line.giEvidenceStatus === 'needs_review') {
        warnings.push(`[${line?.displayName || lineId}]: Non-carb ingredient GI flagged for review`);
      }
    }
  }

  const canCalculateNutrition = missingNutritionLines.length === 0;

  if (!canCalculateNutrition) {
    return {
      status: 'incomplete',
      missingNutritionLines,
      missingGiLines,
      warnings,
      canCalculateNutrition: false,
      canCalculateGl: false,
    };
  }

  const canCalculateGl = missingGiLines.length === 0;

  return {
    status: canCalculateGl ? 'complete' : 'estimated',
    missingNutritionLines: [],
    missingGiLines,
    warnings,
    canCalculateNutrition: true,
    canCalculateGl,
  };
}

export default {
  evaluateRecipeNutritionCompleteness,
  validateIngredientLine,
  REQUIRED_CORE_NUTRIENTS,
};