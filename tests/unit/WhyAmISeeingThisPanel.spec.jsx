import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhyAmISeeingThisPanel } from '../../src/components/patient/WhyAmISeeingThisPanel';

const renderPanel = (props = {}) => {
  return render(
    <MemoryRouter>
      <WhyAmISeeingThisPanel isOpen={true} {...props} />
    </MemoryRouter>
  );
};

describe('WhyAmISeeingThisPanel Component', () => {
  it('renders plain-language explanation and data-used breakdown with mapped category label', () => {
    renderPanel({
      title: 'Why am I seeing this meal timing prompt?',
      reason: 'Scheduled based on your selected 6-occasion circadian daily meal rhythm.',
      dataUsed: 'Occasion timestamps configured in User Preferences.',
      shownBecause: 'care_reminder',
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Why am I seeing this meal timing prompt?')).toBeInTheDocument();
    expect(screen.getByText('Care reminder')).toBeInTheDocument();
    expect(screen.getByText(/Scheduled based on your selected 6-occasion circadian daily meal rhythm/i)).toBeInTheDocument();
    expect(screen.getByText(/Occasion timestamps configured in User Preferences/i)).toBeInTheDocument();
  });

  it('renders optional support notice category for self_service_nudge', () => {
    renderPanel({
      shownBecause: 'self_service_nudge',
    });

    expect(screen.getByText('Optional support notice')).toBeInTheDocument();
  });

  it('exposes manage consent action when consentRequired is true', () => {
    const onManageConsent = vi.fn();
    renderPanel({
      consentRequired: true,
      consentStatus: 'granted',
      onManageConsent,
    });

    expect(screen.getByText(/Data Sharing Authorization/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Status:/i)).toBeInTheDocument();

    const manageBtn = screen.getByRole('button', { name: /Manage Consent/i });
    fireEvent.click(manageBtn);

    expect(onManageConsent).toHaveBeenCalledTimes(1);
  });

  it('labels promoted-dietitian context transparently as editorial/clinic spotlight without algorithmic ranking', () => {
    renderPanel({
      isPromotedDietitian: true,
      shownBecause: 'promoted_dietitian',
    });

    expect(screen.getByText(/Clinic editorial spotlight/i)).toBeInTheDocument();
    expect(screen.getByText(/Editorial Clinic Spotlight/i)).toBeInTheDocument();
    expect(screen.getByText(/curated and recommended by the clinic network/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommendations are non-algorithmic and based on clinical specialty rather than automated profiling/i)).toBeInTheDocument();

    // Invariant: no algorithmic match or scoring terms
    const textContent = document.body.textContent || '';
    expect(textContent).not.toMatch(/best match/i);
    expect(textContent).not.toMatch(/compatibility score/i);
    expect(textContent).not.toMatch(/algorithm rank/i);
  });

  it('provides a reversible close and preferences navigation action', () => {
    const onClose = vi.fn();
    const onManagePrefs = vi.fn();

    renderPanel({
      onClose,
      onManagePreferences: onManagePrefs,
    });

    const closeBtn = screen.getByRole('button', { name: /Close explanation dialog/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const prefsBtn = screen.getByRole('button', { name: /Adjust Notification & Privacy Preferences/i });
    fireEvent.click(prefsBtn);
    expect(onManagePrefs).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});