'use strict';

let createCoreRouter;
try {
  createCoreRouter = require('@strapi/strapi').factories.createCoreRouter;
} catch (err) {
  createCoreRouter = (uid, config) => config;
}

module.exports = createCoreRouter('api::ingredient.ingredient');
