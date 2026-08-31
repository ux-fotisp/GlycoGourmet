/**
 * Single source of truth for dietary restriction tags.
 * Matches the Strapi dietaryTags enumeration schema.
 */

export const DIETARY_TAGS = [
  { value: 'vegan', label: 'Vegan', icon: 'eco' },
  { value: 'vegetarian', label: 'Vegetarian', icon: 'spa' },
  { value: 'low_fodmap', label: 'Low FODMAP', icon: 'health_and_safety' },
  { value: 'renal_friendly', label: 'Renal Friendly', icon: 'medical_services' },
  { value: 'heart_healthy', label: 'Heart Healthy', icon: 'favorite' },
  { value: 'gluten_free', label: 'Gluten-Free', icon: 'do_not_disturb' },
  { value: 'dairy_free', label: 'Dairy-Free', icon: 'no_food' },
];

export const DIETARY_TAG_MAP = DIETARY_TAGS.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const DIETARY_TAG_VALUES = DIETARY_TAGS.map((t) => t.value);

export default DIETARY_TAGS;