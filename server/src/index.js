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

    // Opt-in synthetic demo seeding hook for controlled staging/demo environments
    if (process.env.RUN_DEMO_SEED === 'true') {
      try {
        strapi.log?.info?.('[Bootstrap] RUN_DEMO_SEED=true detected. Executing demo seed hook...');
        const seedDemoData = require('../seed');
        await seedDemoData(strapi);
        strapi.log?.info?.('[Bootstrap] Demo seed hook completed successfully.');
      } catch (seedErr) {
        strapi.log?.error?.('[Bootstrap] Demo seed hook encountered an error:', seedErr);
      }
    }
  },
};
