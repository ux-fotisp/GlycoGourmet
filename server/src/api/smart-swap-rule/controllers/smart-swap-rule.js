"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::smart-swap-rule.smart-swap-rule", ({ strapi }) => ({
  async find(ctx) {
    // 1. Let Strapi validate and sanitize the query as usual
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const user = ctx.state.user;
    
    // 2. If user is a dietitian, enforce tenant scoping directly on the query object 
    // passed to the service, bypassing Koa ctx.query issues.
    if (user && user.roleType === 'dietitian') {
      sanitizedQuery.filters = {
        ...sanitizedQuery.filters,
        dietitian: user.id,
      };
    }

    // 3. Call the core service with the mutated query
    const { results, pagination } = await strapi.service("api::smart-swap-rule.smart-swap-rule").find(sanitizedQuery);
    
    // 4. Sanitize and return
    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults, { pagination });
  },

  async findOne(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const { id } = ctx.params;

    const user = ctx.state.user;
    
    // For findOne, inject the filter into the query so the service only returns
    // it if it matches the dietitian.
    if (user && user.roleType === 'dietitian') {
      sanitizedQuery.filters = {
        ...sanitizedQuery.filters,
        dietitian: user.id,
      };
    }

    const entity = await strapi.service("api::smart-swap-rule.smart-swap-rule").findOne(id, sanitizedQuery);
    
    // If not found (or filtered out by tenant scope), return 404
    if (!entity) {
      return ctx.notFound();
    }

    // Extra safety check in case the service findOne didn't strictly apply the top-level filter
    if (user && user.roleType === 'dietitian') {
      const ownerId = entity.dietitian?.id || entity.dietitian;
      if (Number(ownerId) !== Number(user.id)) {
        return ctx.notFound(); // Hide existence of other tenant's records
      }
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  }
}));
