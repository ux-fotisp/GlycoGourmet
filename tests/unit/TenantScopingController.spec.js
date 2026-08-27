import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockServiceFind = vi.fn().mockResolvedValue({ results: [], pagination: {} });
const mockServiceFindOne = vi.fn().mockResolvedValue(null);

const mockStrapi = {
  service: vi.fn().mockReturnValue({
    find: mockServiceFind,
    findOne: mockServiceFindOne
  })
};

// Top-level mock
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

    // Wrap the returned controller with mock super methods
    const clientProfileControllerDef = require('../../server/src/api/client-profile/controllers/client-profile.js');
    const baseController = typeof clientProfileControllerDef === 'function' ? clientProfileControllerDef({ strapi: mockStrapi }) : clientProfileControllerDef;
    controller = {
      ...baseController,
      
      validateQuery: vi.fn().mockResolvedValue(true),
      sanitizeQuery: vi.fn().mockImplementation(async (ctx) => ({ ...ctx.query })),
      sanitizeOutput: vi.fn().mockImplementation(async (data) => data),
      transformResponse: vi.fn().mockImplementation((data, meta) => ({ data, meta }))
    };
  });

  const createContext = (userRole, userId, query = {}, params = {}) => ({
    state: {
      user: userRole ? { id: userId, roleType: userRole } : null
    },
    query,
    params,
    notFound: vi.fn().mockReturnValue('NOT_FOUND_ERROR')
  });

  describe('find() - GET /api/[entity]', () => {
    it('injects dietitian filter if user is a dietitian', async () => {
      const ctx = createContext('dietitian', 42, { sort: 'createdAt:desc' });
      await controller.find.call(controller, ctx);
      expect(mockServiceFind).toHaveBeenCalledWith(expect.objectContaining({
        sort: 'createdAt:desc',
        filters: { dietitian: 42 }
      }));
    });

    it('preserves existing filters and merges dietitian filter', async () => {
      const ctx = createContext('dietitian', 42, { filters: { name: 'John' } });
      await controller.find.call(controller, ctx);
      expect(mockServiceFind).toHaveBeenCalledWith(expect.objectContaining({
        filters: { name: 'John', dietitian: 42 }
      }));
    });

    it('does NOT inject dietitian filter for admin users', async () => {
      const ctx = createContext('admin', 99, { sort: 'createdAt:desc' });
      await controller.find.call(controller, ctx);
      expect(mockServiceFind).toHaveBeenCalledWith({
        sort: 'createdAt:desc'
      });
    });
  });

  describe('findOne() - GET /api/[entity]/:id', () => {
    it('injects dietitian filter into service call and returns notFound if null', async () => {
      const ctx = createContext('dietitian', 42, {}, { id: 100 });
      mockServiceFindOne.mockResolvedValue(null);
      const result = await controller.findOne.call(controller, ctx);
      expect(mockServiceFindOne).toHaveBeenCalledWith(100, expect.objectContaining({
        filters: { dietitian: 42 }
      }));
      expect(ctx.notFound).toHaveBeenCalled();
      expect(result).toBe('NOT_FOUND_ERROR');
    });

    it('returns notFound if entity belongs to a different dietitian (cross-tenant breach)', async () => {
      const ctx = createContext('dietitian', 42, {}, { id: 100 });
      mockServiceFindOne.mockResolvedValue({ id: 100, dietitian: { id: 99 } });
      const result = await controller.findOne.call(controller, ctx);
      expect(ctx.notFound).toHaveBeenCalled();
      expect(result).toBe('NOT_FOUND_ERROR');
    });

    it('returns entity if owner matches', async () => {
      const ctx = createContext('dietitian', 42, {}, { id: 100 });
      const fakeEntity = { id: 100, dietitian: { id: 42 }, name: 'Valid Client' };
      mockServiceFindOne.mockResolvedValue(fakeEntity);
      const result = await controller.findOne.call(controller, ctx);
      expect(ctx.notFound).not.toHaveBeenCalled();
      expect(result.data).toEqual(fakeEntity);
    });
  });
});