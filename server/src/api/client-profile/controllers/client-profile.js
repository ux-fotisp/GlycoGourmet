"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::client-profile.client-profile", ({ strapi }) => ({
  async find(ctx) {
    try {
      const user = ctx.state.user;

      // Build the query
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      // Tenant scoping for dietitians
      if (user && user.roleType === "dietitian") {
        sanitizedQuery.filters = {
          ...(sanitizedQuery.filters || {}),
          dietitian: user.id,
        };
      }

      // Bypass admin check - admin sees all
      const { results, pagination } = await strapi
        .service("api::client-profile.client-profile")
        .find(sanitizedQuery);

      // Use ctx.state.auth for v4 sanitize.output
      const sanitized = await strapi.contentAPI.sanitize.output(
        results,
        strapi.getModel("api::client-profile.client-profile"),
        { auth: ctx.state.auth }
      );

      return this.transformResponse(sanitized, { pagination });
    } catch (err) {
      console.error("[client-profile.find] ERROR:", err.message, err.stack);
      throw err;
    }
  },

  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      const { id } = ctx.params;

      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);

      const entity = await strapi
        .service("api::client-profile.client-profile")
        .findOne(id, sanitizedQuery);

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
    } catch (err) {
      console.error("[client-profile.findOne] ERROR:", err.message, err.stack);
      throw err;
    }
  },
}));
