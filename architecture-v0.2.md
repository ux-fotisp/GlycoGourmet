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
- All CI/CD gates green: lint, 254 Vitest tests, full Playwright E2E, successful build.
- No active blockers; repository fully refactored and pushed.

---

## 5. Dream — New Schemas Required for UXartifact_v0.2

### 5.1 `ConsentRecord`

```
ConsentRecord {
  id: string
  grantorId: string        // patient ID
  granteeId: string        // dietitian or clinic ID
  purpose: string          // e.g. "self-service-redirect", "data-sharing"
  scope: string[]           // e.g. ["adherence_history"], explicitly excludes raw glucose logs unless extended
  version: string           // e.g. "2.1" — re-consent triggers on scope change
  grantedAt: timestamp
  expiresAt: timestamp | null
  revokedAt: timestamp | null
}
```

**FHIR/LOINC status:** N/A — non-clinical business object. Must never enter the `exportFHIRMetabolicTelemetry` pipeline.

### 5.2 `AuditLogEntry`

```
AuditLogEntry {
  id: string
  actorId: string
  actorRole: 'clinic_admin' | 'system'
  action: 'assign_dietitian' | 'confirm_tier' | 'configure_promotion' | 'flag_escalation'
  suggestedValue: object | null   // system's suggestion, if any
  finalValue: object              // what actually happened
  note: string | null
  timestamp: timestamp
}
```

**Constraint:** append-only store, no update/delete mutation path. **FHIR/LOINC status:** N/A — non-clinical.

### 5.3 `NotificationPreference`

```
NotificationPreference {
  userId: string
  category: 'care_reminder' | 'promoted_dietitian'
  enabled: boolean
  quietHours: { start: string, end: string } | null
  frequencyCap: number | null   // max notifications per period
}
```

**Constraint:** categories toggle independently — no shared enabled flag. **FHIR/LOINC status:** N/A — non-clinical.

### 5.4 Extensions to Existing Schemas

- **Dietitian record (`clientStore.js`):** add `specialties: string[]` (e.g., `["diabetes", "cholesterol_lipid", "renal", "gdm"]`) and `activePatients` capacity field (already exists) used for directory filtering, not scoring.
- **Client record (`clientStore.js`):** add `serviceTier: 'full_care' | 'online_session_only'`.
- **Referral Lead (new entity):** `{ leadId, source: 'gp_referral' | 'ad_campaign' | 'self_service_redirect' | 'walk_in' | 'patient_referral', stage, assignedDietitianId | null, consentId | null }`.

## 6. Architectural Boundary Rules (Dream — must be enforced at build time, not just documented)

- `ConsentRecord`, `AuditLogEntry`, `NotificationPreference`, and Referral Lead entities must live in a schema namespace physically separate from clinical telemetry tables/collections.
- Any query originating from a `clinic_admin`-scoped component must be structurally incapable of joining against clinical telemetry tables — enforce via `is-dietitian-owner.js`-equivalent policy scoped to the new role.
- Consent scope changes must version the record rather than mutate in place, preserving a full history for audit defensibility.

## 7. Key Decisions Log (Appended for v0.2)

- **Decision:** Trust-governance objects (`ConsentRecord`, `AuditLogEntry`, `NotificationPreference`) are schema-isolated from clinical telemetry. *Rationale:* preserves the FHIR export boundary; prevents accidental PHI leakage into business/growth reporting.
- **Decision:** `AuditLogEntry` is append-only. *Rationale:* defensibility requires an immutable record of what the system suggested vs. what Konstantina actually did.
- **Decision:** Dietitian `specialties[]` field is used for filtering, not scoring/ranking. *Rationale:* avoids building an algorithmic matching engine, consistent with "no Tinder for dietitians" product requirement.
