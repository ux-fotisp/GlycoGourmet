'use strict';

/**
 * Tenant Isolation Policy - Dietitian Scope Guard
 * Path: server/src/policies/is-dietitian-owner.js
 */

module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state && policyContext.state.user;

  // Unauthenticated requests are rejected
  if (!user) {
    return false;
  }

  // Admin users bypass tenant isolation
  if (user.roleType === 'admin') {
    return true;
  }

  // Non-dietitian users should not access dietitian-scoped routes at all
  if (user.roleType !== 'dietitian') {
    return false;
  }

  const method = policyContext.request.method;

  // 1. For read queries (find / findOne)
  if (method === 'GET') {
    // Note: Query mutation here (policyContext.query.filters) is dropped by Strapi v4's
    // core sanitizeQuery. The actual tenant isolation for GET requests is explicitly
    // enforced via custom controller overrides for each entity.
    // This policy just validates the role for GET requests.
    return true;
  }

  // 2. For create (POST)
  if (method === 'POST') {
    if (policyContext.request.body && policyContext.request.body.data) {
      // Coerce the payload to belong to the authenticated dietitian
      policyContext.request.body.data.dietitian = user.id;
    }
    return true;
  }

  // 3. For update / delete (PUT / DELETE)
  if (method === 'PUT' || method === 'DELETE') {
    const recordId = policyContext.params.id;
    if (!recordId) return false;

    const modelUid = config.uid;
    if (!modelUid) {
      console.warn('is-dietitian-owner policy requires a uid in its config');
      return false;
    }

    try {
      const existingRecord = await strapi.entityService.findOne(modelUid, recordId, {
        populate: ['dietitian'],
      });

      if (!existingRecord) {
        return false; // Reject if not found
      }

      // Check if the record belongs to the dietitian
      const dietitianId = existingRecord.dietitian?.id || existingRecord.dietitian;
      if (Number(dietitianId) !== Number(user.id)) {
        return false; // 403 Forbidden
      }

      // Ensure they don't try to change the dietitian owner on update
      if (method === 'PUT') {
        if (policyContext.request.body && policyContext.request.body.data && policyContext.request.body.data.dietitian !== undefined) {
           policyContext.request.body.data.dietitian = user.id;
        }
      }

      return true;
    } catch (err) {
      console.error('Tenant Scoping Policy Error:', err);
      return false;
    }
  }

  return false;
};