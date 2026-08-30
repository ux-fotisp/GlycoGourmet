"use strict";

let createCoreController;
try {
  createCoreController = require("@strapi/strapi").factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

module.exports = createCoreController("api::metabolic-target-calibration.metabolic-target-calibration", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    if (user && user.roleType === "dietitian") {
      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        dietitian: user.id,
      };
    }

    const entities = await strapi.entityService.findMany(
      "api::metabolic-target-calibration.metabolic-target-calibration",
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

    const entity = await strapi.entityService.findOne(
      "api::metabolic-target-calibration.metabolic-target-calibration",
      id,
      sanitizedQuery
    );

    if (!entity) return ctx.notFound();

    if (user && user.roleType === "dietitian") {
      const ownerId = entity.dietitian?.id || entity.dietitian;
      if (Number(ownerId) !== Number(user.id)) return ctx.notFound();
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
