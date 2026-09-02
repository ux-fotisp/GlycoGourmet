import { describe, it, expect, beforeEach } from 'vitest';
import {
  PIPELINE_STAGES,
  REFERRAL_SOURCES,
  SERVICE_TIERS,
  getIntakeLeads,
  createIntakeLead,
  updateLeadStage,
  updateLeadServiceTier,
  assignDietitianToLead,
  getPipelineMetrics,
  clearIntakeStore,
} from '../../src/utils/intakeStore';
import { getAllAuditLogs, clearAuditStore } from '../../src/utils/auditStore';

describe('Intake Store - De-Identified Operational Referral Model', () => {
  beforeEach(() => {
    clearIntakeStore();
    clearAuditStore();
  });

  it('defines exactly the six canonical pipeline stages', () => {
    expect(PIPELINE_STAGES).toEqual([
      'Inquiry',
      'Contacted',
      'Intake Sent',
      'Scheduled',
      'Active',
      'Lapsed',
    ]);
  });

  it('seeds fixture records containing zero personal identifiers or clinical variables', async () => {
    const leads = await getIntakeLeads();
    expect(leads.length).toBeGreaterThan(0);

    leads.forEach((lead) => {
      // Must use de-identified reference codes
      expect(lead.referenceCode).toMatch(/^INT-\d{4}$/);
      expect(PIPELINE_STAGES).toContain(lead.stage);
      expect(['FULL_CARE', 'ONLINE_SESSION_ONLY']).toContain(lead.serviceTier);

      // Explicit PHI Boundary Assertion: Record must NOT contain personal contact or clinical fields
      const serialized = JSON.stringify(lead);
      expect(serialized).not.toMatch(/"name"/i);
      expect(serialized).not.toMatch(/"email"/i);
      expect(serialized).not.toMatch(/"phone"/i);
      expect(serialized).not.toMatch(/glucose/i);
      expect(serialized).not.toMatch(/A1c/i);
      expect(serialized).not.toMatch(/CGM/i);
      expect(serialized).not.toMatch(/carb/i);
      expect(serialized).not.toMatch(/mealPlan/i);
      expect(serialized).not.toMatch(/smartSwap/i);
      expect(serialized).not.toMatch(/diagnosis/i);
      expect(serialized).not.toMatch(/Fotis/i);
      expect(serialized).not.toMatch(/Maria/i);
    });
  });

  it('creates a de-identified operational intake record and logs an immutable audit entry', async () => {
    const created = await createIntakeLead(
      {
        referralSource: 'gp_referral',
        serviceTier: 'FULL_CARE',
        stage: 'Inquiry',
        stageReason: 'Attempted contact',
      },
      'admin_konstantina'
    );

    expect(created.referenceCode).toMatch(/^INT-\d{4}$/);
    expect(created.stage).toBe('Inquiry');
    expect(created.serviceTier).toBe('FULL_CARE');

    const logs = getAllAuditLogs();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.actorRole).toBe('clinic_admin');
    expect(log.action).toBe('intake_stage_changed');
    expect(log.entityId).toBe(created.referenceCode);
    expect(log.entityType).toBe('referral_lead');

    // Assert audit entry contains zero PHI
    const serializedLog = JSON.stringify(log);
    expect(serializedLog).not.toMatch(/glucose/i);
    expect(serializedLog).not.toMatch(/A1c/i);
    expect(serializedLog).not.toMatch(/patient/i);
  });

  it('moves lead stage and records an immutable audit entry with previous and new stage', async () => {
    const leads = await getIntakeLeads();
    const lead = leads[0];

    const updated = await updateLeadStage(
      lead.id,
      'Contacted',
      'Attempted contact',
      'admin_konstantina'
    );

    expect(updated.stage).toBe('Contacted');

    const logs = getAllAuditLogs();
    expect(logs).toHaveLength(1);
    const entry = logs[0];
    expect(entry.action).toBe('intake_stage_changed');
    expect(entry.entityId).toBe(lead.referenceCode);
    expect(entry.finalValue.previousStage).toBe(lead.stage);
    expect(entry.finalValue.newStage).toBe('Contacted');
    expect(entry.finalValue.stageReason).toBe('Attempted contact');
  });

  it('updates service tier and records an operational audit entry', async () => {
    const leads = await getIntakeLeads();
    const lead = leads[0];

    const updated = await updateLeadServiceTier(
      lead.id,
      'ONLINE_SESSION_ONLY',
      'admin_konstantina'
    );

    expect(updated.serviceTier).toBe('ONLINE_SESSION_ONLY');

    const logs = getAllAuditLogs();
    expect(logs).toHaveLength(1);
    const entry = logs[0];
    expect(entry.action).toBe('intake_service_tier_changed');
    expect(entry.entityId).toBe(lead.referenceCode);
    expect(entry.finalValue.previousTier).toBe('FULL_CARE');
    expect(entry.finalValue.newTier).toBe('ONLINE_SESSION_ONLY');
  });

  it('assigns a dietitian manually from clinic roster and records an audit entry with no ranking data', async () => {
    const leads = await getIntakeLeads();
    const lead = leads[0];

    const updated = await assignDietitianToLead(
      lead.id,
      'dietitian-1',
      'Dr. Sarah Jenkins',
      'admin_konstantina'
    );

    expect(updated.assignedDietitianId).toBe('dietitian-1');
    expect(updated.assignedDietitianName).toBe('Dr. Sarah Jenkins');

    const logs = getAllAuditLogs();
    expect(logs).toHaveLength(1);
    const entry = logs[0];
    expect(entry.action).toBe('dietitian_assigned');
    expect(entry.entityId).toBe(lead.referenceCode);
    expect(entry.finalValue.dietitianId).toBe('dietitian-1');
    expect(entry.finalValue.dietitianName).toBe('Dr. Sarah Jenkins');

    // Invariant: no algorithmic match or scoring in audit
    const serialized = JSON.stringify(entry);
    expect(serialized).not.toMatch(/score/i);
    expect(serialized).not.toMatch(/bestMatch/i);
    expect(serialized).not.toMatch(/rank/i);
  });

  it('calculates neutral operational metrics without conversion rate or performance pressure', async () => {
    const leads = await getIntakeLeads();
    const metrics = getPipelineMetrics(leads);

    expect(metrics.totalRecords).toBe(leads.length);
    expect(metrics.openRecords).toBeGreaterThan(0);
    expect(metrics.scheduledSessions).toBeGreaterThanOrEqual(0);
    expect(metrics.stageDistribution).toBeDefined();
    expect(metrics.tierDistribution).toBeDefined();

    // Invariant: no conversion rate key
    expect(metrics.conversionRate).toBeUndefined();
  });
});