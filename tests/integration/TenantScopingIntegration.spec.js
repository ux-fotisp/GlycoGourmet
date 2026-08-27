import { describe, it, expect } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

describe('Strapi Integration - Tenant Scoping', () => {
  it('Dietitian B cannot see ClientProfiles owned by Dietitian A via GET /api/client-profiles', async () => {
    
    // Read seed data
    const seedPath = path.join(__dirname, '.seed_data.json');
    if (!fs.existsSync(seedPath)) {
      expect.fail('Seed data not found. Ensure server/seed.js ran successfully.');
    }
    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

    // 4. Authenticate as Dietitian B to get a JWT
    const authRes = await request('http://localhost:1337')
      .post('/api/auth/local')
      .send({
        identifier: seedData.dietitianBEmail,
        password: seedData.dietitianBPassword
      });
      
    if (authRes.status !== 200) {
      console.log('Diagnostic authRes.status:', authRes.status);
      console.log('Diagnostic authRes.body:', JSON.stringify(authRes.body, null, 2));
    }
      
    const jwtB = authRes.body.jwt;
    expect(jwtB).toBeDefined();

    // 5. Make a GET request to /api/client-profiles as Dietitian B
    const res = await request('http://localhost:1337')
      .get('/api/client-profiles')
      .set('Authorization', 'Bearer ' + jwtB);

    expect(res.status).toBe(200);

    // 6. Assert that ClientProfile A is NOT in the results
    const returnedProfiles = res.body.data;
    // Since Dietitian B has no clients, it should just be empty
    expect(returnedProfiles.length).toBe(0);
  });
});
