'use strict';

/**
 * Strapi Backend Lifecycle Guards for Recipe Entity
 * Path: server/src/api/recipe/content-types/recipe/lifecycles.js
 *
 * Enforces physiological macronutrient invariants before database persistence.
 */

let ValidationError = Error;
try {
  const { errors } = require('@strapi/utils');
  if (errors && errors.ValidationError) {
    ValidationError = errors.ValidationError;
  }
} catch (err) {
  ValidationError = class CustomValidationError extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'ValidationError';
    }
  };
}

function validateRecipePayload(data) {
  if (!data) return;

  // 1. Validate Ingredient Line Items
  if (Array.isArray(data.ingredients)) {
    data.ingredients.forEach((item, index) => {
      const amount = parseFloat(item?.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new ValidationError(
          `Validation Error at ingredient [${index}]: Amount must be strictly greater than 0g. Received: ${item?.amount}`
        );
      }
    });
  }

  // 2. Validate Direct Recipe Macronutrients
  const carbs = parseFloat(data.carbs ?? data.nutrition?.carbs ?? data.nutritionPerServing?.carbs) || 0;
  const fiber = parseFloat(data.fiber ?? data.nutrition?.fiber ?? data.nutritionPerServing?.fiber) || 0;
  const netCarbs = parseFloat(data.netCarbs ?? data.nutrition?.netCarbs ?? data.nutritionPerServing?.netCarbs) || (carbs - fiber);
  const gl = parseFloat(data.glycemicLoad ?? data.nutrition?.glycemicLoad ?? data.glycemicLoadPerServing) || 0;

  // Rule 1: Fiber cannot exceed total carbohydrates
  if (fiber > carbs) {
    throw new ValidationError(
      `Macronutrient Anomaly: Dietary fiber (${fiber}g) cannot exceed total carbohydrates (${carbs}g).`
    );
  }

  // Rule 2: Net carbohydrates cannot be negative
  if (netCarbs < 0) {
    throw new ValidationError(
      `Macronutrient Anomaly: Net carbohydrates (${netCarbs}g) cannot be negative.`
    );
  }

  // Rule 3: Calculated GL cannot exceed physical ceiling of 100
  if (gl > 100) {
    throw new ValidationError(
      `Physiological Ceiling Violation: Calculated Glycemic Load per portion (${gl}) exceeds upper physical boundary of 100.`
    );
  }
}

module.exports = {
  beforeCreate(event) {
    const { data } = event.params || {};
    validateRecipePayload(data);
  },

  beforeUpdate(event) {
    const { data } = event.params || {};
    validateRecipePayload(data);
  },
};
