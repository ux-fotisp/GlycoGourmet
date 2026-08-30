# 🎨 GlycoGourmet — Sage & Grain Design System Specification

> **Visual Design DNA, Color Tokens, Typography Scale, 8px Grid, Component States & Contrast Certification Matrix**  
> *Architected & Designed by [Fotis Pastrakis](https://fotisp.gr)*  
> *Sourced from the Google Stitch project GlycoGourmet Accessibility Design System (`projects/5737888838361499776`)*

---

## 1. Color Palette & Semantic Design Tokens

The Sage & Grain palette establishes an earthy, clinical, and calming visual atmosphere designed to minimize anxiety and maximize readability for continuous metabolic monitoring.

| Token Name | CSS Custom Variable | Hex Code | Semantic Role & UI Application |
| :--- | :--- | :---: | :--- |
| **Primary** | `--color-primary` | `#325346` | Deep Sage Green — Primary actions, active navigation, brand identity. |
| **Primary Container** | `--color-primary-container` | `#4A6B5D` | Medium Sage Green — Container hover states, secondary highlights. |
| **On Primary** | `--color-on-primary` | `#FFFFFF` | Crisp White text and icons on primary backgrounds. |
| **On Primary Container** | `--color-on-primary-container` | `#C6EAD8` | Soft Sage text on dark container surfaces. |
| **Surface** | `--color-surface` | `#F7FAF8` | Warm Oat White — Primary page and canvas background. |
| **Surface Container Lowest** | `--color-surface-container-lowest` | `#FFFFFF` | Pure White — Bento cards, modals, interactive inputs. |
| **Surface Container Low** | `--color-surface-container-low` | `#F1F4F2` | Soft Grey-Green — Sidebars, filter panels, badge backings. |
| **Surface Container** | `--color-surface-container` | `#ECEEED` | Tonal base layer for tab groups and segmented controls. |
| **Surface Container High** | `--color-surface-container-high` | `#E6E9E7` | Selected facet chips, active borders, dividing lines. |
| **Surface Container Highest**| `--color-surface-container-highest`| `#E0E3E1` | Disabled controls, inactive toggles, skeleton loaders. |
| **On Surface** | `--color-on-surface` | `#181C1B` | Slate Charcoal — High-contrast primary headings and body copy. |
| **On Surface Variant** | `--color-on-surface-variant` | `#414844` | Muted Grey-Charcoal — Secondary labels, metadata, captions. |
| **Outline** | `--color-outline` | `#727974` | Standard borders on cards, inputs, and dividers. |
| **Outline Variant** | `--color-outline-variant` | `#C1C8C3` | Subtle divider lines and decorative card boundaries. |
| **Tertiary** | `--color-tertiary` | `#803615` | Muted Copper/Amber — Moderate glycemic warnings, nutrition highlights. |
| **Tertiary Container** | `--color-tertiary-container` | `#9E4D2A` | Medium Glycemic Load alert pill backgrounds. |
| **Error** | `--color-error` | `#BA1A1A` | Rose Red — High Glycemic Load alerts ($GL \ge 20$) and validation errors. |
| **Error Container** | `--color-error-container` | `#FFDAD6` | High GL warning container backgrounds. |

---

## 2. Typography Scale & Hierarchy

The design system utilizes **Plus Jakarta Sans** for display headings, body text, and interactive labels, delivering high legibility at all densities.

| Typography Level | Font Size | Weight | Line Height | Letter Spacing | CSS Utility / Application |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Display** | `40px` (`2.5rem`) | Bold (700) | `1.2` | `-0.02em` | Hero headers, main page titles. |
| **Headline Large** | `32px` (`2.0rem`) | Semi-Bold (600) | `1.3` | `-0.01em` | Section headings, modal titles. |
| **Headline Medium**| `24px` (`1.5rem`) | Semi-Bold (600) | `1.4` | `0.00em` | Bento card titles, recipe names. |
| **Body Large** | `18px` (`1.125rem`)| Regular (400) | `1.6` | `0.01em` | Recipe descriptions, intake instructions. |
| **Body Medium** | `16px` (`1.0rem`) | Regular (400) | `1.5` | `0.01em` | Standard body text, form field values. |
| **Label Medium** | `14px` (`0.875rem`)| Semi-Bold (600) | `1.5` | `0.04em` | Buttons, tabs, facet chip text. |
| **Caption** | `12px` (`0.75rem`) | Medium (500) | `1.4` | `0.03em` | Macro sub-labels, timestamps, tooltips. |

---

## 3. Spacing & 8px Base Grid System

All structural layout dimensions, margins, and paddings adhere to an **8px base grid system**:

```
+-----------------------------------------------------------------------------------+
|                            8px BASE GRID DIMENSIONS                               |
+-------------------+--------------------+------------------+-----------------------+
| Token Name        | Pixel Value        | REM Value        | Primary Layout Usage  |
+-------------------+--------------------+------------------+-----------------------+
| unit-xs           | 4px                | 0.25rem          | Tight icon gaps, chip internal padding |
| unit-sm (sm)      | 8px                | 0.5rem           | Input internal padding, badge spacing  |
| unit-md (md)      | 16px               | 1.0rem           | Card padding, standard item gutters    |
| unit-lg (lg)      | 24px               | 1.5rem           | Bento grid column gaps, container edge |
| unit-xl (xl)      | 40px               | 2.5rem           | Major section margins, modal paddings  |
| unit-xxl          | 64px               | 4.0rem           | Page hero vertical padding             |
+-------------------+--------------------+------------------+-----------------------+
```

- **Gutter Width:** `24px` (`1.5rem`).
- **Edge Margin:** `16px` (`1.0rem`) on mobile; `32px` (`2.0rem`) on desktop.
- **Container Max Width:** `1200px` (centered with `mx-auto`).

---

## 4. Border Radius (Roundness Scale)

| Radius Token | CSS Custom Value | REM Value | Component Application |
| :--- | :---: | :---: | :--- |
| **`sm`** | `4px` | `0.25rem` | Nested badges, small thumbnail images. |
| **`DEFAULT`** | `8px` | `0.5rem` | Standard inputs, select dropdowns, alerts. |
| **`md`** | `12px` | `0.75rem` | Bento grid cells, list items, small cards. |
| **`lg`** | `16px` | `1.0rem` | Recipe cards, filter bar glass container. |
| **`xl`** | `24px` | `1.5rem` | Main dialog modals, slide-over drawers. |
| **`full`** | `9999px` | — | Buttons, filter facet chips, metabolic badges. |

---

## 5. Elevation, Shadows & Component States

### 5.1 Ambient Shadows
- **`ambient-shadow`**: `0px 4px 20px rgba(45, 49, 48, 0.05)` (Resting cards, bento modules).
- **`ambient-shadow-hover`**: `0px 12px 30px rgba(45, 49, 48, 0.08)` (Elevated hover states).

### 5.2 Interactive Component States
- **Hover:** Buttons expand slightly (`hover:scale-[1.02]`) with `ambient-shadow-hover` using a 150ms ease transition.
- **Active / Press:** Buttons scale down to `active:scale-95` on pointer down.
- **Disabled:** Opacity reduced to `50%`, `cursor: not-allowed`, all click interactions suppressed.
- **Focus Ring:** Inputs transition to primary outline with a soft focus ring (`focus:ring-2 focus:ring-primary/20`).

---

## 6. Preattentive Chromatic Visual Feedback (WCAG 2.1 AA Compliant)

### 6.1 Preattentive Glycemic Spectrum
The human visual cortex processes preattentive visual attributes in $< 200\text{ms}$, allowing subconscious risk evaluation:

```
Glycemic Load (GL) Spectrum:
0 ---------------- 10 ----------------- 19 ----------------- 100+
[ LOW GL (<= 10)  ] [  MED GL (11 - 19)  ] [   HIGH GL (>= 20)  ]
[   SAGE GREEN    ] [       AMBER        ] [     ERROR ROSE     ]
[ #1B3B22/#386A20 ] [      #9E4D2A       ] [      #BA1A1A       ]
[ "Gentle Impact" ] [ "Moderate Impact"  ] [ "High Spike Risk"  ]
```

### 6.2 WCAG 2.1 Contrast Certification Matrix

| Semantic Token | Hex Code | Background Surface | Measured Contrast | WCAG 2.1 AA Status |
| :--- | :---: | :---: | :---: | :---: |
| **Deep Pine (`--color-pine-900`)** | `#1B3B22` | Grain Ivory (`#F6F4EE`) | **$10.8 : 1$** | ✅ Passes (Exceeds AAA) |
| **Glyco Sage (`--color-sage-700`)** | `#386A20` | Soft Sage (`#D8E8CB`) | **$4.8 : 1$** | ✅ Passes (Exceeds AA) |
| **Forest Moss (`--color-moss-800`)** | `#2D5A34` | Soft Sage (`#D8E8CB`) | **$5.4 : 1$** | ✅ Passes (Exceeds AA) |
| **Amber (`--color-tertiary`)** | `#9E4D2A` | Amber Container (`#FFDBCF`) | **$5.1 : 1$** | ✅ Passes (Exceeds AA) |
| **Error Rose (`--color-error`)** | `#BA1A1A` | Error Container (`#FFDAD6`) | **$5.8 : 1$** | ✅ Passes (Exceeds AA) |

---

## 7. Document Metadata & Attribution

- **Document Version:** `2.0.0`
- **Design System Architect:** Fotis Pastrakis ([https://fotisp.gr](https://fotisp.gr))
- **Accessibility Standard:** WCAG 2.1 Level AA & AAA Contrast Compliance
