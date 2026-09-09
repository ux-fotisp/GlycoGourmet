import { useState, useEffect } from 'react';
import { subscribeToWakeStatus, getWakeStatus } from '../services/strapiClient';

/**
 * useBackendWakeStatus — React Hook for observing Strapi backend cold-start waking/retry status.
 *
 * Requirements:
 * - Unconditionally invokes useState and useEffect hooks (never called conditionally).
 * - Cleans up listener on component unmount.
 *
 * @returns {{ isWaking: boolean, attempt: number, maxAttempts: number, nextRetryDelay: number }}
 */
export function useBackendWakeStatus() {
  const [wakeStatus, setWakeStatus] = useState(() => getWakeStatus());

  useEffect(() => {
    const unsubscribe = subscribeToWakeStatus((status) => {
      setWakeStatus(status);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return wakeStatus;
}

export default useBackendWakeStatus;
