import React from 'react';
import { useOfflineMutation } from '../../hooks/useOfflineMutation';
import { useBackendWakeStatus } from '../../hooks/useBackendWakeStatus';

/**
 * NetworkStatusToast — Persistent preattentive banner indicating online/offline/syncing/waking states.
 *
 * Accessibility & Safety:
 * - Managed via unconditionally-invoked hooks (useOfflineMutation, useBackendWakeStatus).
 * - Non-blocking floating toast: uses aria-live="polite", never traps focus.
 */
export const NetworkStatusToast = () => {
  const { isOnline, isSyncing, syncSuccess, pendingCount } = useOfflineMutation();
  const { isWaking, attempt, maxAttempts } = useBackendWakeStatus();

  // Hide toast if online, not syncing, not waking, and no recent sync success banner
  if (isOnline && !isSyncing && !syncSuccess && !isWaking) {
    return null;
  }

  return (
    <aside aria-label="Network Status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[130] w-[92%] max-w-lg font-sans animate-fade-in pointer-events-none">
      <div className="pointer-events-auto">
        {/* 1. Backend Waking Up Banner (Render Cold Start) — Higher priority when online */}
        {isOnline && isWaking && (
          <div 
            role="status"
            aria-live="polite"
            data-testid="backend-waking-banner"
            className="bg-primary text-white border border-emerald-800 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 text-xs font-extrabold animate-fade-in"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[20px] animate-spin text-emerald-300 shrink-0" aria-hidden="true">
                progress_activity
              </span>
              <span className="truncate">
                Demo backend is waking up (~30-60s on Render)... Retrying request ({attempt}/{maxAttempts})
              </span>
            </div>
          </div>
        )}

        {/* 2. Offline Banner (Amber) */}
        {!isOnline && (
          <div 
            role="status" 
            className="bg-amber-bg border border-amber-text/30 text-amber-text rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3 text-xs font-bold"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[20px] text-amber-text shrink-0 animate-pulse">
                cloud_off
              </span>
              <span className="truncate">
                You're offline. Changes are saved locally and will sync when reconnected.
              </span>
            </div>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-amber-text/20 text-[10px] font-extrabold uppercase shrink-0">
                {pendingCount} Queued
              </span>
            )}
          </div>
        )}

        {/* 3. Syncing In Progress Banner (Deep Pine) */}
        {isOnline && !isWaking && isSyncing && (
          <div 
            role="status" 
            className="bg-primary text-white border border-emerald-800 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 text-xs font-extrabold"
          >
            <span className="material-symbols-outlined text-[20px] animate-spin text-emerald-300">
              sync
            </span>
            <span>Syncing changes to clinical backend...</span>
          </div>
        )}

        {/* 4. Sync Success Confirmation Banner (Sage Green) */}
        {isOnline && !isWaking && !isSyncing && syncSuccess && (
          <div 
            role="status" 
            className="bg-sage-bg border border-sage-text/30 text-sage-text rounded-2xl p-3.5 shadow-xl flex items-center gap-2.5 text-xs font-extrabold animate-fade-in"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>All offline changes synced successfully.</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default NetworkStatusToast;
