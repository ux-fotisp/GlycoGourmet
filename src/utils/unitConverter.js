// Conversion factors
const OZ_TO_G = 28.3495;
const CUP_TO_ML = 236.588;
const TBSP_TO_ML = 14.7868;
const TSP_TO_ML = 4.92892;

/**
 * Converts a culinary ingredient amount and unit between metric and imperial systems.
 * 
 * @param {number} amount The ingredient quantity
 * @param {string} unit The current unit (g, ml, oz, cup, tbsp, tsp, piece, clove, bunch)
 * @param {'metric' | 'imperial'} targetSystem The target measurement system
 * @returns {{ amount: number, unit: string }} Converted amount and unit
 */
export function convertAmountAndUnit(amount, unit, targetSystem) {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { amount: 0, unit };
  }

  const normalizedUnit = (unit || '').toLowerCase().trim();

  if (targetSystem === 'metric') {
    if (normalizedUnit === 'oz') {
      return { amount: parsedAmount * OZ_TO_G, unit: 'g' };
    }
    if (normalizedUnit === 'cup') {
      return { amount: parsedAmount * CUP_TO_ML, unit: 'ml' };
    }
    if (normalizedUnit === 'tbsp') {
      return { amount: parsedAmount * TBSP_TO_ML, unit: 'ml' };
    }
    if (normalizedUnit === 'tsp') {
      return { amount: parsedAmount * TSP_TO_ML, unit: 'ml' };
    }
  } else if (targetSystem === 'imperial') {
    if (normalizedUnit === 'g') {
      return { amount: parsedAmount / OZ_TO_G, unit: 'oz' };
    }
    if (normalizedUnit === 'ml') {
      // Large ml quantities convert to cups, otherwise to oz
      if (parsedAmount >= 100) {
        return { amount: parsedAmount / CUP_TO_ML, unit: 'cup' };
      }
      return { amount: parsedAmount / OZ_TO_G, unit: 'oz' };
    }
  }

  // Keep original if unit does not require conversion or matches current system
  return { amount: parsedAmount, unit };
}

export default convertAmountAndUnit;
