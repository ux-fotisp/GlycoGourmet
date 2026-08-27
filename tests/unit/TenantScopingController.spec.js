import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks for strapi.entityService
const mockEntityServiceFindMany = vi.fn().mockResolvedValue([]);
const mockEntityServiceFindOne = vi.fn().mockResolvedValue(null);

const mockStrapi = {
  entityService: {
    findMany: mockEntityServiceFindMany,
    findOne: mockEntityServiceFindOne,
  }
};

// Mock @strapi/strapi factories
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreController: (uid, definitionFn) => {
      return definitionFn({ strapi: mockStrapi });
    }
  }
}));

describe('Tenant Scoping - Controller Override (Part C)', () => {
  let controller;

  beforeEach(() => {
    vi.clearAllMocks();

    const clientProfileControllerDef = require('../../server/src/api/client-profile/controllers/client-profile.js');
    const baseController =
      typeof clientProfileControllerDef === 'function'
        ? clientProfileControllerDef({ strapi: mockStrapi })
        : clientProfileControllerDef;

    controller = {
      ...baseController,
      validateQuery: vi.fn().mockResolvedValue(true),
      sanitizeQuery: vi.fn().mockImplementation(async (ctx) => ({ ...ctx.query })),
      sanitizeOutput: vi.fn().mockImplementation(async (data) => data),
      transformResponse: vi.fn().mockImplementation((data, meta) => ({ data, meta })),
    };
  });

  const createContext = (userRole, userId, query = {}, params = {}) => ({
    state: { user: userRole ? { id: userId, roleType: userRole } : null },
    query,
    params,
    notFound: vi.fn().mockReturnValue('NOT_FOUND_ERROR'),
  });

  describe('find() - GET /api/[entity]', () => {
    it('injects dietitian filter when user is a dietitian', async () => {
      const ctx = createContext('dietitian', 42, { sort: 'createdAt:desc' });
      await controller.find.call(controller, ctx);
      expect(mockEntityServiceFindMany).toHaveBeenCalledWith(
        'api::client-profile.client-profile',
        expect.objectContaining({ filters: { dietitian: 42 } })
      );
    });

    it('preserves existing filters and merges dietitian filter', async () => {
      const ctx = createContext('dietitian', 42, { filters: { name: 'John' } });
      await controller.find.call(controller, ctx);
      expect(mockEntityServiceFindMany).toHaveBeenCalledWith(
        'api::client-profile.client-profile',
        expect.objectContaining({ filters: { name: 'John', dietitian: 42 } })
      );
    });

    it('does NOT inject dietitian filter for admin users', async () => {
      const ctx = createContext('admin', 99, { sort: 'createdAt:desc' });
      await controller.find.call(controller, ctx);
      // Called without a dietitian filter
      const calledWith = mockEntityServiceFindMany.mock.calls[0][1];
      expect(calledWith.filters?.dietitian).toBeUndefined();
    });
  });

  describe('findOne() - GET /api/[entity]/:id', () => {
    it('returns notFound if entity is null', async () => {
      const ctx = createContext('dietitian', 42, {}, { id: 100 });
      mockEntityServiceFindOne.mockResolvedValue(null);
      const result = await controller.findOne.call(controller, ctx);
      expect(ctx.notFound).toHaveBeenCalled();
      expect(result).toBe('NOT_FOUND_ERROR');
    });

    it('returns notFound if entity belongs to a different dietitian (cross-tenant block)', async () => {
      const ctx = createContext('dietitian', 42, {}, { id: 100 });
      mockEntityServiceFindOne.mockResolvedValue({ id: 100, dietitian: { id: 99 } });
      const result = await controller.findOne.call(controller, ctx);
      expect(ctx.notFound).toHaveBeenCalled();
      expect(result).toBe('NOT_FOUND_ERROR');
    });

    it('returns entity when owner matches (no cross-tenant breach)', async () => {
      const ctx = createContext('dietitian', 42, {}, { id: 100 });
      const fakeEntity = { id: 100, dietitian: { id: 42 }, name: 'Valid Client' };
      mockEntityServiceFindOne.mockResolvedValue(fakeEntity);
      const result = await controller.findOne.call(controller, ctx);
      expect(ctx.notFound).not.toHaveBeenCalled();
      expect(result.data).toEqual(fakeEntity);
    });
  });
});
