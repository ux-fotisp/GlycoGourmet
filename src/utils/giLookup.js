import giMap from '../data/giReferenceMap.json';

/**
 * Normalizes an ingredient name/slug into a search key.
 * @param {string} name
 * @returns {string}
 */
export function normalizeSlug(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Curated Academic GI Lookup Function
 *
 * Sydney University Glycemic Index reference lookup with automated fallback logic:
 *   1. Zero-Carb Rule: If netCarbs === 0, returns GI = 0 automatically.
 *   2. Exact Slug Match: Matches normalized slug against Sydney University database dictionary.
 *   3. Substring Match: Scans dictionary keys for partial matches (e.g. "Atlantic Salmon" -> "salmon").
 *   4. Category Fallback: Low GI default (15) for non-zero low-carb items, or 50 for moderate carbs.
 *
 * @param {string} nameOrSlug — ingredient name or key
 * @param {number} [netCarbs=0] — calculated net carbs
 * @param {string} [category] — optional food category
 * @returns {number} — GI value (0–100)
 */
export function getAcademicGI(nameOrSlug, netCarbs = 0, category = '') {
  // ① Zero-Carb Rule: Zero-carb items have no postprandial glucose impact -> GI = 0
  const numericNetCarbs = parseFloat(netCarbs) || 0;
  if (numericNetCarbs <= 0) {
    return 0;
  }

  const slug = normalizeSlug(nameOrSlug);
  if (!slug) return 15;

  // ② Exact Slug Match
  if (typeof giMap[slug] === 'number') {
    return giMap[slug];
  }

  // ③ Substring Keyword Match
  const keys = Object.keys(giMap);
  for (const key of keys) {
    if (slug.includes(key) || key.includes(slug)) {
      return giMap[key];
    }
  }

  // ④ Category Fallback
  const cat = (category || '').toLowerCase();
  if (cat === 'protein' || cat === 'fat' || cat === 'cheese') return 0;
  if (cat === 'vegetable' || cat === 'seasoning') return 15;
  if (cat === 'fruit') return 25;
  if (cat === 'legume') return 30;
  if (cat === 'grain') return 53;

  return numericNetCarbs < 5 ? 15 : 50;
}

export default getAcademicGI;
