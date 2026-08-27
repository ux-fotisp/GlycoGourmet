import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

let strapiInstance;

describe('Strapi Integration - Tenant Scoping', () => {
  beforeAll(async () => {
    try {
      const Strapi = require('@strapi/strapi');
      if (!global.strapi) {
        strapiInstance = await Strapi({ distDir: './server/dist', appDir: './server', serveAdminPanel: false }).load();
      } else {
        strapiInstance = global.strapi;
      }
    } catch (e) {
      console.warn('Strapi could not be booted locally. Ensure this is running in CI/Docker.');
    }
  }, 30000);

  afterAll(async () => {
    if (strapiInstance && !global.strapi) await strapiInstance.destroy();
  });

  it('Dietitian B cannot see ClientProfiles owned by Dietitian A via GET /api/client-profiles', async () => {
    if (!strapiInstance) {
      expect.fail('Strapi server not available. Must run inside Docker/CI.');
    }

    const dietitianA = await strapiInstance.entityService.create('plugin::users-permissions.user', {
      data: {
        username: 'dietitianA_' + Date.now(),
        email: 'dietitiana' + Date.now() + '@glyco.com',
        password: 'Password123!',
        roleType: 'dietitian',
        confirmed: true
      }
    });

    const dietitianB = await strapiInstance.entityService.create('plugin::users-permissions.user', {
      data: {
        username: 'dietitianB_' + Date.now(),
        email: 'dietitianb' + Date.now() + '@glyco.com',
        password: 'Password123!',
        roleType: 'dietitian',
        confirmed: true
      }
    });

    const clientForA = await strapiInstance.entityService.create('api::client-profile.client-profile', {
      data: {
        userId: 'client_123',
        dietitian: dietitianA.id,
        currentWeight: 150
      }
    });

    const authRes = await request('http://localhost:1337')
      .post('/api/auth/local')
      .send({
        identifier: dietitianB.email,
        password: 'Password123!'
      });
      
    const jwtB = authRes.body.jwt;
    expect(jwtB).toBeDefined();

    const res = await request('http://localhost:1337')
      .get('/api/client-profiles')
      .set('Authorization', Bearer );

    expect(res.status).toBe(200);

    const returnedProfiles = res.body.data;
    const found = returnedProfiles.find(p => p.id === clientForA.id);
    
    expect(found).toBeUndefined();
  });
});