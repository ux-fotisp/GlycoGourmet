import { describe, it, expect } from 'vitest';
import lifecycles from '../content-types/ingredient/lifecycles.js';

describe('US-3.2: Strapi Lifecycle Automated Anomaly Detection Guards', () => {
  it('Scenario 5.1: Throws error when fiber > carbs (impossible macronutrient ratio)', () => {
    const invalidEvent = {
      params: {
        data: {
          name: 'Invalid Fiber Ingredient',
          carbs: 10,
          fiber: 15, // Impossible: fiber exceeds total carbs!
        },
      },
    };

    expect(() => {
      lifecycles.beforeCreate(invalidEvent);
    }).toThrow(/fiber cannot exceed total carbohydrates/i);
  });

  it('Scenario 5.2: Throws error when netCarbs < 0', () => {
    const invalidEvent = {
      params: {
        data: {
          name: 'Negative Net Carbs Ingredient',
          carbs: 5,
          fiber: 10,
          netCarbs: -5,
        },
      },
    };

    expect(() => {
      lifecycles.beforeCreate(invalidEvent);
    }).toThrow(/Data anomaly detected/i);
  });

  it('Scenario 5.3: Throws error when glycemicLoad exceeds physical ceiling threshold of 100', () => {
    const invalidEvent = {
      params: {
        data: {
          name: 'Impossible GL Ingredient',
          carbs: 150,
          fiber: 0,
          glycemicIndex: 100,
          glycemicLoad: 150, // GL > 100 threshold!
        },
      },
    };

    expect(() => {
      lifecycles.beforeCreate(invalidEvent);
    }).toThrow(/exceeds physical threshold/i);
  });

  it('Passes valid ingredient payload cleanly without throwing', () => {
    const validEvent = {
      params: {
        data: {
          name: 'Valid Quinoa',
          carbs: 21.3,
          fiber: 2.8,
          netCarbs: 18.5,
          glycemicIndex: 53,
          glycemicLoad: 9.8,
        },
      },
    };

    expect(() => {
      lifecycles.beforeCreate(validEvent);
    }).not.toThrow();
  });
});
