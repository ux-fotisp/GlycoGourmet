import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PendingApproval = () => {
  const { user, refreshUserStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setStatusMessage('');
    const updatedUser = await refreshUserStatus();
    setIsRefreshing(false);

    if (updatedUser?.isApproved === true) {
      navigate('/recipes/all');
    } else {
      setStatusMessage('Your account is still pending administrator audit.');
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-edge-margin">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">hourglass_top</span>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-on-surface">
            Account Under Review
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            An administrator must audit your account before you can create recipes, save meal plans, or access clinical tools.
          </p>
        </div>

        {/* User Info Capsule */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-left space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-on-surface-variant">Registered Email:</span>
            <span className="font-mono text-on-surface">{user?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-on-surface-variant">Approval Status:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-700">
              Pending Audit
            </span>
          </div>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <p className="text-xs font-bold text-amber-700 animate-fade-in">
            {statusMessage}
          </p>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full min-h-[48px] py-3 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isRefreshing ? 'Checking Status...' : 'Refresh Status'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full min-h-[44px] py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default PendingApproval;
