import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthContext from '../../src/context/AuthContext';
import { IntakePipelineBoard } from '../../src/components/clinic-admin/IntakePipelineBoard';
import { clearIntakeStore, getIntakeLeads } from '../../src/utils/intakeStore';
import { clearAuditStore, getAllAuditLogs } from '../../src/utils/auditStore';

const mockAdminUser = {
  id: 'admin_konstantina',
  name: 'Konstantina Admin',
  email: 'konstantina@glycemicwellness.com',
  roleType: 'clinic_admin',
};

const renderBoard = (props = {}) => {
  return render(
    <AuthContext.Provider value={{ user: mockAdminUser }}>
      <IntakePipelineBoard clinicId="clinic-glycemic-wellness" {...props} />
    </AuthContext.Provider>
  );
};

describe('IntakePipelineBoard Component', () => {
  beforeEach(() => {
    clearIntakeStore();
    clearAuditStore();
  });

  it('renders all six canonical pipeline stages as column headers', async () => {
    renderBoard();

    await waitFor(() => {
      expect(screen.getByText('Intake Pipeline Board')).toBeInTheDocument();
    });

    const expectedStages = [
      'Inquiry',
      'Contacted',
      'Intake Sent',
      'Scheduled',
      'Active',
      'Lapsed',
    ];

    expectedStages.forEach((stg) => {
      expect(screen.getByRole('heading', { name: stg, level: 3 })).toBeInTheDocument();
      expect(screen.getByLabelText(`Pipeline column ${stg}`)).toBeInTheDocument();
    });
  });

  it('renders neutral operational metrics without conversion rate or performance pressure', async () => {
    renderBoard();

    await waitFor(() => {
      expect(screen.getByText('Total Records')).toBeInTheDocument();
      expect(screen.getByText('Open Records')).toBeInTheDocument();
      expect(screen.getByText('Active Clients')).toBeInTheDocument();
      expect(screen.getByText('Tier Breakdown')).toBeInTheDocument();
    });

    // Invariant: no conversion rate in DOM
    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toMatch(/conversion rate/i);
    expect(bodyText).not.toMatch(/pipeline velocity/i);
  });

  it('executes explicit keyboard-accessible stage movement and writes an immutable audit record', async () => {
    renderBoard();

    await waitFor(() => {
      expect(screen.getByText('INT-1011')).toBeInTheDocument();
    });

    // Advance button for INT-1011 (in Inquiry -> should move to Contacted)
    const advanceBtn = screen.getByRole('button', { name: /Move INT-1011 forward to Contacted/i });
    expect(advanceBtn).toBeInTheDocument();

    fireEvent.click(advanceBtn);

    await waitFor(() => {
      expect(screen.getByText(/Updated INT-1011 to stage "Contacted"/i)).toBeInTheDocument();
    });

    const logs = getAllAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
    const stageLog = logs.find((l) => l.action === 'intake_stage_changed');
    expect(stageLog).toBeDefined();
    expect(stageLog.entityId).toBe('INT-1011');
    expect(stageLog.finalValue.newStage).toBe('Contacted');
  });

  it('toggles service tier between Full Care and Online-Session-Only with audit trail', async () => {
    renderBoard();

    await waitFor(() => {
      expect(screen.getByText('INT-1011')).toBeInTheDocument();
    });

    const tierBtn = screen.getByRole('button', { name: /Current tier Full Care for INT-1011\. Click to change tier\./i });
    fireEvent.click(tierBtn);

    await waitFor(() => {
      expect(screen.getByText(/Updated INT-1011 tier to "Online-Session-Only"/i)).toBeInTheDocument();
    });

    const logs = getAllAuditLogs();
    const tierLog = logs.find((l) => l.action === 'intake_service_tier_changed');
    expect(tierLog).toBeDefined();
    expect(tierLog.entityId).toBe('INT-1011');
    expect(tierLog.finalValue.newTier).toBe('ONLINE_SESSION_ONLY');
  });

  it('allows manual practitioner assignment from clinic roster without algorithmic ranking', async () => {
    renderBoard();

    await waitFor(() => {
      expect(screen.getByText('INT-1011')).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Assigned practitioner for INT-1011/i);
    fireEvent.change(select, { target: { value: 'dietitian-2' } });

    await waitFor(() => {
      expect(screen.getByText(/Assigned Marcus Vance to INT-1011/i)).toBeInTheDocument();
    });

    const logs = getAllAuditLogs();
    const assignLog = logs.find((l) => l.action === 'dietitian_assigned');
    expect(assignLog).toBeDefined();
    expect(assignLog.entityId).toBe('INT-1011');
    expect(assignLog.finalValue.dietitianName).toBe('Marcus Vance');
  });

  it('creates a de-identified operational intake record without collecting contact details', async () => {
    renderBoard();

    await waitFor(() => {
      expect(screen.getByText('Intake Pipeline Board')).toBeInTheDocument();
    });

    const newBtn = screen.getByRole('button', { name: /\+ New Intake Record/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/New Operational Intake Record/i)).toBeInTheDocument();

    // Verify modal does NOT ask for name, email, or phone
    expect(screen.queryByLabelText(/Full Name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Phone/i)).not.toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Create Record/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const leads = await getIntakeLeads();
    expect(leads.length).toBe(8); // 7 initial + 1 new
  });

  it('contains zero clinical telemetry, patient identity, or algorithmic ranking in the DOM', async () => {
    const { container } = renderBoard();

    await waitFor(() => {
      expect(screen.getByText('INT-1011')).toBeInTheDocument();
    });

    const textContent = container.textContent || '';
    expect(textContent).not.toMatch(/mg\/dL/i);
    expect(textContent).not.toMatch(/mmol\/L/i);
    expect(textContent).not.toMatch(/A1c/i);
    expect(textContent).not.toMatch(/glucose/i);
    expect(textContent).not.toMatch(/insulinSensitivityFactor/i);
    expect(textContent).not.toMatch(/best match/i);
    expect(textContent).not.toMatch(/compatibility score/i);
    expect(textContent).not.toMatch(/algorithm rank/i);
    expect(textContent).not.toMatch(/conversion rate/i);
  });
});