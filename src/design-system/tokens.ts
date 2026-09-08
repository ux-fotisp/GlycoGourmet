/**
 * GlycoGourmet Design System Tokens
 * Source: MagicPath Design System (daring-storm-9960 / 448058871597133824)
 * Reconciled against GlycoGourmet live clinical tokens.
 *
 * PURE DATA MODULE — zero React dependencies, zero DOM, zero browser runtime side-effects.
 */

// ============================================================================
// Types
// ============================================================================

export interface ColorSwatch {
  readonly id: string;
  readonly hex: string;
  readonly name: string;
  readonly usage: string;
}

export interface SpacingToken {
  readonly token: string;
  readonly value: string;
  readonly pixels: number;
  readonly rem: string;
  readonly usage: string;
}

export interface RadiusToken {
  readonly name: string;
  readonly value: string;
  readonly className: string;
  readonly usage?: string;
}

export interface TypeSpecimen {
  readonly id: string;
  readonly text: string;
  readonly className: string;
  readonly color: string;
  readonly meta: string;
  readonly fontFamily: 'fraunces' | 'jakarta';
  readonly fontSizePx: number;
  readonly fontWeight: number;
}

export interface GlycemicBandToken {
  readonly category: 'Low GL' | 'Medium GL' | 'High GL';
  readonly minGL: number;
  readonly maxGL: number | null;
  readonly thresholdLabel: string;
  /** High-contrast verified text color adopted from MagicPath */
  readonly textColor: string;
  /** Background color preserved from live clinical tokens */
  readonly bgColor: string;
  /** Optional border color for badges/cards */
  readonly borderColor: string;
  /** Gradient styling for chips/CTAs */
  readonly gradient: string;
  readonly clinicalMeaning: string;
}

// ============================================================================
// 1. Chromatic Glycemic Bands (Decision 1 & 2)
// ============================================================================

export const chromaticGlycemicBands: readonly GlycemicBandToken[] = [
  {
    category: 'Low GL',
    minGL: 0,
    maxGL: 10,
    thresholdLabel: 'Low GL ≤10',
    textColor: '#2D5016', // MagicPath Moss (Higher contrast vs #386A20)
    bgColor: '#D8E8CB',   // Live Grain Sage container
    borderColor: '#C8E0B8',
    gradient: 'linear-gradient(135deg, #1A3409 0%, #3D6B1E 100%)',
    clinicalMeaning: 'Minimal postprandial glucose excursion; safe for daily volume.',
  },
  {
    category: 'Medium GL',
    minGL: 11,
    maxGL: 19,
    thresholdLabel: 'Medium GL 11–19',
    textColor: '#7A4A1E', // MagicPath Warm Caramel (Higher contrast vs #9E4D2A)
    bgColor: '#FFDBCF',   // Live Amber container (pending human choice between #FFDBCF & #F5E6D0)
    borderColor: '#F0D8A8',
    gradient: 'linear-gradient(135deg, #7A4A1E 0%, #A0652A 100%)',
    clinicalMeaning: 'Moderate postprandial rise; pair with protein, fiber, or healthy fats.',
  },
  {
    category: 'High GL',
    minGL: 20,
    maxGL: null,
    thresholdLabel: 'High GL ≥20',
    textColor: '#8B1A1A', // MagicPath Deep Crimson (Higher contrast vs #BA1A1A)
    bgColor: '#FFDAD6',   // Live Soft Rose container
    borderColor: '#F0B8B5',
    gradient: 'linear-gradient(135deg, #7B1818 0%, #B02020 100%)',
    clinicalMeaning: 'Significant glycemic spike risk; portion reduction or bolus timing advised.',
  },
] as const;

// ============================================================================
// 2. Primary Green & Supplementary Green Ramps (Decision 3)
// ============================================================================

/**
 * Live Brand Primary Green:
 * Preserved intact per Decision 3 to satisfy WCAG automated Playwright test invariants.
 */
export const liveBrandGreen = {
  primary: '#1B3B22',        // Deep Pine
  primaryVariant: '#2D5A34', // Forest Moss
  onPrimary: '#FFFFFF',
} as const;

/**
 * MagicPath Supplementary Green Ramp:
 * Full 11-step green ramp imported from MagicPath as a supplementary palette.
 */
export const primaryGreenRamp: readonly ColorSwatch[] = [
  { id: 'void',   hex: '#0F1F06', name: 'Void',   usage: 'Deepest shadow' },
  { id: 'forest', hex: '#1A3409', name: 'Forest', usage: 'Sidebar top, active chip' },
  { id: 'moss',   hex: '#2D5016', name: 'Moss',   usage: 'Primary CTA, deep text' },
  { id: 'canopy', hex: '#3D6B1E', name: 'Canopy', usage: 'Sidebar bottom' },
  { id: 'sage',   hex: '#4A7C2F', name: 'Sage',   usage: 'Icons, accents' },
  { id: 'fern',   hex: '#6BA048', name: 'Fern',   usage: 'Hover states' },
  { id: 'sprout', hex: '#96C274', name: 'Sprout', usage: 'Progress bars' },
  { id: 'meadow', hex: '#C8E0B8', name: 'Meadow', usage: 'Badge borders' },
  { id: 'mist',   hex: '#D6ECD2', name: 'Mist',   usage: 'Low GL badge bg' },
  { id: 'dew',    hex: '#EEF5E9', name: 'Dew',    usage: 'Card gradient tint' },
  { id: 'vapor',  hex: '#F4FAF1', name: 'Vapor',  usage: 'Lightest tint' },
] as const;

// ============================================================================
// 3. Neutral Palette
// ============================================================================

export const neutralPalette: readonly ColorSwatch[] = [
  { id: 'ink',      hex: '#1A1A14', name: 'Ink',      usage: 'Primary text' },
  { id: 'charcoal', hex: '#3A3A30', name: 'Charcoal', usage: 'Secondary headings' },
  { id: 'graphite', hex: '#6B6B5E', name: 'Graphite', usage: 'Secondary text' },
  { id: 'pebble',   hex: '#9B9B8E', name: 'Pebble',   usage: 'Tertiary/disabled' },
  { id: 'stone',    hex: '#D0CBC0', name: 'Stone',    usage: 'Dividers' },
  { id: 'linen',    hex: '#E3DFD5', name: 'Linen',    usage: 'Card borders' },
  { id: 'cream',    hex: '#F0EDE5', name: 'Cream',    usage: 'Bar tracks' },
  { id: 'bone',     hex: '#F7F6F1', name: 'Bone',     usage: 'Page background' },
  { id: 'white',    hex: '#FFFFFF', name: 'White',    usage: 'Card surfaces' },
] as const;

// ============================================================================
// 4. Spacing Scale (Decision 5 - Full Expanded Set)
// ============================================================================

export const spacingTokens: readonly SpacingToken[] = [
  { token: 'sp-1',  value: '4px',  pixels: 4,  rem: '0.25rem', usage: 'gap-within-chips, micro-gutters' },
  { token: 'sp-2',  value: '8px',  pixels: 8,  rem: '0.5rem',  usage: 'icon-text gaps, form input padding' },
  { token: 'sp-3',  value: '12px', pixels: 12, rem: '0.75rem', usage: 'compact padding, badge gutters' },
  { token: 'sp-4',  value: '16px', pixels: 16, rem: '1rem',    usage: 'card-inner, standard gutters' },
  { token: 'sp-5',  value: '20px', pixels: 20, rem: '1.25rem', usage: 'card-padding, intermediate' },
  { token: 'sp-6',  value: '24px', pixels: 24, rem: '1.5rem',  usage: 'section-spacing, bento column gaps' },
  { token: 'sp-8',  value: '32px', pixels: 32, rem: '2rem',    usage: 'card-gap, container spacing' },
  { token: 'sp-10', value: '40px', pixels: 40, rem: '2.5rem',  usage: 'section-gap, modal padding' },
  { token: 'sp-12', value: '48px', pixels: 48, rem: '3rem',    usage: 'major-section, touch target minimum' },
  { token: 'sp-16', value: '64px', pixels: 64, rem: '4rem',    usage: 'page-padding, hero spacing' },
] as const;

// ============================================================================
// 5. Radius Tokens (Decision 5 - Full Expanded Set)
// ============================================================================

export const radiusTokens: readonly RadiusToken[] = [
  { name: 'rounded-none', value: '0px',    className: 'rounded-none', usage: 'Squared elements' },
  { name: 'rounded-sm',   value: '4px',    className: 'rounded-sm',   usage: 'Micro badges, tooltips' },
  { name: 'rounded',      value: '6px',    className: 'rounded',      usage: 'Subtle container corners' },
  { name: 'rounded-md',   value: '8px',    className: 'rounded-md',   usage: 'Standard form inputs' },
  { name: 'rounded-control', value: '10px', className: 'rounded-[10px]', usage: 'Live control inputs' },
  { name: 'rounded-lg',   value: '12px',   className: 'rounded-lg',   usage: 'Sub-cards, modal content' },
  { name: 'rounded-xl',   value: '16px',   className: 'rounded-xl',   usage: 'Bento cards' },
  { name: 'rounded-2xl',  value: '20px',   className: 'rounded-2xl',  usage: 'Featured metabolic panels' },
  { name: 'rounded-full', value: '9999px', className: 'rounded-full', usage: 'Pills, avatar circles, chips' },
] as const;

// ============================================================================
// 6. Typography Specimen Reference (Reference Data)
// ============================================================================

export const frauncesSpecimens: readonly TypeSpecimen[] = [
  { id: 'f1', text: 'Glucose Control', className: 'text-[48px] font-bold', color: '#1A1A14', meta: '48px / 700 / Display', fontFamily: 'fraunces', fontSizePx: 48, fontWeight: 700 },
  { id: 'f2', text: 'Green Goddess Salad', className: 'text-[36px] font-bold', color: '#1A1A14', meta: '36px / 700 / H1', fontFamily: 'fraunces', fontSizePx: 36, fontWeight: 700 },
  { id: 'f3', text: 'Recipe & Nutrition Detail', className: 'text-[28px] font-semibold', color: '#1A1A14', meta: '28px / 600 / H2', fontFamily: 'fraunces', fontSizePx: 28, fontWeight: 600 },
  { id: 'f4', text: 'Glycemic Snapshot', className: 'text-[22px] font-semibold', color: '#1A1A14', meta: '22px / 600 / H3', fontFamily: 'fraunces', fontSizePx: 22, fontWeight: 600 },
  { id: 'f5', text: 'Ingredients & Quantities', className: 'text-[18px] font-semibold', color: '#1A1A14', meta: '18px / 600 / H4', fontFamily: 'fraunces', fontSizePx: 18, fontWeight: 600 },
  { id: 'f6', text: 'Kale and pumpkin seeds supply magnesium…', className: 'text-[16px] italic', color: '#6B6B5E', meta: '16px / 400i / Lede', fontFamily: 'fraunces', fontSizePx: 16, fontWeight: 400 },
] as const;

export const jakartaSpecimens: readonly TypeSpecimen[] = [
  { id: 'j1', text: 'A genuinely satiating bowl that keeps blood sugar stable.', className: 'text-[16px] leading-6', color: '#1A1A14', meta: '16px / 400 / Body Large', fontFamily: 'jakarta', fontSizePx: 16, fontWeight: 400 },
  { id: 'j2', text: 'Replacing refined sandwich bread with…', className: 'text-[14px] leading-6', color: '#6B6B5E', meta: '14px / 400 / Body', fontFamily: 'jakarta', fontSizePx: 14, fontWeight: 400 },
  { id: 'j3', text: 'Chef Julian · June 2025 · 4.8 stars', className: 'text-[13px] font-semibold', color: '#1A1A14', meta: '13px / 600 / UI Label', fontFamily: 'jakarta', fontSizePx: 13, fontWeight: 600 },
  { id: 'j4', text: 'Values cross-referenced against USDA FoodData Central.', className: 'text-[12px]', color: '#6B6B5E', meta: '12px / 400 / Caption', fontFamily: 'jakarta', fontSizePx: 12, fontWeight: 400 },
  { id: 'j5', text: 'INGREDIENTS · QUANTITIES', className: 'text-[11px] font-semibold tracking-widest', color: '#6B6B5E', meta: '11px / 600 / Micro label', fontFamily: 'jakarta', fontSizePx: 11, fontWeight: 600 },
  { id: 'j6', text: 'GLYCEMIC SNAPSHOT', className: 'text-[10px] font-semibold tracking-widest', color: '#6B6B5E', meta: '10px / 600 / Section Header', fontFamily: 'jakarta', fontSizePx: 10, fontWeight: 600 },
] as const;
