"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::client-profile.client-profile", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    // 1. Validate and sanitize the client-supplied query
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // 2. Inject tenant isolation filter AFTER sanitization (server-side only)
    if (user && user.roleType === "dietitian") {
      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        dietitian: user.id,
      };
    }

    // 3. Query via entityService (Strapi v4 stable API)
    const entities = await strapi.entityService.findMany(
      "api::client-profile.client-profile",
      sanitizedQuery
    );

    // 4. Sanitize output to strip private/password fields from related users
    const sanitized = await strapi.contentAPI.sanitize.output(
      entities,
      strapi.getModel("api::client-profile.client-profile"),
      { auth: ctx.state.auth }
    );

    return this.transformResponse(sanitized);
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

    if (user && user.roleType === "dietitian") {
      const ownerId = entity.dietitian?.id || entity.dietitian;
      if (Number(ownerId) !== Number(user.id)) return ctx.notFound();
    }

    const sanitized = await strapi.contentAPI.sanitize.output(
      entity,
      strapi.getModel("api::client-profile.client-profile"),
      { auth: ctx.state.auth }
    );

    return this.transformResponse(sanitized);
  },
}));
