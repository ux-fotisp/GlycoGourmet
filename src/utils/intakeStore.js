// src/utils/intakeStore.js
/**
 * Clinic Intake Pipeline Store - De-Identified Operational Referral Management (v0.2)
 *
 * Implements non-clinical, de-identified operational intake lead records for Clinic Administrators.
 *
 * Safety & Privacy Invariants:
 * - Zero personal identifiers (no name, email, phone, DOB, address).
 * - Zero clinical data (no diagnosis, glucose, A1c, CGM, carb target, meal plan, smart swap).
 * - Every stage movement, tier transition, or practitioner assignment produces an immutable audit record.
 * - Never auto-advances leads from automated suggestions.
 */

import { logAdminAction } from './auditStore';

export const PIPELINE_STAGES = [
  'Inquiry',
  'Contacted',
  'Intake Sent',
  'Scheduled',
  'Active',
  'Lapsed',
];

export const REFERRAL_SOURCES = {
  gp_referral: 'GP Referral',
  self_service_redirect: 'Self-Service Redirect',
  campaign: 'Public Outreach',
  walk_in: 'Walk-in Inquiry',
  patient_referral: 'Patient Referral',
};

export const SERVICE_TIERS = {
  FULL_CARE: 'Full Care',
  ONLINE_SESSION_ONLY: 'Online-Session-Only',
};

export const CONTROLLED_STAGE_REASONS = [
  'Attempted contact',
  'Appointment coordination',
  'Intake materials sent',
  'Administrative follow-up',
  'No response',
  'Other administrative reason',
];

const STORAGE_KEY = 'glyco_clinic_intake_leads';

// De-identified operational seed fixtures
const INITIAL_DEIDENTIFIED_LEADS = [
  {
    id: 'intake_1011',
    clinicId: 'clinic-glycemic-wellness',
    referenceCode: 'INT-1011',
    referralSource: 'self_service_redirect',
    serviceTier: 'FULL_CARE',
    stage: 'Inquiry',
    assignedDietitianId: null,
    assignedDietitianName: null,
    createdAt: '2026-02-28T09:15:00.000Z',
    updatedAt: '2026-02-28T09:15:00.000Z',
    stageReason: 'Attempted contact',
  },
  {
    id: 'intake_1012',
    clinicId: 'clinic-glycemic-wellness',
    referenceCode: 'INT-1012',
    referralSource: 'gp_referral',
    serviceTier: 'FULL_CARE',
    stage: 'Contacted',
    assignedDietitianId: null,
    assignedDietitianName: null,
    createdAt: '2026-02-27T11:30:00.000Z',
    updatedAt: '2026-02-28T14:20:00.000Z',
    stageReason: 'Attempted contact',
  },
  {
    id: 'intake_1013',
    clinicId: 'clinic-glycemic-wellness',
    referenceCode: 'INT-1013',
    referralSource: 'campaign',
    serviceTier: 'ONLINE_SESSION_ONLY',
    stage: 'Intake Sent',
    assignedDietitianId: null,
    assignedDietitianName: null,
    createdAt: '2026-02-26T14:00:00.000Z',
    updatedAt: '2026-02-27T10:15:00.000Z',
    stageReason: 'Intake materials sent',
  },
  {
    id: 'intake_1014',
    clinicId: 'clinic-glycemic-wellness',
    referenceCode: 'INT-1014',
    referralSource: 'patient_referral',
    serviceTier: 'FULL_CARE',
    stage: 'Scheduled',
    assignedDietitianId: 'dietitian-1',
    assignedDietitianName: 'Dr. Sarah Jenkins',
    createdAt: '2026-02-25T16:45:00.000Z',
    updatedAt: '2026-02-28T16:00:00.000Z',
    stageReason: 'Appointment coordination',
  },
  {
    id: 'intake_1015',
    clinicId: 'clinic-glycemic-wellness',
    referenceCode: 'INT-1015',
    referralSource: 'self_service_redirect',
    serviceTier: 'ONLINE_SESSION_ONLY',
    stage: 'Scheduled',
    assignedDietitianId: 'dietitian-2',
    assignedDietitianName: 'Marcus Vance',
    createdAt: '2026-02-24T10:00:00.000Z',
    updatedAt: '2026-02-28T11:00:00.000Z',
    stageReason: 'Appointment coordination',
  },
  {
    id: 'intake_1016',
    clinicId: 'clinic-glycemic-wellness',
    referenceCode: 'INT-1016',
    referralSource: 'gp_referral',
    serviceTier: 'FULL_CARE',
    stage: 'Active',
    assignedDietitianId: 'dietitian-1',
    assignedDietitianName: 'Dr. Sarah Jenkins',
    createdAt: '2026-02-15T08:30:00.000Z',
    updatedAt: '2026-02-22T09:00:00.000Z',
    stageReason: 'Administrative follow-up',
  },
  {
    id: 'intake_1017',
    clinicId: 'clinic-glycemic-wellness',
    referenceCode: 'INT-1017',
    referralSource: 'walk_in',
    serviceTier: 'ONLINE_SESSION_ONLY',
    stage: 'Lapsed',
    assignedDietitianId: null,
    assignedDietitianName: null,
    createdAt: '2026-02-10T13:20:00.000Z',
    updatedAt: '2026-02-20T17:00:00.000Z',
    stageReason: 'No response',
  },
];

/**
 * Initialize storage with de-identified operational seed fixtures if empty.
 */
const initStore = () => {
  if (typeof window === 'undefined') return INITIAL_DEIDENTIFIED_LEADS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEIDENTIFIED_LEADS));
    return INITIAL_DEIDENTIFIED_LEADS;
  }
  try {
    return JSON.parse(raw);
  } catch (_e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEIDENTIFIED_LEADS));
    return INITIAL_DEIDENTIFIED_LEADS;
  }
};

/**
 * Retrieve all intake lead records for a given clinic.
 */
export const getIntakeLeads = async (clinicId = 'clinic-glycemic-wellness') => {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('glyco_jwt') : null;
    const res = await fetch('/api/intake-leads?populate=*', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      const rawLeads = data?.data;
      if (Array.isArray(rawLeads) && rawLeads.length > 0) {
        return rawLeads.map((item) => {
          const attrs = item.attributes || item;
          const assignedD = attrs.assignedDietitian?.data?.attributes || attrs.assignedDietitian;
          return {
            id: String(item.id || attrs.id),
            clinicId: String(attrs.clinic?.data?.id || attrs.clinic?.id || attrs.clinic || clinicId),
            referenceCode: attrs.referenceCode,
            referralSource: attrs.referralSource,
            serviceTier: attrs.serviceTier,
            stage: attrs.stage,
            stageReason: attrs.stageReason || '',
            assignedDietitianId: assignedD ? String(assignedD.id || '') : null,
            assignedDietitianName: attrs.assignedDietitianName || assignedD?.name || null,
            createdAt: attrs.createdAt,
            updatedAt: attrs.updatedAt,
          };
        });
      }
    }
  } catch (_e) {
    // Graceful offline fallback
  }

  const leads = initStore();
  return leads.filter((l) => !clinicId || l.clinicId === clinicId);
};

/**
 * Create a new de-identified operational intake record.
 */
export const createIntakeLead = async (
  {
    clinicId = 'clinic-glycemic-wellness',
    referenceCode = null,
    referralSource = 'self_service_redirect',
    serviceTier = 'FULL_CARE',
    stage = 'Inquiry',
    stageReason = 'Attempted contact',
  },
  actorId = 'admin_konstantina'
) => {
  const leads = initStore();
  const nextNum = Math.floor(1000 + Math.random() * 9000);
  const code = referenceCode || `INT-${nextNum}`;

  const newLead = {
    id: `intake_${Date.now()}_${nextNum}`,
    clinicId,
    referenceCode: code,
    referralSource,
    serviceTier,
    stage: PIPELINE_STAGES.includes(stage) ? stage : 'Inquiry',
    assignedDietitianId: null,
    assignedDietitianName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stageReason: CONTROLLED_STAGE_REASONS.includes(stageReason) ? stageReason : 'Attempted contact',
  };

  leads.unshift(newLead);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  // Immutable audit log entry
  logAdminAction({
    actorId,
    actorRole: 'clinic_admin',
    action: 'intake_stage_changed',
    entityId: newLead.referenceCode,
    entityType: 'referral_lead',
    suggestedValue: null,
    finalValue: {
      actionType: 'CREATED',
      stage: newLead.stage,
      serviceTier: newLead.serviceTier,
      referralSource: newLead.referralSource,
      stageReason: newLead.stageReason,
    },
    note: newLead.stageReason,
  });

  return newLead;
};

/**
 * Move a lead to a new pipeline stage with explicit Clinic Admin confirmation.
 */
export const updateLeadStage = async (
  leadId,
  newStage,
  stageReason = 'Administrative follow-up',
  actorId = 'admin_konstantina'
) => {
  if (!PIPELINE_STAGES.includes(newStage)) {
    throw new Error(`Invalid pipeline stage: ${newStage}`);
  }

  const leads = initStore();
  const index = leads.findIndex((l) => l.id === leadId || l.referenceCode === leadId);
  if (index === -1) {
    throw new Error(`Intake lead ${leadId} not found`);
  }

  const prevStage = leads[index].stage;
  const validatedReason = CONTROLLED_STAGE_REASONS.includes(stageReason)
    ? stageReason
    : 'Administrative follow-up';

  leads[index] = {
    ...leads[index],
    stage: newStage,
    stageReason: validatedReason,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  // Immutable audit log entry
  logAdminAction({
    actorId,
    actorRole: 'clinic_admin',
    action: 'intake_stage_changed',
    entityId: leads[index].referenceCode,
    entityType: 'referral_lead',
    suggestedValue: null,
    finalValue: {
      previousStage: prevStage,
      newStage,
      serviceTier: leads[index].serviceTier,
      stageReason: validatedReason,
    },
    note: validatedReason,
  });

  return leads[index];
};

/**
 * Update the service tier (Full Care vs Online-Session-Only) of an intake lead.
 */
export const updateLeadServiceTier = async (
  leadId,
  serviceTier,
  actorId = 'admin_konstantina'
) => {
  if (!SERVICE_TIERS[serviceTier]) {
    throw new Error(`Invalid service tier: ${serviceTier}`);
  }

  const leads = initStore();
  const index = leads.findIndex((l) => l.id === leadId || l.referenceCode === leadId);
  if (index === -1) {
    throw new Error(`Intake lead ${leadId} not found`);
  }

  const prevTier = leads[index].serviceTier;
  leads[index] = {
    ...leads[index],
    serviceTier,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  // Immutable audit log entry
  logAdminAction({
    actorId,
    actorRole: 'clinic_admin',
    action: 'intake_service_tier_changed',
    entityId: leads[index].referenceCode,
    entityType: 'referral_lead',
    suggestedValue: null,
    finalValue: {
      previousTier: prevTier,
      newTier: serviceTier,
      stage: leads[index].stage,
    },
  });

  return leads[index];
};

/**
 * Explicitly assign a dietitian from the clinic roster to an intake lead.
 */
export const assignDietitianToLead = async (
  leadId,
  dietitianId,
  dietitianName,
  actorId = 'admin_konstantina'
) => {
  const leads = initStore();
  const index = leads.findIndex((l) => l.id === leadId || l.referenceCode === leadId);
  if (index === -1) {
    throw new Error(`Intake lead ${leadId} not found`);
  }

  leads[index] = {
    ...leads[index],
    assignedDietitianId: dietitianId,
    assignedDietitianName: dietitianName,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  // Immutable audit log entry
  logAdminAction({
    actorId,
    actorRole: 'clinic_admin',
    action: 'dietitian_assigned',
    entityId: leads[index].referenceCode,
    entityType: 'referral_lead',
    suggestedValue: null,
    finalValue: {
      dietitianId,
      dietitianName,
      stage: leads[index].stage,
      serviceTier: leads[index].serviceTier,
    },
  });

  return leads[index];
};

/**
 * Calculate neutral, non-conversion operational metrics.
 */
export const getPipelineMetrics = (leads = []) => {
  const totalRecords = leads.length;
  const stageDistribution = {};
  PIPELINE_STAGES.forEach((s) => {
    stageDistribution[s] = 0;
  });

  const tierDistribution = {
    FULL_CARE: 0,
    ONLINE_SESSION_ONLY: 0,
  };

  leads.forEach((l) => {
    if (stageDistribution[l.stage] !== undefined) {
      stageDistribution[l.stage] += 1;
    }
    if (tierDistribution[l.serviceTier] !== undefined) {
      tierDistribution[l.serviceTier] += 1;
    }
  });

  const openRecords = (stageDistribution['Inquiry'] || 0) +
    (stageDistribution['Contacted'] || 0) +
    (stageDistribution['Intake Sent'] || 0) +
    (stageDistribution['Scheduled'] || 0);

  const scheduledSessions = stageDistribution['Scheduled'] || 0;
  const activeRecords = stageDistribution['Active'] || 0;
  const lapsedRecords = stageDistribution['Lapsed'] || 0;

  return {
    totalRecords,
    openRecords,
    scheduledSessions,
    activeRecords,
    lapsedRecords,
    stageDistribution,
    tierDistribution,
  };
};

/**
 * Clear the intake store (for test suite isolation only).
 */
export const clearIntakeStore = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};