import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

/**
 * ProtectedRoute — Route Guard with Role & Approval Permission Checks
 *
 * Enforces:
 * 1. Authentication check (redirect to /login if unauthenticated)
 * 2. Audit check: Redirect unapproved users (isApproved === false / isPendingAudit) attempting direct URL navigation to /pending-approval
 * 3. Onboarding check: Redirect non-onboarded users to /onboarding
 * 4. Permission check: Optional requiredPermission flag (e.g. 'canCreateDrafts', 'canPublishPublic', 'canManageUsers')
 */
export const ProtectedRoute = ({ requiredPermission }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="font-label-md text-on-surface-variant opacity-70">
            Carefully preparing your kitchen...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Unapproved users attempting direct URL navigation must be redirected to /pending-approval
  if (permissions.isPendingAudit && location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirect to onboarding if not completed yet
  if (user && !user.onboarded && location.pathname !== '/onboarding' && location.pathname !== '/pending-approval') {
    return <Navigate to="/onboarding" replace />;
  }

  // Permission Gating check (e.g. requiredPermission="canCreateDrafts")
  if (requiredPermission && !permissions[requiredPermission]) {
    if (permissions.isPendingAudit) {
      return <Navigate to="/pending-approval" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
