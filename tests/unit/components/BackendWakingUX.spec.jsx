import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackendWakingBanner } from '../../../src/components/common/BackendWakingBanner';
import { NetworkStatusToast } from '../../../src/components/common/NetworkStatusToast';
import * as wakeHook from '../../../src/hooks/useBackendWakeStatus';
import * as offlineHook from '../../../src/hooks/useOfflineMutation';

describe('Backend Waking UX Components', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('BackendWakingBanner', () => {
    it('renders null when isWaking is false', () => {
      vi.spyOn(wakeHook, 'useBackendWakeStatus').mockReturnValue({
        isWaking: false,
        attempt: 0,
        maxAttempts: 3,
        nextRetryDelay: 0,
      });

      const { container } = render(<BackendWakingBanner />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders with role="status" and aria-live="polite" when backend is waking up', () => {
      vi.spyOn(wakeHook, 'useBackendWakeStatus').mockReturnValue({
        isWaking: true,
        attempt: 2,
        maxAttempts: 3,
        nextRetryDelay: 5000,
      });

      render(<BackendWakingBanner />);

      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText(/Demo backend is waking up/i)).toBeInTheDocument();
      expect(screen.getByText(/\(2\/3\)/)).toBeInTheDocument();
    });
  });

  describe('NetworkStatusToast Integration', () => {
    it('renders waking toast when online and backend is cold-starting', () => {
      vi.spyOn(offlineHook, 'useOfflineMutation').mockReturnValue({
        isOnline: true,
        isSyncing: false,
        syncSuccess: false,
        pendingCount: 0,
      });

      vi.spyOn(wakeHook, 'useBackendWakeStatus').mockReturnValue({
        isWaking: true,
        attempt: 1,
        maxAttempts: 3,
        nextRetryDelay: 2000,
      });

      render(<NetworkStatusToast />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText(/Demo backend is waking up \(~30-60s on Render\)\.\.\. Retrying request \(1\/3\)/i)).toBeInTheDocument();
    });

    it('renders null when online, not syncing, and not waking', () => {
      vi.spyOn(offlineHook, 'useOfflineMutation').mockReturnValue({
        isOnline: true,
        isSyncing: false,
        syncSuccess: false,
        pendingCount: 0,
      });

      vi.spyOn(wakeHook, 'useBackendWakeStatus').mockReturnValue({
        isWaking: false,
        attempt: 0,
        maxAttempts: 3,
        nextRetryDelay: 0,
      });

      const { container } = render(<NetworkStatusToast />);
      expect(container).toBeEmptyDOMElement();
    });

    it('prioritizes offline status banner when device is offline', () => {
      vi.spyOn(offlineHook, 'useOfflineMutation').mockReturnValue({
        isOnline: false,
        isSyncing: false,
        syncSuccess: false,
        pendingCount: 2,
      });

      vi.spyOn(wakeHook, 'useBackendWakeStatus').mockReturnValue({
        isWaking: true,
        attempt: 1,
        maxAttempts: 3,
        nextRetryDelay: 2000,
      });

      render(<NetworkStatusToast />);

      expect(screen.getByText(/You're offline\. Changes are saved locally and will sync when reconnected\./i)).toBeInTheDocument();
      expect(screen.getByText(/2 Queued/i)).toBeInTheDocument();
    });
  });
});
