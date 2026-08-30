import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useWakeLock — Screen Wake Lock API React Hook
 * Keeps the screen awake during active cooking sessions and re-requests lock on visibility change.
 */
export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setIsLocked(true);

      wakeLockRef.current.addEventListener('release', () => {
        setIsLocked(false);
        wakeLockRef.current = null;
      });

      console.log('[WakeLock] Screen Wake Lock acquired.');
      return true;
    } catch (err) {
      console.warn('[WakeLock] Failed to acquire Screen Wake Lock:', err);
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsLocked(false);
        console.log('[WakeLock] Screen Wake Lock released.');
      } catch (err) {
        console.warn('[WakeLock] Error releasing Wake Lock:', err);
      }
    }
  }, []);

  // Handle visibility change (re-request lock when returning to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isLocked) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLocked, requestWakeLock]);

  // Clean up lock on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  return {
    isSupported,
    isLocked,
    requestWakeLock,
    releaseWakeLock,
  };
}

export default useWakeLock;
