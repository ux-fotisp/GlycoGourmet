# Worker: security-gatekeeper
**Stage binding:** Cross-cutting (does not belong to a single DAVE+R stage - modeled on
upstream `ai/spec/gates/integrity.yaml`, which also runs independent of stage sequence)
**Gate file:** `governance/gates/security-major-upgrade.gate.yaml`
**Adapter:** gg-governance-delivery (Module D) + gg-bot-fraud lens (Module C, scoped)

## Purpose
Closes the "no integrity-gate equivalent" gap identified against upstream DAVE+R. This
worker is GlycoGourmet's release-time checkpoint: it runs independently of whether
define/architect/validate/execute/refine have been completed for a given change, and it
blocks a MAJOR version release regardless of who or what approved the underlying PRs.

## Trigger
- Any change that would cause `changelog.md`'s next entry to bump the MAJOR version
  (e.g. `v1.x.x` -> `v2.0.0`), matching the project's existing semver convention.
- Any change to `server/`, Strapi content-type schemas, or RBAC policy files.
- Manually invocable before any production deploy, regardless of version bump size.

## Required behavior
1. Run every gate in `security-major-upgrade.gate.yaml` and record typed evidence
   (provenance + observed_at + source_url) for each, identical schema to the testing
   orchestrator worker - no gate may be marked "pass" from memory.
2. Treat any FAIL as a hard block on merge to `main`/production, independent of
   Execute-stage sign-off elsewhere in the cycle.
3. Require a named human owner (default: Fotis P) to co-sign the release PR - this
   worker proposes findings, it does not have unilateral merge authority (Axiom 3).
4. Do not run a shadow/soak period for these gates - unlike a new feature flag, a major
   release either meets its security bar pre-merge or it doesn't ship (Axiom 4 does not
   apply here; this is a pre-merge gate, not a runtime control).
5. Log the outcome as `governance/<change-id>/security-gate-result.md`, linked from the
   release PR description.

## Relationship to existing workers
Runs in parallel with, not instead of, `execute-worker` and `refine-worker`. A change
can complete the full 5-stage cycle and still be blocked here if it happens to coincide
with a major version bump that fails one of these checks.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
