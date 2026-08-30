import { describe, it, expect, vi } from 'vitest';
import auditLifecycles from '../../server/src/api/audit-record/content-types/audit-record/lifecycles';
import mealPlanLifecycles from '../../server/src/api/prescribed-meal-plan/content-types/prescribed-meal-plan/lifecycles';

describe('Lifecycle Gate Tests (Part C)', () => {

  describe('Audit Record Discrepancy Gate', () => {
    it('Flags and forces pending status when |deltaGL| > 1.0', () => {
      const event = {
        params: {
          data: {
            authorGL: 10.0,
            systemGL: 12.0, // Delta 2.0 (> 1.0)
            authorNetCarbs: 20.0,
            systemNetCarbs: 20.0,
            status: 'approved' // Malicious or eager caller trying to bypass
          }
        }
      };
      
      auditLifecycles.beforeCreate(event);
      
      expect(event.params.data.deltaGL).toBe(2.0);
      expect(event.params.data.deltaNetCarbs).toBe(0.0);
      expect(event.params.data.flagged).toBe(true);
      expect(event.params.data.status).toBe('pending'); // Coerced to pending
    });

    it('Flags and forces pending status when |deltaNetCarbs| > 1.0g', () => {
      const event = {
        params: {
          data: {
            authorGL: 10.0,
            systemGL: 10.0, 
            authorNetCarbs: 20.0,
            systemNetCarbs: 25.0, // Delta 5.0 (> 1.0)
            status: 'approved'
          }
        }
      };
      
      auditLifecycles.beforeUpdate(event);
      
      expect(event.params.data.flagged).toBe(true);
      expect(event.params.data.status).toBe('pending');
    });

    it('Does not flag when deltas are within threshold (<= 1.0)', () => {
      const event = {
        params: {
          data: {
            authorGL: 10.0,
            systemGL: 10.5, // Delta 0.5
            authorNetCarbs: 20.0,
            systemNetCarbs: 20.9, // Delta 0.9
            status: 'approved'
          }
        }
      };
      
      auditLifecycles.beforeCreate(event);
      
      expect(event.params.data.flagged).toBe(false);
      expect(event.params.data.status).toBe('approved'); // Remains untouched
    });
  });

  describe('Prescribed Meal Plan Unpublished Recipe Gate', () => {
    it('Rejects scheduling if any referenced recipe is a draft or unpublished', async () => {
      // Mock global strapi object
      global.strapi = {
        entityService: {
          findOne: vi.fn().mockImplementation((uid, id) => {
            if (id === '1') return { id: '1', status: 'published', publishedAt: new Date() };
            if (id === '2') return { id: '2', status: 'draft', publishedAt: null }; // Unpublished!
            return null;
          })
        }
      };

      const event = {
        params: {
          data: {
            scheduledSlots: {
              'monday': { breakfast: '1', lunch: '2' }
            }
          }
        }
      };

      await expect(mealPlanLifecycles.beforeCreate(event))
        .rejects
        .toThrow(/Clinical Safety Violation: Recipe "2" has status "draft"/);
    });

    it('Passes successfully if all recipes are published', async () => {
      global.strapi = {
        entityService: {
          findOne: vi.fn().mockImplementation((uid, id) => {
             // Both are published
             return { id, status: 'published', publishedAt: new Date() };
          })
        }
      };

      const event = {
        params: {
          data: {
            scheduledSlots: {
              'monday': { breakfast: '1', lunch: '3' }
            }
          }
        }
      };

      await expect(mealPlanLifecycles.beforeCreate(event)).resolves.toBeUndefined();
    });
  });
});