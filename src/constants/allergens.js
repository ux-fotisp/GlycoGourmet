/**
 * Single source of truth for the 9 major food allergens defined by
 * the FDA (FALCPA 2004 + FASTER Act 2021).
 * Matches the Strapi allergen enumeration schema.
 */

export const FDA_ALLERGENS = [
  { value: 'milk', label: 'Milk', icon: 'water_drop' },
  { value: 'egg', label: 'Egg', icon: 'egg' },
  { value: 'fish', label: 'Fish', icon: 'set_meal' },
  { value: 'crustacean_shellfish', label: 'Crustacean Shellfish', icon: 'phishing' },
  { value: 'tree_nuts', label: 'Tree Nuts', icon: 'nature' },
  { value: 'peanuts', label: 'Peanuts', icon: 'grain' },
  { value: 'wheat', label: 'Wheat', icon: 'bakery_dining' },
  { value: 'soybeans', label: 'Soybeans', icon: 'eco' },
  { value: 'sesame', label: 'Sesame', icon: 'scatter_plot' },
];

export const ALLERGENS = FDA_ALLERGENS;

export const ALLERGEN_MAP = FDA_ALLERGENS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const ALLERGEN_VALUES = FDA_ALLERGENS.map((a) => a.value);

export default FDA_ALLERGENS;