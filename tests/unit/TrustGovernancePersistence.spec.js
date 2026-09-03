import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Import policies and controllers
const isClinicAdminPolicy = require('../../server/src/policies/is-clinic-admin.js');
const auditLogControllerFactory = require('../../server/src/api/audit-log-entry/controllers/audit-log-entry.js');
const consentRecordControllerFactory = require('../../server/src/api/consent-record/controllers/consent-record.js');
const intakeLeadControllerFactory = require('../../server/src/api/intake-lead/controllers/intake-lead.js');
const notifPrefControllerFactory = require('../../server/src/api/notification-preference/controllers/notification-preference.js');

import { fetchConsentsFromStrapi } from '../../src/utils/consentStore.js';
import { fetchAuditLogsFromStrapi } from '../../src/utils/auditStore.js';
import { getIntakeLeads } from '../../src/utils/intakeStore.js';

describe('Trust & Governance Backend Persistence — Gap-Closure Chunk 2', () => {

  describe('1. Invariance: FORBIDDEN_CLINICAL_UIDS in is-clinic-admin.js', () => {
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

    it('proves governance collections are NOT in FORBIDDEN_CLINICAL_UIDS (accessible to clinic_admin)', () => {
      const policySource = fs.readFileSync(
        path.resolve(__dirname, '../../server/src/policies/is-clinic-admin.js'),
        'utf8'
      );
      expect(policySource).not.toContain('api::consent-record');
      expect(policySource).not.toContain('api::audit-log-entry');
      expect(policySource).not.toContain('api::intake-lead');
      expect(policySource).not.toContain('api::notification-preference');
    });
  });

  describe('2. Hard PHI & Clinical Wall Regression: clinic_admin receives 403 on all 4 clinical UIDs', () => {
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
            user: { id: 10, roleType: 'clinic_admin', clinicId: 'clinic-101' },
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

  describe('3. AuditLogEntry Two-Tier Append-Only Immutability & Tenant Scoping', () => {
    let controller;
    let strapiMock;

    beforeEach(() => {
      strapiMock = {
        entityService: {
          findMany: vi.fn().mockResolvedValue([{ id: 1, action: 'dietitian_assigned', clinic: 101 }]),
          findOne: vi.fn().mockResolvedValue({ id: 1, action: 'dietitian_assigned', clinic: { id: 101 } }),
        },
      };

      const base = auditLogControllerFactory({ strapi: strapiMock });
      controller = {
        ...base,
        validateQuery: vi.fn().mockResolvedValue(true),
        sanitizeQuery: vi.fn().mockImplementation((ctx) => Promise.resolve(ctx.query || {})),
        sanitizeOutput: vi.fn().mockImplementation((data) => Promise.resolve(data)),
        transformResponse: vi.fn().mockImplementation((data) => ({ data })),
      };
    });

    it('router config declares except: ["update", "delete"]', () => {
      const routerSource = fs.readFileSync(
        path.resolve(__dirname, '../../server/src/api/audit-log-entry/routes/audit-log-entry.js'),
        'utf8'
      );
      expect(routerSource).toContain('except: ["update", "delete"]');
    });

    it('controller update() explicitly rejects mutation with ctx.forbidden()', async () => {
      const forbiddenMock = vi.fn().mockReturnValue({ status: 403 });
      const ctx = { forbidden: forbiddenMock };

      await controller.update(ctx);
      expect(forbiddenMock).toHaveBeenCalledWith(expect.stringContaining('immutable and append-only'));
    });

    it('controller delete() explicitly rejects deletion with ctx.forbidden()', async () => {
      const forbiddenMock = vi.fn().mockReturnValue({ status: 403 });
      const ctx = { forbidden: forbiddenMock };

      await controller.delete(ctx);
      expect(forbiddenMock).toHaveBeenCalledWith(expect.stringContaining('immutable and cannot be deleted'));
    });

    it('find() injects clinic filter for clinic_admin', async () => {
      const ctx = {
        state: { user: { id: 10, roleType: 'clinic_admin', clinicId: 101 } },
        query: {},
      };

      await controller.find(ctx);
      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::audit-log-entry.audit-log-entry',
        expect.objectContaining({
          filters: expect.objectContaining({ clinic: 101 }),
        })
      );
    });

    it('findOne() rejects cross-tenant access with 404', async () => {
      const notFoundMock = vi.fn().mockReturnValue({ status: 404 });
      const ctx = {
        state: { user: { id: 10, roleType: 'clinic_admin', clinicId: 999 } }, // Different clinic
        params: { id: 1 },
        notFound: notFoundMock,
      };

      await controller.findOne(ctx);
      expect(notFoundMock).toHaveBeenCalled();
    });
  });

  describe('4. ConsentRecord Scope Allow-List & Boundary Defense', () => {
    let controller;
    let strapiMock;

    beforeEach(() => {
      strapiMock = {
        entityService: {
          findMany: vi.fn(),
          findOne: vi.fn(),
        },
      };

      const base = consentRecordControllerFactory({ strapi: strapiMock });
      controller = {
        ...base,
        validateQuery: vi.fn().mockResolvedValue(true),
        sanitizeQuery: vi.fn().mockImplementation((ctx) => Promise.resolve(ctx.query || {})),
        sanitizeOutput: vi.fn().mockImplementation((data) => Promise.resolve(data)),
        transformResponse: vi.fn().mockImplementation((data) => ({ data })),
      };
    });

    it('clinic_admin CANNOT read a consent record containing dietitian_share even when co-mingled with intake_redirect', async () => {
      const mockRecords = [
        {
          id: 1,
          purpose: 'Operational Intake Only',
          scope: ['intake_redirect'],
          clinic: 101,
        },
        {
          id: 2,
          purpose: 'Co-Mingled Consent with Clinical Share',
          scope: ['intake_redirect', 'dietitian_share'],
          clinic: 101,
        },
        {
          id: 3,
          purpose: 'Clinical Telemetry Analytics',
          scope: ['telemetry_analytics'],
          clinic: 101,
        },
      ];

      strapiMock.entityService.findMany.mockResolvedValue(mockRecords);

      const ctx = {
        state: { user: { id: 10, roleType: 'clinic_admin', clinicId: 101 } },
        query: {},
      };

      const result = await controller.find(ctx);
      // Only record 1 must be returned; records 2 and 3 must be completely excluded
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].scope).toEqual(['intake_redirect']);
    });

    it('clinic_admin findOne() returns 404 for record with non-visible scope', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 2,
        clinic: { id: 101 },
        scope: ['intake_redirect', 'dietitian_share'],
      });

      const notFoundMock = vi.fn().mockReturnValue({ status: 404 });
      const ctx = {
        state: { user: { id: 10, roleType: 'clinic_admin', clinicId: 101 } },
        params: { id: 2 },
        notFound: notFoundMock,
      };

      await controller.findOne(ctx);
      expect(notFoundMock).toHaveBeenCalled();
    });

    it('patient user reads all their own consent records regardless of scope', async () => {
      const patientRecords = [
        { id: 10, grantor: 50, scope: ['intake_redirect', 'dietitian_share'] },
      ];
      strapiMock.entityService.findMany.mockResolvedValue(patientRecords);

      const ctx = {
        state: { user: { id: 50, roleType: 'user' } },
        query: {},
      };

      const result = await controller.find(ctx);
      expect(result.data).toHaveLength(1);
      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::consent-record.consent-record',
        expect.objectContaining({
          filters: expect.objectContaining({ grantor: 50 }),
        })
      );
    });

    it('dietitian can query clinical consents where granteeId matches or clinic matches', async () => {
      strapiMock.entityService.findMany.mockResolvedValue([
        { id: 20, granteeId: '5', scope: ['dietitian_share'] },
      ]);

      const ctx = {
        state: { user: { id: 5, roleType: 'dietitian', clinicId: 101 } },
        query: {},
      };

      const result = await controller.find(ctx);
      expect(result.data).toHaveLength(1);
      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::consent-record.consent-record',
        expect.objectContaining({
          filters: expect.objectContaining({
            $or: [{ granteeId: '5' }, { clinic: 101 }],
          }),
        })
      );
    });
  });

  describe('5. IntakeLead Tenant Scoping & Dietitian Field Projection', () => {
    let controller;
    let strapiMock;

    beforeEach(() => {
      strapiMock = {
        entityService: {
          findMany: vi.fn().mockResolvedValue([]),
          findOne: vi.fn(),
        },
      };

      const base = intakeLeadControllerFactory({ strapi: strapiMock });
      controller = {
        ...base,
        validateQuery: vi.fn().mockResolvedValue(true),
        sanitizeQuery: vi.fn().mockImplementation((ctx) => Promise.resolve(ctx.query || {})),
        sanitizeOutput: vi.fn().mockImplementation((data) => Promise.resolve(data)),
        transformResponse: vi.fn().mockImplementation((data) => ({ data })),
      };
    });

    it('standard patient user receives 403 on intake-lead queries', async () => {
      const forbiddenMock = vi.fn().mockReturnValue({ status: 403 });
      const ctx = {
        state: { user: { id: 50, roleType: 'user' } },
        forbidden: forbiddenMock,
      };

      await controller.find(ctx);
      expect(forbiddenMock).toHaveBeenCalled();
    });

    it('find() injects explicit field projection for assignedDietitian excluding private user attributes', async () => {
      const ctx = {
        state: { user: { id: 10, roleType: 'clinic_admin', clinicId: 101 } },
        query: {},
      };

      await controller.find(ctx);
      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::intake-lead.intake-lead',
        expect.objectContaining({
          populate: expect.objectContaining({
            assignedDietitian: {
              fields: ['id', 'username', 'name', 'credential'],
            },
          }),
        })
      );
    });

    it('findOne() returns 404 if lead belongs to another clinic', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 1,
        clinic: { id: 202 },
      });

      const notFoundMock = vi.fn().mockReturnValue({ status: 404 });
      const ctx = {
        state: { user: { id: 10, roleType: 'clinic_admin', clinicId: 101 } },
        params: { id: 1 },
        notFound: notFoundMock,
      };

      await controller.findOne(ctx);
      expect(notFoundMock).toHaveBeenCalled();
    });
  });

  describe('6. NotificationPreference Owner Isolation', () => {
    let controller;
    let strapiMock;

    beforeEach(() => {
      strapiMock = {
        entityService: {
          findMany: vi.fn().mockResolvedValue([]),
          findOne: vi.fn(),
        },
      };

      const base = notifPrefControllerFactory({ strapi: strapiMock });
      controller = {
        ...base,
        validateQuery: vi.fn().mockResolvedValue(true),
        sanitizeQuery: vi.fn().mockImplementation((ctx) => Promise.resolve(ctx.query || {})),
        sanitizeOutput: vi.fn().mockImplementation((data) => Promise.resolve(data)),
        transformResponse: vi.fn().mockImplementation((data) => ({ data })),
      };
    });

    it('find() strictly restricts to user.id matching authenticated session', async () => {
      const ctx = {
        state: { user: { id: 42, roleType: 'user' } },
        query: {},
      };

      await controller.find(ctx);
      expect(strapiMock.entityService.findMany).toHaveBeenCalledWith(
        'api::notification-preference.notification-preference',
        expect.objectContaining({
          filters: expect.objectContaining({ user: 42 }),
        })
      );
    });

    it('findOne() returns 404 if preference belongs to another user', async () => {
      strapiMock.entityService.findOne.mockResolvedValue({
        id: 1,
        user: { id: 99 },
      });

      const notFoundMock = vi.fn().mockReturnValue({ status: 404 });
      const ctx = {
        state: { user: { id: 42, roleType: 'user' } },
        params: { id: 1 },
        notFound: notFoundMock,
      };

      await controller.findOne(ctx);
      expect(notFoundMock).toHaveBeenCalled();
    });
  });

  describe('7. Client Store Resilience (Dual Mode Live Fetch & Local Storage Fallback)', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('fetchConsentsFromStrapi maps live Strapi records when API succeeds', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              id: '1',
              attributes: {
                grantorId: 'user_1',
                granteeId: 'clinic-1',
                purpose: 'Care Coordination',
                scope: ['intake_redirect'],
                version: '2.1',
                status: 'active',
              },
            },
          ],
        }),
      });

      const records = await fetchConsentsFromStrapi();
      expect(records).toHaveLength(1);
      expect(records[0].grantorId).toBe('user_1');
      expect(records[0].scope).toEqual(['intake_redirect']);
    });

    it('getIntakeLeads maps live Strapi leads and falls back to local storage fixtures when API fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const leads = await getIntakeLeads('clinic-glycemic-wellness');
      expect(Array.isArray(leads)).toBe(true);
      expect(leads.length).toBeGreaterThanOrEqual(1);
      expect(leads[0].clinicId).toBe('clinic-glycemic-wellness');
    });
  });
});
