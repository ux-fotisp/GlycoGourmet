import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflineBanner from '../OfflineBanner';

describe('OfflineBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders status when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    render(<OfflineBanner />);
    expect(screen.getByText(/Offline Mode:/i)).toBeDefined();
  });
});
