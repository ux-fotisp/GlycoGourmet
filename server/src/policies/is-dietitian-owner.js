'use strict';

/**
 * Tenant Isolation Policy — Dietitian Scope Guard
 * Path: server/src/policies/is-dietitian-owner.js
 *
 * Ensures that dietitian-role users can only access ClientProfile records
 * (and their dependent entities: MetabolicTargetCalibration, PrescribedMealPlan,
 * SmartSwapRule) that are associated with their own user ID via the
 * dietitian relation.
 *
 * Usage (route config):
 *   config: {
 *     policies: ['global::is-dietitian-owner']
 *   }
 *
 * IMPLEMENTATION STATUS: Draft scaffold — tenant-scoped query injection
 * requires Strapi middleware integration in a future chunk.
 *
 * TODO (Chunk N):
 *   1. For find/findOne: inject ilters: { dietitian: ctx.state.user.id }
 *      into the query so dietitians never see other dietitians' client data.
 *   2. For create: validate that data.dietitian matches ctx.state.user.id.
 *   3. For update/delete: verify the target entity's dietitian matches the
 *      authenticated user before allowing mutation.
 *   4. Admin-role users bypass this policy entirely.
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

  // --- Dietitian tenant scoping ---
  // At this stage the user is a confirmed dietitian.
  // The calling route handler is responsible for filtering queries by
  // dietitian: user.id. This policy confirms the role gate only.
  //
  // Full query-level tenant isolation (injecting filters into entityService
  // calls) will be implemented as a Strapi middleware in a subsequent chunk
  // to avoid duplicating filter logic across every controller action.

  return true;
};
