import { describe, it, expect } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

const seedPath = path.join(__dirname, '.seed_data.json');
const hasSeed = fs.existsSync(seedPath);

describe('Strapi Integration - Tenant Scoping', () => {
  it.skipIf(!hasSeed)('Verifies end-to-end tenant isolation for ClientProfiles', async () => {
    if (!hasSeed) {
      console.log('Skipping live Strapi integration test: no .seed_data.json present (requires live Strapi instance).');
      return;
    }
    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

    // --- a. Dietitian B successfully receives a real JWT ---
    const authResB = await request('http://localhost:1337')
      .post('/api/auth/local')
      .send({
        identifier: seedData.dietitianBEmail,
        password: seedData.dietitianBPassword
      });
      
    if (authResB.status !== 200) {
      console.log('authResB.status:', authResB.status);
      console.log('authResB.body:', JSON.stringify(authResB.body));
    }
      
    const jwtB = authResB.body.jwt;
    expect(jwtB).toBeDefined();

    // --- b & c. Dietitian B receives HTTP 200 for GET /api/client-profiles but sees no ClientProfile owned by Dietitian A ---
    const meRes = await request('http://localhost:1337')
      .get('/api/users/me?populate=role')
      .set('Authorization', 'Bearer ' + jwtB);
    console.log('Diagnostic /api/users/me status:', meRes.status);
    console.log('Diagnostic /api/users/me body:', JSON.stringify(meRes.body, null, 2));

    const resB = await request('http://localhost:1337')
      .get('/api/client-profiles')
      .set('Authorization', 'Bearer ' + jwtB);

    if (resB.status !== 200) {
      console.log('Diagnostic resB.status:', resB.status);
      console.log('Diagnostic resB.body:', JSON.stringify(resB.body, null, 2));
    }
    
    // --- DIAGNOSTIC BLOCK (PHASE 2) ---
    console.log('Diagnostic resB error name/message:', resB.body?.error?.name, resB.body?.error?.message);
    // ----------------------------------

    expect(resB.status).toBe(200);
    const profilesB = resB.body.data;
    expect(profilesB.length).toBe(0); // Should be completely empty since B has no clients

    // --- d. Dietitian A can retrieve their own ClientProfile ---
    const authResA = await request('http://localhost:1337')
      .post('/api/auth/local')
      .send({
        identifier: seedData.dietitianAEmail,
        password: seedData.dietitianAPassword
      });
    const jwtA = authResA.body.jwt;
    expect(jwtA).toBeDefined();

    const resA = await request('http://localhost:1337')
      .get('/api/client-profiles')
      .set('Authorization', 'Bearer ' + jwtA);

    expect(resA.status).toBe(200);
    const profilesA = resA.body.data;
    expect(profilesA.length).toBeGreaterThan(0);
    expect(profilesA[0].id).toBe(seedData.profileAId);

    // --- e. An admin can retrieve ClientProfile records across tenants ---
    const authResAdmin = await request('http://localhost:1337')
      .post('/api/auth/local')
      .send({
        identifier: seedData.adminAEmail,
        password: seedData.adminAPassword
      });
    const jwtAdmin = authResAdmin.body.jwt;
    expect(jwtAdmin).toBeDefined();

    const resAdmin = await request('http://localhost:1337')
      .get('/api/client-profiles')
      .set('Authorization', 'Bearer ' + jwtAdmin);

    expect(resAdmin.status).toBe(200);
    const profilesAdmin = resAdmin.body.data;
    // Admin sees all clients (which is at least 1)
    expect(profilesAdmin.length).toBeGreaterThan(0);

    // --- f. A normal patient/user account receives denial for the dietitian-only client-profile route ---
    const authResPatient = await request('http://localhost:1337')
      .post('/api/auth/local')
      .send({
        identifier: seedData.patientAEmail,
        password: seedData.patientAPassword
      });
    const jwtPatient = authResPatient.body.jwt;
    expect(jwtPatient).toBeDefined();

    const resPatient = await request('http://localhost:1337')
      .get('/api/client-profiles')
      .set('Authorization', 'Bearer ' + jwtPatient);

    // Should be denied (Forbidden) because is-dietitian-owner prevents users with roleType 'user'
    expect([403, 401]).toContain(resPatient.status);
  });
});
