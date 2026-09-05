'use strict';

const bootstrapClinicTenant = require('./bootstrap');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    if (strapi && strapi.server && typeof strapi.server.routes === 'function') {
      strapi.server.routes([
        {
          method: 'GET',
          path: '/_health',
          handler: async (ctx) => {
            ctx.status = 200;
            ctx.body = {
              status: 'ok',
              timestamp: new Date().toISOString(),
            };
          },
          config: {
            auth: false,
          },
        },
        {
          method: 'GET',
          path: '/api/health',
          handler: async (ctx) => {
            ctx.status = 200;
            ctx.body = {
              status: 'ok',
              timestamp: new Date().toISOString(),
            };
          },
          config: {
            auth: false,
          },
        },
      ]);
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    if (bootstrapClinicTenant) {
      await bootstrapClinicTenant({ strapi });
    }
  },
};
