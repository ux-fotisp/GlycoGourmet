import { useAuth } from '../context/AuthContext';

/**
 * usePermissions — Reactive Multi-Tenant Role-Based Permission & Feature Gating Hook
 *
 * Evaluates the current authenticated user's roleType, approval status, and clinic tenant context:
 * - canCreateDrafts: True for User, Dietitian, ClinicAdmin, and Admin (if isApproved !== false)
 * - canPublishPublic: True for Dietitian, ClinicAdmin, Admin, SuperAdmin (if isApproved !== false)
 * - canManageClients: True for Dietitian, ClinicAdmin, Admin, SuperAdmin (if isApproved !== false)
 * - canManageUsers: True ONLY for Admin and SuperAdmin (if isApproved !== false)
 * - canManageClinic: True ONLY for ClinicAdmin and SuperAdmin (if isApproved !== false)
 * - canViewCrossRoster: True for ClinicAdmin and SuperAdmin (cross-dietitian visibility within clinicId)
 * - canShareTemplates: True if clinic tier is CLINIC_PRO or ENTERPRISE
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
      canManageUsers: false,
      canManageClinic: false,
      canViewCrossRoster: false,
      canShareTemplates: false,
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
  const clinicTier = user.clinicTier || user.clinic?.tier || 'INDEPENDENT';

  const canCreateDrafts = isApproved && ['user', 'dietitian', 'clinic_admin', 'admin', 'super_admin'].includes(role);
  const canPublishPublic = isApproved && ['dietitian', 'clinic_admin', 'admin', 'super_admin'].includes(role);
  const canManageClients = isApproved && ['dietitian', 'clinic_admin', 'admin', 'super_admin'].includes(role);
  const canManageUsers = isApproved && ['admin', 'super_admin'].includes(role);

  // Multi-Tenant RBAC extensions
  const canManageClinic = isApproved && ['clinic_admin', 'super_admin'].includes(role);
  const canViewCrossRoster = isApproved && ['clinic_admin', 'super_admin'].includes(role);
  const canShareTemplates = isApproved && ['CLINIC_PRO', 'ENTERPRISE'].includes(clinicTier);

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
    canManageUsers,
    canManageClinic,
    canViewCrossRoster,
    canShareTemplates,
    isPendingAudit,
    role,
    isApproved,
    clinicId,
    clinicTier,
    validateTenantAccess,
  };
}

export default usePermissions;
