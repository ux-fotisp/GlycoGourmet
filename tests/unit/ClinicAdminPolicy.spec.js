import { describe, it, expect, vi, beforeEach } from 'vitest';
import isClinicAdmin from '../../server/src/policies/is-clinic-admin';

describe('Clinic Admin Policy (is-clinic-admin) Security & PHI Boundary', () => {
  let mockStrapi;
  let mockConfig;

  beforeEach(() => {
    mockConfig = { uid: 'api::intake.intake' };
    mockStrapi = {
      entityService: {
        findOne: vi.fn(),
      },
    };
  });

  const createContext = (
    method,
    userRole,
    userId,
    clinicId = 'clinic-123',
    params = {},
    query = {},
    bodyData = {}
  ) => ({
    request: {
      method,
      body: { data: bodyData },
    },
    state: {
      user: userRole
        ? {
            id: userId,
            roleType: userRole,
            clinicId: clinicId,
            clinic: { id: clinicId },
          }
        : null,
    },
    query,
    params,
  });

  describe('Unauthenticated and Non-Admin Roles', () => {
    it('Rejects unauthenticated requests', async () => {
      const ctx = createContext('GET', null, null, null);
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Rejects standard patient role', async () => {
      const ctx = createContext('GET', 'user', 1, 'clinic-123');
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Rejects dietitian role from clinic-admin specific operations', async () => {
      const ctx = createContext('GET', 'dietitian', 42, 'clinic-123');
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });
  });

  describe('Hard Clinical PHI Gate', () => {
    it('Strictly rejects clinic_admin from accessing client-profile (patient records)', async () => {
      const clinicalConfig = { uid: 'api::client-profile.client-profile' };
      const ctx = createContext('GET', 'clinic_admin', 10, 'clinic-123');
      const result = await isClinicAdmin(ctx, clinicalConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Strictly rejects clinic_admin from accessing metabolic-target-calibration', async () => {
      const clinicalConfig = { uid: 'api::metabolic-target-calibration.metabolic-target-calibration' };
      const ctx = createContext('GET', 'clinic_admin', 10, 'clinic-123');
      const result = await isClinicAdmin(ctx, clinicalConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Strictly rejects clinic_admin from accessing prescribed-meal-plan', async () => {
      const clinicalConfig = { uid: 'api::prescribed-meal-plan.prescribed-meal-plan' };
      const ctx = createContext('GET', 'clinic_admin', 10, 'clinic-123');
      const result = await isClinicAdmin(ctx, clinicalConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Strictly rejects clinic_admin from accessing smart-swap-rule', async () => {
      const clinicalConfig = { uid: 'api::smart-swap-rule.smart-swap-rule' };
      const ctx = createContext('GET', 'clinic_admin', 10, 'clinic-123');
      const result = await isClinicAdmin(ctx, clinicalConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });
  });

  describe('Multi-Tenant Scoping & Mutations (POST, PUT, DELETE)', () => {
    it('Rejects clinic_admin without an assigned clinic tenant', async () => {
      const ctx = createContext('GET', 'clinic_admin', 10, null);
      ctx.state.user.clinicId = null;
      ctx.state.user.clinic = null;
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Coerces POST payload to belong to authenticated clinic tenant', async () => {
      const ctx = createContext('POST', 'clinic_admin', 10, 'clinic-123', {}, {}, {
        clinic: 'clinic-hacker',
        title: 'New Intake Form',
      });
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
      expect(ctx.request.body.data.clinic).toBe('clinic-123');
      expect(ctx.request.body.data.clinicId).toBe('clinic-123');
    });

    it('Permits PUT if target entity belongs to the same clinic', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue({
        id: 50,
        clinic: { id: 'clinic-123' },
      });
      const ctx = createContext('PUT', 'clinic_admin', 10, 'clinic-123', { id: 50 }, {}, { title: 'Updated' });
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
    });

    it('Rejects PUT if target entity belongs to another clinic (Cross-tenant breach attempt)', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue({
        id: 50,
        clinic: { id: 'clinic-999' },
      });
      const ctx = createContext('PUT', 'clinic_admin', 10, 'clinic-123', { id: 50 }, {}, { title: 'Breach' });
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(false);
    });

    it('Strips tenant reassignment attempts during PUT', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue({
        id: 50,
        clinic: { id: 'clinic-123' },
      });
      const ctx = createContext('PUT', 'clinic_admin', 10, 'clinic-123', { id: 50 }, {}, { clinic: 'clinic-999' });
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
      expect(ctx.request.body.data.clinic).toBe('clinic-123');
    });
  });

  describe('Global Admin Bypass', () => {
    it('Permits global admin access across any endpoint and tenant', async () => {
      const ctx = createContext('GET', 'admin', 99, null);
      const result = await isClinicAdmin(ctx, mockConfig, { strapi: mockStrapi });
      expect(result).toBe(true);
    });
  });
});