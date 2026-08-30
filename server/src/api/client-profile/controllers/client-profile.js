"use strict";

let createCoreController;
try {
  createCoreController = require("@strapi/strapi").factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

module.exports = createCoreController("api::client-profile.client-profile", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    // 1. Validate and sanitize the client-supplied query params
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // 2. Inject tenant isolation AFTER client-side sanitization (server enforced)
    if (user && user.roleType === "dietitian") {
      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        dietitian: user.id,
      };
    }

    // 3. Fetch from DB
    const entities = await strapi.entityService.findMany(
      "api::client-profile.client-profile",
      sanitizedQuery
    );

    // 4. Sanitize output using inherited base controller method (Strapi v4 stable)
    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);

    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const entity = await strapi.entityService.findOne(
      "api::client-profile.client-profile",
      id,
      sanitizedQuery
    );

    if (!entity) return ctx.notFound();

    // Tenant check: dietitians can only see their own records
    if (user && user.roleType === "dietitian") {
      const ownerId = entity.dietitian?.id || entity.dietitian;
      if (Number(ownerId) !== Number(user.id)) return ctx.notFound();
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
