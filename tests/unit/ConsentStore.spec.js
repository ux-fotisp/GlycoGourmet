import { describe, it, expect, beforeEach } from 'vitest';
import {
  grantConsent,
  revokeConsent,
  revokeConsentByScope,
  getConsentById,
  getConsentsByGrantor,
  hasActiveConsent,
  getConsentStatusDescriptor,
  clearConsentStore,
  getAllConsents,
} from '../../src/utils/consentStore';

describe('ConsentStore (v0.2 Trust Governance Layer)', () => {
  beforeEach(() => {
    clearConsentStore();
  });

  describe('Consent Lifecycle: Grant -> Active -> Revoke', () => {
    it('grants a new versioned consent record with correct defaults', () => {
      const record = grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_101',
        purpose: 'Intake and Dietitian Consultation',
        scope: ['intake_redirect'],
        version: '2.1',
      });

      expect(record.id).toMatch(/^consent_/);
      expect(record.grantorId).toBe('patient_fotis');
      expect(record.granteeId).toBe('clinic_101');
      expect(record.purpose).toBe('Intake and Dietitian Consultation');
      expect(record.scope).toEqual(['intake_redirect']);
      expect(record.version).toBe('2.1');
      expect(record.status).toBe('granted');
      expect(record.revokedAt).toBeNull();
      expect(new Date(record.grantedAt).getTime()).toBeGreaterThan(0);
    });

    it('confirms hasActiveConsent returns true for an active granted record', () => {
      grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_101',
        purpose: 'Intake Redirect',
        scope: ['intake_redirect'],
      });

      expect(hasActiveConsent('patient_fotis', 'intake_redirect', 'clinic_101')).toBe(true);
      expect(hasActiveConsent('patient_fotis', 'dietitian_share', 'clinic_101')).toBe(false);
      expect(hasActiveConsent('patient_unknown', 'intake_redirect')).toBe(false);
    });

    it('revoking consent immediately reflects revoked status and halts hasActiveConsent', () => {
      const record = grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_101',
        purpose: 'Intake Redirect',
        scope: ['intake_redirect'],
      });

      expect(hasActiveConsent('patient_fotis', 'intake_redirect')).toBe(true);

      const revoked = revokeConsent(record.id, 'User clicked one-click revoke');

      expect(revoked.status).toBe('revoked');
      expect(revoked.revokedAt).toBeTruthy();
      expect(revoked.metadata.revocationReason).toBe('User clicked one-click revoke');

      // Immediate verification: access is halted
      expect(hasActiveConsent('patient_fotis', 'intake_redirect')).toBe(false);
      const descriptor = getConsentStatusDescriptor('patient_fotis', 'intake_redirect');
      expect(descriptor.status).toBe('revoked');
      expect(descriptor.isActive).toBe(false);
    });

    it('revokes consent by scope for a patient across all grantees', () => {
      grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_101',
        purpose: 'Intake',
        scope: ['intake_redirect'],
      });
      grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_202',
        purpose: 'Secondary Intake',
        scope: ['intake_redirect'],
      });

      expect(hasActiveConsent('patient_fotis', 'intake_redirect')).toBe(true);

      const revokedList = revokeConsentByScope('patient_fotis', 'intake_redirect', 'Master Opt-out');
      expect(revokedList.length).toBe(2);
      expect(hasActiveConsent('patient_fotis', 'intake_redirect')).toBe(false);
    });
  });

  describe('Versioning & Superseding Scope Transitions', () => {
    it('automatically supersedes previous version when granting updated version for same purpose', () => {
      const v1 = grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_101',
        purpose: 'Care Coordination',
        scope: ['intake_redirect'],
        version: '1.0',
      });

      expect(v1.status).toBe('granted');

      const v2 = grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_101',
        purpose: 'Care Coordination',
        scope: ['intake_redirect', 'dietitian_share'],
        version: '2.0',
      });

      const updatedV1 = getConsentById(v1.id);
      expect(updatedV1.status).toBe('expired');
      expect(updatedV1.metadata.supersededByVersion).toBe('2.0');

      expect(v2.status).toBe('granted');
      expect(v2.version).toBe('2.0');

      const all = getAllConsents();
      expect(all.length).toBe(2);
    });
  });

  describe('Expiration & Edge Cases', () => {
    it('treats past expiresAt as inactive', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
      grantConsent({
        grantorId: 'patient_fotis',
        granteeId: 'clinic_101',
        purpose: 'Timed Session',
        scope: ['dietitian_share'],
        expiresAt: pastDate,
      });

      expect(hasActiveConsent('patient_fotis', 'dietitian_share')).toBe(false);
      const descriptor = getConsentStatusDescriptor('patient_fotis', 'dietitian_share');
      expect(descriptor.status).toBe('expired');
      expect(descriptor.isActive).toBe(false);
    });

    it('throws when grantorId is omitted', () => {
      expect(() => {
        grantConsent({
          purpose: 'Invalid',
        });
      }).toThrow('[consentStore] grantorId is required to grant consent');
    });

    it('returns empty results defensively for non-existent grantors', () => {
      expect(getConsentsByGrantor('non_existent')).toEqual([]);
      expect(getConsentById('non_existent')).toBeNull();
      expect(revokeConsent('non_existent')).toBeNull();
      expect(revokeConsentByScope('non_existent', 'intake_redirect')).toEqual([]);
    });
  });
});