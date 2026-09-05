# 📜 DAVE+R Declarative Evidence Ledger

> **Specification Authority:** DAVE+R Governance Framework (Module D / Gate Set INT)  
> **Repository:** `ux-fotisp/GlycoGourmet`  
> **Schema Definition:** [`governance/evidence/evidence.schema.yaml`](./evidence.schema.yaml)  
> **Machine-Readable Ledger:** [`governance/evidence/evidence-ledger.yaml`](./evidence-ledger.yaml)  

---

## 1. Purpose & Scope

The **Evidence Ledger** is a machine-checkable index that links factual governance claims to durable, verifiable repository metadata and GitHub artifacts.

It does **not** replace human narrative or DAVE+R stage artifacts (`01-define.md` through `04-refine.md`). Instead, it establishes mechanical provenance correlation:
1. **Anti-Backdating Validation:** Proves that an observation timestamp (`observed_at`) precedes or coincides with the entry's ingestion timestamp (`recorded_at`), and neither lies in the future.
2. **Git & CI Provenance:** Verifies that referenced commit SHAs exist in the repository history and referenced GitHub Actions runs contain valid run IDs.
3. **Honest Demarcation:** Distinguishes between mechanically verified empirical records and external or legacy claims that cannot be audited from Git metadata alone (`legacy-unverifiable`).

---

## 2. Verification Status Classifications

| Verification Status | Definition | Criteria for Acceptance |
|---|---|---|
| **`verified`** | Fully corroborated by immutable repository history or GitHub Actions logs. | Non-empty `source_url`; valid numeric run ID or 7–40 char Git commit SHA present in repo history; `observed_at <= recorded_at`. |
| **`legacy-unverifiable`** | Historical observation or live network check captured before ledger adoption or lacking an immutable artifact. | Retained for audit fidelity per DAVE+R Axiom 2; **strictly barred** from serving as sole justification for active gate exceptions (Gate `INT-8`). |
| **`pending-human-review`** | Claim awaiting human operator inspection or external validation. | Temporary holding state; cannot unlock automated waivers on protected security or clinical gates. |

---

## 3. Schema & Anti-Backdating Rules

All entries in [`evidence-ledger.yaml`](./evidence-ledger.yaml) are checked by [`scripts/governance-gates.js`](../../scripts/governance-gates.js) under gates `INT-2` through `INT-8`:

1. **Rule INT-2:** Ledger and schema parse without YAML syntax or type errors.
2. **Rule INT-3:** Every `verified` record contains complete metadata (`source_url`, `source_type`, `recorded_at`, `observed_at`, and `source_commit` where required).
3. **Rule INT-4:** Timestamps must be logically consistent: `observed_at <= recorded_at`, with zero tolerance for future dates.
4. **Rule INT-5:** `source_commit` for `git_commit` or `repository_file` must resolve to an existing commit object in the repository (`git cat-file -e <sha>^{commit}`).
5. **Rule INT-6:** If a `change_id` is supplied, the folder `governance/<change-id>/` must exist and contain all four stage artifacts.
6. **Rule INT-7:** External network checks (`external_live_check`) cannot be marked `verified` unless supported by an immutable artifact URL or committed sanitized output.
7. **Rule INT-8:** No active governance exception in [`exception-register.yaml`](../exceptions/exception-register.yaml) may rely solely on a `legacy-unverifiable` evidence entry.

---

## 4. Agent Attribution & Boundaries

- An AI agent may discover, ingest, and mechanically validate evidence records.
- When an agent records an entry, `recorded_by` must identify the agent and session context (e.g., `Antigravity agent (session e622fc11)`).
- An agent **must never** forge commit SHAs, backdate timestamps, or invent live URLs to satisfy verification rules.
- Under **Axiom A2 (Evidence over assertion)**, if a claim cannot be verified mechanically, it must be designated `legacy-unverifiable` or `pending-human-review`.

---
_Security-control lifecycle concepts (Define→Architect→Validate→Execute→Refine, typed evidence, gates-as-data) adapted from the **DAVE+R Framework by Demetrios Petropoulos** (CC BY 4.0), https://github.com/DtheRock/DAVE-R. Changes were made._
