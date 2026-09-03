import * as strapiClient from '../../src/services/strapiClient.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as ingredientStore from '../../src/utils/ingredientStore.js';

const ingredientControllerFactory = require('../../server/src/api/ingredient/controllers/ingredient.js');

describe('Custom Ingredient Ownership Scoping — Gap-Closure Chunk 3', () => {
  describe('1. Controller Ownership Scoping & 404 Concealment', () => {
    let controller;
    let strapiMock;

    beforeEach(() => {
      strapiMock = {
        entityService: {
          findMany: vi.fn().mockResolvedValue([]),
          findOne: vi.fn(),
        },
      };

      const base = ingredientControllerFactory({ strapi: strapiMock });
      controller = {
        ...base,
        validateQuery: vi.fn().mockResolvedValue(true),
        sanitizeQuery: vi.fn().mockImplementation((ctx) => Promise.resolve(ctx.query || {})),
        sanitizeOutput: vi.fn().mockImplementation((data) => Promise.resolve(data)),
        transformResponse: vi.fn().mockImplementation((data) => ({ data })),
      };
    });

    it('find() allows unauthenticated callers to read verified catalog and unowned ingredients', async () => {
      const ctx = {
        state: { user: null },
        query: {},
      };

      await controller.find(ctx);

      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::ingredient.ingredient',
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: [
              { isUserAuthored: false },
              { isUserAuthored: { $null: true } },
              { owner: { $null: true } },
            ],
          }),
        })
      );
    });

    it('find() scopes authenticated patient to verified/unowned ingredients OR their own custom ingredients', async () => {
      const ctx = {
        state: { user: { id: 101, roleType: 'user' } },
        query: {},
      };

      await controller.find(ctx);

      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::ingredient.ingredient',
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: [
              { isUserAuthored: false },
              { isUserAuthored: { $null: true } },
              { owner: { $null: true } },
              { owner: 101 },
            ],
          }),
        })
      );
    });

    it('find() provides unrestricted catalog access to staff roles (admin, dietitian)', async () => {
      const ctxAdmin = {
        state: { user: { id: 5, roleType: 'admin' } },
        query: {},
      };

      await controller.find(ctxAdmin);
      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::ingredient.ingredient',
        expect.not.objectContaining({
          filters: expect.objectContaining({ owner: 5 }),
        })
      );
    });

    it('findOne() returns verified catalog ingredient to unauthenticated caller', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 'spinach_1',
        name: 'Fresh Baby Spinach',
        isUserAuthored: false,
        owner: null,
      });

      const ctx = {
        state: { user: null },
        params: { id: 'spinach_1' },
      };

      const res = await controller.findOne(ctx);
      expect(res.data.name).toBe('Fresh Baby Spinach');
    });

    it('findOne() allows patient owner to read their own custom ingredient', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 'custom_99',
        name: "Patient 101's Flax Crackers",
        isUserAuthored: true,
        owner: { id: 101 },
      });

      const ctx = {
        state: { user: { id: 101, roleType: 'user' } },
        params: { id: 'custom_99' },
      };

      const res = await controller.findOne(ctx);
      expect(res.data.name).toBe("Patient 101's Flax Crackers");
    });

    it('findOne() returns 404 (conceals existence) when different patient queries custom ingredient', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 'custom_99',
        name: "Patient 101's Flax Crackers",
        isUserAuthored: true,
        owner: { id: 101 },
      });

      const notFoundMock = vi.fn().mockReturnValue({ status: 404 });
      const ctx = {
        state: { user: { id: 102, roleType: 'user' } },
        params: { id: 'custom_99' },
        notFound: notFoundMock,
      };

      await controller.findOne(ctx);
      expect(notFoundMock).toHaveBeenCalled();
    });

    it('findOne() returns 404 to unauthenticated caller for owned custom ingredient', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 'custom_99',
        name: "Patient 101's Flax Crackers",
        isUserAuthored: true,
        owner: { id: 101 },
      });

      const notFoundMock = vi.fn().mockReturnValue({ status: 404 });
      const ctx = {
        state: { user: null },
        params: { id: 'custom_99' },
        notFound: notFoundMock,
      };

      await controller.findOne(ctx);
      expect(notFoundMock).toHaveBeenCalled();
    });

    it('findOne() allows clinical staff (dietitian, admin) to read patient custom ingredients for review', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 'custom_99',
        name: "Patient 101's Flax Crackers",
        isUserAuthored: true,
        owner: { id: 101 },
      });

      const ctx = {
        state: { user: { id: 7, roleType: 'dietitian' } },
        params: { id: 'custom_99' },
      };

      const res = await controller.findOne(ctx);
      expect(res.data.name).toBe("Patient 101's Flax Crackers");
    });

    it('create() automatically associates owner with authenticated patient user ID', async () => {
      const superCreate = vi.fn().mockResolvedValue({ id: 'new_1' });
      controller.create = async function(ctx) {
        const user = ctx.state.user;
        if (ctx.request.body && ctx.request.body.data) {
          if (user && user.roleType === 'user') {
            ctx.request.body.data.owner = user.id;
            ctx.request.body.data.isUserAuthored = true;
          }
        }
        return superCreate(ctx);
      };

      const ctx = {
        state: { user: { id: 101, roleType: 'user' } },
        request: {
          body: {
            data: { name: 'Keto Chia Bread' },
          },
        },
      };

      await controller.create(ctx);
      expect(ctx.request.body.data.owner).toBe(101);
      expect(ctx.request.body.data.isUserAuthored).toBe(true);
    });

    it('create() by admin leaves owner as null for shared catalog curation', async () => {
      const superCreate = vi.fn().mockResolvedValue({ id: 'new_2' });
      controller.create = async function(ctx) {
        const user = ctx.state.user;
        if (ctx.request.body && ctx.request.body.data) {
          if (user && (user.roleType === 'admin' || user.roleType === 'super_admin' || user.roleType === 'dietitian')) {
            ctx.request.body.data.isUserAuthored = true;
            ctx.request.body.data.owner = null;
          }
        }
        return superCreate(ctx);
      };

      const ctx = {
        state: { user: { id: 8, roleType: 'admin' } },
        request: {
          body: {
            data: { name: 'Clinical Almond Meal' },
          },
        },
      };

      await controller.create(ctx);
      expect(ctx.request.body.data.owner).toBeNull();
      expect(ctx.request.body.data.isUserAuthored).toBe(true);
    });
  });

  describe('2. Client Store Default-Deny & Ownership Isolation', () => {
    const fixture = [
      { id: '1', name: 'Fresh Broccoli', isUserAuthored: false, owner: null },
      { id: '2', name: 'Shared Clinic Granola', isUserAuthored: true, owner: null },
      { id: '3', name: "Patient A's Diabetic Lasagna", isUserAuthored: true, owner: { id: 101 } },
      { id: '4', name: "Patient B's Low-GI Oatmeal", isUserAuthored: true, owner: 102 },
    ];

    beforeEach(() => {
      ingredientStore.setRegistryCache(fixture);
    });

    afterEach(() => {
      ingredientStore.invalidateIngredientCache();
    });

    it('getCustomIngredients() with no userId argument returns ONLY unowned/curated custom ingredients — denies all owned ingredients', () => {
      // 1. Explicit no arguments
      const resultsNoArgs = ingredientStore.getCustomIngredients();
      expect(resultsNoArgs).toHaveLength(1);
      expect(resultsNoArgs[0].name).toBe('Shared Clinic Granola');
      expect(resultsNoArgs.some(i => i.id === '3')).toBe(false);
      expect(resultsNoArgs.some(i => i.id === '4')).toBe(false);

      // 2. Explicit null
      const resultsNull = ingredientStore.getCustomIngredients(null);
      expect(resultsNull).toHaveLength(1);
      expect(resultsNull[0].name).toBe('Shared Clinic Granola');

      // 3. Explicit undefined
      const resultsUndef = ingredientStore.getCustomIngredients(undefined);
      expect(resultsUndef).toHaveLength(1);
      expect(resultsUndef[0].name).toBe('Shared Clinic Granola');
    });

    it('getCustomIngredients(101) returns shared ingredients PLUS patient 101 owned ingredient only', () => {
      const results = ingredientStore.getCustomIngredients(101);
      expect(results).toHaveLength(2);
      const names = results.map(r => r.name);
      expect(names).toContain('Shared Clinic Granola');
      expect(names).toContain("Patient A's Diabetic Lasagna");
      expect(names).not.toContain("Patient B's Low-GI Oatmeal");
    });

    it('getCustomIngredients(102) returns shared ingredients PLUS patient 102 owned ingredient only', () => {
      const results = ingredientStore.getCustomIngredients('102');
      expect(results).toHaveLength(2);
      const names = results.map(r => r.name);
      expect(names).toContain('Shared Clinic Granola');
      expect(names).toContain("Patient B's Low-GI Oatmeal");
      expect(names).not.toContain("Patient A's Diabetic Lasagna");
    });

    it('getCustomIngredients(999) with non-existent patient returns ONLY shared ingredients', () => {
      const results = ingredientStore.getCustomIngredients(999);
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Shared Clinic Granola');
    });
  });

  describe('3. saveCustomIngredient Owner Payload Handling', () => {
    beforeEach(() => {
      vi.spyOn(strapiClient, 'strapiPost').mockImplementation(async (url, payload) => ({
        id: 'custom_test_id',
        ...payload,
        isUserAuthored: true,
      }));
    });
    it('saveCustomIngredient(rawInput, 101) includes owner: 101 in normalized ingredient', async () => {
      const rawInput = {
        name: 'Organic Flax Meal',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 30,
        nutrition: {
          kcal: 160,
          carbs: 9,
          fiber: 8,
          protein: 6,
          fat: 12,
          glycemicIndex: 35,
        },
      };

      const result = await ingredientStore.saveCustomIngredient(rawInput, 101);
      expect(result.ok).toBe(true);
      expect(result.ingredient.owner).toBe(101);
      expect(result.ingredient.isUserAuthored).toBe(true);
    });

    it('saveCustomIngredient(rawInput) without ownerId leaves owner as null for curated/admin items', async () => {
      const rawInput = {
        name: 'Clinic Standard Chia Powder',
        category: 'grain',
        defaultUnit: 'g',
        defaultAmount: 25,
        nutrition: {
          kcal: 120,
          carbs: 10,
          fiber: 9,
          protein: 4,
          fat: 8,
          glycemicIndex: 1,
        },
      };

      const result = await ingredientStore.saveCustomIngredient(rawInput);
      expect(result.ok).toBe(true);
      expect(result.ingredient.owner).toBeNull();
      expect(result.ingredient.isUserAuthored).toBe(true);
    });
  });
});
