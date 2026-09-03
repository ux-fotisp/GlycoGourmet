"use strict";

let createCoreController;
try {
  createCoreController = require("@strapi/strapi").factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

module.exports = createCoreController("api::notification-preference.notification-preference", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Strictly restrict to user's own preferences
    sanitizedQuery.filters = {
      ...(sanitizedQuery.filters || {}),
      user: user.id,
    };

    const entities = await strapi.entityService.findMany(
      "api::notification-preference.notification-preference",
      sanitizedQuery
    );

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized();

    const entity = await strapi.entityService.findOne(
      "api::notification-preference.notification-preference",
      id,
      { populate: ["user"] }
    );

    if (!entity) return ctx.notFound();

    const ownerId = entity.user?.id || entity.user;
    if (String(ownerId) !== String(user.id)) {
      return ctx.notFound();
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    if (ctx.request.body && ctx.request.body.data) {
      ctx.request.body.data.user = user.id;
    }

    return await super.create(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    if (!user) return ctx.unauthorized();

    const entity = await strapi.entityService.findOne(
      "api::notification-preference.notification-preference",
      id,
      { populate: ["user"] }
    );

    if (!entity) return ctx.notFound();

    const ownerId = entity.user?.id || entity.user;
    if (String(ownerId) !== String(user.id)) {
      return ctx.forbidden("Cannot modify another user's notification preferences.");
    }

    return await super.update(ctx);
  },
}));
