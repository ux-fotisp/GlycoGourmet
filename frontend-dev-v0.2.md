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
| `IntakePipelineBoard` | `src/components/clinic-admin/` | 6-stage operational intake pipeline board | De-identified, non-clinical |
| `PHIBoundaryBanner` | `src/components/clinic-admin/` | Persistent non-dismissible operational boundary indicator | Enforces non-clinical wall |
| `EscalationFlagControl` | `src/components/clinic-admin/` | Contests system suggestions with immutable audit logging | Human-in-command |
| `ConsentStatusBadge` | `src/components/clinic-admin/` | Read-only consent status badge (e.g. "Consented v2.1") | Zero clinical content exposed |
| `WhyAmISeeingThisPanel` | `src/components/patient/` | Plain-language explainability disclosure for suggestions | Non-algorithmic disclosure |
| `ConsentPermissionsDashboard` | `src/components/patient/` | Lists active consents with one-click revocation | Patient-controlled |
| `RedirectNudgeCard` | `src/components/patient/` | Non-punitive dietitian consultation nudge | Patient role allow-list gated |
| `NotificationGovernancePanel` | `src/components/patient/` | Independent toggles for care reminders vs promotions | Quiet hours & frequency caps |
| `RecipeIngredientCanvas` | `src/components/recipe-builder/` | Multi-source ingredient builder canvas | Accessible move/remove controls |
| `CustomIngredientFormModal` | `src/components/recipe-builder/` | Patient-safe custom ingredient creation form | Private account-scoped (PR #22) |
| `RecipeNutritionSummary` | `src/components/recipe-builder/` | Live composite GL and macronutrient rollup | Honest completeness states |

## 2. Testing Conventions (Built)

- Unit: Vitest, `tests/unit/` (e.g., `metabolicEngineRollups.spec.ts`) — tolerance-based assertions (`toBeLessThanOrEqual(1)`), never `toBeCloseTo`.
- E2E: Playwright, `tests/e2e/` (e.g., `metabolicJourneys.spec.ts`) — text/role-based locators only, no brittle DOM pathing.
- Lint/type gates: `oxlint`, `tsc --noEmit`, `npm run precommit`.

## 3. Anti-Patterns (Built, enforced)

- Never render `useEffect` conditionally.
- Never expose Draft recipes to public client views without `DraftPreviewBanner` + audit check.
- Never use brittle DOM-path locators in Playwright.

---

## 4. Remaining Backlog & Future Components

| Component | Proposed path | Purpose | Persona |
|---|---|---|---|
| `ReferralSourceTracker` | `src/components/clinic-admin/` | Attribution reporting over de-identified intake lead records | Konstantina |
| `SessionRequestQueue` | `src/components/clinic-admin/` | Dedicated UI queue for ad-hoc consultation triage | Konstantina |
| `DietitianDirectory` | `src/components/clinic-admin/` | Filterable/sortable directory by specialty + capacity (non-algorithmic) | Konstantina, Patient |
| `PromotionConfigPanel` | `src/components/clinic-admin/` | Configures promoted-dietitian notifications, logs criteria used | Konstantina |

### 4.1 Completed Extensions (Delivered in PR #11–#14, #20–#22)

- `usePermissions.js`: Added `canManageIntakePipeline`, `canAssignDietitian`, `canConfigurePromotions`, and `canManageClinic` flags scoped to `clinic_admin` and administrative roles; strictly excluded `clinic_admin` from clinical PHI.
- `NotificationOptIn.jsx`: Clinical pre-meal bolus reminder opt-in; deep links to `/#/settings/notifications` for category governance.
- `ClinicDashboard.jsx`: Embeds persistent `PHIBoundaryBanner` and intake lead pipeline management.
- State objects `ConsentRecord`, `AuditLogEntry`, `NotificationPreference`, and `IntakeLead` fully backed by Strapi collections with offline-resilient local sync.

### 4.3 New Test Coverage Required

- Vitest: audit log integrity (every Konstantina action writes an immutable entry with correct before/after state).
- Playwright: consent-gating flow (action blocked pre-consent, revocation immediately removes downstream access) and PHI-boundary regression (Clinic Admin role never renders clinical fields even under misconfiguration) — use existing text/role-based locator convention.
