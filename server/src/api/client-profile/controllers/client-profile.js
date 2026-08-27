"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::client-profile.client-profile", ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (user && user.roleType === 'dietitian') {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          dietitian: user.id
        }
      };
    }
    return super.find(ctx);
  },
  
  async findOne(ctx) {
    const user = ctx.state.user;
    if (user && user.roleType === 'dietitian') {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          dietitian: user.id
        }
      };
    }
    return super.findOne(ctx);
  }
}));