"use strict";

const { createCoreRouter } = require("@strapi/strapi").factories;

const policyConfig = { name: "global::is-dietitian-owner", config: { uid: "api::metabolic-target-calibration.metabolic-target-calibration" } };

module.exports = createCoreRouter("api::metabolic-target-calibration.metabolic-target-calibration", {
  config: {
    find: { policies: [policyConfig] },
    findOne: { policies: [policyConfig] },
    create: { policies: [policyConfig] },
    update: { policies: [policyConfig] },
    delete: { policies: [policyConfig] }
  }
});
