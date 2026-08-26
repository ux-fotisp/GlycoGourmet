/**
 * seedNewRecipes.js — Master Clinical Database Seeder & Strapi Synchronization CLI
 *
 * Ingests the 12 clinical seed recipes, constituent ingredients, thermal states,
 * and Smart Swap pairings directly into Strapi CMS REST endpoints and local seed caches.
 *
 * Usage:
 *   node scripts/seedNewRecipes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.VITE_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || process.env.VITE_STRAPI_TOKEN || '';

// Load Seed Datasets
import { MASTER_CLINICAL_RECIPES } from '../src/data/seedRecipes.js';

const INGREDIENTS_SEED_PATH = path.resolve(__dirname, '../server/src/seeds/ingredientsSeed.json');
const RECIPES_SEED_PATH = path.resolve(__dirname, '../server/src/seeds/recipesSeed.json');
const PUBLIC_INDEX_PATH = path.resolve(__dirname, '../public/data/recipes_index.json');
const SRC_INGREDIENTS_PATH = path.resolve(__dirname, '../src/data/ingredients.json');
const SRC_RECIPES_PATH = path.resolve(__dirname, '../src/data/recipes.json');

/**
 * Validate recipe mathematical invariants before database insertion
 */
function validateRecipeInvariants(recipe) {
  if (!recipe.title || !recipe.title.trim()) {
    throw new Error(`[Validation Error] Recipe must have a title.`);
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    throw new Error(`[Validation Error] Recipe "${recipe.title}" must contain at least 1 ingredient.`);
  }

  recipe.ingredients.forEach((ing, idx) => {
    if (!ing.ingredientId) {
      throw new Error(`[Validation Error] Recipe "${recipe.title}" ingredient #${idx + 1} missing ingredientId.`);
    }
    if (typeof ing.amount !== 'number' || ing.amount <= 0) {
      throw new Error(`[Validation Error] Recipe "${recipe.title}" ingredient "${ing.ingredientId}" has invalid amount: ${ing.amount}`);
    }
  });

  const gl = Number(recipe.glycemicLoad ?? recipe.nutrition?.glycemicLoad ?? 0);
  if (gl < 0 || gl > 100) {
    throw new Error(`[Validation Error] Recipe "${recipe.title}" Glycemic Load (${gl}) must be between 0 and 100.`);
  }

  const carbs = Number(recipe.nutrition?.carbs ?? 0);
  const fiber = Number(recipe.nutrition?.fiber ?? 0);
  const netCarbs = Number(recipe.nutrition?.netCarbs ?? Math.max(0, carbs - fiber));
  if (netCarbs < 0) {
    throw new Error(`[Validation Error] Recipe "${recipe.title}" Net Carbs cannot be negative.`);
  }
}

async function buildAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }
  return headers;
}

async function checkStrapiLiveness() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${STRAPI_URL}/api/ingredients`, {
      method: 'GET',
      headers: await buildAuthHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.ok || res.status === 401 || res.status === 403;
  } catch {
    return false;
  }
}

async function seedStrapi(isOnline) {
  console.log('\n======================================================');
  console.log('  🥗 GlycoGourmet Master Clinical Database Seeder');
  console.log('======================================================');
  console.log(`🌐 Target Strapi CMS URL: ${STRAPI_URL}`);
  console.log(`📡 Strapi Connectivity:  ${isOnline ? 'ONLINE (Syncing API)' : 'OFFLINE (Syncing Seed Caches)'}`);

  // 1. Ingest / Synchronize Seed Files
  let baseIngredients = [];
  if (fs.existsSync(INGREDIENTS_SEED_PATH)) {
    try {
      baseIngredients = JSON.parse(fs.readFileSync(INGREDIENTS_SEED_PATH, 'utf8'));
    } catch {
      baseIngredients = [];
    }
  }

  let baseRecipes = [];
  if (fs.existsSync(RECIPES_SEED_PATH)) {
    try {
      baseRecipes = JSON.parse(fs.readFileSync(RECIPES_SEED_PATH, 'utf8'));
    } catch {
      baseRecipes = [];
    }
  }

  // Merge Master Clinical Recipes into seed list
  const mergedRecipes = [...MASTER_CLINICAL_RECIPES];
  baseRecipes.forEach(rec => {
    if (!mergedRecipes.some(m => m.id === rec.id || m.title === rec.title)) {
      mergedRecipes.push(rec);
    }
  });

  // 2. Validate all recipes against mathematical invariants
  console.log(`\n🔍 Validating ${mergedRecipes.length} recipes against metabolic invariants...`);
  mergedRecipes.forEach(rec => validateRecipeInvariants(rec));
  console.log(`✅ All ${mergedRecipes.length} recipes passed mathematical invariant checks.`);

  // 3. Write Local Persistence Caches
  console.log('\n💾 Writing updated seed caches to disk:');
  const safeWrite = (filePath, data) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   ✓ ${path.relative(process.cwd(), filePath)} (${Array.isArray(data) ? data.length + ' items' : 'saved'})`);
  };

  safeWrite(RECIPES_SEED_PATH, mergedRecipes);
  safeWrite(SRC_RECIPES_PATH, mergedRecipes);
  safeWrite(PUBLIC_INDEX_PATH, mergedRecipes.map((r, i) => ({
    id: r.id,
    recipeNumber: i + 1,
    title: r.title,
    mealOccasion: r.mealOccasion || 'dinner',
    category: r.category,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    glycemicIndex: r.glycemicIndex,
    glycemicLoad: r.glycemicLoad,
    glycemicImpact: r.glycemicImpact,
    dietaryFlags: r.dietaryFlags || [],
    imageUrl: r.imageUrl,
    status: r.status || 'published',
    publishedAt: r.publishedAt || new Date().toISOString(),
  })));

  if (baseIngredients.length > 0) {
    safeWrite(SRC_INGREDIENTS_PATH, baseIngredients);
  }

  // 4. If Strapi is online, synchronize entities via REST API
  if (isOnline) {
    console.log('\n🚀 Synchronizing recipes with live Strapi REST API...');
    const headers = await buildAuthHeaders();

    let inserted = 0;
    let updated = 0;

    for (const recipe of mergedRecipes) {
      try {
        // Query if exists
        const searchRes = await fetch(`${STRAPI_URL}/api/recipes?filters[title][$eq]=${encodeURIComponent(recipe.title)}`, {
          headers,
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const existing = searchData?.data?.[0];

          const payload = {
            data: {
              ...recipe,
              publishedAt: recipe.publishedAt || new Date().toISOString(),
            },
          };

          if (existing) {
            await fetch(`${STRAPI_URL}/api/recipes/${existing.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify(payload),
            });
            updated++;
          } else {
            await fetch(`${STRAPI_URL}/api/recipes`, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            });
            inserted++;
          }
        }
      } catch (err) {
        console.warn(`   ⚠️ Strapi API sync warning for "${recipe.title}":`, err.message);
      }
    }
    console.log(`✅ Strapi Sync Complete: ${inserted} created, ${updated} updated.`);
  }

  // 5. Output Summary Table
  console.log('\n📊 Ingested Clinical Recipe Manifest:');
  console.log('-------------------------------------------------------------------------------------');
  console.log('  # | Occasion  | GL   | Impact        | Recipe Title');
  console.log('-------------------------------------------------------------------------------------');
  MASTER_CLINICAL_RECIPES.forEach((r, idx) => {
    const num = String(idx + 1).padStart(3, ' ');
    const occasion = (r.mealOccasion || 'dinner').padEnd(9, ' ');
    const gl = String(r.glycemicLoad).padEnd(4, ' ');
    const impact = (r.glycemicImpact || 'Optimal Low-GI').padEnd(13, ' ');
    console.log(` ${num} | ${occasion} | ${gl} | ${impact} | ${r.title}`);
  });
  console.log('-------------------------------------------------------------------------------------');
  console.log('✨ Seed & Synchronization completed successfully!\n');
}

checkStrapiLiveness().then(seedStrapi).catch((err) => {
  console.error('❌ Fatal error during database seed:', err);
  process.exit(1);
});
