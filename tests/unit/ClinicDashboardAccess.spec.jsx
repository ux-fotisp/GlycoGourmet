import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/routes/ProtectedRoute';
import ClinicDashboard from '../../src/pages/ClinicDashboard';
import * as permissionsHook from '../../src/hooks/usePermissions';
import AuthContext from '../../src/context/AuthContext';

describe('ClinicDashboard Access Control (RBAC Boundary)', () => {
  const renderGatedClinicDashboard = (userRole = 'clinic_admin', canManageClinic = true) => {
    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      role: userRole,
      isApproved: true,
      canManageClinic,
      canManageIntakePipeline: canManageClinic,
      canManageClinicalRecords: false,
    });

    const mockUser = {
      id: 'test_user',
      name: 'Test User',
      email: 'user@clinic.com',
      roleType: userRole,
      onboarded: true,
    };

    return render(
      <AuthContext.Provider value={{ user: mockUser, isAuthenticated: true, isLoading: false }}>
        <MemoryRouter initialEntries={['/clinic-dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute requiredPermission="canManageClinic" />}>
              <Route path="/clinic-dashboard" element={<ClinicDashboard />} />
            </Route>
            <Route path="/" element={<div>Home Page (Access Denied)</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('allows Clinic Admin access to the Clinic Dashboard and Intake Pipeline', async () => {
    renderGatedClinicDashboard('clinic_admin', true);

    await waitFor(() => {
      expect(screen.queryByText(/Home Page \(Access Denied\)/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Clinic Administration Data Boundary Notice/i)).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Intake Pipeline/i })).toBeInTheDocument();
    });
  });

  it('blocks ordinary patient from accessing Clinic Dashboard', async () => {
    renderGatedClinicDashboard('user', false);

    await waitFor(() => {
      expect(screen.getByText(/Home Page \(Access Denied\)/i)).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /Intake Pipeline/i })).not.toBeInTheDocument();
    });
  });

  it('blocks ordinary clinical dietitian from accessing Clinic Dashboard', async () => {
    renderGatedClinicDashboard('dietitian', false);

    await waitFor(() => {
      expect(screen.getByText(/Home Page \(Access Denied\)/i)).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /Intake Pipeline/i })).not.toBeInTheDocument();
    });
  });
});