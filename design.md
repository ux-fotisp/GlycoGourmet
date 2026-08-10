# GlycoGourmet — Design DNA Reference (Sage & Grain)

This design system is sourced from the Google Stitch project **GlycoGourmet Accessibility Design System** (`projects/5737888838361499776`).

---

## 🎨 Color Palette

| Role | Variable | Hex Value | Usage |
|---|---|---|---|
| **Primary** | `--color-primary` | `#325346` | Sage Green - primary actions, success states, brand identifiers |
| **Primary Container** | `--color-primary-container` | `#4a6b5d` | Medium Sage Green - hover states, secondary indicators |
| **On Primary** | `--color-on-primary` | `#ffffff` | White text on primary buttons |
| **On Primary Container** | `--color-on-primary-container` | `#c6ead8` | Light sage text on container |
| **Surface** | `--color-surface` | `#f7faf8` | Warm Oat White background |
| **Surface Container Lowest**| `--color-surface-container-lowest`| `#ffffff` | Pure white for cards, inputs |
| **Surface Container Low** | `--color-surface-container-low` | `#f1f4f2` | Soft grey-green for list panels, sidebar |
| **Surface Container** | `--color-surface-container` | `#eceeed` | Tonal layer base |
| **Surface Container High** | `--color-surface-container-high`| `#e6e9e7` | Selected chips, borders |
| **Surface Container Highest**|`--color-surface-container-highest`|`#e0e3e1`| Disabled control backgrounds |
| **On Surface** | `--color-on-surface` | `#181c1b` | Slate Charcoal for primary body text |
| **On Surface Variant** | `--color-on-surface-variant` | `#414844` | Muted grey-charcoal for secondary text, labels |
| **Outline** | `--color-outline` | `#727974` | Standard borders |
| **Outline Variant** | `--color-outline-variant` | `#c1c8c3` | Subtle divider lines |
| **Tertiary** | `--color-tertiary` | `#803615` | Muted Copper/Amber warnings, nutrition highlights |
| **Tertiary Container** | `--color-tertiary-container` | `#9e4d2a` | Warning/curfew background |
| **Error** | `--color-error` | `#ba1a1a` | High GI alert |
| **Error Container** | `--color-error-container` | `#ffdad6` | Error block background |

---

## 🅰️ Typography

The design system is exported with **Plus Jakarta Sans** for both Display and Body elements. 
*(Note: If Comfortaa for display/headings and Manrope for body are preferred, they are noted here as alternative overrides.)*

### Exported Plus Jakarta Sans Scale:
*   **Display:** 40px | Semi-bold (700) | Line height 1.2 | Tracking 0.02em
*   **Headline Large:** 32px | Semi-bold (600) | Line height 1.3 | Tracking 0.01em
*   **Headline Medium:** 24px | Semi-bold (600) | Line height 1.4 | Tracking 0.01em
*   **Body Large:** 18px | Regular (400) | Line height 1.6 | Tracking 0.02em
*   **Body Medium:** 16px | Regular (400) | Line height 1.5 | Tracking 0.02em
*   **Label Medium:** 14px | Semi-bold (600) | Line height 1.5 | Tracking 0.05em
*   **Caption:** 12px | Medium (500) | Line height 1.4 | Tracking 0.03em

---

## 📐 Spacing & Grid System

All spacing follows an **8px base grid system**:
*   **unit-xs:** 4px
*   **unit-sm (sm):** 8px / 0.5rem
*   **unit-md (md):** 16px / 1rem
*   **unit-lg (lg):** 24px / 1.5rem
*   **unit-xl (xl):** 40px / 2.5rem
*   **unit-xxl:** 64px / 4rem
*   **Gutter:** 24px / 1.5rem
*   **Edge Margin:** 16px / 1rem
*   **Container Max Width:** 1200px

---

## 🪟 Border Radius (Roundness)

*   **sm:** 0.25rem (4px) — nested elements, images
*   **DEFAULT:** 0.5rem (8px) — inputs, small cards, panels
*   **md:** 0.75rem (12px) — standard modules
*   **lg:** 1rem (16px) — recipe cards, featured cards
*   **xl:** 1.5rem (24px) — main modals
*   **full:** 9999px — buttons, chips, selectors

---

## 👥 Elevation & Component States

### Shadows
*   **ambient-shadow:** `0px 4px 20px rgba(45, 49, 48, 0.05)` (used on resting cards, panels)
*   **ambient-shadow-hover:** `0px 12px 30px rgba(45, 49, 48, 0.08)` (applied on hover/active states)

### States
*   **Hover**: Buttons expand scale slightly, apply `ambient-shadow-hover` with 150ms ease transition.
*   **Active**: Buttons scale down to `active:scale-95` on press.
*   **Disabled**: Opacity reduced to `50%`, cursor changed to `not-allowed`, click events blocked.
*   **Focus**: Inputs outline transitions to primary color outline with a thin focus ring (`focus:ring-2 focus:ring-primary/20`).
