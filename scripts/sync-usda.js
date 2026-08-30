'use strict';

// Ensure we set the process directory to the server directory so Strapi loads correctly
const path = require('path');
process.chdir(path.join(__dirname, '../server'));

const strapi = require('@strapi/strapi');

async function run() {
  const app = await strapi().load();
  try {
    const usdaSyncService = app.service('api::ingredient.usda-sync');
    if (!usdaSyncService) {
      throw new Error('usda-sync service not found');
    }
    
    app.log.info('Running manual USDA sync...');
    const result = await usdaSyncService.syncIngredients();
    app.log.info(`Sync complete. ${result.syncedCount} records updated.`);
    process.exit(0);
  } catch (error) {
    app.log.error('Failed to run USDA sync', error);
    process.exit(1);
  }
}

run();
