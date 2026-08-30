import React, { useState, useEffect } from 'react';

/**
 * OfflineBanner - Real-time network status indicator for offline resilience.
 */
export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <aside 
      role="status" 
      aria-live="polite"
      className="bg-[#1B3B22] text-[#D8E8CB] px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md border-b border-[#386A20]/40 animate-fade-in z-50 sticky top-0"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <span className="material-symbols-outlined text-[18px] text-amber-400">cloud_off</span>
        <span>
          <strong>Offline Mode:</strong> Viewing cached recipes, ingredients, and scheduled meal plans.
        </span>
      </div>
    </aside>
  );
};

export default OfflineBanner;
