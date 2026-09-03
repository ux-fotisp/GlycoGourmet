"use strict";

let createCoreController;
try {
  createCoreController = require("@strapi/strapi").factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

module.exports = createCoreController("api::clinic.clinic", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Enforce tenant scoping: callers may only read their own clinic, except super_admin / admin
    if (user && user.roleType !== "super_admin" && user.roleType !== "admin") {
      const userClinicId =
        user.clinicId ||
        user.clinic?.id ||
        (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);

      if (!userClinicId) {
        return this.transformResponse([]);
      }

      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        id: userClinicId,
      };
    }

    const entities = await strapi.entityService.findMany(
      "api::clinic.clinic",
      sanitizedQuery
    );

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    if (user && user.roleType !== "super_admin" && user.roleType !== "admin") {
      const userClinicId =
        user.clinicId ||
        user.clinic?.id ||
        (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);

      if (!userClinicId || String(userClinicId) !== String(id)) {
        return ctx.notFound();
      }
    }

    const entity = await strapi.entityService.findOne(
      "api::clinic.clinic",
      id,
      sanitizedQuery
    );

    if (!entity) return ctx.notFound();

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) return ctx.unauthorized();

    if (user.roleType !== "clinic_admin" && user.roleType !== "super_admin" && user.roleType !== "admin") {
      return ctx.forbidden("Only clinic administrators may update clinic settings.");
    }

    const userClinicId =
      user.clinicId ||
      user.clinic?.id ||
      (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);

    if (user.roleType !== "super_admin" && user.roleType !== "admin") {
      if (!userClinicId || String(userClinicId) !== String(id)) {
        return ctx.forbidden("Cannot update a clinic tenant other than your own.");
      }
    }

    return await super.update(ctx);
  },
}));
