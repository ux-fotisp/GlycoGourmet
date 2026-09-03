"use strict";

let createCoreRouter;
try {
  createCoreRouter = require("@strapi/strapi").factories.createCoreRouter;
} catch (err) {
  createCoreRouter = (uid, config) => config;
}

// Structurally exclude update and delete endpoints from the routing table
module.exports = createCoreRouter("api::audit-log-entry.audit-log-entry", {
  except: ["update", "delete"],
  config: {
    find: {},
    findOne: {},
    create: {},
  },
});
