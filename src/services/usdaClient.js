/**
 * usdaClient.js — External USDA FoodData Central API Service Wrapper
 *
 * Connects to USDA FoodData Central API:
 *   - Base URL: https://api.nal.usda.gov/fdc/v1/foods/search
 *   - API Key: VITE_USDA_API_KEY (defaults to USDA public 'DEMO_KEY')
 *
 * Extracts normalized 100g lab values for:
 *   - Calories (ID 1008 / 208)
 *   - Protein (ID 1003 / 203)
 *   - Total Fat (ID 1004 / 204)
 *   - Carbohydrates (ID 1005 / 205)
 *   - Dietary Fiber (ID 1079 / 291)
 *
 * Calculates netCarbs = Math.max(0, totalCarbs - fiber)
 */

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

/** Get standard nutrient value by ID list or name matching */
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

/**
 * Searches the USDA FoodData Central API for foods matching a query.
 *
 * @param {string} query — search term e.g. "Salmon" or "Quinoa"
 * @param {string} [customApiKey] — optional explicit API key override
 * @returns {Promise<Array<object>>} — array of normalized food items per 100g base
 */
export async function searchUSDAFoods(query, customApiKey) {
  if (!query || !query.trim()) return [];

  const apiKey =
    customApiKey ||
    (typeof process !== 'undefined' && process.env?.USDA_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USDA_API_KEY) ||
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
    throw new Error(`[usdaClient] USDA API search failed (${response.status}): ${errorText}`);
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

/**
 * Convenience wrapper returning the top matching USDA food item.
 *
 * @param {string} query
 * @param {string} [customApiKey]
 * @returns {Promise<object|null>}
 */
export async function fetchUSDAIngredient(query, customApiKey) {
  const results = await searchUSDAFoods(query, customApiKey);
  return results.length > 0 ? results[0] : null;
}

export default {
  searchUSDAFoods,
  fetchUSDAIngredient,
};
