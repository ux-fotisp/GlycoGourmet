import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

// Dynamically require supertest and strapi inside the test blocks so Vitest doesn't crash 
// during discovery if the dependencies are absent in the host environment.
let strapiInstance;
let server;

describe('Strapi Integration - Tenant Scoping', () => {
  beforeAll(async () => {
    // We only load Strapi if we are actually running inside the container or a valid env
    try {
      const Strapi = require('@strapi/strapi');
      if (!global.strapi) {
        strapiInstance = await Strapi({ distDir: './server/dist', appDir: './server' }).load();
        strapiInstance.server.mount();
        server = strapiInstance.server.httpServer;
      } else {
        strapiInstance = global.strapi;
        server = strapiInstance.server.httpServer;
      }
    } catch (e) {
      console.warn('Strapi could not be booted locally. Ensure this is running in Docker.');
    }
  }, 30000);

  afterAll(async () => {
    if (strapiInstance && !global.strapi) await strapiInstance.destroy();
  });

  it('Dietitian B cannot see ClientProfiles owned by Dietitian A via GET /api/client-profiles', async () => {
    if (!server) {
      // If server failed to boot, fail the test explicitly
      expect.fail('Strapi server not available. Must run inside Docker.');
    }

    // 1. Create Dietitian A
    const dietitianA = await strapiInstance.entityService.create('plugin::users-permissions.user', {
      data: {
        username: 'dietitianA_' + Date.now(),
        email: 'dietitiana' + Date.now() + '@glyco.com',
        password: 'Password123!',
        roleType: 'dietitian',
        confirmed: true
      }
    });

    // 2. Create Dietitian B
    const dietitianB = await strapiInstance.entityService.create('plugin::users-permissions.user', {
      data: {
        username: 'dietitianB_' + Date.now(),
        email: 'dietitianb' + Date.now() + '@glyco.com',
        password: 'Password123!',
        roleType: 'dietitian',
        confirmed: true
      }
    });

    // 3. Create a ClientProfile owned by Dietitian A
    const clientForA = await strapiInstance.entityService.create('api::client-profile.client-profile', {
      data: {
        userId: 'client_123',
        dietitian: dietitianA.id,
        currentWeight: 150
      }
    });

    // 4. Authenticate as Dietitian B to get a JWT
    const authRes = await request(server)
      .post('/api/auth/local')
      .send({
        identifier: dietitianB.email,
        password: 'Password123!'
      });
      
    const jwtB = authRes.body.jwt;
    expect(jwtB).toBeDefined();

    // 5. Make a GET request to /api/client-profiles as Dietitian B
    const res = await request(server)
      .get('/api/client-profiles')
      .set('Authorization', \Bearer \\);

    expect(res.status).toBe(200);

    // 6. Assert that ClientProfile A is NOT in the results
    const returnedProfiles = res.body.data;
    const found = returnedProfiles.find(p => p.id === clientForA.id);
    
    // Chunk 13 fix: this should now correctly be undefined due to the custom controller override
    expect(found).toBeUndefined();
  });
});
