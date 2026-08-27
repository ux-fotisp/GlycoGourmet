'use strict';

/**
 * Strapi Lifecycle Hooks for Prescribed Meal Plan
 * Path: server/src/api/prescribed-meal-plan/content-types/prescribed-meal-plan/lifecycles.js
 *
 * Clinical Safety Gate:
 * Prevents scheduling of uncertified draft recipes into patient meal plans.
 * All referenced recipes in scheduledSlots must be published (non-draft).
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

/**
 * Extract all unique recipe IDs from the scheduledSlots JSON structure.
 * Expected shape: { [day]: { [occasion]: recipeId } }
 *
 * @param {object|null|undefined} scheduledSlots
 * @returns {string[]} Unique, non-empty recipe ID strings
 */
function extractRecipeIds(scheduledSlots) {
  if (!scheduledSlots || typeof scheduledSlots !== 'object') return [];

  const ids = new Set();
  const days = Object.values(scheduledSlots);

  for (const daySlots of days) {
    if (!daySlots || typeof daySlots !== 'object') continue;
    const recipeIds = Object.values(daySlots);
    for (const rid of recipeIds) {
      if (rid && typeof rid === 'string' && rid.trim().length > 0) {
        ids.add(rid.trim());
      } else if (rid && typeof rid === 'number') {
        ids.add(String(rid));
      }
    }
  }

  return Array.from(ids);
}

/**
 * Validate that no draft/unpublished recipes are referenced in the plan.
 *
 * @param {object} data - The event params data payload
 */
async function validateNoUnpublishedRecipes(data) {
  if (!data || !data.scheduledSlots) return;

  const recipeIds = extractRecipeIds(data.scheduledSlots);
  if (recipeIds.length === 0) return;

  // Query all referenced recipes to check their publication status
  for (const recipeId of recipeIds) {
    let recipe;
    try {
      recipe = await strapi.entityService.findOne(
        'api::recipe.recipe',
        recipeId,
        { fields: ['id', 'status', 'publishedAt'] }
      );
    } catch (err) {
      throw new ValidationError(
        'Meal Plan Validation Error: Recipe ID "' + recipeId + '" could not be resolved. ' +
        'Ensure all scheduled recipes exist before assigning them to a clinical plan.'
      );
    }

    if (!recipe) {
      throw new ValidationError(
        'Meal Plan Validation Error: Recipe ID "' + recipeId + '" does not exist. ' +
        'Cannot schedule a non-existent recipe in a clinical meal plan.'
      );
    }

    // Gate 1: Reject explicitly draft recipes
    if (recipe.status === 'draft') {
      throw new ValidationError(
        'Clinical Safety Violation: Recipe "' + recipeId + '" has status "draft". ' +
        'Only published, clinically certified recipes may be scheduled in patient meal plans.'
      );
    }

    // Gate 2: Reject unpublished recipes (publishedAt is null)
    if (recipe.publishedAt === null || recipe.publishedAt === undefined) {
      throw new ValidationError(
        'Clinical Safety Violation: Recipe "' + recipeId + '" has not been published (publishedAt is null). ' +
        'Unpublished recipes cannot be included in prescribed clinical meal plans.'
      );
    }
  }
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params || {};
    await validateNoUnpublishedRecipes(data);
  },

  async beforeUpdate(event) {
    const { data } = event.params || {};
    await validateNoUnpublishedRecipes(data);
  },
};
