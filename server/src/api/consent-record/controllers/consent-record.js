"use strict";

let createCoreController;
try {
  createCoreController = require("@strapi/strapi").factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

const CLINIC_ADMIN_VISIBLE_SCOPES = Object.freeze([
  "intake_redirect",
  "promoted_notifications",
]);

module.exports = createCoreController("api::consent-record.consent-record", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const userClinicId =
      user.clinicId ||
      user.clinic?.id ||
      (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);

    // 1. Patient: strictly read only their own consent records
    if (user.roleType === "user") {
      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        grantor: user.id,
      };
    }
    // 2. Clinic Admin: clinic-scoped operational consents only
    else if (user.roleType === "clinic_admin") {
      if (!userClinicId) return this.transformResponse([]);

      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        clinic: userClinicId,
      };
    }
    // 3. Dietitian: consents where they are the grantee or within their practice clinic
    else if (user.roleType === "dietitian") {
      if (!userClinicId) return this.transformResponse([]);

      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        $or: [
          { granteeId: String(user.id) },
          { clinic: userClinicId },
        ],
      };
    }

    const entities = await strapi.entityService.findMany(
      "api::consent-record.consent-record",
      sanitizedQuery
    );

    // Defense-in-depth scope allow-list filter for clinic_admin:
    // Completely exclude any record containing at least one non-visible scope
    let filteredEntities = entities;
    if (user.roleType === "clinic_admin") {
      filteredEntities = (entities || []).filter((record) => {
        const scopes = Array.isArray(record.scope) ? record.scope : [];
        if (scopes.length === 0) return false;
        const hasNonVisibleScope = scopes.some((s) => !CLINIC_ADMIN_VISIBLE_SCOPES.includes(s));
        return !hasNonVisibleScope;
      });
    }

    const sanitizedEntities = await this.sanitizeOutput(filteredEntities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized();

    const entity = await strapi.entityService.findOne(
      "api::consent-record.consent-record",
      id,
      { populate: ["grantor", "clinic"] }
    );

    if (!entity) return ctx.notFound();

    // Patient check
    if (user.roleType === "user") {
      const grantorId = entity.grantor?.id || entity.grantor;
      if (String(grantorId) !== String(user.id)) return ctx.notFound();
    }

    // Clinic Admin check
    if (user.roleType === "clinic_admin") {
      const userClinicId =
        user.clinicId ||
        user.clinic?.id ||
        (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);
      const recordClinicId = entity.clinic?.id || entity.clinic;

      if (!userClinicId || String(recordClinicId) !== String(userClinicId)) {
        return ctx.notFound();
      }

      // Check scope allow-list: return 404 (not 403) to prevent clinical scope enumeration
      const scopes = Array.isArray(entity.scope) ? entity.scope : [];
      const hasNonVisibleScope = scopes.some((s) => !CLINIC_ADMIN_VISIBLE_SCOPES.includes(s));
      if (hasNonVisibleScope) {
        return ctx.notFound();
      }
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
