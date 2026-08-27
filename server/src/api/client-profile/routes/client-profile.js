"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

const policyConfig = { name: "global::is-dietitian-owner", config: { uid: "api::client-profile.client-profile" } };

module.exports = createCoreRouter("api::client-profile.client-profile", {
  config: {
    find: { policies: [policyConfig] },
    findOne: { policies: [policyConfig] },
    create: { policies: [policyConfig] },
    update: { policies: [policyConfig] },
    delete: { policies: [policyConfig] }
  }
});
