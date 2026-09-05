# 04 — Refine Artifact

> **Change ID:** `<change-id>`  
> **Date:** `<YYYY-MM-DD>`  
> **Author (Agent):** `<agent-id>`  
> **Risk Owner (Human):** Fotis P  
> **Prerequisite:** Execute-worker PR merged in shadow mode + soak period elapsed

---

## 1. Shadow-Mode Soak Results

| Field | Value |
|---|---|
| **Shadow start date** | _e.g. `2026-09-05`_ |
| **Shadow end date** | _e.g. `2026-09-08`_ |
| **Soak duration (days)** | _Must be ≥ `min_shadow_days: 3`_ |
| **Telemetry source** | _GitHub Actions logs / Playwright traces / application logs_ |

### 1.1 Shadow-Mode Telemetry Summary

| Metric | Value | Notes |
|---|---|---|
| Total shadow-mode trigger events | _e.g. `0`_ | |
| False positive triggers | _e.g. `0`_ | |
| True positive triggers | _e.g. `0`_ | |
| Unexpected errors or exceptions | _e.g. `0`_ | |

---

## 2. False Positive Analysis

_If any false positives were detected during the soak period, document each one._

| # | Trigger Event | Root Cause | Severity | Resolution |
|---|---|---|---|---|
| _1_ | _e.g. "Rate limiter triggered on batch recipe import by admin"_ | _e.g. "Admin batch operations were not exempt from rate limit"_ | _high / medium / low_ | _e.g. "Added admin role exemption to rate limit policy"_ |

---

## 3. Promotion Decision

| Decision | Selected? | Justification |
|---|---|---|
| **Promote** (shadow → enforcing) | ⬜ | _Evidence is clean; zero false positives during soak period._ |
| **Hold** (extend soak period) | ⬜ | _Insufficient data or minor false positives requiring observation._ |
| **Rollback** (revert change) | ⬜ | _Unacceptable false positive rate or architectural issue discovered._ |

### 3.1 If Promoting

| Field | Value |
|---|---|
| **Promotion commit SHA** | _e.g. `abc1234`_ |
| **Promotion PR** | _e.g. `#42`_ |
| **Shadow flag removed?** | ⬜ Yes / ⬜ No (kept for gradual rollout) |

### 3.2 If Holding

| Field | Value |
|---|---|
| **Extended soak end date** | _e.g. `2026-09-15`_ |
| **Additional monitoring criteria** | _What specific evidence is needed?_ |

### 3.3 If Rolling Back

| Field | Value |
|---|---|
| **Rollback command executed** | _e.g. `git revert abc1234`_ |
| **Rollback commit SHA** | _e.g. `def5678`_ |
| **Loop back to** | `architect-worker` (redesign control) |

---

## 4. Changelog Entry

_Only if promoting. Follow `changelog.md`'s existing semantic-versioning table format._

```markdown
| <date> | `v<X.Y.Z>` | `<type>` | **<Description>** | Fotis Pastrakis |
```

| Field | Value |
|---|---|
| **Version bump** | _e.g. `v2.1.0` (minor for new governance control)_ |
| **Type** | _`feat` / `fix` / `security` / `chore`_ |
| **Description** | _One-line summary of the promoted control._ |

---

## 5. Gate Status

| Gate | Status |
|---|---|
| Soak period ≥ min_shadow_days (3) | ⬜ Pass / ⬜ Fail |
| False positive rate acceptable | ⬜ Pass / ⬜ Fail |
| Promotion decision documented | ⬜ Pass / ⬜ Fail |
| Changelog entry prepared (if promoting) | ⬜ Pass / ⬜ N/A |
| Rollback command verified (if rolling back) | ⬜ Pass / ⬜ N/A |
| Governance cycle complete | ⬜ Pass / ⬜ Fail |
