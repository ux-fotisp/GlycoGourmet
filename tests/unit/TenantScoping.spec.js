import { describe, it, expect, vi, beforeEach } from 'vitest';
import isDietitianOwner from '../../server/src/policies/is-dietitian-owner';

describe('Tenant Scoping Policy (is-dietitian-owner) Security', () => {
  let mockStrapi;
  let mockConfig;

  beforeEach(() => {
    mockConfig = { uid: 'api::test.test' };
    mockStrapi = {
      entityService: {
        findOne: vi.fn(),
      }
    };
  });

  const createContext = (method, userRole, userId, params = {}, query = {}, bodyData = {}) => ({
    request: {
      method,
      body: { data: bodyData }
    },
    state: {
      user: userRole ? { id: userId, roleType: userRole } : null
    },
    query,
    params
  });

  describe('Unauthenticated and Patients', () => {
    it('Rejects unauthenticated requests', async () => {
      const ctx = createContext('GET', null, null);
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Rejects patient/user role entirely', async () => {
      const ctx = createContext('GET', 'user', 1);
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });
  });

  describe('Admin Role', () => {
    it('Permits admin cross-tenant access without filters', async () => {
      const ctx = createContext('GET', 'admin', 99);
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
      expect(ctx.query.filters).toBeUndefined(); // Filters not injected
    });
  });

  describe('Dietitian Role (GET)', () => {
    it('Permits the request and delegates filter injection to controller overrides', async () => {
      const ctx = createContext('GET', 'dietitian', 42);
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
      // Ensure it doesn't mutate ctx.query anymore (handled by controller)
      expect(ctx.query.filters).toBeUndefined();
    });
  });

  describe('Dietitian Role (POST)', () => {
    it('Overrides body payload to assign ownership to the authenticated dietitian', async () => {
      // Even if they try to assign it to dietitian 99
      const ctx = createContext('POST', 'dietitian', 42, {}, {}, { dietitian: 99, name: 'Plan A' });
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
      expect(ctx.request.body.data.dietitian).toBe(42); // Coerced to 42
    });
  });

  describe('Dietitian Role (PUT / DELETE)', () => {
    it('Permits if target record belongs to the dietitian', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue({
        id: 100,
        dietitian: { id: 42 } // Belongs to 42
      });
      const ctx = createContext('PUT', 'dietitian', 42, { id: 100 }, {}, { name: 'Updated' });
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
      expect(mockStrapi.entityService.findOne).toHaveBeenCalledWith('api::test.test', 100, expect.any(Object));
    });

    it('Rejects if target record belongs to another dietitian (Cross-tenant breach attempt)', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue({
        id: 100,
        dietitian: { id: 99 } // Belongs to 99, not 42
      });
      const ctx = createContext('PUT', 'dietitian', 42, { id: 100 });
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false); // 403 Forbidden
    });
    
    it('Strips ownership reassignment attempts during PUT', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue({
        id: 100,
        dietitian: { id: 42 } // Valid owner
      });
      // Attacker tries to transfer record to dietitian 99
      const ctx = createContext('PUT', 'dietitian', 42, { id: 100 }, {}, { dietitian: 99 });
      const result = await isDietitianOwner(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
      expect(ctx.request.body.data.dietitian).toBe(42); // Coerced back to 42
    });
  });
});