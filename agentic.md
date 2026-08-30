# 🤖 GlycoGourmet — Agentic QA, AI Automation & System Orchestration Directives

> **Autonomous LLM Agent Protocols, Self-Healing Selectors, Deterministic Fuzzing, and CI/CD Automation Architecture**  
> *Authored & Architected by [Fotis Pastrakis](https://fotisp.gr)*

---

## 1. Executive Directive & Automation Philosophy (QA-DIRECTIVE-2026)

**Target Systems:** GlycoGourmet Clinical Metabolic Engine & Digital Platform  
**Target Agents:** Autonomous AI Coding & QA Assistants (Antigravity, Playwright Agentic Runners, Cursor Agents)  
**Execution Standard:** Zero Tolerance for Flaky Selectors, Non-Deterministic Assertions, Silent Metabolic Drift, or Broken Invariant Gates  

### Why Autonomous Automation in Clinical Metabolic Software?
In standard web applications, small UI glitches or transient calculation inaccuracies cause minor user inconvenience. In **GlycoGourmet**, calculations dictate dietary decisions, Glycemic Load budgets, and insulin bolus timing for patients with Type 1 Diabetes, Type 2 Diabetes, Gestational Diabetes, and Insulin Resistance.

Automating verification through strict AI agent directives ensures:
1. **Deterministic Correctness:** Mathematical calculations never drift due to floating-point rounding errors or unhandled zero-division singularities.
2. **Clinical Safety Gates:** Uncertified drafts or physiologically impossible macros (e.g. Fiber > Total Carbs) can never leak into patient meal plans or public catalogs.
3. **Resilient Developer Velocity:** Self-healing selectors and semantic locator hierarchies prevent test suites from breaking during cosmetic styling refactors.
4. **Architectural Coherence:** AI agents follow structured orchestration workflows, maintaining documentation integrity and synchronized schemas.

---

## 2. Autonomous Test Agent Directives & Selector Protocols

Autonomous test agents authoring or repairing Playwright end-to-end tests must adhere strictly to the **Semantic Locator Hierarchy**. Brittle selectors that bind to layout styles or transient dynamic IDs are forbidden.

### 2.1 Strict Banning Rules
1. ❌ **NO Utility CSS Class Selectors:** Never select elements via Tailwind utility classes (e.g. `page.locator('.bg-primary.text-on-primary.p-4')`).
   - *Why:* Presentation utility classes change frequently during visual design iterations without altering semantic function.
2. ❌ **NO Hierarchical XPath Strings:** Never generate raw DOM paths (e.g. `page.locator('xpath=/html/body/div[2]/div/div[3]/button[1]')`).
   - *Why:* Minor DOM wrapper additions or flexbox adjustments instantly break hierarchical paths.
3. ❌ **NO Generated Dynamic State IDs:** Never target dynamic IDs (e.g. `id="radix-:r1:"` or `id="headlessui-menu-12"`).
   - *Why:* Dynamic IDs vary across hydration cycles, re-renders, and test runners.

---

### 2.2 Mandatory Locator Hierarchy
Agents must resolve interactive targets in descending order of precedence:

```
+-----------------------------------------------------------------------------------+
|                           MANDATORY LOCATOR HIERARCHY                             |
+---+-----------------------------+-------------------------------------------------+
| # | Locator Type                | Playwright Implementation Example               |
+---+-----------------------------+-------------------------------------------------+
| 1 | Semantic Test Identifiers   | page.locator('[data-testid="recipe-gl-badge"]') |
| 2 | Explicit ARIA Roles & Names | page.getByRole('button', { name: /Apply/i })    |
| 3 | Associated Form Labels      | page.getByLabel(/Total Carbohydrates/i)         |
| 4 | OOUX Domain Object Bindings | page.locator('[data-ooux-object="Recipe"]')     |
+---+-----------------------------+-------------------------------------------------+
```

---

### 2.3 Self-Healing Selector Protocol (OOUX Object Recovery)

When a UI refactoring breaks an existing test selector, the autonomous agent must execute the **OOUX Self-Healing Sequence** prior to failing the test run:

```mermaid
flowchart TD
    Fail["Primary Selector Fails to Locate Target"] --> Step1["1. Locate Parent Container: [data-ooux-object='Recipe']"]
    Step1 --> Step2["2. Query Standard ARIA Roles (role='dialog', role='radio', role='button')"]
    Step2 --> Step3["3. Validate Semantic Accessibility Tree matches target User Intent"]
    Step3 --> Step4["4. Heal Test Spec by replacing with Canonical Semantic Locator"]
```

- **Step 1:** Locate the nearest semantic parent entity container using `[data-ooux-object="Recipe"]` or `[data-ooux-object="MealPlan"]`.
- **Step 2:** Query within that container for unambiguous standard ARIA roles (`role="button"`, `role="radio"`, `role="dialog"`).
- **Step 3:** Inspect accessible name and label properties against the accessibility tree.
- **Step 4:** Rewrite the failing spec with the newly validated canonical locator, documenting the self-healing event in test logs.

---

## 3. Synthetic Data Fuzzing & Metabolic Boundary Vectors

When authoring unit or integration test cases, test agents must systematically generate synthetic payloads testing the following 5 physiological boundary vectors:

### 3.1 Fiber Inversion Anomaly
- **Phenomenon:** Laboratory analytical assay reporting errors occasionally state dietary fiber exceeding total carbohydrates.
- **Test Vector:** `Total Carbs = 4.0g`, `Dietary Fiber = 9.0g`.
- **Required Behavior:** Deterministic engine must clamp `NetCarbs` to `0.0g` without returning negative values or `-0` (`Object.is(result, -0)` must be `false`).
- *Why:* Negative net carbs corrupt composite recipe equations and underestimate insulin requirements.

### 3.2 Thermal Multiplier Upper Bounds
- **Phenomenon:** Mechanical processing and thermal gelatinization elevate starch digestion rates.
- **Test Vector:** Ingredients with `prepState: 'mashed_processed'` ($1.25\times$) or `'boiled'` ($1.20\times$).
- **Required Behavior:** Effective GI must never exceed the theoretical ceiling of $100$.
- *Why:* GI is indexed to pure reference glucose ($100$); mathematical overflow violates clinical guidelines.

### 3.3 Floating-Point Precision Drift (IEEE 754)
- **Phenomenon:** Binary floating-point subtraction yields artifacts (e.g. `10.3333 - 3.1111 = 7.222222222222221`).
- **Test Vector:** Feed non-terminating decimal macronutrients.
- **Required Behavior:** Deterministic helper `roundToOneDecimal(val)` must clamp results strictly to 1 decimal place (`7.2g`).
- *Why:* Consistent display across UI components and prevents precision jitter during state re-renders.

### 3.4 Zero-Division Carbohydrate Singularity
- **Phenomenon:** Multi-ingredient meal composed exclusively of pure proteins and lipids ($0\text{g}$ carbohydrates, e.g. olive oil + salmon + ribeye steak).
- **Test Vector:** Recipes where $\sum NC_i = 0$.
- **Required Behavior:** Composite GI and GL must resolve to `0`. `Number.isNaN()` must be `false` and `Number.isFinite()` must be `true`.
- *Why:* Prevents runtime crashes, `NaN` badges, and invalid meal plan rollups.

### 3.5 Carbohydrate-Weighted GL Rollup Aggregation
- **Phenomenon:** Multi-meal daily rollups across breakfast, lunch, and dinner.
- **Test Vector:** Zero-carb chicken breast meal + high-carb rice bowl meal.
- **Required Behavior:** Daily cumulative GL must be weighted by carbohydrate mass rather than an unweighted arithmetic average of meal GLs.
- *Why:* Unweighted averaging incorrectly dilutes high-glycemic spikes with zero-carb meals.

---

## 4. Preattentive Visual Spectrum & Chromatic Validation

When validating chromatic compliance in automated visual regression runs, agents must verify that element background tokens map to the following HSL spectrum ranges:

```
+-----------------------------------------------------------------------------------+
|                          CHROMATIC SPECTRUM TARGETS                               |
+---------------+--------------------+------------------------+---------------------+
| Band Category | Target Hex Range   | Hue Angle Range (HSL)  | Min Contrast Ratio  |
+---------------+--------------------+------------------------+---------------------+
| Low GL        | #D8E8CB to #1B3B22 | 95° to 135° (Sage)     | 4.5:1 (AA) / 10.8:1 |
| Medium GL     | #FFE082 to #9E4D2A | 30° to 50° (Amber)     | 4.5:1 (AA) / 5.1:1  |
| High GL       | #FFDAD6 to #BA1A1A | 340° to 10° (Rose)     | 4.5:1 (AA) / 5.8:1  |
+---------------+--------------------+------------------------+---------------------+
```

- **Why:** Visual feedback processed in $< 200\text{ms}$ by the human visual cortex enables instant subconscious glycemic risk assessment, eliminating cognitive decision fatigue.

---

## 5. Antigravity Agent Orchestration & Consolidation Workflow

The **Antigravity Orchestration Engine** coordinates multi-step development, verification, and documentation consolidation:

```mermaid
flowchart TD
    UserReq["User Intent / Objective"] --> Branch["Branch Creation (docs/full-consolidation from master)"]
    Branch --> Ingest["Verbatim Ingestion & AST Inspection (Raw Docs & Tests)"]
    Ingest --> DupMap["Duplicate Content Mapping & Section Tagging"]
    DupMap --> Plan["Chunked Synthesis & Architectural Planning"]
    Plan --> Gen["Atomic File Generation (UTF-8 Clean)"]
    Gen --> Gate["Validation & CI Verification Gates (Lint, Typecheck, Test)"]
    Gate --> Commit["Conventional Commits & Linear History"]
```

### Key Orchestration Principles:
1. **Verbatim Ingestion First:** Ingest full raw source files before planning or refactoring to avoid hallucinations or loss of technical precision.
2. **Chunked Consolidation:** Execute complex multi-document refactoring in discrete, reviewable stages rather than massive monolithic rewrites.
3. **Reactive Task Handling:** Utilize non-blocking background command tasks for heavy test executions (`npm run test`), receiving event notifications upon completion.
4. **Encoding Integrity:** Enforce UTF-8 encoding across all programmatic file generators, preventing character corruption or BOM artifacts.

---


### 5.1 Automated Encoding & BOM Sanitization (`scripts/strip-bom.js`)
AI coding agents running on Windows environments may inadvertently emit UTF-8 Byte Order Marks (BOM). The orchestration suite provides `scripts/strip-bom.js` to audit and sanitize all root configuration files before staging commits.

## 6. Continuous Integration (CI/CD) Agent Behaviors & Validation Gates

Every Pull Request and branch merge is automatically evaluated against the automated CI pipeline gates:

```
+-----------------------------------------------------------------------------------+
|                           AUTOMATED CI/CD PIPELINE GATES                          |
+-------------------+--------------------------------+------------------------------+
| Gate Stage        | Command Execution              | Enforcement Standard         |
+-------------------+--------------------------------+------------------------------+
| 1. Static Lint    | npm run lint (Oxlint)          | Zero syntax/hook errors      |
| 2. Type Check     | npm run typecheck (tsc)        | Zero TypeScript errors       |
| 3. Unit & Invar   | npm run test (Vitest)          | 281+ tests passing (100%)    |
| 4. Accessibility  | npm run test:a11y (Playwright) | Zero WCAG 2.1 AA violations  |
| 5. User Journeys  | npm run test:e2e (Playwright)  | Complete end-to-end flows    |
| 6. DB Integrity   | npm run validate-db (Node.js)  | Nutritional invariants valid |
| 7. Pre-Commit     | npm run precommit              | Lint + Typecheck gate        |
+-------------------+--------------------------------+------------------------------+
```

---

## 7. Engineering Standards, Conventional Commits & Branching Strategy

### 7.1 Git Branching Strategy
- **`master`**: Production-ready, deployable branch. Direct pushes are protected.
- **`feat/<feature-name>`**: Feature development branches (e.g. `feat/extend-recipe-ingredient-schemas`).
- **`docs/<scope>`**: Documentation architecture and consolidation branches (e.g. `docs/full-consolidation`).
- **`fix/<bug-name>`**: Targeted bug fixes and security patches (e.g. `fix/tenant-scoping-middleware`).

---

### 7.2 Conventional Commits Specification
All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<optional scope>): <description>

[optional body explaining architectural/clinical rationale]
```

#### Supported Types:
- **`feat`**: A new clinical feature or UI capability (e.g. `feat: implement 7-day adherence rollup calculation`).
- **`fix`**: A bug fix or security patch (e.g. `fix(deploy): remove UTF-8 BOM from netlify.toml`).
- **`docs`**: Documentation updates and architecture consolidation (e.g. `docs: create consolidated frontend engineering guide`).
- **`refactor`**: Code refactoring without behavioral alterations (e.g. `refactor: standardize calculateNetCarbs helper usage`).
- **`test`**: Adding or updating test suites (e.g. `test: add tenant scoping integration tests`).
- **`chore`**: Maintenance, dependencies, and cleanup (e.g. `chore: remove orphaned test artifacts`).

---

## 8. Document Metadata & Attribution

- **Document Version:** `2.0.0`
- **Lead Systems Architect & QA Lead:** Fotis Pastrakis ([https://fotisp.gr](https://fotisp.gr))
- **Execution Standard:** QA-DIRECTIVE-2026, WCAG 2.1 Level AA, Conventional Commits 1.0
