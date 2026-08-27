import { describe, it } from 'vitest';

describe.skip('Strapi Integration - Tenant Scoping', () => {
  it('Dietitian B cannot see ClientProfiles owned by Dietitian A via GET /api/client-profiles', async () => {
    // BLOCKING FINDING REPORTED TO ORCHESTRATOR:
    // 1. A full Strapi instance cannot be booted here because server/ lacks a valid Strapi project structure 
    //    (missing config/, database middlewares, package.json, and the @strapi/strapi dependency itself).
    // 2. Furthermore, in Strapi v4, injecting filters via policyContext.query.filters.dietitian = user.id 
    //    in a policy does NOT reliably reach the core ind controller's database query because the controller 
    //    re-parses ctx.request.query and runs sanitizeQuery, bypassing policy-level context mutations.
    // 
    // This requires a route middleware or an explicit controller override, which was forbidden to implement 
    // in this chunk per the PRD constraints ("do not silently patch it as a side quest").
  });
});