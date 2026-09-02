import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PHIBoundaryBanner } from '../../src/components/clinic-admin/PHIBoundaryBanner';
import * as permissionsHook from '../../src/hooks/usePermissions';

describe('PHIBoundaryBanner Component', () => {
  it('renders for permitted Clinic Admin context', () => {
    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      role: 'clinic_admin',
      canManageClinic: true,
      canManageIntakePipeline: true,
      canManageClinicalRecords: false,
    });

    render(<PHIBoundaryBanner />);

    expect(screen.getByLabelText(/Clinic Administration Data Boundary Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational Administration Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Clinical records, metabolic targets, meal plans, and recipe-swap rules are unavailable in this workspace/i)).toBeInTheDocument();
  });

  it('renders for super_admin in a valid operational context', () => {
    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      role: 'super_admin',
      canManageClinic: true,
      canManageIntakePipeline: true,
      canManageClinicalRecords: true,
    });

    render(<PHIBoundaryBanner />);

    expect(screen.getByLabelText(/Clinic Administration Data Boundary Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational Administration Workspace/i)).toBeInTheDocument();
  });

  it('does NOT render for patient context', () => {
    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      role: 'user',
      canManageClinic: false,
      canManageIntakePipeline: false,
      canManageClinicalRecords: false,
    });

    const { container } = render(<PHIBoundaryBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does NOT render for ordinary clinical dietitian context', () => {
    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      role: 'dietitian',
      canManageClinic: false,
      canManageIntakePipeline: false,
      canManageClinicalRecords: true,
    });

    const { container } = render(<PHIBoundaryBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('toggles accessible disclosure panel and explains allowed vs excluded boundaries', () => {
    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      role: 'clinic_admin',
      canManageClinic: true,
      canManageIntakePipeline: true,
    });

    render(<PHIBoundaryBanner />);

    const disclosureBtn = screen.getByRole('button', { name: /What can I manage\?/i });
    expect(disclosureBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(disclosureBtn);
    expect(disclosureBtn).toHaveAttribute('aria-expanded', 'true');

    // Permitted operational work
    expect(screen.getByText(/Permitted Operational Work/i)).toBeInTheDocument();
    expect(screen.getByText(/Intake pipeline management & lead status triage/i)).toBeInTheDocument();
    expect(screen.getByText(/Two-tier service routing/i)).toBeInTheDocument();

    // Excluded clinical areas
    expect(screen.getByText(/Excluded Protected Health Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient clinical records & medical consultation notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Continuous glucose monitoring/i)).toBeInTheDocument();
  });

  it('contains zero clinical telemetry or patient PHI values in the DOM', () => {
    vi.spyOn(permissionsHook, 'usePermissions').mockReturnValue({
      role: 'clinic_admin',
      canManageClinic: true,
      canManageIntakePipeline: true,
    });

    const { container } = render(<PHIBoundaryBanner />);

    const textContent = container.textContent || '';
    expect(textContent).not.toMatch(/mg\/dL/i);
    expect(textContent).not.toMatch(/mmol\/L/i);
    expect(textContent).not.toMatch(/A1c/i);
    expect(textContent).not.toMatch(/insulinSensitivityFactor/i);
  });
});