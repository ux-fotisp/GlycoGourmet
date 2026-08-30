import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * PwaUpdater - Global service worker lifecycle manager, update notifier, and PWA install prompt.
 */
export const PwaUpdater = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('[PWA] Service Worker registered successfully:', r.scope);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker registration failed:', error);
    },
  });

  // Capture beforeinstallprompt event for mobile PWA install
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User install choice: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  return (
    <aside aria-label="Application Updates and Offline Status">
      {/* 1. Offline Ready Toast Notification */}
      {offlineReady && (
        <div 
          role="status" 
          className="fixed bottom-20 md:bottom-6 right-6 z-[110] bg-white border border-stone-200 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-fade-in max-w-sm font-sans"
        >
          <span className="material-symbols-outlined text-sage-text text-2xl">offline_pin</span>
          <div className="flex-1">
            <div className="text-xs font-bold text-primary">Offline Mode Ready</div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Prescribed meal plans and calculations are now cached locally.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOfflineReady(false)}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* 2. New Clinical Version Update Toast */}
      {needRefresh && (
        <div 
          role="alert" 
          className="fixed bottom-20 md:bottom-6 right-6 z-[110] bg-primary text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-fade-in max-w-md font-sans border border-emerald-800"
        >
          <span className="material-symbols-outlined text-emerald-300 text-2xl">system_update</span>
          <div className="flex-1">
            <div className="text-xs font-extrabold tracking-wide">A new clinical update is available.</div>
            <p className="text-[11px] text-emerald-100/80 mt-0.5">
              Reload now to apply updated glycemic algorithms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="px-3.5 py-1.5 bg-white text-primary rounded-xl text-xs font-extrabold hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="p-1 text-emerald-200 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Mobile PWA Add-To-Home-Screen Banner */}
      {showInstallBanner && (
        <div 
          role="region" 
          aria-label="Install App"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-white border border-stone-200 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 w-[92%] max-w-lg font-sans animate-fade-in"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display font-bold text-sm shrink-0">
            GG
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-primary truncate">Install GlycoGourmet App</div>
            <p className="text-[11px] text-stone-500 truncate">
              Install to your home screen for instant offline kitchen access.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-extrabold hover:bg-primary-variant transition-colors shadow-xs cursor-pointer"
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default PwaUpdater;
