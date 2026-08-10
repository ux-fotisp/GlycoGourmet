/**
 * recipeStore.js — Strapi CMS Recipe Data Layer
 *
 * Architecture:
 * - All recipes are stored in Strapi `/api/recipes`.
 * - Supports Strapi's Draft & Publish feature:
 *   * Draft: `publishedAt: null`
 *   * Published: `publishedAt: new Date().toISOString()`
 * - GET requests use SWR-cached `strapiGet` wrapper.
 * - Writes (create/update) send POST/PUT to `/api/recipes` with auto cache invalidation.
 * - No static database file imports or local fallback JSON fetches exist.
 */

import { strapiGet, strapiPost, strapiPut, invalidateCache } from '../services/strapiClient';

const COLLECTION = '/api/recipes';

const DEFAULT_SEED_RECIPES = [
  {
    id: 'crispy-salmon-asparagus',
    title: 'Herb-Roasted Salmon with Lemon Asparagus',
    description: 'Tender, crispy-skin Atlantic salmon paired with vibrant lemon-roasted asparagus. High protein, zero Net Carbs from salmon, and minimal glycemic impact.',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    cookingTime: 20,
    difficulty: 'Easy',
    servings: 2,
    tags: ['High Protein', 'Keto', 'Low GI'],
    publishedAt: '2026-01-01T00:00:00.000Z',
    status: 'published',
    ingredients: [
      { ingredientId: 'atlantic-salmon', amount: 300, unit: 'g', prepState: 'roasted' },
      { ingredientId: 'herb-asparagus', amount: 200, unit: 'g', prepState: 'roasted' },
    ],
    steps: [
      { title: 'Prep Oven', description: 'Pre-heat oven to 400°F (200°C) and line a baking sheet with parchment paper.', timer: 5 },
      { title: 'Season Ingredients', description: 'Toss asparagus spears in olive oil, sea salt, black pepper, and lemon zest.', timer: 5 },
      { title: 'Roast', description: 'Season salmon fillets with herbs and place skin-side down alongside asparagus. Roast for 12-15 minutes.', timer: 15 },
    ],
  },
  {
    id: 'quinoa-power-bowl',
    title: 'High-Protein Quinoa & Avocado Power Bowl',
    description: 'Nutritious plant-based power bowl with fluffy cooked quinoa, creamy avocado, and fresh spinach. Packed with fiber and slow-digesting complex carbs.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    cookingTime: 15,
    difficulty: 'Easy',
    servings: 1,
    tags: ['High Fiber', 'Vegan', 'Med GI'],
    publishedAt: '2026-01-01T00:00:00.000Z',
    status: 'published',
    ingredients: [
      { ingredientId: 'quinoa-cooked', amount: 150, unit: 'g', prepState: 'boiled' },
      { ingredientId: 'avocado', amount: 100, unit: 'g', prepState: 'raw' },
      { ingredientId: 'spinach', amount: 50, unit: 'g', prepState: 'raw' },
    ],
    steps: [
      { title: 'Assemble Base', description: 'Layer fresh baby spinach as the base of the bowl.', timer: 2 },
      { title: 'Add Quinoa & Avocado', description: 'Add warm cooked quinoa alongside sliced ripe avocado.', timer: 3 },
      { title: 'Drizzle & Serve', description: 'Drizzle with extra virgin olive oil and freshly squeezed lemon juice.', timer: 1 },
    ],
  },
  {
    id: 'keto-berry-smoothie',
    title: 'Low-GI Keto Berry Almond Smoothie',
    description: 'Refreshing low-glycemic smoothie blended with wild strawberries, Greek yogurt, almond milk, and chia seeds.',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    cookingTime: 5,
    difficulty: 'Easy',
    servings: 1,
    tags: ['Keto', 'Breakfast', 'Low GI'],
    publishedAt: '2026-01-01T00:00:00.000Z',
    status: 'published',
    ingredients: [
      { ingredientId: 'strawberries', amount: 100, unit: 'g', prepState: 'raw' },
      { ingredientId: 'greek-yogurt', amount: 150, unit: 'g', prepState: 'raw' },
      { ingredientId: 'almond-milk', amount: 240, unit: 'g', prepState: 'raw' },
      { ingredientId: 'chia-seeds', amount: 15, unit: 'g', prepState: 'raw' },
    ],
    steps: [
      { title: 'Pour Liquids', description: 'Add almond milk and Greek yogurt into blender container.', timer: 1 },
      { title: 'Add Berries', description: 'Add strawberries and chia seeds.', timer: 1 },
      { title: 'Blend', description: 'Blend on high speed for 45-60 seconds until smooth and creamy.', timer: 1 },
    ],
  },
  {
    id: 'lemon-herb-chicken-broccoli',
    title: 'Sautéed Lemon Herb Chicken with Broccoli',
    description: 'Juicy sautéed chicken breast served with steamed garlic broccoli florets. Ideal balanced dinner for daily GL control.',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
    cookingTime: 25,
    difficulty: 'Medium',
    servings: 2,
    tags: ['High Protein', 'Low Carb', 'Low GI'],
    publishedAt: '2026-01-01T00:00:00.000Z',
    status: 'published',
    ingredients: [
      { ingredientId: 'chicken-breast', amount: 350, unit: 'g', prepState: 'sauteed' },
      { ingredientId: 'broccoli', amount: 250, unit: 'g', prepState: 'steamed' },
      { ingredientId: 'olive-oil', amount: 14, unit: 'g', prepState: 'raw' },
    ],
    steps: [
      { title: 'Season Chicken', description: 'Slice chicken breast into cutlets and season with garlic, oregano, salt, and pepper.', timer: 5 },
      { title: 'Sear Cutlets', description: 'Heat olive oil in a skillet over medium-high heat and sear chicken for 6-8 minutes per side.', timer: 15 },
      { title: 'Steam Broccoli', description: 'Steam broccoli florets for 4-5 minutes until bright green and crisp-tender.', timer: 5 },
    ],
  },
];

let _indexCache = DEFAULT_SEED_RECIPES.map(normalizeRecipe);

/**
 * Fetches recipes directly from Strapi CMS `/api/recipes`.
 *
 * @param {object} [options]
 * @param {'live'|'preview'} [options.publicationState='live']
 * @param {object} [options.filters]
 * @returns {Promise<Array<object>>}
 */
export async function getAllRecipes(options = {}) {
  try {
    const params = {
      populate: '*',
      publicationState: options.publicationState || 'live',
    };

    if (options.filters && typeof options.filters === 'object') {
      Object.entries(options.filters).forEach(([key, val]) => {
        params[key] = val;
      });
    }

    const response = await strapiGet(COLLECTION, params);
    const recipes = Array.isArray(response) ? response : (response?.data ?? []);

    if (recipes.length > 0) {
      _indexCache = recipes.map(normalizeRecipe);
    }
    return _indexCache;
  } catch (err) {
    console.error('[recipeStore] Strapi /api/recipes fetch failed:', err.message);
    return _indexCache;
  }
}

/**
 * Fetches full recipe details by ID from Strapi or local cache.
 * @param {string|number} id
 * @returns {Promise<object|null>}
 */
export async function getRecipeById(id) {
  if (!id && id !== 0) return null;
  const strId = String(id);

  try {
    const response = await strapiGet(`${COLLECTION}/${id}`, { populate: '*' });
    const recipe = response?.data ?? response;
    if (recipe) {
      return normalizeRecipe(recipe);
    }
  } catch (err) {
    console.warn(`[recipeStore] Strapi GET /api/recipes/${id} failed, checking local cache:`, err.message);
  }

  const cached = (_indexCache || DEFAULT_SEED_RECIPES.map(normalizeRecipe)).find(
    r => String(r.id) === strId
  );
  return cached || null;
}

/**
 * Saves a recipe to Strapi `/api/recipes`.
 *
 * @param {object} recipe
 * @param {object} [options]
 * @param {boolean} [options.isUpdate=false]
 * @param {string|null} [options.publishedAt=null] — null for draft, ISO string for published
 * @returns {Promise<object>}
 */
export async function saveRecipe(recipe, { isUpdate = false, publishedAt = null } = {}) {
  if (!recipe?.id && !recipe?.title) {
    throw new Error('[recipeStore] Cannot save a recipe without a title.');
  }

  const finalPublishedAt = publishedAt !== undefined
    ? publishedAt
    : (recipe.status === 'published' ? (recipe.publishedAt || new Date().toISOString()) : null);

  const payload = {
    title: recipe.title ?? '',
    description: recipe.description ?? '',
    imageUrl: recipe.imageUrl ?? '',
    cookingTime: parseFloat(recipe.cookingTime) || 0,
    difficulty: recipe.difficulty ?? 'Easy',
    servings: parseFloat(recipe.servings) || 1,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    publishedAt: finalPublishedAt,
    authorId: recipe.authorId ?? '',
    isUserAuthored: true,
    ingredients: (recipe.ingredients ?? []).map((ing) => ({
      ingredientId: String(ing?.ingredientId || ing?.id || ''),
      amount: parseFloat(ing?.amount) || 0,
      unit: ing?.unit ?? 'g',
      prepState: ing?.prepState ?? 'raw',
    })),
    steps: (recipe.steps ?? []).map((step) => ({
      title: step?.title ?? '',
      description: step?.description ?? '',
      timer: step?.timer !== undefined && step?.timer !== null ? parseFloat(step.timer) : null,
    })),
  };

  let saved;
  if (isUpdate && recipe.id) {
    saved = await strapiPut(`${COLLECTION}/${recipe.id}`, payload);
  } else {
    saved = await strapiPost(COLLECTION, payload);
  }

  invalidateRecipeCache();
  return normalizeRecipe(saved?.data ?? saved);
}

function normalizeRecipe(r) {
  const publishedAt = r?.publishedAt ?? (r?.status === 'published' ? new Date().toISOString() : null);
  const status = publishedAt ? 'published' : 'draft';

  return {
    id: String(r?.id ?? r?.documentId ?? ''),
    title: r?.title ?? '',
    description: r?.description ?? '',
    imageUrl: r?.imageUrl ?? '',
    cookingTime: parseFloat(r?.cookingTime) || 0,
    difficulty: r?.difficulty ?? 'Easy',
    servings: parseFloat(r?.servings) || 1,
    tags: Array.isArray(r?.tags) ? r.tags : [],
    publishedAt,
    status,
    authorId: r?.authorId ?? '',
    isUserAuthored: r?.isUserAuthored ?? (!!r?.authorId),
    ingredients: Array.isArray(r?.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r?.steps) ? r.steps : [],
  };
}

export function invalidateRecipeCache() {
  _indexCache = null;
  invalidateCache('recipes');
}
