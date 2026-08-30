"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

const policyConfig = { name: "global::is-dietitian-owner", config: { uid: "api::smart-swap-rule.smart-swap-rule" } };

module.exports = createCoreRouter("api::smart-swap-rule.smart-swap-rule", {
  config: {
    find: { policies: [policyConfig] },
    findOne: { policies: [policyConfig] },
    create: { policies: [policyConfig] },
    update: { policies: [policyConfig] },
    delete: { policies: [policyConfig] }
  }
});
