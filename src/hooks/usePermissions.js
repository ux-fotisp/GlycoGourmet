import { useAuth } from '../context/AuthContext';

/**
 * usePermissions — Reactive Multi-Tenant Role-Based Permission & SaaS Feature Gating Hook
 *
 * Evaluates the current authenticated user's roleType, approval status, and clinic tenant context:
 *
 * Clinical Scope (Dietitian / Admin only — strictly NO clinic_admin access to PHI):
 * - canManageClinicalRecords: True ONLY for Dietitian, Admin, SuperAdmin (if isApproved !== false)
 * - canPrescribeMealPlans: True ONLY for Dietitian, Admin, SuperAdmin (if isApproved !== false)
 * - canManageClients: Legacy alias for canManageClinicalRecords (Dietitian, Admin, SuperAdmin only)
 *
 * Clinic Admin Scope (Clinic Admin / Admin only — non-clinical organizational & intake operations):
 * - canManageIntakePipeline: True for ClinicAdmin, Admin, SuperAdmin (if isApproved !== false)
 * - canAssignDietitian: True for ClinicAdmin, Admin, SuperAdmin (if isApproved !== false)
 * - canConfigurePromotions: True for ClinicAdmin, Admin, SuperAdmin (if isApproved !== false)
 * - canManageClinic: True ONLY for ClinicAdmin and SuperAdmin (if isApproved !== false)
 * - canViewCrossRoster: True for ClinicAdmin and SuperAdmin (cross-dietitian visibility within clinicId)
 *
 * General & Authoring Scope:
 * - canCreateDrafts: True for User, Dietitian, ClinicAdmin, and Admin (if isApproved !== false)
 * - canPublishPublic: True for Dietitian, ClinicAdmin, Admin, SuperAdmin (if isApproved !== false)
 * - canManageUsers: True ONLY for Admin and SuperAdmin (if isApproved !== false)
 *
 * SaaS Subscription Tier Boundaries:
 * - canShareTemplates: True if clinic tier is CLINIC_PRO or ENTERPRISE
 * - canExportBulkFHIR: True ONLY if clinic tier is ENTERPRISE
 * - canAccessPredictiveAnalytics: True if clinic tier is CLINIC_PRO or ENTERPRISE
 * - hasSSOEnabled: True ONLY if clinic tier is ENTERPRISE
 * - isPendingAudit: True if isApproved === false
 * - validateTenantAccess(entityClinicId): Validates tenant boundary against user.clinicId
 */
export function usePermissions() {
  const auth = useAuth();
  const user = auth?.user || null;
  const isAuthenticated = auth?.isAuthenticated || false;

  if (!isAuthenticated || !user) {
    return {
      canCreateDrafts: false,
      canPublishPublic: false,
      canManageClients: false,
      canManageClinicalRecords: false,
      canPrescribeMealPlans: false,
      canManageIntakePipeline: false,
      canAssignDietitian: false,
      canConfigurePromotions: false,
      canManageUsers: false,
      canManageClinic: false,
      canViewCrossRoster: false,
      canShareTemplates: false,
      canExportBulkFHIR: false,
      canAccessPredictiveAnalytics: false,
      hasSSOEnabled: false,
      isPendingAudit: false,
      role: null,
      isApproved: false,
      clinicId: null,
      clinicTier: null,
      validateTenantAccess: () => false,
    };
  }

  const role = (user.roleType || user.role || 'user').toLowerCase();
  const isApproved = user.isApproved !== false;
  const isPendingAudit = user.isApproved === false;
  const clinicId = user.clinicId || user.clinic?.id || null;
  const clinicTier = user.clinicTier || user.clinic?.tier || (user.clinic ? 'INDEPENDENT' : 'INDEPENDENT');

  // General authoring & publishing permissions
  const canCreateDrafts = isApproved && ['user', 'dietitian', 'clinic_admin', 'admin', 'super_admin'].includes(role);
  const canPublishPublic = isApproved && ['dietitian', 'clinic_admin', 'admin', 'super_admin'].includes(role);

  // Clinical Scope (Dietitian / Admin only — NEVER clinic_admin)
  const canManageClinicalRecords = isApproved && ['dietitian', 'admin', 'super_admin'].includes(role);
  const canPrescribeMealPlans = isApproved && ['dietitian', 'admin', 'super_admin'].includes(role);
  const canManageClients = canManageClinicalRecords; // Protected alias for legacy clinical components

  // Clinic Admin Scope (Organizational administration, intake, dietitian assignment, promotions)
  const canManageIntakePipeline = isApproved && ['clinic_admin', 'admin', 'super_admin'].includes(role);
  const canAssignDietitian = isApproved && ['clinic_admin', 'admin', 'super_admin'].includes(role);
  const canConfigurePromotions = isApproved && ['clinic_admin', 'admin', 'super_admin'].includes(role);

  // Global Platform Administration
  const canManageUsers = isApproved && ['admin', 'super_admin'].includes(role);

  // Multi-Tenant RBAC extensions
  const canManageClinic = isApproved && ['clinic_admin', 'super_admin'].includes(role);
  const canViewCrossRoster = isApproved && ['clinic_admin', 'super_admin'].includes(role);
  const canShareTemplates = isApproved && ['CLINIC_PRO', 'ENTERPRISE'].includes(clinicTier);

  // SaaS Subscription Tier Boundaries
  const canExportBulkFHIR = isApproved && (clinicTier === 'ENTERPRISE' || role === 'super_admin');
  const canAccessPredictiveAnalytics = isApproved && (['CLINIC_PRO', 'ENTERPRISE'].includes(clinicTier) || role === 'super_admin');
  const hasSSOEnabled = isApproved && (clinicTier === 'ENTERPRISE' || role === 'super_admin');

  /**
   * Validates whether an entity belonging to `entityClinicId` is accessible by the current tenant user.
   */
  const validateTenantAccess = (entityClinicId) => {
    if (!entityClinicId) return true; // Legacy or unscoped
    if (role === 'super_admin') return true;
    return Boolean(clinicId && entityClinicId === clinicId);
  };

  return {
    canCreateDrafts,
    canPublishPublic,
    canManageClients,
    canManageClinicalRecords,
    canPrescribeMealPlans,
    canManageIntakePipeline,
    canAssignDietitian,
    canConfigurePromotions,
    canManageUsers,
    canManageClinic,
    canViewCrossRoster,
    canShareTemplates,
    canExportBulkFHIR,
    canAccessPredictiveAnalytics,
    hasSSOEnabled,
    isPendingAudit,
    role,
    isApproved,
    clinicId,
    clinicTier,
    validateTenantAccess,
  };
}

export default usePermissions;