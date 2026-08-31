# GlycoGourmet — Testing & QA Standards (v0.2)
*Written as QA/Compliance Lead. Extends existing Vitest/Playwright conventions with trust-governance coverage.*

## 1. Testing Stack (Built)

- **Unit Testing:** Vitest (`npm run test`)
- **End-to-End:** Playwright (`npm run test:e2e`, Mobile + Desktop)
- **Linting/Types:** Oxlint (`npm run precommit`), `tsc --noEmit`
- **CI Gate Status:** 254 Vitest unit tests passing, full Playwright E2E suite passing, build green.

## 2. Established Conventions (Built)

### 2.1 Metabolic Math Tolerance

- Floating-point Glycemic Load/macro assertions must use absolute tolerance, e.g. `expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1)`.
- Never use `toBeCloseTo` for scaled multiplier math — caused false-negative failures historically (see `metabolicEngineRollups.spec.ts`).

### 2.2 E2E Locator Resilience

- Never use brittle DOM-path selectors.
- Use text-based or role-based locators exclusively, e.g. `page.locator('text=Draft Audit Queue')`, `.locator('visible=true')`.
- Applies to all suites, including `metabolicJourneys.spec.ts`.

### 2.3 Accessibility Regression

- Every modal/drawer test must assert: Escape key closes the component, `role="dialog"` present, `aria-modal="true"` present.
- No component ships without this triple-check in its test file.

### 2.4 Hooks Safety

- Vitest/React Testing Library tests must assert `useEffect` never renders conditionally — regression test dedicated to the Chunk 8 hooks-crash fix.

---

## 3. Dream — New Test Classes Required for UXartifact_v0.2

### 3.1 Audit Log Integrity (Vitest)

**Target:** every Konstantina action (assignment, promotion, tier confirmation) writes an immutable `AuditLogEntry`.

- Assert entry contains `actorId`, `actorRole`, `action`, `suggestedValue`, `finalValue`, `timestamp`.
- Assert log entries are append-only — no update/delete path exists in the store.
- Assert `finalValue` differs from `suggestedValue` when Konstantina overrides a system suggestion, and that the override is captured, not silently dropped.

### 3.2 Consent-Gating E2E (Playwright)

**Target:** no cross-boundary data flow occurs without an active `ConsentRecord`.

- Test: redirect nudge action is blocked/hidden until consent status = "granted."
- Test: revoking consent mid-session immediately removes downstream access (e.g., Konstantina's intake queue no longer shows the referred lead's adherence summary).
- Test: scope change on an existing consent triggers a re-consent prompt rather than silently expanding access.
- Use existing locator convention — role/text-based only (e.g., `page.locator('role=button[name="Revoke Access"]')`).

### 3.3 PHI-Boundary Regression (Playwright)

**Target:** Clinic Admin role never renders clinical fields, even under component misconfiguration.

- Test: mount `ClinicDashboard.jsx` under `clinic_admin` role, assert no DOM node contains glucose values, GL targets, or clinical note text.
- Test: `PHIBoundaryBanner` is present and visible on every Clinic Admin route.
- Test: attempting to navigate directly to a clinical-record URL as `clinic_admin` redirects or 403s (must be tested at UI level, not backend-only).

### 3.4 Notification Governance (Vitest + Playwright)

- Vitest: `NotificationPreference` categories (`care_reminder`, `promoted_dietitian`) toggle independently — disabling one must not mutate the other's `enabled` state.
- Vitest: frequency cap and quiet-hours logic in `notificationEngine.ts` correctly suppresses `sendPromotedDietitianNotification` calls outside allowed windows.
- Playwright: patient can access `/#/settings/notifications`, toggle each category independently, and see the change persist on reload.

### 3.5 Escalation Flow (Playwright)

- Test: Konstantina can flag a system suggestion via `EscalationFlagControl` without the action being blocked or requiring justification text (frictionless, per "safe to question the system" requirement).
- Test: flagged items appear in a review queue accessible to a System Admin role, not silently dismissed.

### 3.6 Tolerance Convention Applies To New Numeric Logic

- Any numeric scoring used in risk-signal detection (e.g., adherence percentage thresholds triggering a redirect nudge) must follow the same absolute-tolerance convention as the metabolic engine — never strict equality on computed floats.

## 4. CI Gate Additions (Dream)

- New required check: `audit-log-integrity.spec.ts` must pass before merge to any branch touching `clinic-admin` components.
- New required check: `phi-boundary-regression.spec.ts` must pass before merge to any branch touching `ClinicDashboard.jsx` or role-permission files.
- Oxlint rule addition (recommended): flag any direct import of clinical telemetry fields inside files under `src/components/clinic-admin/`.
