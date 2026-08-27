"use strict";
const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController("api::client-profile.client-profile", ({ strapi }) => ({
  async find(ctx) {
    try {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const user = ctx.state.user;
      if (user && user.roleType === 'dietitian') {
        sanitizedQuery.filters = {
          ...(sanitizedQuery.filters || {}),
          dietitian: { id: { $eq: user.id } }
        };
      }
      const { results, pagination } = await strapi.service("api::client-profile.client-profile").find(sanitizedQuery);
      const sanitizedResults = await this.sanitizeOutput(results, ctx);
      return this.transformResponse(sanitizedResults, { pagination });
    } catch (err) {
      console.error('FIND ERROR:', err);
      throw err;
    }
  },
  async findOne(ctx) {
    try {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const user = ctx.state.user;
      if (user && user.roleType === 'dietitian') {
        sanitizedQuery.filters = {
          ...(sanitizedQuery.filters || {}),
          dietitian: { id: { $eq: user.id } }
        };
      }
      const entity = await strapi.service("api::client-profile.client-profile").findOne(ctx.params.id, sanitizedQuery);
      if (!entity) return ctx.notFound();
      if (user && user.roleType === 'dietitian') {
        const ownerId = entity.dietitian?.id || entity.dietitian;
        if (Number(ownerId) !== Number(user.id)) return ctx.notFound();
      }
      const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (err) {
      console.error('FINDONE ERROR:', err);
      throw err;
    }
  }
}));