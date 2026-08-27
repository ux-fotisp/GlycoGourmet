"use strict";
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::smart-swap-rule.smart-swap-rule", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    let query = { ...ctx.query };
    
    if (user && user.roleType === 'dietitian') {
      query = {
        ...query,
        filters: {
          ...(query.filters || {}),
          dietitian: user.id
        }
      };
    }
    
    // Use entityService directly to bypass sanitizeQuery limitations
    const results = await strapi.entityService.findMany("api::smart-swap-rule.smart-swap-rule", query);
    
    // Sanitize with contentAPI
    const sanitizedResults = await strapi.contentAPI.sanitize.output(results, strapi.getModel("api::smart-swap-rule.smart-swap-rule"), { auth: ctx.state.auth });
    return this.transformResponse(sanitizedResults);
  },
  
  async findOne(ctx) {
    const user = ctx.state.user;
    let query = { ...ctx.query };
    
    if (user && user.roleType === 'dietitian') {
      query = {
        ...query,
        filters: {
          ...(query.filters || {}),
          dietitian: user.id
        }
      };
    }
    
    const entity = await strapi.entityService.findOne("api::smart-swap-rule.smart-swap-rule", ctx.params.id, query);
    
    if (!entity) return ctx.notFound();
    if (user && user.roleType === 'dietitian') {
      const ownerId = entity.dietitian?.id || entity.dietitian;
      if (Number(ownerId) !== Number(user.id)) return ctx.notFound();
    }
    
    const sanitizedEntity = await strapi.contentAPI.sanitize.output(entity, strapi.getModel("api::smart-swap-rule.smart-swap-rule"), { auth: ctx.state.auth });
    return this.transformResponse(sanitizedEntity);
  }
}));