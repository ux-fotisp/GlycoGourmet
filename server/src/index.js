'use strict';

const bootstrapClinicTenant = require('./bootstrap');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/*{ strapi }*/) {},

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
