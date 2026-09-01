import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserPreferencesProvider } from '../../src/context/UserPreferences';
import AuthContext from '../../src/context/AuthContext';
import Settings from '../../src/pages/Settings';

const mockUser = {
  id: 'user_123',
  name: 'Fotis Pastrakis',
  email: 'fotis@glycogourmet.com',
  roleType: 'user',
};

const renderSettings = (initialEntries = ['/settings'], initialTab = null) => {
  return render(
    <AuthContext.Provider value={{ user: mockUser, logout: vi.fn(), setSettings: vi.fn() }}>
      <UserPreferencesProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Settings initialTab={initialTab} />
        </MemoryRouter>
      </UserPreferencesProvider>
    </AuthContext.Provider>
  );
};

describe('Settings Page (Metabolic & Profile Control Center v0.2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 6 accessible section tabs in tablist', () => {
    renderSettings();

    expect(screen.getByRole('tab', { name: /Section A: Targets/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Section B: Preferences & Density/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Section C: Diabetic & Dietary Rules/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Section D: Permissions & Consent/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Section E: Notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Section F: Export & Account/i })).toBeInTheDocument();
  });

  it('defaults to Section A (Metabolic Targets) when no path or initialTab is provided', () => {
    renderSettings();
    expect(screen.getByRole('tab', { name: /Section A: Targets/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Daily Glycemic Load \(GL\) Budget/i)).toBeInTheDocument();
  });

  it('switches tabs on click and activates corresponding panel', () => {
    renderSettings();

    const densityTab = screen.getByRole('tab', { name: /Section B: Preferences & Density/i });
    fireEvent.click(densityTab);
    expect(densityTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/User Interface Display Density/i)).toBeInTheDocument();

    const consentTab = screen.getByRole('tab', { name: /Section D: Permissions & Consent/i });
    fireEvent.click(consentTab);
    expect(consentTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Permissions & Data Consent Governance/i)).toBeInTheDocument();

    const notifTab = screen.getByRole('tab', { name: /Section E: Notifications/i });
    fireEvent.click(notifTab);
    expect(notifTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Notification & Alert Governance/i)).toBeInTheDocument();
  });

  it('resolves initialTab="consent" prop directly to Permissions & Consent tab', () => {
    renderSettings(['/settings'], 'consent');
    expect(screen.getByRole('tab', { name: /Section D: Permissions & Consent/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Permissions & Data Consent Governance/i)).toBeInTheDocument();
  });

  it('resolves URL path "/settings/notifications" to Notification Governance tab', () => {
    renderSettings(['/settings/notifications']);
    expect(screen.getByRole('tab', { name: /Section E: Notifications/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Notification & Alert Governance/i)).toBeInTheDocument();
  });

  it('enforces numerical target validation (> 0)', () => {
    renderSettings();

    const glInput = screen.getByLabelText(/Daily GL Target/i);
    fireEvent.change(glInput, { target: { value: '-5' } });

    expect(screen.getByText(/GL Target must be greater than 0/i)).toBeInTheDocument();
  });

  it('toggles visual density between comfortable and compact in Section B', () => {
    renderSettings();

    fireEvent.click(screen.getByRole('tab', { name: /Section B: Preferences & Density/i }));

    const compactBtn = screen.getByRole('button', { name: /Compact \(High Density\)/i });
    fireEvent.click(compactBtn);

    const saved = JSON.parse(localStorage.getItem('glyco_user_preferences') || '{}');
    expect(saved.visualDensity).toBe('compact');
  });
});