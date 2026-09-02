import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthContext from '../../src/context/AuthContext';
import { EscalationFlagControl } from '../../src/components/clinic-admin/EscalationFlagControl';
import { clearAuditStore, getAllAuditLogs } from '../../src/utils/auditStore';

const mockAdminUser = {
  id: 'admin_konstantina',
  name: 'Konstantina Admin',
  email: 'konstantina@glycemicwellness.com',
  roleType: 'clinic_admin',
};

const renderControl = (props = {}) => {
  return render(
    <AuthContext.Provider value={{ user: mockAdminUser }}>
      <EscalationFlagControl
        suggestionId="sugg_tier_b_routing_101"
        suggestionType="tier_b_routing"
        suggestedValue={{ tier: 'ONLINE_SESSION_ONLY' }}
        entityId="routing_case_202"
        entityType="operational_suggestion"
        {...props}
      />
    </AuthContext.Provider>
  );
};

describe('EscalationFlagControl Component', () => {
  beforeEach(() => {
    clearAuditStore();
  });

  it('renders trigger button and opens accessible modal dialog on click', () => {
    renderControl();

    const triggerBtn = screen.getByRole('button', { name: /Flag suggestion sugg_tier_b_routing_101 as incorrect/i });
    expect(triggerBtn).toBeInTheDocument();

    fireEvent.click(triggerBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/Flag Operational Suggestion/i)).toBeInTheDocument();
    expect(screen.getByText(/Flagging this suggestion will not change it automatically\. It records your concern for human review\./i)).toBeInTheDocument();
  });

  it('closes dialog on Cancel without writing an audit record', () => {
    renderControl();

    fireEvent.click(screen.getByRole('button', { name: /Flag suggestion/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getAllAuditLogs()).toHaveLength(0);
  });

  it('closes dialog on Escape key press', () => {
    renderControl();

    fireEvent.click(screen.getByRole('button', { name: /Flag suggestion/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getAllAuditLogs()).toHaveLength(0);
  });

  it('confirms escalation and writes an immutable audit record with Clinic Admin actor role and neutral operational data', async () => {
    const onLogged = vi.fn();
    renderControl({ onEscalationLogged: onLogged });

    fireEvent.click(screen.getByRole('button', { name: /Flag suggestion/i }));

    // Select reason
    const radio = screen.getByLabelText(/Important context is missing/i);
    fireEvent.click(radio);

    // Enter note with neutral operational content
    const noteInput = screen.getByPlaceholderText(/Describe why this operational suggestion is inaccurate/i);
    fireEvent.change(noteInput, { target: { value: 'Routing criteria need human review before action.' } });

    // Submit
    const confirmBtn = screen.getByRole('button', { name: /Confirm Escalation/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Operational suggestion flagged for human review/i)).toBeInTheDocument();
    });

    const logs = getAllAuditLogs();
    expect(logs).toHaveLength(1);

    const entry = logs[0];
    expect(entry.actorId).toBe('admin_konstantina');
    expect(entry.actorRole).toBe('clinic_admin');
    expect(entry.action).toBe('operational_suggestion_escalated');
    expect(entry.entityId).toBe('routing_case_202');
    expect(entry.entityType).toBe('operational_suggestion');
    expect(entry.suggestedValue).toEqual({ tier: 'ONLINE_SESSION_ONLY' });
    expect(entry.finalValue.status).toBe('ESCALATED_FOR_HUMAN_REVIEW');
    expect(entry.finalValue.reason).toBe('Important context is missing');
    expect(entry.note).toBe('Routing criteria need human review before action.');
    expect(onLogged).toHaveBeenCalledWith(entry);

    // Explicit PHI Boundary Assertion: Serialized audit entry must contain zero patient-linked or clinical terms
    const serializedAudit = JSON.stringify(entry);
    expect(serializedAudit).not.toMatch(/Fotis/i);
    expect(serializedAudit).not.toMatch(/patient/i);
    expect(serializedAudit).not.toMatch(/glucose/i);
    expect(serializedAudit).not.toMatch(/A1c/i);
    expect(serializedAudit).not.toMatch(/mg\/dL/i);
    expect(serializedAudit).not.toMatch(/meal plan/i);
  });

  it('displays visible warning instructing user not to enter patient clinical PHI', () => {
    renderControl();

    fireEvent.click(screen.getByRole('button', { name: /Flag suggestion/i }));

    expect(screen.getByText(/Do not enter patient clinical information, medical notes, or glucose targets/i)).toBeInTheDocument();
  });
});