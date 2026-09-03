'use strict';

let createCoreController;
try {
  createCoreController = require('@strapi/strapi').factories.createCoreController;
} catch (err) {
  createCoreController = (uid, factory) => factory;
}

module.exports = createCoreController('api::ingredient.ingredient', ({ strapi }) => ({
  async find(ctx) {
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const user = ctx.state.user;

    // Unauthenticated visitors: can read verified catalog ingredients and unowned/curated custom ingredients
    if (!user) {
      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        $or: [
          { isUserAuthored: false },
          { isUserAuthored: { $null: true } },
          { owner: { $null: true } },
        ],
      };
    }
    // Authenticated patients: can read verified catalog ingredients, unowned ingredients, and their own custom ingredients
    else if (user.roleType === 'user') {
      sanitizedQuery.filters = {
        ...(sanitizedQuery.filters || {}),
        $or: [
          { isUserAuthored: false },
          { isUserAuthored: { $null: true } },
          { owner: { $null: true } },
          { owner: user.id },
        ],
      };
    }
    // Staff (super_admin, admin, dietitian): unrestricted access to catalog and custom ingredients

    const entities = await strapi.entityService.findMany(
      'api::ingredient.ingredient',
      sanitizedQuery
    );

    const sanitizedEntities = await this.sanitizeOutput(entities, ctx);
    return this.transformResponse(sanitizedEntities);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    const entity = await strapi.entityService.findOne('api::ingredient.ingredient', id, {
      populate: ['owner'],
    });

    if (!entity) return ctx.notFound();

    const isCustom = entity.isUserAuthored === true;
    const ownerId = entity.owner?.id || entity.owner;

    // If it is a custom ingredient with an owner, conceal existence with 404 unless caller is owner or staff
    if (isCustom && ownerId) {
      if (!user) return ctx.notFound();

      const isStaff = user.roleType === 'admin' || user.roleType === 'super_admin' || user.roleType === 'dietitian';
      if (!isStaff && String(ownerId) !== String(user.id)) {
        return ctx.notFound(); // 404 concealment
      }
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (ctx.request.body && ctx.request.body.data) {
      if (user && user.roleType === 'user') {
        // Patient role: strictly scope to authenticated patient
        ctx.request.body.data.owner = user.id;
        ctx.request.body.data.isUserAuthored = true;
      } else if (user && (user.roleType === 'admin' || user.roleType === 'super_admin' || user.roleType === 'dietitian')) {
        // Staff role: catalog-curated ingredient
        ctx.request.body.data.isUserAuthored = true;
        ctx.request.body.data.owner = null;
      }
    }

    return await super.create(ctx);
  },
}));
