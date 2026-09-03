"use strict";

let createCoreController;
try {
  createCoreController = require("@strapi/strapi").factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

module.exports = createCoreController("api::audit-log-entry.audit-log-entry", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const userClinicId =
      user.clinicId ||
      user.clinic?.id ||
      (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);

    if (user.roleType !== "super_admin" && user.roleType !== "admin") {
      if (!userClinicId) return this.transformResponse([]);

      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        clinic: userClinicId,
      };
    }

    const entities = await strapi.entityService.findMany(
      "api::audit-log-entry.audit-log-entry",
      sanitizedQuery
    );

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized();

    const entity = await strapi.entityService.findOne(
      "api::audit-log-entry.audit-log-entry",
      id,
      { populate: ["clinic"] }
    );

    if (!entity) return ctx.notFound();

    if (user.roleType !== "super_admin" && user.roleType !== "admin") {
      const userClinicId =
        user.clinicId ||
        user.clinic?.id ||
        (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);
      const recordClinicId = entity.clinic?.id || entity.clinic;

      if (!userClinicId || String(recordClinicId) !== String(userClinicId)) {
        return ctx.notFound();
      }
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Append-only defense-in-depth: explicit controller prohibition
  async update(ctx) {
    return ctx.forbidden("Audit log entries are immutable and append-only.");
  },

  async delete(ctx) {
    return ctx.forbidden("Audit log entries are immutable and cannot be deleted.");
  },
}));
