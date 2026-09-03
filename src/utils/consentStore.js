// src/utils/consentStore.js
/**
 * GlycoGourmet Consent Management Store (v0.2)
 *
 * Provides reactive, versioned, and revocable consent lifecycle management:
 * Lifecycle States: Granted -> Active -> Revoked / Expired
 *
 * FHIR / LOINC Isolation Boundary:
 * Non-clinical governance business object â€” strictly isolated from metabolic telemetry.
 */

const STORAGE_KEY = 'glyco_consent_records';
let inMemoryStore = [];

/**
 * Reads all consent records from storage (localStorage or in-memory fallback)
 */
export const getAllConsents = () => {
  if (typeof localStorage === 'undefined') {
    return [...inMemoryStore];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('[consentStore] Error parsing consent records:', err);
    return [];
  }
};

/**
 * Persists consent records to storage and emits change event
 */

/**
 * Asynchronously fetches live consent records from Strapi /api/consent-records
 * and updates in-memory and local storage.
 */
export const fetchConsentsFromStrapi = async () => {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('glyco_jwt') : null;
    const res = await fetch('/api/consent-records?populate=*', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      const rawRecords = data?.data;
      if (Array.isArray(rawRecords)) {
        const mapped = rawRecords.map((item) => {
          const attrs = item.attributes || item;
          return {
            id: String(item.id || attrs.id),
            grantorId: String(attrs.grantor?.data?.id || attrs.grantor?.id || attrs.grantorId || ''),
            granteeId: attrs.granteeId || 'system',
            clinicId: attrs.clinic?.data?.id || attrs.clinic?.id || attrs.clinicId || null,
            purpose: attrs.purpose || '',
            scope: Array.isArray(attrs.scope) ? attrs.scope : [],
            version: attrs.version || '2.1',
            status: attrs.status || 'active',
            grantedAt: attrs.grantedAt || new Date().toISOString(),
            expiresAt: attrs.expiresAt || null,
            revokedAt: attrs.revokedAt || null,
            metadata: attrs.metadata || {},
          };
        });
        saveConsents(mapped);
        return mapped;
      }
    }
  } catch (_e) {
    // Graceful offline fallback
  }
  return getAllConsents();
};

const saveConsents = (records) => {
  inMemoryStore = [...records];
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('[consentStore] Error saving consent records:', err);
    }
  }

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('glyco:consent:updated', { detail: { records } }));
    } catch (_e) {
      // Ignore in non-browser environments
    }
  }
};

/**
 * Grants a new versioned consent record.
 * Automatically supersedes any older active consent with matching grantorId, granteeId, and purpose.
 */
export const grantConsent = ({
  grantorId,
  granteeId = 'system',
  purpose,
  scope = ['intake_redirect'],
  version = '2.1',
  expiresAt = null,
  metadata = {},
}) => {
  if (!grantorId) {
    throw new Error('[consentStore] grantorId is required to grant consent');
  }

  const existing = getAllConsents();

  // Supersede existing active records with identical scope/grantee
  const updatedExisting = existing.map((rec) => {
    if (
      rec.grantorId === grantorId &&
      rec.granteeId === granteeId &&
      rec.purpose === purpose &&
      (rec.status === 'granted' || rec.status === 'active') &&
      !rec.revokedAt
    ) {
      return {
        ...rec,
        status: 'expired',
        metadata: {
          ...rec.metadata,
          supersededByVersion: version,
          supersededAt: new Date().toISOString(),
        },
      };
    }
    return rec;
  });

  const newRecord = {
    id: `consent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    grantorId,
    granteeId,
    purpose: purpose || 'Intake and Dietitian Collaboration',
    scope: Array.isArray(scope) ? scope : [scope],
    version: String(version),
    status: 'granted',
    grantedAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    revokedAt: null,
    metadata: {
      ...metadata,
    },
  };

  saveConsents([newRecord, ...updatedExisting]);
  return newRecord;
};

/**
 * Revokes a specific consent record by ID.
 * Sets status to 'revoked' and records the revocation timestamp immediately.
 */
export const revokeConsent = (consentId, revocationReason = 'Patient requested revocation') => {
  if (!consentId) return null;

  const existing = getAllConsents();
  let targetRecord = null;

  const updated = existing.map((rec) => {
    if (rec.id === consentId) {
      targetRecord = {
        ...rec,
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        metadata: {
          ...rec.metadata,
          revocationReason,
        },
      };
      return targetRecord;
    }
    return rec;
  });

  if (targetRecord) {
    saveConsents(updated);
  }

  return targetRecord;
};

/**
 * Revokes all active consents for a specific patient matching a given scope.
 */
export const revokeConsentByScope = (grantorId, scope, reason = 'Scope revocation') => {
  if (!grantorId || !scope) return [];

  const existing = getAllConsents();
  const revoked = [];

  const updated = existing.map((rec) => {
    if (
      rec.grantorId === grantorId &&
      rec.scope.includes(scope) &&
      rec.status !== 'revoked'
    ) {
      const revokedRec = {
        ...rec,
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        metadata: {
          ...rec.metadata,
          revocationReason: reason,
        },
      };
      revoked.push(revokedRec);
      return revokedRec;
    }
    return rec;
  });

  saveConsents(updated);
  return revoked;
};

/**
 * Retrieves a consent record by ID.
 */
export const getConsentById = (consentId) => {
  const records = getAllConsents();
  return records.find((r) => r.id === consentId) || null;
};

/**
 * Retrieves all consent records for a specific patient (grantorId).
 */
export const getConsentsByGrantor = (grantorId) => {
  if (!grantorId) return [];
  const records = getAllConsents();
  return records.filter((r) => r.grantorId === grantorId);
};

/**
 * Determines whether a patient has an active, unexpired, and unrevoked consent for a specific scope.
 */
export const hasActiveConsent = (grantorId, scope, granteeId = null) => {
  if (!grantorId || !scope) return false;
  const records = getAllConsents();

  return records.some((rec) => {
    if (rec.grantorId !== grantorId) return false;
    if (granteeId && rec.granteeId !== granteeId) return false;
    if (!rec.scope.includes(scope)) return false;
    if (rec.status !== 'granted' && rec.status !== 'active') return false;
    if (rec.revokedAt) return false;
    if (rec.expiresAt && new Date(rec.expiresAt) <= new Date()) return false;
    return true;
  });
};

/**
 * Evaluates the consent status descriptor for UI badges and gateways.
 */
export const getConsentStatusDescriptor = (grantorId, scope, granteeId = null) => {
  if (!grantorId || !scope) {
    return { status: 'unconsented', version: null, record: null, isActive: false };
  }

  const records = getConsentsByGrantor(grantorId).filter((rec) => {
    if (granteeId && rec.granteeId !== granteeId) return false;
    return rec.scope.includes(scope);
  });

  if (records.length === 0) {
    return { status: 'unconsented', version: null, record: null, isActive: false };
  }

  // Pick newest record
  const latest = records[0];
  const isExpired = latest.expiresAt && new Date(latest.expiresAt) <= new Date();
  const isActive = (latest.status === 'granted' || latest.status === 'active') && !latest.revokedAt && !isExpired;

  return {
    status: latest.revokedAt ? 'revoked' : isExpired ? 'expired' : latest.status,
    version: latest.version,
    record: latest,
    isActive,
  };
};

/**
 * Resets/clears the consent store (primarily for unit test isolation).
 */
export const clearConsentStore = () => {
  inMemoryStore = [];
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('glyco:consent:updated', { detail: { records: [] } }));
    } catch (_e) {}
  }
};