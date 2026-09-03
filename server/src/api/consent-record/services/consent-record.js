"use strict";

let createCoreService;
try {
  createCoreService = require("@strapi/strapi").factories.createCoreService;
} catch (err) {
  createCoreService = (uid, factory) => factory;
}

module.exports = createCoreService("api::consent-record.consent-record");
