# GlycoGourmet — Frontend Development Reference (v0.2)
*Component inventory. Written as Frontend Lead handoff doc.*

## 1. Component Inventory

### 1.1 Built

| Component | Path | Purpose | Notes |
|---|---|---|---|
| `ClientOnboardingWizard` | `src/components/dietitian/` | Multi-step new-client intake for dietitians | WCAG 2.1 AA compliant modal |
| `ClientCalibrationDrawer` | `src/components/dietitian/` | Sets metabolic/GL targets per client | Drawer pattern, Escape-to-close |
| `ClinicDashboard.jsx` | `src/pages/` (or clinic module) | Clinic Admin roster + dietitian invite workspace | Multi-tenant, reads `roleType`/`clinicId`/`clinicTier` |
| `ClinicLibrary.jsx` | — | Shared institutional recipe/meal-plan library | Clinic-wide, not per-dietitian |
| `ClientRoster.jsx` | `src/components/dietitian/` (or admin) | Client portfolio view | Gated Dietitian/Admin |
| `PlanBuilder` | — | Meal plan scheduling canvas with serving multipliers | Core metabolic engine consumer |
| `DetailHero.jsx`, `DraftPreviewBanner.jsx` | `src/components/recipe/` | Recipe detail view, draft-state warning banner | Enforces Draft/Public visibility rule |
| `RecipeDetails.jsx` | `src/pages/` | Full recipe page | — |
| `FeatureGate.jsx` | — | Tier-gates premium features (default `CLINIC_PRO`) | Used for subscription boundaries |
| `NotificationOptIn.jsx` | — | Patient-facing single opt-in card | Needs extension (see Dream) |
| `notificationEngine.ts` | — | Schedules bolus reminders, push notifications | Needs extension (see Dream) |
| `usePermissions.js` | — | Resolves `roleType`, `clinicId`, `clinicTier` | RBAC hook |
| `is-dietitian-owner.js` | backend policy | Tenant isolation — dietitians see only their own clients | Server-side enforcement |
| `exportPipeline.js` | — | `generateGroceryManifest`, `generateClinicalSummaryReport`, `exportFHIRMetabolicTelemetry` | Fully wired to UI |

## 2. Testing Conventions (Built)

- Unit: Vitest, `tests/unit/` (e.g., `metabolicEngineRollups.spec.ts`) — tolerance-based assertions (`toBeLessThanOrEqual(1)`), never `toBeCloseTo`.
- E2E: Playwright, `tests/e2e/` (e.g., `metabolicJourneys.spec.ts`) — text/role-based locators only, no brittle DOM pathing.
- Lint/type gates: `oxlint`, `tsc --noEmit`, `npm run precommit`.

## 3. Anti-Patterns (Built, enforced)

- Never render `useEffect` conditionally.
- Never expose Draft recipes to public client views without `DraftPreviewBanner` + audit check.
- Never use brittle DOM-path locators in Playwright.

---

## 4. Dream — New Components Required for UXartifact_v0.2

| Component | Proposed path | Purpose | Persona |
|---|---|---|---|
| `ReferralSourceTracker` | `src/components/clinic-admin/` | Logs lead source (GP referral, ad, walk-in, patient referral) | Konstantina |
| `IntakePipelineBoard` | `src/components/clinic-admin/` | Kanban: Inquiry → Contacted → Intake Sent → Scheduled → Active → Lapsed | Konstantina |
| `SessionRequestQueue` | `src/components/clinic-admin/` | Tier B (online-session-only) request management, separate from full roster | Konstantina |
| `DietitianDirectory` | `src/components/clinic-admin/` | Filterable/sortable listing by specialty + capacity — explicitly list UI, not swipe/card | Konstantina, Patient |
| `PromotionConfigPanel` | `src/components/clinic-admin/` | Configures promoted-dietitian notifications, logs criteria used | Konstantina |
| `PHIBoundaryBanner` | `src/components/clinic-admin/` | Persistent banner on `ClinicDashboard.jsx`: "You are viewing intake/assignment data only" | Konstantina |
| `EscalationFlagControl` | `src/components/clinic-admin/` | Lets Konstantina flag a system suggestion as wrong, feeds review queue, no penalty | Konstantina |
| `ConsentStatusBadge` | `src/components/clinic-admin/` | Read-only badge ("Consented v2.1, 08/30/2026") visible to Konstantina, no clinical content | Konstantina |
| `WhyAmISeeingThisPanel` | `src/components/patient/` | Explainability panel for redirect nudges — plain-language signal disclosure | Fotis |
| `ConsentPermissionsDashboard` | `src/components/patient/` | Lists every active consent grant, last-accessed date, destination; one-click revoke | Fotis |
| `RedirectNudgeCard` | `src/components/patient/` | Non-punitive, augmentation-framed suggestion to consult a dietitian | Fotis |
| `NotificationGovernancePanel` | `src/components/patient/` | Split toggles: care reminders vs. promoted-dietitian nudges, quiet hours, frequency caps | Fotis |

### 4.1 Extensions to Existing Components

- `NotificationOptIn.jsx` → must branch into two independently toggleable categories instead of one binary opt-in.
- `notificationEngine.ts` → add `scheduleMealTimingReminder` alongside existing `scheduleBolusReminder`; add `sendPromotedDietitianNotification` with criteria-logging hook.
- `ClinicDashboard.jsx` → embed `PHIBoundaryBanner` and new funnel-analytics widget (inquiries → intake completed → converted → churned).
- `clientStore.js` → add `specialties[]` array to dietitian records; add `serviceTier` field to client records.
- `usePermissions.js` → add `canManageIntakePipeline`, `canAssignDietitian`, `canConfigurePromotions` flags scoped to `clinic_admin`/`admin` only — never granted `canViewClinicalRecords`.

### 4.2 New State/Data Objects

- `ConsentRecord` — `{ grantorId, granteeId, purpose, scope[], version, expiresAt, revokedAt }`
- `AuditLogEntry` — `{ actorId, actorRole, action, suggestedValue, finalValue, note, timestamp }`
- `NotificationPreference` — `{ userId, category: 'care_reminder' | 'promoted_dietitian', enabled, quietHours, frequencyCap }`

### 4.3 New Test Coverage Required

- Vitest: audit log integrity (every Konstantina action writes an immutable entry with correct before/after state).
- Playwright: consent-gating flow (action blocked pre-consent, revocation immediately removes downstream access) and PHI-boundary regression (Clinic Admin role never renders clinical fields even under misconfiguration) — use existing text/role-based locator convention.
