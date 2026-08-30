import { describe, it, expect, vi } from 'vitest';
import strapiServer from '../../server/src/extensions/users-permissions/strapi-server';

describe('Strapi User Update Security (Part A)', () => {
  it('Sanitizes privileged fields from PUT /api/users/:id payload', async () => {
    // 1. Mock the original plugin controllers
    const mockOriginalUpdate = vi.fn().mockResolvedValue({});
    const mockOriginalRegister = vi.fn().mockResolvedValue({});
    const mockOriginalCallback = vi.fn().mockResolvedValue({});
    
    const mockPlugin = {
      controllers: {
        user: { update: mockOriginalUpdate },
        auth: { register: mockOriginalRegister, callback: mockOriginalCallback }
      }
    };
    
    // 2. Apply our strapi-server overrides
    const extendedPlugin = strapiServer(mockPlugin);
    
    // 3. Construct a malicious request payload
    const ctx = {
      request: {
        body: {
          roleType: 'admin',
          isApproved: true,
          clientIds: [1, 2, 3],
          licenseId: 'FAKE-123',
          credential: 'MD',
          clinicName: 'Fake Clinic',
          preferences: ['Vegan'], // Legitimate field
          onboarded: true        // Legitimate field
        }
      }
    };
    
    // 4. Execute the overridden update controller
    await extendedPlugin.controllers.user.update(ctx);
    
    // 5. Assert the malicious fields were stripped before reaching the original controller
    expect(mockOriginalUpdate).toHaveBeenCalledWith(ctx);
    expect(ctx.request.body).not.toHaveProperty('roleType');
    expect(ctx.request.body).not.toHaveProperty('isApproved');
    expect(ctx.request.body).not.toHaveProperty('clientIds');
    expect(ctx.request.body).not.toHaveProperty('licenseId');
    expect(ctx.request.body).not.toHaveProperty('credential');
    expect(ctx.request.body).not.toHaveProperty('clinicName');
    
    // 6. Assert legitimate fields remain untouched
    expect(ctx.request.body).toHaveProperty('preferences');
    expect(ctx.request.body.preferences).toEqual(['Vegan']);
    expect(ctx.request.body.onboarded).toBe(true);
  });
});