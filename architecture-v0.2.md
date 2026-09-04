# GlycoGourmet — Data Schema & System Architecture Reference (v0.2)
*Written as System Architect. Defines built schemas and dream schemas required for UXartifact_v0.2.*

## 1. Core Stack (Built)

- **Frontend UI:** React.js, component-driven.
- **Build Tool:** Vite (`npm run build`).
- **Language:** TypeScript & JavaScript.
- **Testing:** Vitest (unit), Playwright (E2E).
- **Linting:** Oxlint, `tsc --noEmit`.

## 2. Folder Structure (Built)

```
src/components/dietitian/      e.g. ClientOnboardingWizard.jsx
src/components/recipe/         e.g. DetailHero.jsx, DraftPreviewBanner.jsx
src/pages/                     e.g. RecipeDetails.jsx
tests/unit/                    Vitest, e.g. metabolicEngineRollups.spec.ts
tests/e2e/                     Playwright, e.g. metabolicJourneys.spec.ts
scratch/                       Temporary systemic file manipulations via Node scripts
```

## 3. Key Data Schemas (Built)

### 3.1 Clinical Telemetry

- Maps patient carbohydrate and Glycemic Load (GL) targets into HL7 FHIR `Observation` resources.
- Uses standard LOINC identifiers exclusively.
- Exported via `exportFHIRMetabolicTelemetry` — one-way, downloadable JSON bridge to external EMR/EHR (no live API yet).

### 3.2 Plan Data Structure

- 7-day plans containing scheduled slots.
- Each slot maps to a base recipe with a dynamic `serving multiplier`.

### 3.3 Recipe Profile

- Contains `profile.glycemicLoad` and macro structures.
- Macro/GL values scale linearly with the serving multiplier.

## 4. Implementation State (Built)

- Chunks 1–8 fully resolved and validated.
- `exportPipeline.js` fully functional: `generateGroceryManifest`, `generateClinicalSummaryReport`, `exportFHIRMetabolicTelemetry`.
- All CI/CD gates green: lint, 690 Vitest tests (68 test files), full Playwright E2E, successful build.
- No active blockers; repository fully refactored and pushed.

---

## 5. Trust & Governance Schemas (Built — PR #20, PR #21, PR #22)

### 5.1 `api::consent-record`

```json
{
  "grantor": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
  "granteeId": { "type": "string", "required": true },
  "clinic": { "type": "relation", "relation": "manyToOne", "target": "api::clinic.clinic" },
  "purpose": { "type": "string", "required": true },
  "scope": { "type": "json", "required": true },
  "version": { "type": "string", "default": "2.1", "required": true },
  "status": { "type": "enumeration", "enum": ["granted", "active", "revoked", "expired"], "default": "active" },
  "grantedAt": { "type": "datetime", "required": true },
  "expiresAt": { "type": "datetime" },
  "revokedAt": { "type": "datetime" },
  "metadata": { "type": "json" }
}
```

**FHIR/LOINC status:** N/A — non-clinical business object. Excluded from `exportFHIRMetabolicTelemetry`. Controller enforces consent-scope defense-in-depth (`intake_redirect` allow-list).

### 5.2 `api::audit-log-entry`

```json
{
  "clinic": { "type": "relation", "relation": "manyToOne", "target": "api::clinic.clinic", "required": true },
  "actor": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
  "actorId": { "type": "string", "required": true },
  "actorRole": { "type": "enumeration", "enum": ["clinic_admin", "admin", "super_admin", "system"] },
  "action": { "type": "string", "required": true },
  "entityId": { "type": "string", "required": true },
  "entityType": { "type": "enumeration", "enum": ["referral_lead", "client_profile", "dietitian_profile", "promotion_config", "operational_suggestion"] },
  "suggestedValue": { "type": "json" },
  "finalValue": { "type": "json", "required": true },
  "note": { "type": "text" },
  "timestamp": { "type": "datetime", "required": true }
}
```

**Constraint:** Append-only store. Controller rejects update and delete with `405 Method Not Allowed`. **FHIR/LOINC status:** N/A — non-clinical.

### 5.3 `api::notification-preference`

```json
{
  "user": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user", "required": true },
  "category": { "type": "enumeration", "enum": ["care_reminders", "promoted_dietitians"], "required": true },
  "enabled": { "type": "boolean", "default": true, "required": true },
  "quietHoursStart": { "type": "string", "default": "22:00" },
  "quietHoursEnd": { "type": "string", "default": "07:00" },
  "frequencyCap": { "type": "enumeration", "enum": ["daily", "weekly", "biweekly"], "default": "weekly" }
}
```

**Constraint:** Categories toggle independently — no shared enabled flag. **FHIR/LOINC status:** N/A — non-clinical.

### 5.4 `api::intake-lead`

```json
{
  "clinic": { "type": "relation", "relation": "manyToOne", "target": "api::clinic.clinic", "required": true },
  "referenceCode": { "type": "string", "required": true, "unique": true },
  "referralSource": { "type": "enumeration", "enum": ["gp_referral", "self_service_redirect", "campaign", "walk_in", "patient_referral"], "required": true },
  "serviceTier": { "type": "enumeration", "enum": ["FULL_CARE", "ONLINE_SESSION_ONLY"], "default": "FULL_CARE", "required": true },
  "stage": { "type": "enumeration", "enum": ["Inquiry", "Contacted", "Intake Sent", "Scheduled", "Active", "Lapsed"], "default": "Inquiry", "required": true },
  "stageReason": { "type": "string" },
  "assignedDietitian": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
  "assignedDietitianName": { "type": "string" }
}
```

### 5.5 `api::ingredient` Ownership Extensions

```json
{
  "isUserAuthored": { "type": "boolean", "default": false },
  "owner": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" }
}
```

**Constraint:** Default-deny scoping in `getCustomIngredients(userId = null)` and 404 concealment for non-owner patient queries.

## 6. Architectural Boundary Rules (Built & Enforced)

- `ConsentRecord`, `AuditLogEntry`, `NotificationPreference`, and `IntakeLead` live in dedicated Strapi content types physically isolated from clinical telemetry collections.
- Any query originating from a `clinic_admin` user is structurally blocked from clinical telemetry and client health endpoints via `server/src/policies/is-clinic-admin.js` with `FORBIDDEN_CLINICAL_UIDS` (returning `403 Forbidden`).
- Consent scope changes must version the record rather than mutate in place, preserving a full history for audit defensibility.

## 7. Key Decisions Log (Appended for v0.2)

- **Decision:** Trust-governance objects (`ConsentRecord`, `AuditLogEntry`, `NotificationPreference`) are schema-isolated from clinical telemetry. *Rationale:* preserves the FHIR export boundary; prevents accidental PHI leakage into business/growth reporting.
- **Decision:** `AuditLogEntry` is append-only. *Rationale:* defensibility requires an immutable record of what the system suggested vs. what Konstantina actually did.
- **Decision:** Dietitian `specialties[]` field is used for filtering, not scoring/ranking. *Rationale:* avoids building an algorithmic matching engine, consistent with "no Tinder for dietitians" product requirement.
