/**
 * GlycoGourmet Trust & Governance Domain Contracts (v0.2)
 *
 * Implements non-clinical trust and audit models for:
 * 1. Layered, versioned, and revocable consent records (ConsentRecord)
 * 2. Immutable, append-only administrative audit log entries (AuditLogEntry)
 * 3. Split-channel patient notification preferences (NotificationPreference)
 *
 * FHIR / LOINC Boundary Note:
 * These objects are strictly non-clinical governance entities and must NEVER
 * be ingested into or processed by exportFHIRMetabolicTelemetry.
 */

export type ConsentStatus = 'granted' | 'active' | 'revoked' | 'expired';

export type ConsentScope =
  | 'intake_redirect'
  | 'dietitian_share'
  | 'promoted_notifications'
  | 'telemetry_analytics';

export interface ConsentRecord {
  id: string;
  grantorId: string; // Patient user ID
  granteeId: string; // Clinic ID, Dietitian ID, or 'system'
  purpose: string;
  scope: ConsentScope[];
  version: string; // e.g. '2.1'
  status: ConsentStatus;
  grantedAt: string; // ISO 8601 timestamp
  expiresAt?: string; // ISO 8601 timestamp
  revokedAt?: string | null; // ISO 8601 timestamp
  metadata?: Record<string, unknown>;
}

export type AdminActionType =
  | 'intake_stage_change'
  | 'dietitian_assigned'
  | 'tier_promoted'
  | 'promotion_configured'
  | 'suggestion_flagged_wrong';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: 'clinic_admin' | 'admin' | 'super_admin' | 'system';
  action: AdminActionType | string;
  entityId: string;
  entityType: 'referral_lead' | 'client_profile' | 'dietitian_profile' | 'promotion_config';
  suggestedValue?: unknown;
  finalValue: unknown;
  note?: string;
  timestamp: string; // ISO 8601 timestamp
}

export type NotificationChannelCategory = 'care_reminders' | 'promoted_dietitians';

export interface NotificationPreference {
  userId?: string;
  category: NotificationChannelCategory;
  enabled: boolean;
  quietHoursStart?: string; // e.g. '22:00'
  quietHoursEnd?: string; // e.g. '07:00'
  frequencyCap?: 'daily' | 'weekly' | 'biweekly';
}