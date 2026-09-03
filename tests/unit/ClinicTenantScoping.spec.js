import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Import policy and controller
const isClinicAdminPolicy = require('../../server/src/policies/is-clinic-admin.js');
const clinicControllerFactory = require('../../server/src/api/clinic/controllers/clinic.js');
const bootstrapClinicTenant = require('../../server/src/bootstrap.js');
import { getClinicDetails, getClinicDietitians, mockClinic } from '../../src/utils/clientStore.js';

describe('Multi-Tenant Clinic Backend Foundation — Gap-Closure Chunk 1', () => {

  describe('1. Byte-for-Byte Invariance: FORBIDDEN_CLINICAL_UIDS in is-clinic-admin.js', () => {
    it('guarantees FORBIDDEN_CLINICAL_UIDS is strictly and byte-for-byte identical to baseline', () => {
      const policySource = fs.readFileSync(
        path.resolve(__dirname, '../../server/src/policies/is-clinic-admin.js'),
        'utf8'
      );

      const expectedArraySnippet = `const FORBIDDEN_CLINICAL_UIDS = [
  'api::client-profile.client-profile',
  'api::metabolic-target-calibration.metabolic-target-calibration',
  'api::prescribed-meal-plan.prescribed-meal-plan',
  'api::smart-swap-rule.smart-swap-rule',
];`;

      expect(policySource.replace(/\r\n/g, '\n')).toContain(expectedArraySnippet);
    });
  });

  describe('2. Hard PHI & Clinical Data Wall: clinic_admin receives 403 / rejection on all 4 clinical UIDs', () => {
    const forbiddenUids = [
      'api::client-profile.client-profile',
      'api::metabolic-target-calibration.metabolic-target-calibration',
      'api::prescribed-meal-plan.prescribed-meal-plan',
      'api::smart-swap-rule.smart-swap-rule',
    ];

    forbiddenUids.forEach((uid) => {
      it(`strictly rejects clinic_admin access to clinical UID: ${uid}`, async () => {
        const policyContext = {
          state: {
            user: {
              id: 10,
              roleType: 'clinic_admin',
              clinicId: 'clinic-glycemic-wellness',
            },
          },
          request: { method: 'GET' },
          params: {},
        };
        const config = { uid };

        const allowed = await isClinicAdminPolicy(policyContext, config, { strapi: {} });
        expect(allowed).toBe(false);
      });
    });
  });

  describe('3. Tenant Isolation on api::clinic via is-clinic-admin Policy', () => {
    it('permits clinic_admin with assigned clinic to read clinic data (GET)', async () => {
      const policyContext = {
        state: {
          user: {
            id: 10,
            roleType: 'clinic_admin',
            clinicId: 'clinic-glycemic-wellness',
          },
        },
        request: { method: 'GET' },
        params: {},
      };
      const config = { uid: 'api::clinic.clinic' };

      const allowed = await isClinicAdminPolicy(policyContext, config, { strapi: {} });
      expect(allowed).toBe(true);
    });

    it('permits affiliated dietitian to read clinic tenant details (GET)', async () => {
      const policyContext = {
        state: {
          user: {
            id: 20,
            roleType: 'dietitian',
            clinicId: 'clinic-glycemic-wellness',
          },
        },
        request: { method: 'GET' },
        params: {},
      };
      const config = { uid: 'api::clinic.clinic' };

      const allowed = await isClinicAdminPolicy(policyContext, config, { strapi: {} });
      expect(allowed).toBe(true);
    });

    it('denies standard patient user from accessing api::clinic', async () => {
      const policyContext = {
        state: {
          user: {
            id: 30,
            roleType: 'user',
            clinicId: 'clinic-glycemic-wellness',
          },
        },
        request: { method: 'GET' },
        params: {},
      };
      const config = { uid: 'api::clinic.clinic' };

      const allowed = await isClinicAdminPolicy(policyContext, config, { strapi: {} });
      expect(allowed).toBe(false);
    });

    it('denies clinic_admin update (PUT) across tenants (attempting to update clinic-102 while belonging to clinic-101)', async () => {
      const strapiMock = {
        entityService: {
          findOne: vi.fn().mockResolvedValue({
            id: 'clinic-102',
            slug: 'clinic-102',
          }),
        },
      };

      const policyContext = {
        state: {
          user: {
            id: 10,
            roleType: 'clinic_admin',
            clinicId: 'clinic-101',
          },
        },
        request: { method: 'PUT', body: { data: { name: 'Breached Name' } } },
        params: { id: 'clinic-102' },
      };
      const config = { uid: 'api::clinic.clinic' };

      const allowed = await isClinicAdminPolicy(policyContext, config, { strapi: strapiMock });
      expect(allowed).toBe(false);
    });

    it('allows clinic_admin update (PUT) on their own clinic tenant record', async () => {
      const strapiMock = {
        entityService: {
          findOne: vi.fn().mockResolvedValue({
            id: 'clinic-101',
            slug: 'clinic-101',
          }),
        },
      };

      const policyContext = {
        state: {
          user: {
            id: 10,
            roleType: 'clinic_admin',
            clinicId: 'clinic-101',
          },
        },
        request: { method: 'PUT', body: { data: { name: 'Updated Name' } } },
        params: { id: 'clinic-101' },
      };
      const config = { uid: 'api::clinic.clinic' };

      const allowed = await isClinicAdminPolicy(policyContext, config, { strapi: strapiMock });
      expect(allowed).toBe(true);
    });

    it('super_admin bypasses tenant restrictions on all methods', async () => {
      const policyContext = {
        state: {
          user: {
            id: 1,
            roleType: 'super_admin',
          },
        },
        request: { method: 'PUT' },
        params: { id: 'any-clinic' },
      };
      const config = { uid: 'api::clinic.clinic' };

      const allowed = await isClinicAdminPolicy(policyContext, config, { strapi: {} });
      expect(allowed).toBe(true);
    });
  });

  describe('4. Clinic Core Controller Tenant Enforcement', () => {
    let controller;
    let strapiMock;

    beforeEach(() => {
      strapiMock = {
        entityService: {
          findMany: vi.fn().mockResolvedValue([
            { id: 'clinic-101', name: 'Clinic 101' },
          ]),
          findOne: vi.fn().mockImplementation((uid, id) => {
            if (id === 'clinic-101') return Promise.resolve({ id: 'clinic-101', name: 'Clinic 101' });
            if (id === 'clinic-102') return Promise.resolve({ id: 'clinic-102', name: 'Clinic 102' });
            return Promise.resolve(null);
          }),
        },
      };

      // Create core controller instance with mocked base methods
      const baseController = clinicControllerFactory({ strapi: strapiMock });
      controller = {
        ...baseController,
        validateQuery: vi.fn().mockResolvedValue(true),
        sanitizeQuery: vi.fn().mockImplementation((ctx) => Promise.resolve(ctx.query || {})),
        sanitizeOutput: vi.fn().mockImplementation((data) => Promise.resolve(data)),
        transformResponse: vi.fn().mockImplementation((data) => ({ data })),
      };
    });

    it('find() automatically restricts clinic_admin to their own clinicId', async () => {
      const ctx = {
        state: {
          user: { id: 10, roleType: 'clinic_admin', clinicId: 'clinic-101' },
        },
        query: {},
      };

      await controller.find(ctx);
      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::clinic.clinic',
        expect.objectContaining({
          filters: expect.objectContaining({ id: 'clinic-101' }),
        })
      );
    });

    it('find() does NOT restrict super_admin to a single clinicId', async () => {
      const ctx = {
        state: {
          user: { id: 1, roleType: 'super_admin' },
        },
        query: {},
      };

      await controller.find(ctx);
      const callArgs = strapiMock.entityService.findMany.mock.calls[0];
      expect(callArgs[0]).toBe('api::clinic.clinic');
      expect(callArgs[1]?.filters?.id).toBeUndefined();
    });

    it('findOne() returns notFound if caller attempts to read another clinic tenant', async () => {
      const notFoundMock = vi.fn().mockReturnValue({ status: 404 });
      const ctx = {
        state: {
          user: { id: 10, roleType: 'clinic_admin', clinicId: 'clinic-101' },
        },
        params: { id: 'clinic-102' },
        notFound: notFoundMock,
      };

      await controller.findOne(ctx);
      expect(notFoundMock).toHaveBeenCalled();
    });

    it('findOne() allows reading own clinic tenant', async () => {
      const ctx = {
        state: {
          user: { id: 10, roleType: 'clinic_admin', clinicId: 'clinic-101' },
        },
        params: { id: 'clinic-101' },
        notFound: vi.fn(),
      };

      const res = await controller.findOne(ctx);
      expect(res.data).toEqual({ id: 'clinic-101', name: 'Clinic 101' });
    });
  });

  describe('5. Backward-Compatible Bootstrap Backfill (server/src/bootstrap.js)', () => {
    it('creates default clinic if not existing and backfills orphaned dietitians and client profiles', async () => {
      const defaultClinicRecord = {
        id: 1,
        slug: 'clinic-glycemic-wellness',
        name: 'Glycemic Wellness Center',
      };

      const unassignedDietitians = [
        { id: 2, roleType: 'dietitian', clinic: null },
      ];

      const unassignedProfiles = [
        { id: 100, clinic: null },
        { id: 101, clinic: null },
      ];

      const strapiMock = {
        entityService: {
          findMany: vi.fn().mockImplementation((uid, opts) => {
            if (uid === 'api::clinic.clinic') return Promise.resolve([]); // Not existing yet
            if (uid === 'plugin::users-permissions.user') return Promise.resolve(unassignedDietitians);
            if (uid === 'api::client-profile.client-profile') return Promise.resolve(unassignedProfiles);
            return Promise.resolve([]);
          }),
          create: vi.fn().mockResolvedValue(defaultClinicRecord),
          update: vi.fn().mockResolvedValue({ success: true }),
        },
        log: { info: vi.fn(), warn: vi.fn() },
      };

      await bootstrapClinicTenant({ strapi: strapiMock });

      expect(strapiMock.entityService.create).toHaveBeenCalledWith(
        'api::clinic.clinic',
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'clinic-glycemic-wellness',
            name: 'Glycemic Wellness Center',
            tier: 'CLINIC_PRO',
          }),
        })
      );

      expect(strapiMock.entityService.update).toHaveBeenCalledWith(
        'plugin::users-permissions.user',
        2,
        { data: { clinic: 1 } }
      );

      expect(strapiMock.entityService.update).toHaveBeenCalledWith(
        'api::client-profile.client-profile',
        100,
        { data: { clinic: 1 } }
      );
      expect(strapiMock.entityService.update).toHaveBeenCalledWith(
        'api::client-profile.client-profile',
        101,
        { data: { clinic: 1 } }
      );
    });
  });

  describe('6. Client Store Resilience: getClinicDetails & getClinicDietitians', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches clinic details from Strapi /api/clinics/:id when network succeeds', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'clinic-glycemic-wellness',
            attributes: {
              name: 'Strapi Live Clinic',
              tier: 'ENTERPRISE',
              totalSeats: 10,
              activeSeats: 4,
            },
          },
        }),
      });

      const clinic = await getClinicDetails('clinic-glycemic-wellness');
      expect(clinic.name).toBe('Strapi Live Clinic');
      expect(clinic.tier).toBe('ENTERPRISE');
      expect(clinic.totalSeats).toBe(10);
    });

    it('gracefully falls back to local mock clinic if network call throws or fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const clinic = await getClinicDetails('clinic-glycemic-wellness');
      expect(clinic.name).toBe(mockClinic.name);
      expect(clinic.tier).toBe(mockClinic.tier);
      expect(clinic.totalSeats).toBe(mockClinic.totalSeats);
    });
  });
});
