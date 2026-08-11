'use strict';

/**
 * Strapi Lifecycle Hooks for Ingredient Content-Type (US-3.2)
 *
 * Automated Database Anomaly Detection:
 * Blocks invalid macronutrient entries before database persistence.
 */

let ValidationError = Error;
try {
  const { errors } = require('@strapi/utils');
  if (errors && errors.ValidationError) {
    ValidationError = errors.ValidationError;
  }
} catch (err) {
  // Defensive fallback for non-Strapi test runners
  ValidationError = class CustomValidationError extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'ValidationError';
    }
  };
}

module.exports = {
  beforeCreate(event) {
    const { data } = event?.params || {};
    validateIngredientMacros(data);
  },

  beforeUpdate(event) {
    const { data } = event?.params || {};
    validateIngredientMacros(data);
  },
};

function validateIngredientMacros(data) {
  if (!data) return;

  const carbs = parseFloat(data.carbs ?? data.nutrition?.carbs) || 0;
  const fiber = parseFloat(data.fiber ?? data.nutrition?.fiber) || 0;
  const netCarbs = parseFloat(data.netCarbs ?? data.nutrition?.netCarbs) || (carbs - fiber);
  const gl = parseFloat(data.glycemicLoad ?? data.nutrition?.glycemicLoad) || 0;

  // Rule 1: Fiber cannot exceed total carbohydrates
  if (fiber > carbs) {
    throw new ValidationError('Data anomaly detected: Dietary fiber cannot exceed total carbohydrates.');
  }

  // Rule 2: Net carbs cannot be negative
  if (netCarbs < 0) {
    throw new ValidationError('Data anomaly detected: Net carbs cannot be negative.');
  }

  // Rule 3: Glycemic Load per 100g cannot exceed physical threshold of 100
  if (gl > 100) {
    throw new ValidationError('Data anomaly detected: Glycemic load per 100g exceeds physical threshold (100).');
  }
}
