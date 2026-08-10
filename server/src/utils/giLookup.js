import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

let giMap = {};

try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const mapPath = join(__dirname, '../data/giReferenceMap.json');
  giMap = JSON.parse(readFileSync(mapPath, 'utf8'));
} catch {
  // Inline fallback map if file read differs in bundled execution
  giMap = {
    "salmon": 0, "asparagus": 15, "almond-flour": 15, "quinoa": 53, "white-rice": 73,
    "chicken-breast": 0, "egg": 0, "spinach": 15, "broccoli": 15, "cauliflower": 15,
    "avocado": 15, "berries": 25, "greek-yogurt": 11, "sweet-potato": 54, "brown-rice": 50
  };
}

export function normalizeSlug(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getAcademicGI(nameOrSlug, netCarbs = 0, category = '') {
  const numericNetCarbs = parseFloat(netCarbs) || 0;
  if (numericNetCarbs <= 0) {
    return 0;
  }

  const slug = normalizeSlug(nameOrSlug);
  if (!slug) return 15;

  if (typeof giMap[slug] === 'number') {
    return giMap[slug];
  }

  const keys = Object.keys(giMap);
  for (const key of keys) {
    if (slug.includes(key) || key.includes(slug)) {
      return giMap[key];
    }
  }

  const cat = (category || '').toLowerCase();
  if (cat === 'protein' || cat === 'fat' || cat === 'cheese') return 0;
  if (cat === 'vegetable' || cat === 'seasoning') return 15;
  if (cat === 'fruit') return 25;
  if (cat === 'legume') return 30;
  if (cat === 'grain') return 53;

  return numericNetCarbs < 5 ? 15 : 50;
}

export default getAcademicGI;
