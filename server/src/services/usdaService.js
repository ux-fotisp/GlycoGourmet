/**
 * usdaService.js — Node / Backend USDA FoodData Central Service
 *
 * Integrates with USDA FoodData Central API (https://api.nal.usda.gov/fdc/v1/foods/search)
 * Extracts normalized 100g lab macronutrient values.
 */

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

function extractNutrientValue(nutrients = [], targetIds = [], targetNames = []) {
  if (!Array.isArray(nutrients)) return 0;

  for (const n of nutrients) {
    const id = n.nutrientId || n.id || n.nutrientNumber;
    const name = (n.nutrientName || n.name || '').toLowerCase();

    if (targetIds.includes(Number(id))) {
      return parseFloat(n.value) || 0;
    }
    if (targetNames.some(tn => name.includes(tn.toLowerCase()))) {
      return parseFloat(n.value) || 0;
    }
  }
  return 0;
}

export async function searchUSDAFoods(query, customApiKey) {
  if (!query || !query.trim()) return [];

  const apiKey =
    customApiKey ||
    (typeof process !== 'undefined' && process.env?.USDA_API_KEY) ||
    'DEMO_KEY';

  const params = new URLSearchParams({
    api_key: apiKey,
    query: query.trim(),
    dataType: 'Foundation,SR Legacy,Survey (FNDDS)',
    pageSize: '10',
  });

  const response = await fetch(`${USDA_API_URL}?${params.toString()}`);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`[usdaService] USDA API search failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const foods = Array.isArray(data.foods) ? data.foods : [];

  return foods.map(food => {
    const nutrients = food.foodNutrients || [];

    const kcal = extractNutrientValue(nutrients, [1008, 208], ['energy']);
    const protein = extractNutrientValue(nutrients, [1003, 203], ['protein']);
    const fat = extractNutrientValue(nutrients, [1004, 204], ['total lipid', 'fat']);
    const carbs = extractNutrientValue(nutrients, [1005, 205], ['carbohydrate']);
    const fiber = extractNutrientValue(nutrients, [1079, 291], ['fiber']);

    const roundedCarbs = Math.round(carbs * 10) / 10;
    const roundedFiber = Math.round(fiber * 10) / 10;
    const netCarbs = Math.max(0, Math.round((roundedCarbs - roundedFiber) * 10) / 10);

    return {
      fdcId: food.fdcId,
      description: food.description || query,
      brandOwner: food.brandOwner || food.dataType || 'USDA Standard Reference',
      kcal: Math.round(kcal * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      carbs: roundedCarbs,
      fiber: roundedFiber,
      netCarbs,
    };
  });
}

export async function fetchUSDAIngredient(query, customApiKey) {
  const results = await searchUSDAFoods(query, customApiKey);
  return results.length > 0 ? results[0] : null;
}

export default {
  searchUSDAFoods,
  fetchUSDAIngredient,
};
