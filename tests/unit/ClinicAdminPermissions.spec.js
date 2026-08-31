import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../../src/hooks/usePermissions';
import { useAuth } from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Clinic Admin RBAC & Clinical Trust Boundary Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Strict PHI Wall: clinic_admin role must NEVER receive clinical record access', () => {
    it('denies canManageClinicalRecords and canPrescribeMealPlans to approved clinic_admin', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'admin-1',
          roleType: 'clinic_admin',
          isApproved: true,
          clinicId: 'clinic-101',
          clinicTier: 'CLINIC_PRO',
        },
      });

      const { result } = renderHook(() => usePermissions());

      // Hard clinical safety assertions
      expect(result.current.canManageClinicalRecords).toBe(false);
      expect(result.current.canPrescribeMealPlans).toBe(false);
      expect(result.current.canManageClients).toBe(false);

      // Organizational / Clinic Admin permissions MUST be granted
      expect(result.current.canManageIntakePipeline).toBe(true);
      expect(result.current.canAssignDietitian).toBe(true);
      expect(result.current.canConfigurePromotions).toBe(true);
      expect(result.current.canManageClinic).toBe(true);
      expect(result.current.canViewCrossRoster).toBe(true);
    });

    it('denies clinical access even if clinic_admin has ENTERPRISE subscription tier', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'admin-enterprise',
          roleType: 'clinic_admin',
          isApproved: true,
          clinicId: 'clinic-enterprise',
          clinicTier: 'ENTERPRISE',
        },
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageClinicalRecords).toBe(false);
      expect(result.current.canPrescribeMealPlans).toBe(false);
      expect(result.current.canManageClients).toBe(false);
      expect(result.current.canExportBulkFHIR).toBe(true);
      expect(result.current.hasSSOEnabled).toBe(true);
    });

    it('denies clinical access to unapproved clinic_admin', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'admin-pending',
          roleType: 'clinic_admin',
          isApproved: false,
          clinicId: 'clinic-101',
        },
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageClinicalRecords).toBe(false);
      expect(result.current.canPrescribeMealPlans).toBe(false);
      expect(result.current.canManageIntakePipeline).toBe(false);
      expect(result.current.canAssignDietitian).toBe(false);
      expect(result.current.canConfigurePromotions).toBe(false);
      expect(result.current.isPendingAudit).toBe(true);
    });

    it('handles uppercase or legacy role property format deterministically without leaking PHI', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'admin-legacy',
          role: 'CLINIC_ADMIN',
          isApproved: true,
          clinicId: 'clinic-legacy',
        },
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageClinicalRecords).toBe(false);
      expect(result.current.canPrescribeMealPlans).toBe(false);
      expect(result.current.canManageIntakePipeline).toBe(true);
      expect(result.current.canAssignDietitian).toBe(true);
    });
  });

  describe('Clinical Role Isolation: Dietitians vs Clinic Admins', () => {
    it('grants clinical records and prescriptions to approved Dietitian but denies organizational pipeline', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'dietitian-1',
          roleType: 'dietitian',
          isApproved: true,
          clinicId: 'clinic-101',
        },
      });

      const { result } = renderHook(() => usePermissions());

      // Clinical capabilities granted
      expect(result.current.canManageClinicalRecords).toBe(true);
      expect(result.current.canPrescribeMealPlans).toBe(true);
      expect(result.current.canManageClients).toBe(true);

      // Clinic Admin organizational powers denied
      expect(result.current.canManageIntakePipeline).toBe(false);
      expect(result.current.canAssignDietitian).toBe(false);
      expect(result.current.canConfigurePromotions).toBe(false);
      expect(result.current.canManageClinic).toBe(false);
      expect(result.current.canViewCrossRoster).toBe(false);
    });
  });

  describe('Global Platform Administration: Admin and SuperAdmin roles', () => {
    it('grants both clinical and administrative permissions to global Admin', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'sys-admin',
          roleType: 'admin',
          isApproved: true,
        },
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageClinicalRecords).toBe(true);
      expect(result.current.canPrescribeMealPlans).toBe(true);
      expect(result.current.canManageIntakePipeline).toBe(true);
      expect(result.current.canAssignDietitian).toBe(true);
      expect(result.current.canConfigurePromotions).toBe(true);
      expect(result.current.canManageUsers).toBe(true);
    });

    it('grants all permissions to super_admin', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'super-admin',
          roleType: 'super_admin',
          isApproved: true,
        },
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageClinicalRecords).toBe(true);
      expect(result.current.canPrescribeMealPlans).toBe(true);
      expect(result.current.canManageIntakePipeline).toBe(true);
      expect(result.current.canAssignDietitian).toBe(true);
      expect(result.current.canConfigurePromotions).toBe(true);
      expect(result.current.canManageClinic).toBe(true);
      expect(result.current.canViewCrossRoster).toBe(true);
      expect(result.current.canExportBulkFHIR).toBe(true);
    });
  });

  describe('Standard Patients / End Users', () => {
    it('denies both clinical and clinic-admin powers to standard patient', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'patient-1',
          roleType: 'user',
          isApproved: true,
        },
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canManageClinicalRecords).toBe(false);
      expect(result.current.canPrescribeMealPlans).toBe(false);
      expect(result.current.canManageIntakePipeline).toBe(false);
      expect(result.current.canAssignDietitian).toBe(false);
      expect(result.current.canConfigurePromotions).toBe(false);
      expect(result.current.canManageClinic).toBe(false);
      expect(result.current.canCreateDrafts).toBe(true);
    });
  });
});