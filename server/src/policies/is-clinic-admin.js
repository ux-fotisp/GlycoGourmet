'use strict';

/**
 * Tenant Isolation & Clinical Safety Policy - Clinic Admin Scope Guard
 * Path: server/src/policies/is-clinic-admin.js
 *
 * Enforces strict organizational boundary isolation for clinic_admin users:
 * 1. Hard PHI & Clinical Data Wall:
 *    clinic_admin is structurally prohibited from accessing clinical telemetry,
 *    patient health records (client-profile), target calibrations, prescriptions, or clinical rules.
 * 2. Multi-Tenant Scoping:
 *    Administrative actions (intake, invitations, promotions, roster) are strictly
 *    scoped to the authenticated user's clinicId.
 */

// Explicit list of clinical model UIDs that clinic_admin must NEVER access under any circumstances
const FORBIDDEN_CLINICAL_UIDS = [
  'api::client-profile.client-profile',
  'api::metabolic-target-calibration.metabolic-target-calibration',
  'api::prescribed-meal-plan.prescribed-meal-plan',
  'api::smart-swap-rule.smart-swap-rule',
];

module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state && policyContext.state.user;

  // 1. Reject unauthenticated requests
  if (!user) {
    return false;
  }

  // 2. Global Admin / Super Admin bypasses tenant isolation
  if (user.roleType === 'admin' || user.roleType === 'super_admin') {
    return true;
  }

  // 3. Reject any non-clinic_admin role (dietitians, standard patients, etc. use their own policies)
  // For api::clinic.clinic read queries, allow authenticated dietitians who belong to a clinic to read
  const modelUid = config?.uid;
  const isDietitianReadingClinic =
    modelUid === 'api::clinic.clinic' &&
    policyContext.request.method === 'GET' &&
    user.roleType === 'dietitian';

  if (user.roleType !== 'clinic_admin' && !isDietitianReadingClinic) {
    return false;
  }

  // 4. Hard PHI / Clinical Data Wall Check
  if (modelUid && FORBIDDEN_CLINICAL_UIDS.includes(modelUid)) {
    // Zero access to clinical telemetry, calibration, or prescription tables
    return false;
  }

  // 5. Tenant context resolution (clinicId)
  const userClinicId =
    user.clinicId ||
    user.clinic?.id ||
    (typeof user.clinic === 'number' || typeof user.clinic === 'string' ? user.clinic : null);

  if (!userClinicId) {
    // Clinic admin without an assigned clinic tenant cannot perform scoped operations
    return false;
  }

  const method = policyContext.request.method;

  // 6. Read queries (find / findOne)
  if (method === 'GET') {
    return true;
  }

  // 7. Create queries (POST)
  if (method === 'POST') {
    if (policyContext.request.body && policyContext.request.body.data) {
      // Coerce the payload to belong strictly to the authenticated user's clinic tenant
      policyContext.request.body.data.clinic = userClinicId;
      policyContext.request.body.data.clinicId = userClinicId;
    }
    return true;
  }

  // 8. Update / Delete queries (PUT / DELETE)
  if (method === 'PUT' || method === 'DELETE') {
    const recordId = policyContext.params.id;
    if (!recordId) return false;

    if (!modelUid) {
      console.warn('is-clinic-admin policy requires a uid in its config');
      return false;
    }

    try {
      const existingRecord = await strapi.entityService.findOne(modelUid, recordId, {
        populate: ['clinic'],
      });

      if (!existingRecord) {
        return false;
      }

      // Check if the record belongs to the user's clinic tenant
      const recordClinicId =
        modelUid === 'api::clinic.clinic'
          ? (existingRecord.id || existingRecord.slug)
          : (existingRecord.clinic?.id || existingRecord.clinic || existingRecord.clinicId);

      if (String(recordClinicId) !== String(userClinicId)) {
        return false; // 403 Forbidden - Cross-tenant breach attempt
      }

      // Prevent tenant re-assignment during updates
      if (method === 'PUT') {
        if (policyContext.request.body && policyContext.request.body.data) {
          if (policyContext.request.body.data.clinic !== undefined) {
            policyContext.request.body.data.clinic = userClinicId;
          }
          if (policyContext.request.body.data.clinicId !== undefined) {
            policyContext.request.body.data.clinicId = userClinicId;
          }
        }
      }

      return true;
    } catch (err) {
      console.error('Clinic Admin Tenant Scoping Policy Error:', err);
      return false;
    }
  }

  return false;
};