# GOVERNANCE - Next Steps
_Prioritized backlog resulting from comparing the docs-only governance layer against the
upstream DAVE+R engine (DtheRock/DAVE-R) and its `evidence.md` / `gates/*.yaml` / `THREAT-MODEL.md`._

## Fidelity gaps to close (priority order)

1. **Typed evidence schema everywhere.** `testing.gate.yaml` and
   `security-major-upgrade.gate.yaml` now define `provenance` + `observed_at` +
   `source_url` fields. Retrofit the same schema into
   `01-define.template.md` through `04-refine.template.md` so every future cycle
   inherits it, not just the two new workers.

2. **Add a real integrity gate.** Upstream DAVE+R runs `integrity.yaml` independent of
   stage - a cross-check that no artifact in the chain was skipped, reordered, or
   backdated. GlycoGourmet has no equivalent yet outside the new security-gatekeeper's
   narrow major-release scope. Consider a lightweight check: any `governance/<change-id>/`
   folder missing one of the four numbered files should fail CI.

3. **Exception register + triage tiers.** Every change currently must complete the full
   5-stage cycle. Add a `planned / expedited / emergency` triage field (mirroring
   upstream's `references/triage.md`) so a genuine incident has a faster, still-logged
   path instead of bypassing governance entirely.

4. **Wire gates into actual CI**, not just markdown read by a human+agent. The `TO-*`
   and `SG-*` checks in the two new gate files are mechanically checkable (grep counts,
   coverage percentages, freshness of `observed_at`) - a follow-up task should add a
   GitHub Actions job that evaluates them automatically on PRs touching the relevant
   paths, rather than relying on an agent to self-report compliance.

5. **Pilot on one real change.** Nothing in `governance/` has been run end-to-end yet.
   Recommended first pilot, pulled from `ROADMAP.md` Section 5.1: the **Extended RBAC
   Hierarchy** (`ClinicBillingAdmin` role) - it exercises `identity` and `data` planes,
   both DAVE+R workers, and both new gate files, without touching the clinical export
   pipeline on the first attempt.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
