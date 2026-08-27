import { useAuth } from '../context/AuthContext';

/**
 * usePermissions — Reactive Role-Based Permission & Feature Gating Hook
 *
 * Evaluates the current authenticated user's roleType and approval status:
 * - canCreateDrafts: True for User, Dietitian, and Admin (if isApproved !== false)
 * - canPublishPublic: True ONLY for Dietitian and Admin (if isApproved !== false)
 * - canManageClients: True for Dietitian and Admin (if isApproved !== false)
 * - canManageUsers: True ONLY for Admin (if isApproved !== false)
 * - isPendingAudit: True if isApproved === false
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
      isPendingAudit: false,
      role: null,
      isApproved: false,
    };
  }

  const role = (user.roleType || 'user').toLowerCase();
  const isApproved = user.isApproved !== false;
  const isPendingAudit = user.isApproved === false;

  const canCreateDrafts = isApproved && ['user', 'dietitian', 'admin'].includes(role);
  const canPublishPublic = isApproved && ['dietitian', 'admin'].includes(role);
  const canManageClients = isApproved && ['dietitian', 'admin'].includes(role);
  const canManageUsers = isApproved && role === 'admin';

  return {
    canCreateDrafts,
    canPublishPublic,
    canManageClients,
    canManageUsers,
    isPendingAudit,
    role,
    isApproved,
  };
}

export default usePermissions;
