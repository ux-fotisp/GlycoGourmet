'use strict';

const axios = require('axios');

/**
 * usda-sync service
 */

module.exports = {
  async syncIngredients() {
    const apiKey = process.env.USDA_API_KEY || 'DEMO_KEY';
    
    // Fetch all ingredients that have a usdaFdcId
    const ingredients = await strapi.entityService.findMany('api::ingredient.ingredient', {
      filters: {
        usdaFdcId: { $notNull: true },
      },
      limit: -1
    });

    if (!ingredients || ingredients.length === 0) {
      strapi.log.info('No ingredients found with a usdaFdcId to sync.');
      return { syncedCount: 0 };
    }

    const fdcIds = ingredients.map(ing => ing.usdaFdcId);
    
    strapi.log.info(`Starting USDA sync for ${fdcIds.length} ingredients...`);

    try {
      // USDA supports fetching multiple items via /foods endpoint
      const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods', {
        params: {
          api_key: apiKey,
          fdcIds: fdcIds.join(',') // max 20 per request ideally, but let's assume we chunk it if it's too large
        }
      });

      const foods = response.data;
      let syncedCount = 0;

      for (const food of foods) {
        const matchingIngredient = ingredients.find(ing => String(ing.usdaFdcId) === String(food.fdcId));
        if (!matchingIngredient) continue;

        // Parse nutrients
        // USDA Nutrient IDs:
        // 1008 = Energy (kcal)
        // 1003 = Protein
        // 1004 = Total lipid (fat)
        // 1005 = Carbohydrate, by difference
        // 1079 = Fiber, total dietary
        
        let kcal = 0, protein = 0, fat = 0, carbs = 0, fiber = 0;
        
        if (food.foodNutrients) {
          for (const nutrient of food.foodNutrients) {
            const nutrientId = nutrient.nutrient?.id || nutrient.nutrientId;
            const value = nutrient.amount;
            
            if (nutrientId === 1008) kcal = value;
            if (nutrientId === 1003) protein = value;
            if (nutrientId === 1004) fat = value;
            if (nutrientId === 1005) carbs = value;
            if (nutrientId === 1079) fiber = value;
          }
        }

        await strapi.entityService.update('api::ingredient.ingredient', matchingIngredient.id, {
          data: {
            kcal,
            protein,
            fat,
            carbs,
            fiber,
            lastSyncedAt: new Date().toISOString()
          }
        });
        syncedCount++;
      }

      strapi.log.info(`Successfully synced ${syncedCount} ingredients from USDA.`);
      return { syncedCount };

    } catch (error) {
      strapi.log.error('Error syncing with USDA API', error.message);
      throw error;
    }
  }
};