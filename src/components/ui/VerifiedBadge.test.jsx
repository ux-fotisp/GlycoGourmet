import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import VerifiedBadge from './VerifiedBadge';

describe('VerifiedBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default "Verified" label with CheckCircle icon', () => {
    render(<VerifiedBadge />);

    const badge = screen.getByTestId('verified-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Verified');
    expect(screen.getByTestId('verified-check-icon')).toBeInTheDocument();
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('bg-sage-bg');
    expect(badge).toHaveClass('text-sage-text');
  });

  it('renders custom label when provided', () => {
    render(<VerifiedBadge label="Clinically Validated" />);

    const badge = screen.getByTestId('verified-badge');
    expect(badge).toHaveTextContent('Clinically Validated');
    expect(screen.getByTestId('verified-check-icon')).toBeInTheDocument();
  });

  it('applies custom className to the badge container', () => {
    render(<VerifiedBadge className="custom-verified-class" />);

    const badge = screen.getByTestId('verified-badge');
    expect(badge).toHaveClass('custom-verified-class');
  });
});
