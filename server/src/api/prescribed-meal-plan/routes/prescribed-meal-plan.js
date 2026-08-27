"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

const policyConfig = { name: "global::is-dietitian-owner", config: { uid: "api::prescribed-meal-plan.prescribed-meal-plan" } };

module.exports = createCoreRouter("api::prescribed-meal-plan.prescribed-meal-plan", {
  config: {
    find: { policies: [policyConfig] },
    findOne: { policies: [policyConfig] },
    create: { policies: [policyConfig] },
    update: { policies: [policyConfig] },
    delete: { policies: [policyConfig] }
  }
});
