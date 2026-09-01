import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserPreferencesProvider } from '../../src/context/UserPreferences';
import AuthContext from '../../src/context/AuthContext';
import NotificationGovernancePanel from '../../src/components/patient/NotificationGovernancePanel';

const renderPanel = () => {
  return render(
    <AuthContext.Provider value={{ user: { id: 'patient_1' } }}>
      <UserPreferencesProvider>
        <NotificationGovernancePanel />
      </UserPreferencesProvider>
    </AuthContext.Provider>
  );
};

describe('NotificationGovernancePanel Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders dual channels: Care Reminders and Promoted Dietitian Spotlights', () => {
    renderPanel();

    expect(screen.getByText(/Channel A: Metabolic Care Reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/Channel B: Promoted Dietitian & Clinic Spotlights/i)).toBeInTheDocument();
  });

  it('toggles Care Reminders switch independently and persists to storage', () => {
    renderPanel();

    const careSwitch = screen.getByRole('switch', { name: /Toggle Metabolic Care Reminders/i });
    expect(careSwitch).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(careSwitch);
    expect(careSwitch).toHaveAttribute('aria-checked', 'false');

    const saved = JSON.parse(localStorage.getItem('glyco_user_preferences') || '{}');
    expect(saved.notificationPreferences.careReminders.enabled).toBe(false);
  });

  it('toggles Promoted Dietitian spotlights and updates frequency cap', () => {
    renderPanel();

    const promoSwitch = screen.getByRole('switch', { name: /Toggle Promoted Dietitian Spotlights/i });
    expect(promoSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(promoSwitch);
    expect(promoSwitch).toHaveAttribute('aria-checked', 'true');

    const selectCap = screen.getByLabelText(/Select promotion frequency cap/i);
    fireEvent.change(selectCap, { target: { value: 'daily' } });

    const saved = JSON.parse(localStorage.getItem('glyco_user_preferences') || '{}');
    expect(saved.notificationPreferences.promotedDietitians.enabled).toBe(true);
    expect(saved.notificationPreferences.promotedDietitians.frequencyCap).toBe('daily');
  });
});