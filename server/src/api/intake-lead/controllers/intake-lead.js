"use strict";

let createCoreController;
try {
  createCoreController = require("@strapi/strapi").factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

module.exports = createCoreController("api::intake-lead.intake-lead", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // Standard patient users have zero access to operational intake leads
    if (user.roleType === "user") {
      return ctx.forbidden("Standard users may not view intake pipeline records.");
    }

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

    // Explicit field projection: prevent leaking full user records
    sanitizedQuery.populate = {
      ...(sanitizedQuery.populate || {}),
      assignedDietitian: {
        fields: ["id", "username", "name", "credential"],
      },
      clinic: {
        fields: ["id", "name", "slug"],
      },
    };

    const entities = await strapi.entityService.findMany(
      "api::intake-lead.intake-lead",
      sanitizedQuery
    );

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized();

    if (user.roleType === "user") {
      return ctx.forbidden("Standard users may not view intake pipeline records.");
    }

    const entity = await strapi.entityService.findOne(
      "api::intake-lead.intake-lead",
      id,
      {
        populate: {
          assignedDietitian: {
            fields: ["id", "username", "name", "credential"],
          },
          clinic: {
            fields: ["id", "name", "slug"],
          },
        },
      }
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

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (user.roleType === "user") {
      return ctx.forbidden();
    }

    const userClinicId =
      user.clinicId ||
      user.clinic?.id ||
      (typeof user.clinic === "number" || typeof user.clinic === "string" ? user.clinic : null);

    if (user.roleType !== "super_admin" && user.roleType !== "admin") {
      if (!userClinicId) return ctx.forbidden("User is not associated with an active clinic tenant.");
      if (ctx.request.body && ctx.request.body.data) {
        ctx.request.body.data.clinic = userClinicId;
      }
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized();

    if (user.roleType === "user") {
      return ctx.forbidden();
    }

    const entity = await strapi.entityService.findOne(
      "api::intake-lead.intake-lead",
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
        return ctx.forbidden("Cannot modify intake leads belonging to another clinic.");
      }

      // Prevent tenant re-assignment
      if (ctx.request.body && ctx.request.body.data) {
        ctx.request.body.data.clinic = userClinicId;
      }
    }

    return await super.update(ctx);
  },
}));
