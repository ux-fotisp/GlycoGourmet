"use strict";

let createCoreRouter;
try {
  createCoreRouter = require("@strapi/strapi").factories.createCoreRouter;
} catch (err) {
  createCoreRouter = (uid, config) => config;
}

const policyConfig = { name: "global::is-clinic-admin", config: { uid: "api::clinic.clinic" } };

module.exports = createCoreRouter("api::clinic.clinic", {
  config: {
    find: { policies: [policyConfig] },
    findOne: { policies: [policyConfig] },
    create: { policies: [policyConfig] },
    update: { policies: [policyConfig] },
    delete: { policies: [policyConfig] }
  }
});
