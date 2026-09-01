import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthContext from '../../src/context/AuthContext';
import { ConsentPermissionsDashboard } from '../../src/components/patient/ConsentPermissionsDashboard';
import { clearConsentStore, grantConsent, hasActiveConsent } from '../../src/utils/consentStore';

const mockUser = {
  id: 'patient_fotis',
  name: 'Fotis Pastrakis',
  email: 'fotis@glycogourmet.com',
};

const renderDashboard = () => {
  return render(
    <AuthContext.Provider value={{ user: mockUser }}>
      <ConsentPermissionsDashboard />
    </AuthContext.Provider>
  );
};

describe('ConsentPermissionsDashboard Component', () => {
  beforeEach(() => {
    clearConsentStore();
  });

  it('renders consent authorizations with version and scope tags', () => {
    grantConsent({
      grantorId: 'patient_fotis',
      granteeId: 'Glycemic Wellness Center',
      purpose: 'Endocrinology Collaboration',
      scope: ['intake_redirect', 'dietitian_share'],
      version: '2.1',
    });

    renderDashboard();

    expect(screen.getByText('Endocrinology Collaboration')).toBeInTheDocument();
    expect(screen.getByText('v2.1')).toBeInTheDocument();
    expect(screen.getByText(/Grantee:/i)).toBeInTheDocument();
    expect(screen.getByText('Glycemic Wellness Center')).toBeInTheDocument();
    expect(screen.getByText('Intake Referral')).toBeInTheDocument();
    expect(screen.getByText('Dietitian Plan Sharing')).toBeInTheDocument();
  });

  it('executes 1-click revocation and immediately updates status in UI and store', async () => {
    const record = grantConsent({
      grantorId: 'patient_fotis',
      granteeId: 'Clinic Alpha',
      purpose: 'Dietitian Review',
      scope: ['dietitian_share'],
      version: '2.1',
    });

    expect(hasActiveConsent('patient_fotis', 'dietitian_share')).toBe(true);

    renderDashboard();

    const revokeBtn = screen.getByRole('button', { name: /Revoke access for Dietitian Review/i });
    fireEvent.click(revokeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Access revoked for "Dietitian Review"/i)).toBeInTheDocument();
    });

    expect(hasActiveConsent('patient_fotis', 'dietitian_share')).toBe(false);
    expect(screen.getByText('Revoked')).toBeInTheDocument();
  });

  it('opens grant modal and allows adding a new authorization', async () => {
    renderDashboard();

    const openModalBtn = screen.getByRole('button', { name: /Authorize new clinical data share/i });
    fireEvent.click(openModalBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Authorize New Clinical Share')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Grant Access/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/granted successfully/i)).toBeInTheDocument();
    });
  });
});