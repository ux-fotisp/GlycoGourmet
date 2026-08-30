'use strict';

const axios = require('axios');
const usdaSyncService = require('../services/usda-sync');

jest.mock('axios');

describe('USDA Sync Service', () => {
  beforeEach(() => {
    global.strapi = {
      log: {
        info: jest.fn(),
        error: jest.fn(),
      },
      entityService: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should skip if no ingredients have usdaFdcId', async () => {
    strapi.entityService.findMany.mockResolvedValue([]);
    const result = await usdaSyncService.syncIngredients();
    expect(result.syncedCount).toBe(0);
    expect(strapi.entityService.update).not.toHaveBeenCalled();
  });

  it('should fetch and update ingredients correctly', async () => {
    const mockIngredients = [
      { id: 1, name: 'Broccoli', usdaFdcId: '11090' }
    ];
    
    strapi.entityService.findMany.mockResolvedValue(mockIngredients);
    
    const mockUsdaResponse = {
      data: [
        {
          fdcId: 11090,
          description: 'Broccoli, raw',
          foodNutrients: [
            { nutrient: { id: 1008 }, amount: 34 },   // Energy
            { nutrient: { id: 1003 }, amount: 2.82 }, // Protein
            { nutrient: { id: 1004 }, amount: 0.37 }, // Fat
            { nutrient: { id: 1005 }, amount: 6.64 }, // Carbs
            { nutrient: { id: 1079 }, amount: 2.6 }   // Fiber
          ]
        }
      ]
    };
    
    axios.get.mockResolvedValue(mockUsdaResponse);
    strapi.entityService.update.mockResolvedValue({});

    const result = await usdaSyncService.syncIngredients();
    
    expect(result.syncedCount).toBe(1);
    expect(axios.get).toHaveBeenCalledWith('https://api.nal.usda.gov/fdc/v1/foods', {
      params: {
        api_key: 'DEMO_KEY',
        fdcIds: '11090'
      }
    });
    
    expect(strapi.entityService.update).toHaveBeenCalledWith('api::ingredient.ingredient', 1, expect.objectContaining({
      data: expect.objectContaining({
        kcal: 34,
        protein: 2.82,
        fat: 0.37,
        carbs: 6.64,
        fiber: 2.6
      })
    }));
  });
});