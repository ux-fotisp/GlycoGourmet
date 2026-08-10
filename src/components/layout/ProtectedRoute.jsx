import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
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

  // Redirect to pending-approval if account is not approved yet by admin
  if (user && user.isApproved === false && location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirect to onboarding if not done yet, except if they are already on /onboarding or /pending-approval
  if (user && !user.onboarded && location.pathname !== '/onboarding' && location.pathname !== '/pending-approval') {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
