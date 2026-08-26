# Autonomous AI Test Agent Directives (QA-DIRECTIVE-2026)

**Audience:** Autonomous LLM Coding & QA Agents (Antigravity, Playwright Agentic Runners, Cursor)  
**Target Platform:** GlycoGourmet Clinical Metabolic Engine  
**Execution Standard:** Zero Tolerance for Flaky Selectors, Non-Deterministic Assertions, or Silent Regressions  

---

## 1. Semantic Locator Protocol

Autonomous agents are strictly forbidden from generating or relying on brittle selectors.

### Strict Banning Rules:
1. **NO Utility CSS Class Selectors:** Never select elements via Tailwind utility classes (e.g. `page.locator('.bg-primary.text-on-primary.p-4')`).
2. **NO Hierarchical XPath Strings:** Never generate raw DOM paths (e.g. `xpath=/html/body/div[2]/div/div[3]/button[1]`).
3. **NO Generated State IDs:** Never target dynamic IDs (e.g. `id="radix-:r1:"`).

### Mandatory Locator Hierarchy:
Agents must resolve interactive targets in the following order of precedence:
1. **Semantic Test Identifiers:** `page.locator('[data-testid="recipe-gl-badge"]')`
2. **Explicit ARIA Roles & Accessible Names:** `page.getByRole('button', { name: /Swap & Apply/i })`
3. **Associated Form Labels:** `page.getByLabel(/Total Carbohydrates/i)`
4. **OOUX Domain Object Bindings:** `page.locator('[data-ooux-object="Recipe"][data-ooux-id="rec_01"]')`

---

## 2. Self-Healing Selector Protocol (OOUX Object Recovery)

When a UI refactor breaks an existing test selector, the autonomous agent must execute the following self-healing sequence before failing:

```
+-----------------------------------------------------------------------------------+
|                        SELF-HEALING SELECTOR DECISION FLOW                         |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Target Not Found with Primary Selector ]                                       |
|         |                                                                         |
|         v                                                                         |
|  1. Inspect Parent Container for [data-ooux-object="<DomainEntity>"]             |
|         |                                                                         |
|         v                                                                         |
|  2. Query Child ARIA Roles (e.g. role="dialog", role="radio", role="search")      |
|         |                                                                         |
|         v                                                                         |
|  3. Validate Semantic Accessibility Tree matches target Intent                   |
|         |                                                                         |
|         v                                                                         |
|  4. Heal Test Spec by replacing with Canonical Semantic Locator                  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Synthetic Data Fuzzing Directives

When authoring unit or integration test cases, test agents must systematically generate synthetic payloads testing the following physiological boundary conditions:

### Boundary Vectors:
1. **Fiber Inversion Anomaly:**
   * Feed: `Total Carbs = 4.0g`, `Fiber = 9.0g`
   * Requirement: Net Carbs must clamp to `0.0g` without throwing negative numbers or `-0`.
2. **Thermal Multiplier Upper Bounds:**
   * Feed: Ingredients with `prepState: 'mashed_processed'` ($1.25\times$).
   * Requirement: Calculated effective GI must never exceed the theoretical ceiling of $100$.
3. **Floating-Point Precision Drift:**
   * Feed: `Carbs = 10.3333333333g`, `Fiber = 3.1111111111g`
   * Requirement: Calculated values must strictly round to 1 decimal place (`7.2g`) using deterministic math, avoiding IEEE 754 precision artifacts (`7.222222222222221`).
4. **Zero-Division Carbohydrate Shield:**
   * Feed: Multi-ingredient recipe where all ingredients possess $0\text{g}$ carbohydrates (e.g., olive oil + salmon + flank steak).
   * Requirement: Composite GI must resolve to `0` and Composite GL must resolve to `0` (asserting `Number.isNaN()` is strictly `false`).

---

## 4. Preattentive Visual Spectrum Validation (HSL Assertions)

When validating chromatic compliance in automated visual regression runs, agents must verify that element background colors map to the following HSL spectrum ranges:

```
+-----------------------------------------------------------------------------------+
|                          CHROMATIC SPECTRUM TARGETS                               |
+---------------+--------------------+------------------------+---------------------+
| Band Category | Target Hex Range   | Hue Angle Range (HSL)  | Min Contrast Ratio  |
+---------------+--------------------+------------------------+---------------------+
| Low GL        | #D8E8CB to #1B3B22 | 95° to 135° (Sage)     | 4.5:1 (AA)          |
| Medium GL     | #FFE082 to #5D4037 | 30° to 50° (Amber)     | 4.5:1 (AA)          |
| High GL       | #FFCDD2 to #B71C1C | 340° to 10° (Rose)     | 4.5:1 (AA)          |
+---------------+--------------------+------------------------+---------------------+
```
