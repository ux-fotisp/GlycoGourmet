# Worker: test-orchestrator-worker
**Stage binding:** Validate (extends `validate-worker` from GOVERNANCE.md)
**Gate file:** `governance/gates/testing.gate.yaml`
**Adapter:** gg-governance-delivery (Module D)

## Purpose
Closes the "gates became prose" gap identified against the upstream DAVE+R engine
(`ai/engine/daver/`), which evaluates typed evidence against declarative YAML gates
rather than trusting a written summary. This worker binds every Validate-stage claim
about GlycoGourmet's test suite to a freshly observed, source-linked result.

## Trigger
Any change touching: `tests/unit/**`, `tests/e2e/**`, `.oxlintrc.json`, `tsconfig.json`,
`vitest.config.ts`, `playwright.config.ts`, or any file under `src/` that has a
corresponding invariant test (Net Carbs clamp, GI/GL composite, serving multipliers).

## Required behavior
1. **Never restate a cached number.** "690 tests passing" is only valid evidence if this
   worker just executed `npm run test` (or read the just-completed GitHub Actions run)
   in the current session. Prior-session figures must be re-observed before citing.
2. **Emit typed evidence**, not prose, for every claim - see `evidence_schema` in the
   gate file. Each record needs `value`, `provenance` (`observed|asserted|estimated`),
   `observed_at` (ISO 8601), and `source_url` (the actual CI run or terminal log).
3. **Enforce the floating-point tolerance rule**: metabolic engine assertions must use
   `toBeLessThanOrEqual(1)`-style tolerance, never `toBeCloseTo`, per the project's
   established anti-pattern list.
4. **Enforce Playwright locator resilience**: fail (warn-level) on any brittle CSS/DOM
   path selector in `tests/e2e/**`; require text- or role-based locators instead.
5. **Coverage floor on invariant logic**: any PR touching the Net-Carbs clamp, GI/GL
   composite, or thermal prep multipliers must show 100% line/branch coverage on the
   changed invariant scope (matching the existing `ci_cd.md` Invariant Scope target).
6. **Write the result** to `governance/<change-id>/03-validate.md` using the schema
   fields above - this replaces free-text "I verified..." language with checkable data.

## Relationship to existing workers
This worker does not replace `validate-worker`; it is the concrete implementation
`validate-worker` must call whenever the change under review touches test or CI
surfaces. Non-testing Validate-stage concerns (e.g., WCAG or RBAC review) remain with
`validate-worker` directly.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
