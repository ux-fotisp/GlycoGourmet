import { describe, it, expect, beforeEach } from 'vitest';
import {
  logAdminAction,
  getAllAuditLogs,
  getAuditLogsForEntity,
  getAuditLogsByActor,
  clearAuditStore,
} from '../../src/utils/auditStore';

describe('AuditStore (v0.2 Immutable Audit Trail)', () => {
  beforeEach(() => {
    clearAuditStore();
  });

  describe('Append-Only Audit Logging', () => {
    it('creates an immutable AuditLogEntry with generated ID and ISO timestamp', () => {
      const entry = logAdminAction({
        actorId: 'admin_konstantina',
        actorRole: 'clinic_admin',
        action: 'intake_stage_change',
        entityId: 'lead_fotis_101',
        entityType: 'referral_lead',
        suggestedValue: 'Inquiry',
        finalValue: 'Contacted',
        note: 'Reached out via secure SMS',
      });

      expect(entry.id).toMatch(/^audit_/);
      expect(entry.actorId).toBe('admin_konstantina');
      expect(entry.actorRole).toBe('clinic_admin');
      expect(entry.action).toBe('intake_stage_change');
      expect(entry.entityId).toBe('lead_fotis_101');
      expect(entry.suggestedValue).toBe('Inquiry');
      expect(entry.finalValue).toBe('Contacted');
      expect(entry.note).toBe('Reached out via secure SMS');
      expect(new Date(entry.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('enforces object freezing and immutability on returned entries', () => {
      const entry = logAdminAction({
        actorId: 'admin_konstantina',
        action: 'tier_promoted',
        entityId: 'lead_fotis_101',
        finalValue: 'FULL_CARE',
      });

      expect(Object.isFrozen(entry)).toBe(true);

      // In strict mode or frozen object, mutation is prevented
      expect(() => {
        // @ts-ignore
        entry.finalValue = 'ONLINE_SESSION_ONLY';
      }).toThrow();
    });

    it('maintains reverse chronological ordering (newest first)', () => {
      const first = logAdminAction({
        actorId: 'admin_konstantina',
        action: 'action_1',
        entityId: 'entity_1',
        finalValue: 'Val1',
      });

      const second = logAdminAction({
        actorId: 'admin_konstantina',
        action: 'action_2',
        entityId: 'entity_1',
        finalValue: 'Val2',
      });

      const all = getAllAuditLogs();
      expect(all.length).toBe(2);
      expect(all[0].id).toBe(second.id);
      expect(all[1].id).toBe(first.id);
    });
  });

  describe('Query Filters', () => {
    it('retrieves audit logs filtered by entityId', () => {
      logAdminAction({
        actorId: 'admin_konstantina',
        action: 'intake_stage_change',
        entityId: 'lead_A',
        finalValue: 'Contacted',
      });
      logAdminAction({
        actorId: 'admin_konstantina',
        action: 'intake_stage_change',
        entityId: 'lead_B',
        finalValue: 'Intake Sent',
      });
      logAdminAction({
        actorId: 'admin_konstantina',
        action: 'dietitian_assigned',
        entityId: 'lead_A',
        finalValue: 'dietitian_ivana',
      });

      const leadALogs = getAuditLogsForEntity('lead_A');
      expect(leadALogs.length).toBe(2);
      expect(leadALogs.every((l) => l.entityId === 'lead_A')).toBe(true);

      const leadBLogs = getAuditLogsForEntity('lead_B');
      expect(leadBLogs.length).toBe(1);
      expect(leadBLogs[0].entityId === 'lead_B').toBe(true);
    });

    it('retrieves audit logs filtered by actorId', () => {
      logAdminAction({
        actorId: 'admin_konstantina',
        action: 'dietitian_assigned',
        entityId: 'lead_A',
        finalValue: 'dietitian_1',
      });
      logAdminAction({
        actorId: 'admin_super',
        actorRole: 'super_admin',
        action: 'tier_promoted',
        entityId: 'lead_A',
        finalValue: 'ENTERPRISE',
      });

      const konstantinaLogs = getAuditLogsByActor('admin_konstantina');
      expect(konstantinaLogs.length).toBe(1);
      expect(konstantinaLogs[0].actorId).toBe('admin_konstantina');
    });
  });

  describe('Defensive Validation', () => {
    it('throws when required fields are missing', () => {
      expect(() => {
        logAdminAction({
          actorId: 'admin_konstantina',
          action: 'missing_entity',
        });
      }).toThrow('[auditStore] actorId, action, and entityId are required to record an audit log');
    });

    it('returns empty array when querying empty or non-existent parameters', () => {
      expect(getAuditLogsForEntity(null)).toEqual([]);
      expect(getAuditLogsByActor('')).toEqual([]);
      expect(getAuditLogsForEntity('non_existent')).toEqual([]);
    });
  });
});