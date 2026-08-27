'use strict';

/**
 * Strapi Lifecycle Hooks for Audit Record
 * Path: server/src/api/audit-record/content-types/audit-record/lifecycles.js
 *
 * Discrepancy Gate:
 * Automatically enforces status = 'pending' when the absolute delta between
 * author-claimed and engine-calculated values exceeds the clinical threshold.
 *
 * Thresholds:
 *   |deltaGL|       > 1.0  => flagged + pending
 *   |deltaNetCarbs| > 1.0g => flagged + pending
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

/** Clinical discrepancy threshold for both GL and NetCarbs */
const DISCREPANCY_THRESHOLD = 1.0;

/**
 * Evaluate discrepancy between author-claimed and system-calculated values.
 * Computes deltas, sets the flagged boolean, and enforces 'pending' status
 * when any delta exceeds the threshold.
 *
 * @param {object} data - The event params data payload (mutated in place)
 */
function evaluateDiscrepancyGate(data) {
  if (!data) return;

  const authorGL = parseFloat(data.authorGL);
  const systemGL = parseFloat(data.systemGL);
  const authorNetCarbs = parseFloat(data.authorNetCarbs);
  const systemNetCarbs = parseFloat(data.systemNetCarbs);

  // Compute absolute deltas
  const deltaGL = Number.isFinite(authorGL) && Number.isFinite(systemGL)
    ? Math.round(Math.abs(authorGL - systemGL) * 100) / 100
    : 0;

  const deltaNetCarbs = Number.isFinite(authorNetCarbs) && Number.isFinite(systemNetCarbs)
    ? Math.round(Math.abs(authorNetCarbs - systemNetCarbs) * 100) / 100
    : 0;

  // Persist computed deltas
  data.deltaGL = deltaGL;
  data.deltaNetCarbs = deltaNetCarbs;

  // Determine if discrepancy exceeds clinical threshold
  const hasDiscrepancy = deltaGL > DISCREPANCY_THRESHOLD || deltaNetCarbs > DISCREPANCY_THRESHOLD;

  data.flagged = hasDiscrepancy;

  // Enforce 'pending' status when flagged — cannot be overridden by caller
  if (hasDiscrepancy) {
    data.status = 'pending';
  }
}

module.exports = {
  beforeCreate(event) {
    const { data } = event.params || {};
    evaluateDiscrepancyGate(data);
  },

  beforeUpdate(event) {
    const { data } = event.params || {};
    evaluateDiscrepancyGate(data);
  },
};
