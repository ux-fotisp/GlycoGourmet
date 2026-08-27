"use strict";
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::metabolic-target-calibration.metabolic-target-calibration", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    
    const query = { ...ctx.query };
    if (user && user.roleType === 'dietitian') {
      query.filters = {
        ...(query.filters || {}),
        dietitian: user.id
      };
    }
    
    // Bypass validation entirely and use entityService
    const { results, pagination } = await strapi.service("api::metabolic-target-calibration.metabolic-target-calibration").find(query);
    
    // Use the native sanitize function
    const sanitizedResults = await strapi.contentAPI.sanitize.output(results, strapi.getModel("api::metabolic-target-calibration.metabolic-target-calibration"), { auth: ctx.state.auth });
    return this.transformResponse(sanitizedResults, { pagination });
  },
  
  async findOne(ctx) {
    const user = ctx.state.user;
    const query = { ...ctx.query };
    
    if (user && user.roleType === 'dietitian') {
      query.filters = {
        ...(query.filters || {}),
        dietitian: user.id
      };
    }
    
    const entity = await strapi.service("api::metabolic-target-calibration.metabolic-target-calibration").findOne(ctx.params.id, query);
    
    if (!entity) return ctx.notFound();
    if (user && user.roleType === 'dietitian') {
      const ownerId = entity.dietitian?.id || entity.dietitian;
      if (Number(ownerId) !== Number(user.id)) return ctx.notFound();
    }
    
    const sanitizedEntity = await strapi.contentAPI.sanitize.output(entity, strapi.getModel("api::metabolic-target-calibration.metabolic-target-calibration"), { auth: ctx.state.auth });
    return this.transformResponse(sanitizedEntity);
  }
}));