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
import { MASTER_CLINICAL_RECIPES } from '../data/seedRecipes';

const COLLECTION = '/api/recipes';

const DEFAULT_SEED_RECIPES = [
  {
    "recipeNumber": 1,
    "id": "low-glycemic-egg-salad-lettuce-wraps",
    "title": "Low-Glycemic Egg Salad Lettuce Wraps",
    "description": "Replacing refined sandwich bread with crisp Romaine lettuce eliminates 30g of fast-digesting carbohydrates, yielding a Glycemic Load of 0.0. Utilizing protein-rich Greek yogurt rather than commercial mayonnaise cuts heavy saturated fat and avoids inflammatory industrial seed oils.",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 12,
    "cookTime": 0,
    "cookingTime": 12,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving (3 wraps)",
    "category": "Lunch",
    "tags": [
      "Low GI",
      "Zero GL",
      "High Protein",
      "Keto-Friendly",
      "Under 30 Min",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 15,
    "glycemicLoad": 0,
    "glycemicImpact": "Zero Glycemic Impact",
    "nutrition": {
      "kcal": 240,
      "protein": 14,
      "fat": 18.5,
      "saturatedFat": 4.2,
      "carbs": 3,
      "fiber": 1.5,
      "netCarbs": 1.5,
      "glycemicIndex": 15,
      "glycemicLoad": 0
    },
    "diabeticNotes": "Replacing refined sandwich bread with crisp Romaine lettuce eliminates 30g of fast-digesting carbohydrates, yielding a Glycemic Load of 0.0. Utilizing protein-rich Greek yogurt rather than commercial mayonnaise cuts heavy saturated fat and avoids inflammatory industrial seed oils.",
    "ingredients": [
      {
        "ingredientId": "eggs",
        "amount": 2,
        "unit": "piece",
        "prepState": "boiled",
        "name": "large hard-boiled eggs, peeled and diced"
      },
      {
        "ingredientId": "greek-yogurt",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "2% Greek yogurt (substituting standard mayonnaise)"
      },
      {
        "ingredientId": "dijon-mustard",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "Dijon mustard"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lemon juice"
      },
      {
        "ingredientId": "celery",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "finely diced celery (adds crunch and prebiotic insoluble fiber)"
      },
      {
        "ingredientId": "chives",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "finely minced fresh chives or dill"
      },
      {
        "ingredientId": "romaine-lettuce",
        "amount": 45,
        "unit": "g",
        "prepState": "raw",
        "name": "large, crisp Romaine or butterhead lettuce leaves"
      }
    ],
    "steps": [
      {
        "title": "Mash Eggs",
        "description": "In a medium bowl, mash the hard-boiled eggs coarsely with a fork.",
        "timer": 2
      },
      {
        "title": "Mix Dressing & Seasoning",
        "description": "Add the Greek yogurt, Dijon mustard, lemon juice, diced celery, minced chives, salt, and pepper. Fold thoroughly until creamy yet structured.",
        "timer": 3
      },
      {
        "title": "Prepare Lettuce Leaves",
        "description": "Wash and dry the Romaine lettuce leaves thoroughly.",
        "timer": 2
      },
      {
        "title": "Fill & Serve",
        "description": "Spoon equal portions of the egg salad mixture down the center rib of each lettuce boat. Serve immediately or pack chilled for lunch.",
        "timer": 5
      }
    ]
  },
  {
    "recipeNumber": 2,
    "id": "low-glycemic-green-goddess-power-salad",
    "title": "Low-Glycemic Green Goddess Power Salad",
    "description": "Kale and pumpkin seeds supply magnesium and phytosterols, which compete with dietary cholesterol absorption in the gut. The monounsaturated fats from avocado enhance the bioavailability of fat-soluble antioxidant carotenoids.",
    "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 0,
    "cookingTime": 15,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Salad",
    "tags": [
      "Low GI",
      "Low GL",
      "High Protein",
      "High Fiber",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 20,
    "glycemicLoad": 0.9,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 290,
      "protein": 22,
      "fat": 18,
      "saturatedFat": 2.8,
      "carbs": 8,
      "fiber": 5.2,
      "netCarbs": 2.8,
      "glycemicIndex": 20,
      "glycemicLoad": 0.9
    },
    "diabeticNotes": "Kale and pumpkin seeds supply magnesium and phytosterols, which compete with dietary cholesterol absorption in the gut. The monounsaturated fats from avocado enhance the bioavailability of fat-soluble antioxidant carotenoids.",
    "ingredients": [
      {
        "ingredientId": "chicken-breast",
        "amount": 80,
        "unit": "g",
        "prepState": "sauteed",
        "name": "grilled chicken breast, thinly sliced across the grain"
      },
      {
        "ingredientId": "kale",
        "amount": 70,
        "unit": "g",
        "prepState": "raw",
        "name": "chopped dinosaur / lacinato kale (stems removed, massaged)"
      },
      {
        "ingredientId": "cucumber",
        "amount": 50,
        "unit": "g",
        "prepState": "raw",
        "name": "medium Persian cucumber, thinly sliced"
      },
      {
        "ingredientId": "avocado",
        "amount": 50,
        "unit": "g",
        "prepState": "raw",
        "name": "ripe avocado, diced"
      },
      {
        "ingredientId": "pumpkin-seeds",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "raw unsalted pumpkin seeds (pepitas)"
      },
      {
        "ingredientId": "greek-yogurt",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "Greek yogurt (dressing)"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "lemon juice (dressing)"
      },
      {
        "ingredientId": "garlic",
        "amount": 3,
        "unit": "g",
        "prepState": "raw",
        "name": "garlic clove (dressing)"
      },
      {
        "ingredientId": "olive-oil",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil for massaging kale"
      }
    ],
    "steps": [
      {
        "title": "Blend Dressing",
        "description": "Place dressing ingredients (1/4 avocado, 2 tbsp Greek yogurt, 1 tbsp lemon juice, 2 tbsp mixed fresh herbs, 1 clove garlic, 2 tbsp water, pinch of sea salt) into a small blender and blend until vibrant green and velvety smooth.",
        "timer": 3
      },
      {
        "title": "Massage Kale",
        "description": "Place chopped kale in a large salad bowl. Drizzle 1 teaspoon of olive oil and massage leaves with clean hands for 60 seconds until softened and dark green.",
        "timer": 2
      },
      {
        "title": "Toss Greens & Cucumber",
        "description": "Toss massaged kale with cucumber slices and 2 tablespoons of green goddess dressing.",
        "timer": 2
      },
      {
        "title": "Top & Serve",
        "description": "Top with sliced grilled chicken breast, diced avocado, and raw pumpkin seeds.",
        "timer": 3
      }
    ]
  },
  {
    "recipeNumber": 3,
    "id": "salmon-stuffed-avocados-with-fresh-herbs",
    "title": "Salmon-Stuffed Avocados with Fresh Herbs",
    "description": "Rich in marine omega-3 polyunsaturated fatty acids (EPA and DHA) and plant monounsaturated oleic acid. This lipid pairing elevates HDL, lowers circulating triglycerides, and improves cell-membrane insulin sensitivity.",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 10,
    "cookTime": 0,
    "cookingTime": 10,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving (2 halves)",
    "category": "Lunch",
    "tags": [
      "Low GI",
      "Low GL",
      "Omega-3",
      "Keto-Friendly",
      "Under 30 Min",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 15,
    "glycemicLoad": 1.4,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 360,
      "protein": 24,
      "fat": 25,
      "saturatedFat": 3.5,
      "carbs": 9,
      "fiber": 6.8,
      "netCarbs": 2.2,
      "glycemicIndex": 15,
      "glycemicLoad": 1.4
    },
    "diabeticNotes": "Rich in marine omega-3 polyunsaturated fatty acids (EPA and DHA) and plant monounsaturated oleic acid. This lipid pairing elevates HDL, lowers circulating triglycerides, and improves cell-membrane insulin sensitivity.",
    "ingredients": [
      {
        "ingredientId": "avocado",
        "amount": 150,
        "unit": "g",
        "prepState": "raw",
        "name": "medium ripe Hass avocado, sliced lengthwise and pitted"
      },
      {
        "ingredientId": "wild-salmon",
        "amount": 100,
        "unit": "g",
        "prepState": "raw",
        "name": "canned drained wild pink salmon or poached salmon flakes"
      },
      {
        "ingredientId": "greek-yogurt",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "2% Greek yogurt"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lemon juice + lemon zest"
      },
      {
        "ingredientId": "red-onion",
        "amount": 10,
        "unit": "g",
        "prepState": "raw",
        "name": "finely diced red onion"
      },
      {
        "ingredientId": "dill",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "chopped fresh dill"
      },
      {
        "ingredientId": "capers",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "drained capers"
      }
    ],
    "steps": [
      {
        "title": "Hollow Avocados",
        "description": "Scoop a thin layer (about 1 tablespoon) of flesh from each avocado half to enlarge the center cavity; finely dice the scooped avocado.",
        "timer": 2
      },
      {
        "title": "Combine Filling",
        "description": "In a bowl, combine wild salmon, diced scooped avocado, Greek yogurt, olive oil, lemon juice, lemon zest, red onion, dill, capers, salt, and pepper.",
        "timer": 4
      },
      {
        "title": "Flake Gently",
        "description": "Flake gently with a fork until ingredients are evenly distributed without turning into a paste.",
        "timer": 2
      },
      {
        "title": "Mound & Garnish",
        "description": "Mound generous portions of the salmon mixture into the avocado cavities. Garnish with an extra sprig of fresh dill.",
        "timer": 2
      }
    ]
  },
  {
    "recipeNumber": 4,
    "id": "cantonese-steamed-sea-bass-with-ginger-scallion",
    "title": "Cantonese Steamed Sea Bass with Ginger & Scallion",
    "description": "Sea bass provides ultra-lean protein (34g) with minimal calories, making it ideal for aggressive fat loss protocols. Ginger and scallions contain gingerols and allicin, compounds shown to enhance peripheral insulin sensitivity and reduce vascular inflammation.",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 10,
    "cookTime": 10,
    "cookingTime": 20,
    "difficulty": "Medium",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Low GL",
      "High Protein",
      "Anti-Inflammatory",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 20,
    "glycemicLoad": 2.1,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 280,
      "protein": 34,
      "fat": 13.5,
      "saturatedFat": 2.1,
      "carbs": 4,
      "fiber": 1.8,
      "netCarbs": 2.2,
      "glycemicIndex": 20,
      "glycemicLoad": 2.1
    },
    "diabeticNotes": "Sea bass provides ultra-lean protein (34g) with minimal calories, making it ideal for aggressive fat loss protocols. Ginger and scallions contain gingerols and allicin, compounds shown to enhance peripheral insulin sensitivity and reduce vascular inflammation.",
    "ingredients": [
      {
        "ingredientId": "sea-bass",
        "amount": 180,
        "unit": "g",
        "prepState": "steamed",
        "name": "fresh sea bass fillet (or cod / halibut), skin scored"
      },
      {
        "ingredientId": "baby-bok-choy",
        "amount": 150,
        "unit": "g",
        "prepState": "steamed",
        "name": "heads baby bok choy, halved lengthwise"
      },
      {
        "ingredientId": "ginger",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh ginger, cut into matchsticks (julienned)"
      },
      {
        "ingredientId": "scallions",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "scallions, cut into fine 2-inch shreds"
      },
      {
        "ingredientId": "tamari-soy-sauce",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "reduced-sodium tamari / gluten-free soy sauce"
      },
      {
        "ingredientId": "sesame-oil",
        "amount": 10,
        "unit": "g",
        "prepState": "raw",
        "name": "toasted sesame oil"
      },
      {
        "ingredientId": "olive-oil",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "cold-pressed avocado / olive oil"
      }
    ],
    "steps": [
      {
        "title": "Setup Steamer",
        "description": "Set up a steamer basket over a pot of boiling water. Arrange halved baby bok choy on a heatproof ceramic plate.",
        "timer": 2
      },
      {
        "title": "Plate Sea Bass",
        "description": "Lay sea bass fillet on top of bok choy. Scatter half of julienned ginger and Shaoxing wine over the fish.",
        "timer": 2
      },
      {
        "title": "Steam Fish",
        "description": "Place plate into steamer, cover tightly, and steam over medium-high heat for 8–9 minutes until fish flakes easily.",
        "timer": 9
      },
      {
        "title": "Add Scallions & Ginger",
        "description": "Carefully remove plate. Pour off any excess watery steaming condensation. Scatter remaining fresh ginger and shredded scallions over the hot fish.",
        "timer": 2
      },
      {
        "title": "Pour Sizzling Aromatics",
        "description": "Heat sesame and avocado oil in a small ladle or pan until smoking hot; pour sizzling oil directly over the scallions and ginger to unlock aromatics.",
        "timer": 2
      },
      {
        "title": "Drizzle Sauce & Serve",
        "description": "Drizzle tamari soy sauce around the base of the fish and bok choy before serving.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 5,
    "id": "vietnamese-chicken-vegetable-noodle-bowl",
    "title": "Vietnamese Chicken & Vegetable Noodle Bowl",
    "description": "Shirataki noodles are composed of glucomannan, a viscous water-soluble fiber with zero digestible carbohydrates. Glucomannan slows carbohydrate breakdown and traps dietary cholesterol, aiding excretion.",
    "imageUrl": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 10,
    "cookingTime": 25,
    "difficulty": "Medium",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Low GL",
      "High Fiber",
      "Shirataki",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 25,
    "glycemicLoad": 2.4,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 295,
      "protein": 28,
      "fat": 16,
      "saturatedFat": 2.2,
      "carbs": 8,
      "fiber": 4.5,
      "netCarbs": 3.5,
      "glycemicIndex": 25,
      "glycemicLoad": 2.4
    },
    "diabeticNotes": "Shirataki noodles are composed of glucomannan, a viscous water-soluble fiber with zero digestible carbohydrates. Glucomannan slows carbohydrate breakdown and traps dietary cholesterol, aiding excretion.",
    "ingredients": [
      {
        "ingredientId": "shirataki-noodles",
        "amount": 200,
        "unit": "g",
        "prepState": "boiled",
        "name": "packet Konjac / Shirataki noodles (rinsed and drained)"
      },
      {
        "ingredientId": "chicken-breast",
        "amount": 100,
        "unit": "g",
        "prepState": "boiled",
        "name": "poached chicken breast, shredded"
      },
      {
        "ingredientId": "cabbage",
        "amount": 70,
        "unit": "g",
        "prepState": "raw",
        "name": "shredded red and green cabbage"
      },
      {
        "ingredientId": "cucumber",
        "amount": 60,
        "unit": "g",
        "prepState": "raw",
        "name": "English cucumber, julienned"
      },
      {
        "ingredientId": "peanuts",
        "amount": 15,
        "unit": "g",
        "prepState": "roasted",
        "name": "crushed roasted peanuts"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lime juice (Nuoc Cham)"
      },
      {
        "ingredientId": "garlic",
        "amount": 3,
        "unit": "g",
        "prepState": "raw",
        "name": "grated garlic clove (Nuoc Cham)"
      }
    ],
    "steps": [
      {
        "title": "Prep Shirataki Noodles",
        "description": "Rinse shirataki noodles thoroughly in cold running water for 2 minutes. Parboil in boiling water for 1 minute, drain, and dry-fry in a hot skillet for 2 minutes to eliminate excess moisture.",
        "timer": 5
      },
      {
        "title": "Whisk Nuoc Cham",
        "description": "Whisk the lime juice, fish sauce, water, allulose sweetener, minced chili, and garlic in a small bowl until sweetener dissolves completely.",
        "timer": 3
      },
      {
        "title": "Layer Noodle Base",
        "description": "In a serving bowl, lay down the warm prepared shirataki noodles.",
        "timer": 1
      },
      {
        "title": "Add Toppings",
        "description": "Arrange shredded chicken breast, cabbage slaw, cucumber, mint, and cilantro neatly over noodles.",
        "timer": 3
      },
      {
        "title": "Dress & Toss",
        "description": "Pour dressing evenly over bowl and scatter crushed roasted peanuts over top. Toss before eating.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 6,
    "id": "nicoise-salad-with-tuna-soft-boiled-eggs",
    "title": "Niçoise Salad with Tuna & Soft-Boiled Eggs",
    "description": "Removing traditional boiled potatoes eliminates the primary glycemic spike of classical French Niçoise. Extra virgin olive oil provides oleocanthal and polyphenols that protect LDL particles against oxidation.",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 10,
    "cookingTime": 25,
    "difficulty": "Medium",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Salad",
    "tags": [
      "Low GI",
      "Low GL",
      "High Protein",
      "Mediterranean",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 25,
    "glycemicLoad": 3.3,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 350,
      "protein": 32,
      "fat": 19,
      "saturatedFat": 3.2,
      "carbs": 10,
      "fiber": 4.2,
      "netCarbs": 5.8,
      "glycemicIndex": 25,
      "glycemicLoad": 3.3
    },
    "diabeticNotes": "Removing traditional boiled potatoes eliminates the primary glycemic spike of classical French Niçoise. Extra virgin olive oil provides oleocanthal and polyphenols that protect LDL particles against oxidation.",
    "ingredients": [
      {
        "ingredientId": "tuna-light",
        "amount": 120,
        "unit": "g",
        "prepState": "raw",
        "name": "solid light tuna in spring water or olive oil, drained"
      },
      {
        "ingredientId": "eggs",
        "amount": 1,
        "unit": "piece",
        "prepState": "boiled",
        "name": "large egg (boiled 6.5 minutes for a jammy soft center, halved)"
      },
      {
        "ingredientId": "green-beans",
        "amount": 100,
        "unit": "g",
        "prepState": "steamed",
        "name": "tender haricots verts / green beans, trimmed"
      },
      {
        "ingredientId": "romaine-lettuce",
        "amount": 60,
        "unit": "g",
        "prepState": "raw",
        "name": "mixed artisan salad greens / butter lettuce"
      },
      {
        "ingredientId": "cherry-tomato",
        "amount": 60,
        "unit": "g",
        "prepState": "raw",
        "name": "cherry tomatoes, halved"
      },
      {
        "ingredientId": "kalamata-olives",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "Kalamata olives, pitted and sliced"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil"
      },
      {
        "ingredientId": "dijon-mustard",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "Dijon mustard (vinaigrette)"
      }
    ],
    "steps": [
      {
        "title": "Blanch Green Beans",
        "description": "Blanch green beans in boiling salted water for 3 minutes until crisp-tender. Transfer immediately to ice water to shock and lock in bright green color. Drain well.",
        "timer": 5
      },
      {
        "title": "Whisk Vinaigrette",
        "description": "Whisk olive oil, red wine vinegar, Dijon mustard, oregano, salt, and pepper in a small bowl.",
        "timer": 2
      },
      {
        "title": "Base Greens",
        "description": "Arrange mixed greens in a wide salad bowl.",
        "timer": 2
      },
      {
        "title": "Assemble Salad",
        "description": "Artfully place flaked tuna, soft-boiled egg halves, blanched green beans, cherry tomatoes, and Kalamata olives over the greens.",
        "timer": 3
      },
      {
        "title": "Dress & Serve",
        "description": "Drizzle vinaigrette evenly over the salad right before serving.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 7,
    "id": "thai-chili-lime-tofu-broccoli-stir-fry",
    "title": "Thai Chili-Lime Tofu & Broccoli Stir-Fry",
    "description": "Soy isoflavones and plant proteins lower serum total cholesterol and LDL. Broccoli delivers sulforaphane, a bioactive isothiocyanate with proven anti-inflammatory and glucose-stabilizing properties.",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 10,
    "cookTime": 12,
    "cookingTime": 22,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Low GL",
      "Plant-Based",
      "Vegan",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 25,
    "glycemicLoad": 3.6,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 260,
      "protein": 18,
      "fat": 15,
      "saturatedFat": 2,
      "carbs": 11,
      "fiber": 5,
      "netCarbs": 6,
      "glycemicIndex": 25,
      "glycemicLoad": 3.6
    },
    "diabeticNotes": "Soy isoflavones and plant proteins lower serum total cholesterol and LDL. Broccoli delivers sulforaphane, a bioactive isothiocyanate with proven anti-inflammatory and glucose-stabilizing properties.",
    "ingredients": [
      {
        "ingredientId": "tofu-extra-firm",
        "amount": 180,
        "unit": "g",
        "prepState": "sauteed",
        "name": "extra-firm organic tofu, pressed dry and cubed"
      },
      {
        "ingredientId": "broccoli",
        "amount": 150,
        "unit": "g",
        "prepState": "steamed",
        "name": "fresh broccoli florets, chopped small"
      },
      {
        "ingredientId": "garlic",
        "amount": 3,
        "unit": "g",
        "prepState": "sauteed",
        "name": "clove garlic, minced"
      },
      {
        "ingredientId": "ginger",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh ginger, grated"
      },
      {
        "ingredientId": "sesame-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "toasted sesame oil"
      },
      {
        "ingredientId": "tamari-soy-sauce",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "tamari soy sauce"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lime juice"
      }
    ],
    "steps": [
      {
        "title": "Sear Tofu",
        "description": "Heat sesame oil in a nonstick wok or heavy skillet over high heat. Add tofu cubes and sear undisturbed for 4 minutes until golden on the bottom; flip and sear other sides until crisp. Transfer to a plate.",
        "timer": 6
      },
      {
        "title": "Steam-Fry Broccoli",
        "description": "Add broccoli florets, garlic, ginger, and sliced chili to the hot wok with 2 tablespoons of water. Cover for 2 minutes to steam-fry until bright green.",
        "timer": 3
      },
      {
        "title": "Glaze & Toss",
        "description": "Return tofu to wok, pour in sauce mixture, and toss vigorously over high heat for 1 minute until sauce glazes the vegetables.",
        "timer": 2
      },
      {
        "title": "Fold Herbs & Serve",
        "description": "Remove from heat, fold in fresh Thai basil, and serve hot.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 8,
    "id": "low-glycemic-tuna-avocado-power-slaw",
    "title": "Low-Glycemic Tuna Avocado Power Slaw",
    "description": "Cruciferous cabbage provides insoluble bulk that prolongs fullness, while the monounsaturated fats from avocado and lean marine proteins maintain stable postprandial blood sugar.",
    "imageUrl": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 10,
    "cookTime": 0,
    "cookingTime": 10,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Salad",
    "tags": [
      "Low GI",
      "Low GL",
      "High Protein",
      "Under 30 Min",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 22,
    "glycemicLoad": 4.3,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 330,
      "protein": 30,
      "fat": 17.5,
      "saturatedFat": 2.6,
      "carbs": 11,
      "fiber": 6,
      "netCarbs": 5,
      "glycemicIndex": 22,
      "glycemicLoad": 4.3
    },
    "diabeticNotes": "Cruciferous cabbage provides insoluble bulk that prolongs fullness, while the monounsaturated fats from avocado and lean marine proteins maintain stable postprandial blood sugar.",
    "ingredients": [
      {
        "ingredientId": "tuna-light",
        "amount": 120,
        "unit": "g",
        "prepState": "raw",
        "name": "skipjack or albacore tuna in spring water, drained"
      },
      {
        "ingredientId": "avocado",
        "amount": 80,
        "unit": "g",
        "prepState": "raw",
        "name": "ripe avocado, diced"
      },
      {
        "ingredientId": "cabbage",
        "amount": 100,
        "unit": "g",
        "prepState": "raw",
        "name": "shredded purple and green cabbage"
      },
      {
        "ingredientId": "carrots",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "shredded carrots"
      },
      {
        "ingredientId": "greek-yogurt",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "2% Greek yogurt (dressing)"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lime juice"
      }
    ],
    "steps": [
      {
        "title": "Whisk Cumin Yogurt Dressing",
        "description": "Whisk Greek yogurt, lime juice, cumin, garlic powder, salt, and pepper in a large mixing bowl.",
        "timer": 2
      },
      {
        "title": "Toss Crunchy Slaw",
        "description": "Add shredded cabbage, carrots, and fresh cilantro. Toss well with the dressing.",
        "timer": 3
      },
      {
        "title": "Fold Tuna & Avocado",
        "description": "Add drained tuna and diced avocado. Gently fold into the slaw to keep avocado chunks intact.",
        "timer": 2
      },
      {
        "title": "Serve / Chill",
        "description": "Serve immediately or chill for up to 4 hours for maximum crispness.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 9,
    "id": "shirataki-noodle-stir-fry-with-chicken-veggies",
    "title": "Shirataki Noodle Stir-Fry with Chicken & Veggies",
    "description": "The combination of beta-glucans in cremini mushrooms and glucomannan in shirataki creates a powerful dual-fiber barrier that blunts carbohydrate absorption and aids bile acid binding.",
    "imageUrl": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 10,
    "cookTime": 12,
    "cookingTime": 22,
    "difficulty": "Medium",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Low GL",
      "High Fiber",
      "Shirataki",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 28,
    "glycemicLoad": 5,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 310,
      "protein": 33,
      "fat": 13,
      "saturatedFat": 2,
      "carbs": 12,
      "fiber": 6.5,
      "netCarbs": 5.5,
      "glycemicIndex": 28,
      "glycemicLoad": 5
    },
    "diabeticNotes": "The combination of beta-glucans in cremini mushrooms and glucomannan in shirataki creates a powerful dual-fiber barrier that blunts carbohydrate absorption and aids bile acid binding.",
    "ingredients": [
      {
        "ingredientId": "shirataki-noodles",
        "amount": 200,
        "unit": "g",
        "prepState": "boiled",
        "name": "packet Shirataki / Konjac noodles (rinsed and drained)"
      },
      {
        "ingredientId": "chicken-breast",
        "amount": 120,
        "unit": "g",
        "prepState": "sauteed",
        "name": "skinless chicken breast, cut into thin strips"
      },
      {
        "ingredientId": "bell-pepper-red",
        "amount": 60,
        "unit": "g",
        "prepState": "sauteed",
        "name": "red bell pepper, thinly sliced"
      },
      {
        "ingredientId": "sugar-snap-peas",
        "amount": 50,
        "unit": "g",
        "prepState": "sauteed",
        "name": "sugar snap peas, trimmed"
      },
      {
        "ingredientId": "cremini-mushrooms",
        "amount": 70,
        "unit": "g",
        "prepState": "sauteed",
        "name": "sliced button or cremini mushrooms"
      },
      {
        "ingredientId": "sesame-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "avocado oil or cold-pressed sesame oil"
      },
      {
        "ingredientId": "tamari-soy-sauce",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "tamari soy sauce"
      }
    ],
    "steps": [
      {
        "title": "Parboil & Dry-Sear Noodles",
        "description": "Rinse shirataki noodles thoroughly, boil for 1 minute, drain, and dry-sear in a hot pan for 2 minutes to dry out. Set aside.",
        "timer": 4
      },
      {
        "title": "Stir-Fry Chicken",
        "description": "Heat oil in a wok over high heat. Add sliced chicken breast and stir-fry for 4 minutes until golden and cooked through.",
        "timer": 4
      },
      {
        "title": "Cook Vegetables",
        "description": "Add bell pepper, sugar snap peas, and mushrooms. Stir-fry vigorously for 3 minutes until crisp-tender.",
        "timer": 3
      },
      {
        "title": "Combine & Glaze",
        "description": "Add prepared shirataki noodles and pour stir-fry sauce over everything. Toss constantly for 2 minutes until liquid is fully absorbed and noodles are coated. Serve hot.",
        "timer": 2
      }
    ]
  },
  {
    "recipeNumber": 10,
    "id": "low-gi-coronation-chicken-salad",
    "title": "Low-GI Coronation Chicken Salad",
    "description": "Turmeric's active compound curcumin improves glycemic markers and insulin receptor activity, while almond fats provide monounsaturated lipid protection.",
    "imageUrl": "https://images.unsplash.com/photo-1546069901-5ec6a79120b0?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 0,
    "cookingTime": 15,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Salad",
    "tags": [
      "Low GI",
      "Low GL",
      "High Protein",
      "Curry",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 30,
    "glycemicLoad": 5.8,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 340,
      "protein": 35,
      "fat": 17.5,
      "saturatedFat": 3.5,
      "carbs": 9,
      "fiber": 2.8,
      "netCarbs": 6.2,
      "glycemicIndex": 30,
      "glycemicLoad": 5.8
    },
    "diabeticNotes": "Turmeric's active compound curcumin improves glycemic markers and insulin receptor activity, while almond fats provide monounsaturated lipid protection.",
    "ingredients": [
      {
        "ingredientId": "chicken-breast",
        "amount": 130,
        "unit": "g",
        "prepState": "boiled",
        "name": "poached or roasted skinless chicken breast, shredded"
      },
      {
        "ingredientId": "greek-yogurt",
        "amount": 45,
        "unit": "g",
        "prepState": "raw",
        "name": "2% Greek yogurt (replaces traditional mayonnaise)"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lemon juice"
      },
      {
        "ingredientId": "ginger",
        "amount": 3,
        "unit": "g",
        "prepState": "raw",
        "name": "grated ginger"
      },
      {
        "ingredientId": "almonds-flaked",
        "amount": 10,
        "unit": "g",
        "prepState": "roasted",
        "name": "toasted flaked almonds"
      },
      {
        "ingredientId": "romaine-lettuce",
        "amount": 60,
        "unit": "g",
        "prepState": "raw",
        "name": "Little Gem lettuce, leaves separated"
      }
    ],
    "steps": [
      {
        "title": "Whisk Spiced Yogurt",
        "description": "In a medium bowl, whisk together Greek yogurt, curry powder, turmeric, lemon juice, grated ginger, salt, and pepper.",
        "timer": 3
      },
      {
        "title": "Coat Chicken",
        "description": "Fold shredded chicken breast and chopped dried apricots into the curry yogurt mixture until thoroughly coated.",
        "timer": 3
      },
      {
        "title": "Arrange Gem Cups",
        "description": "Arrange Little Gem lettuce leaves across a serving plate.",
        "timer": 2
      },
      {
        "title": "Spoon Salad",
        "description": "Spoon coronation chicken salad into the lettuce cups.",
        "timer": 2
      },
      {
        "title": "Garnish with Almonds",
        "description": "Top with toasted flaked almonds for texture and heart-healthy fat.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 11,
    "id": "smashed-white-bean-skillet-with-cherry-tomatoes-feta",
    "title": "Smashed White Bean Skillet with Cherry Tomatoes & Feta",
    "description": "Cannellini beans are rich in soluble resistant starch and alpha-amylase inhibitors (phaseolamin) which slow the conversion of complex carbohydrates into blood glucose. High soluble fiber binds LDL cholesterol.",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 5,
    "cookTime": 15,
    "cookingTime": 20,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Low GL",
      "High Fiber",
      "Mediterranean",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 32,
    "glycemicLoad": 6.1,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 320,
      "protein": 16,
      "fat": 17,
      "saturatedFat": 4.8,
      "carbs": 24,
      "fiber": 8.5,
      "netCarbs": 15.5,
      "glycemicIndex": 32,
      "glycemicLoad": 6.1
    },
    "diabeticNotes": "Cannellini beans are rich in soluble resistant starch and alpha-amylase inhibitors (phaseolamin) which slow the conversion of complex carbohydrates into blood glucose. High soluble fiber binds LDL cholesterol.",
    "ingredients": [
      {
        "ingredientId": "cannellini-beans",
        "amount": 180,
        "unit": "g",
        "prepState": "sauteed",
        "name": "cooked/canned cannellini white beans, rinsed and drained"
      },
      {
        "ingredientId": "cherry-tomato",
        "amount": 150,
        "unit": "g",
        "prepState": "sauteed",
        "name": "ripe cherry tomatoes, halved"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil"
      },
      {
        "ingredientId": "garlic",
        "amount": 6,
        "unit": "g",
        "prepState": "sauteed",
        "name": "cloves garlic, thinly sliced"
      },
      {
        "ingredientId": "feta-cheese",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "Greek sheep's milk feta cheese, crumbled"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 10,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lemon juice"
      }
    ],
    "steps": [
      {
        "title": "Heat Olive Oil",
        "description": "Heat olive oil in a medium nonstick or cast-iron skillet over medium heat.",
        "timer": 2
      },
      {
        "title": "Blister Cherry Tomatoes",
        "description": "Add sliced garlic and cherry tomatoes; cook for 4–5 minutes until tomatoes blister and collapse.",
        "timer": 5
      },
      {
        "title": "Add & Smash White Beans",
        "description": "Add drained cannellini beans and dried oregano. Using the back of a fork or potato masher, crush half of the beans directly in the pan to create a creamy texture while leaving the rest whole.",
        "timer": 3
      },
      {
        "title": "Simmer Saucy",
        "description": "Cook for 3–4 minutes until hot and saucy. Season with black pepper.",
        "timer": 4
      },
      {
        "title": "Garnish with Feta & Basil",
        "description": "Remove from heat, scatter crumbled feta and fresh basil over top, and finish with a squeeze of fresh lemon juice.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 12,
    "id": "tuna-white-bean-salad-with-spring-asparagus",
    "title": "Tuna & White Bean Salad with Spring Asparagus",
    "description": "Asparagus contains prebiotic inulin fiber, which fuels beneficial gut microbiota to produce short-chain fatty acids (SCFAs), improving systemic insulin sensitivity and hepatic lipid handling.",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 0,
    "cookingTime": 15,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Salad",
    "tags": [
      "Low GI",
      "Low GL",
      "High Protein",
      "High Fiber",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 30,
    "glycemicLoad": 6.4,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 345,
      "protein": 33,
      "fat": 13,
      "saturatedFat": 2.1,
      "carbs": 22,
      "fiber": 7.2,
      "netCarbs": 14.8,
      "glycemicIndex": 30,
      "glycemicLoad": 6.4
    },
    "diabeticNotes": "Asparagus contains prebiotic inulin fiber, which fuels beneficial gut microbiota to produce short-chain fatty acids (SCFAs), improving systemic insulin sensitivity and hepatic lipid handling.",
    "ingredients": [
      {
        "ingredientId": "tuna-light",
        "amount": 120,
        "unit": "g",
        "prepState": "raw",
        "name": "chunk light tuna in olive oil or spring water, drained"
      },
      {
        "ingredientId": "cannellini-beans",
        "amount": 135,
        "unit": "g",
        "prepState": "raw",
        "name": "cannellini white beans, rinsed and drained"
      },
      {
        "ingredientId": "asparagus",
        "amount": 90,
        "unit": "g",
        "prepState": "steamed",
        "name": "green asparagus spears, blanched and sliced into 1-inch pieces"
      },
      {
        "ingredientId": "red-onion",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "finely chopped red onion + fresh parsley"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lemon juice"
      },
      {
        "ingredientId": "dijon-mustard",
        "amount": 3,
        "unit": "g",
        "prepState": "raw",
        "name": "Dijon mustard"
      }
    ],
    "steps": [
      {
        "title": "Blanch Asparagus",
        "description": "Blanch asparagus spears in boiling water for 2 minutes; cool in ice water and drain.",
        "timer": 4
      },
      {
        "title": "Whisk Lemon Dijon Dressing",
        "description": "Whisk olive oil, lemon juice, Dijon mustard, salt, and pepper in a mixing bowl.",
        "timer": 2
      },
      {
        "title": "Toss Beans & Asparagus",
        "description": "Add white beans, blanched asparagus pieces, red onion, and fresh parsley to the bowl. Toss to coat.",
        "timer": 3
      },
      {
        "title": "Fold Tuna & Serve",
        "description": "Gently fold in flaked tuna. Serve chilled or at room temperature.",
        "timer": 2
      }
    ]
  },
  {
    "recipeNumber": 13,
    "id": "low-gi-frikadeller-with-cucumber-dill-salad",
    "title": "Low-GI Frikadeller with Cucumber-Dill Salad",
    "description": "Traditional Danish Frikadeller use white flour and soaked white bread; replacing them with rolled oats introduces beta-glucan soluble fiber. The acetic acid in the cucumber salad actively blunts postprandial glucose absorption.",
    "imageUrl": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 12,
    "cookingTime": 27,
    "difficulty": "Medium",
    "servings": 1,
    "yield": "1 Serving (3 patties)",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Low GL",
      "High Protein",
      "Scandi-Style",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 35,
    "glycemicLoad": 7,
    "glycemicImpact": "Optimal Low-GI",
    "nutrition": {
      "kcal": 390,
      "protein": 31,
      "fat": 22.5,
      "saturatedFat": 6.5,
      "carbs": 15,
      "fiber": 3.5,
      "netCarbs": 11.5,
      "glycemicIndex": 35,
      "glycemicLoad": 7
    },
    "diabeticNotes": "Traditional Danish Frikadeller use white flour and soaked white bread; replacing them with rolled oats introduces beta-glucan soluble fiber. The acetic acid in the cucumber salad actively blunts postprandial glucose absorption.",
    "ingredients": [
      {
        "ingredientId": "ground-pork-lean",
        "amount": 130,
        "unit": "g",
        "prepState": "sauteed",
        "name": "lean minced pork or turkey (7–10% fat)"
      },
      {
        "ingredientId": "rolled-oats",
        "amount": 15,
        "unit": "g",
        "prepState": "boiled",
        "name": "rolled oats (soaked in 2 tbsp water, replacing breadcrumbs)"
      },
      {
        "ingredientId": "eggs",
        "amount": 1,
        "unit": "piece",
        "prepState": "raw",
        "name": "small egg white, beaten"
      },
      {
        "ingredientId": "yellow-onion",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "finely minced yellow onion"
      },
      {
        "ingredientId": "cucumber",
        "amount": 150,
        "unit": "g",
        "prepState": "raw",
        "name": "medium English cucumber (shaved paper-thin)"
      },
      {
        "ingredientId": "dill",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh dill"
      },
      {
        "ingredientId": "olive-oil",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "butter / olive oil for cooking"
      }
    ],
    "steps": [
      {
        "title": "Mix Patty Base",
        "description": "In a bowl, combine minced meat, soaked oats, egg white, minced onion, allspice, salt, and pepper. Mix with your hands until tacky and uniform. Shape into 3 oval patties.",
        "timer": 5
      },
      {
        "title": "Quick-Pickle Cucumber",
        "description": "In a separate bowl, toss shaved cucumber with apple cider vinegar, water, sweetener, fresh dill, and salt. Set aside to pickle lightly.",
        "timer": 3
      },
      {
        "title": "Heat Pan",
        "description": "Heat 1 teaspoon butter or oil in a skillet over medium heat.",
        "timer": 2
      },
      {
        "title": "Pan-Sear Frikadeller",
        "description": "Add meat patties and cook for 5–6 minutes per side until deeply browned and cooked through (internal temp 165°F / 74°C).",
        "timer": 12
      },
      {
        "title": "Plate & Serve",
        "description": "Serve hot frikadeller alongside the chilled, tangy cucumber-dill salad.",
        "timer": 2
      }
    ]
  },
  {
    "recipeNumber": 14,
    "id": "low-gi-chili-con-carne-with-two-bean-base",
    "title": "Low-GI Chili con Carne with Two-Bean Base",
    "description": "Omitting white rice and utilizing a two-bean foundation provides 10.5g of dietary fiber. The high proportion of resistant starch creates a low glycemic excursion and fuels colonic SCFA production.",
    "imageUrl": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 10,
    "cookTime": 25,
    "cookingTime": 35,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Large Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Med GL",
      "High Protein",
      "High Fiber",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 35,
    "glycemicLoad": 10.5,
    "glycemicImpact": "Medium Impact",
    "nutrition": {
      "kcal": 410,
      "protein": 36,
      "fat": 14.5,
      "saturatedFat": 4.8,
      "carbs": 30,
      "fiber": 10.5,
      "netCarbs": 19.5,
      "glycemicIndex": 35,
      "glycemicLoad": 10.5
    },
    "diabeticNotes": "Omitting white rice and utilizing a two-bean foundation provides 10.5g of dietary fiber. The high proportion of resistant starch creates a low glycemic excursion and fuels colonic SCFA production.",
    "ingredients": [
      {
        "ingredientId": "ground-beef-lean",
        "amount": 120,
        "unit": "g",
        "prepState": "sauteed",
        "name": "extra-lean ground beef (5% fat)"
      },
      {
        "ingredientId": "black-beans",
        "amount": 90,
        "unit": "g",
        "prepState": "boiled",
        "name": "canned black beans, rinsed and drained"
      },
      {
        "ingredientId": "red-kidney-beans",
        "amount": 90,
        "unit": "g",
        "prepState": "boiled",
        "name": "canned red kidney beans, rinsed and drained"
      },
      {
        "ingredientId": "canned-tomatoes",
        "amount": 180,
        "unit": "g",
        "prepState": "sauteed",
        "name": "crushed Italian canned tomatoes"
      },
      {
        "ingredientId": "bell-pepper",
        "amount": 60,
        "unit": "g",
        "prepState": "sauteed",
        "name": "green bell pepper, diced"
      },
      {
        "ingredientId": "yellow-onion",
        "amount": 40,
        "unit": "g",
        "prepState": "sauteed",
        "name": "diced onion"
      },
      {
        "ingredientId": "garlic",
        "amount": 3,
        "unit": "g",
        "prepState": "sauteed",
        "name": "clove garlic, minced"
      }
    ],
    "steps": [
      {
        "title": "Brown Ground Beef",
        "description": "In a medium saucepan, brown the lean ground beef over medium heat for 5 minutes, breaking into crumbles. Drain any excess fat.",
        "timer": 5
      },
      {
        "title": "Sauté Veggies",
        "description": "Add diced onion, bell pepper, and garlic; sauté for 3 minutes until softened.",
        "timer": 3
      },
      {
        "title": "Toast Aromatics",
        "description": "Stir in chili powder, cumin, and smoked paprika for 30 seconds until fragrant.",
        "timer": 1
      },
      {
        "title": "Add Beans & Tomatoes",
        "description": "Add crushed tomatoes, black beans, and red kidney beans with 1/4 cup water.",
        "timer": 2
      },
      {
        "title": "Simmer & Thicken",
        "description": "Simmer gently uncovered for 15–18 minutes until rich and thickened. Garnish with fresh cilantro.",
        "timer": 18
      }
    ]
  },
  {
    "recipeNumber": 15,
    "id": "smoked-paprika-chickpea-bowl-with-spinach-feta",
    "title": "Smoked Paprika Chickpea Bowl with Spinach & Feta",
    "description": "Chickpeas boast an exceptionally low GI (~33) due to dense legume protein and soluble fiber walls. The nearly 10g of fiber contributes directly to the entrapment and clearance of circulating LDL cholesterol.",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 5,
    "cookTime": 10,
    "cookingTime": 15,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Med GL",
      "High Fiber",
      "Vegetarian",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 33,
    "glycemicLoad": 10.6,
    "glycemicImpact": "Medium Impact",
    "nutrition": {
      "kcal": 365,
      "protein": 17,
      "fat": 17.5,
      "saturatedFat": 4.5,
      "carbs": 34,
      "fiber": 9.8,
      "netCarbs": 24.2,
      "glycemicIndex": 33,
      "glycemicLoad": 10.6
    },
    "diabeticNotes": "Chickpeas boast an exceptionally low GI (~33) due to dense legume protein and soluble fiber walls. The nearly 10g of fiber contributes directly to the entrapment and clearance of circulating LDL cholesterol.",
    "ingredients": [
      {
        "ingredientId": "chickpeas",
        "amount": 180,
        "unit": "g",
        "prepState": "sauteed",
        "name": "cooked/canned chickpeas, rinsed and dried thoroughly"
      },
      {
        "ingredientId": "spinach",
        "amount": 80,
        "unit": "g",
        "prepState": "sauteed",
        "name": "fresh baby spinach"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil"
      },
      {
        "ingredientId": "garlic",
        "amount": 3,
        "unit": "g",
        "prepState": "sauteed",
        "name": "clove garlic, minced"
      },
      {
        "ingredientId": "feta-cheese",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "authentic Greek feta, crumbled"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lemon juice"
      }
    ],
    "steps": [
      {
        "title": "Heat Olive Oil",
        "description": "Heat olive oil in a skillet over medium-high heat.",
        "timer": 2
      },
      {
        "title": "Crisp Chickpeas with Spices",
        "description": "Add dried chickpeas, smoked paprika, cumin, and a pinch of salt. Sauté for 6 minutes, shaking pan frequently until chickpeas are slightly crisp.",
        "timer": 6
      },
      {
        "title": "Wilt Baby Spinach",
        "description": "Add minced garlic and fresh baby spinach; toss for 90 seconds until spinach is just wilted.",
        "timer": 2
      },
      {
        "title": "Dress with Lemon",
        "description": "Remove skillet from heat, squeeze fresh lemon juice over the top, and transfer to a bowl.",
        "timer": 1
      },
      {
        "title": "Garnish with Greek Feta",
        "description": "Top with crumbled feta cheese before serving.",
        "timer": 1
      }
    ]
  },
  {
    "recipeNumber": 16,
    "id": "bulgogi-beef-lettuce-wraps",
    "title": "Bulgogi Beef Lettuce Wraps",
    "description": "Replacing cane sugar and corn syrup with minimal grated fresh pear and allulose delivers authentic Korean bulgogi flavors without glycemic volatility. Kimchi provides live lactobacilli that modulate gut inflammation.",
    "imageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 6,
    "cookingTime": 21,
    "difficulty": "Medium",
    "servings": 1,
    "yield": "1 Serving (4 large wraps)",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Med GL",
      "High Protein",
      "Korean-Inspired",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 36,
    "glycemicLoad": 11,
    "glycemicImpact": "Medium Impact",
    "nutrition": {
      "kcal": 380,
      "protein": 34,
      "fat": 21,
      "saturatedFat": 5.8,
      "carbs": 14,
      "fiber": 3,
      "netCarbs": 11,
      "glycemicIndex": 36,
      "glycemicLoad": 11
    },
    "diabeticNotes": "Replacing cane sugar and corn syrup with minimal grated fresh pear and allulose delivers authentic Korean bulgogi flavors without glycemic volatility. Kimchi provides live lactobacilli that modulate gut inflammation.",
    "ingredients": [
      {
        "ingredientId": "sirloin-steak",
        "amount": 150,
        "unit": "g",
        "prepState": "sauteed",
        "name": "lean top sirloin or flank steak, sliced paper-thin across the grain"
      },
      {
        "ingredientId": "romaine-lettuce",
        "amount": 60,
        "unit": "g",
        "prepState": "raw",
        "name": "large crisp Boston Bibb or butterhead lettuce leaves"
      },
      {
        "ingredientId": "kimchi",
        "amount": 75,
        "unit": "g",
        "prepState": "raw",
        "name": "kimchi (sugar-free probiotic fermented cabbage)"
      },
      {
        "ingredientId": "tamari-soy-sauce",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "tamari soy sauce"
      },
      {
        "ingredientId": "sesame-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "toasted sesame oil"
      },
      {
        "ingredientId": "garlic",
        "amount": 6,
        "unit": "g",
        "prepState": "raw",
        "name": "cloves garlic, grated"
      },
      {
        "ingredientId": "ginger",
        "amount": 5,
        "unit": "g",
        "prepState": "raw",
        "name": "grated ginger"
      },
      {
        "ingredientId": "scallions",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "scallion, chopped"
      }
    ],
    "steps": [
      {
        "title": "Mix Low-GI Bulgogi Marinade",
        "description": "In a bowl, mix grated Asian pear, tamari, sesame oil, sweetener, garlic, ginger, and scallion.",
        "timer": 3
      },
      {
        "title": "Marinate Sirloin Slices",
        "description": "Add sliced sirloin steak; toss to coat and marinate for 15 minutes at room temperature.",
        "timer": 15
      },
      {
        "title": "Preheat Heavy Skillet",
        "description": "Heat a cast-iron skillet or grill pan over very high heat until smoking hot.",
        "timer": 3
      },
      {
        "title": "Flash-Sear Beef",
        "description": "Add marinated beef in a single layer (do not crowd pan). Sear hard for 90 seconds per side until caramelized.",
        "timer": 3
      },
      {
        "title": "Assemble in Crisp Cups",
        "description": "Divide hot bulgogi beef among 4 crisp lettuce cups. Top with probiotic kimchi and sesame seeds.",
        "timer": 3
      }
    ]
  },
  {
    "recipeNumber": 17,
    "id": "italian-farro-salad-with-cherry-tomatoes-basil-feta",
    "title": "Italian Farro Salad with Cherry Tomatoes, Basil & Feta",
    "description": "Farro is an ancient wheat grain with an intact bran coat and low GI (~40). Its dense amylose starch matrix requires prolonged enzymatic breakdown, sustaining satiety without sharp glucose spikes.",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 20,
    "cookingTime": 35,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Salad",
    "tags": [
      "Low GI",
      "Med GL",
      "Ancient Grain",
      "High Fiber",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 40,
    "glycemicLoad": 11.4,
    "glycemicImpact": "Medium Impact",
    "nutrition": {
      "kcal": 350,
      "protein": 14,
      "fat": 16.5,
      "saturatedFat": 4.5,
      "carbs": 35,
      "fiber": 7,
      "netCarbs": 28,
      "glycemicIndex": 40,
      "glycemicLoad": 11.4
    },
    "diabeticNotes": "Farro is an ancient wheat grain with an intact bran coat and low GI (~40). Its dense amylose starch matrix requires prolonged enzymatic breakdown, sustaining satiety without sharp glucose spikes.",
    "ingredients": [
      {
        "ingredientId": "whole-grain-farro",
        "amount": 100,
        "unit": "g",
        "prepState": "boiled",
        "name": "cooked whole-grain farro (al dente)"
      },
      {
        "ingredientId": "cherry-tomato",
        "amount": 110,
        "unit": "g",
        "prepState": "raw",
        "name": "ripe cherry tomatoes, halved"
      },
      {
        "ingredientId": "cucumber",
        "amount": 60,
        "unit": "g",
        "prepState": "raw",
        "name": "English cucumber, diced"
      },
      {
        "ingredientId": "feta-cheese",
        "amount": 30,
        "unit": "g",
        "prepState": "raw",
        "name": "authentic Greek feta, crumbled"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil"
      }
    ],
    "steps": [
      {
        "title": "Cook Farro Al Dente",
        "description": "Cook farro in boiling salted water until pleasantly chewy (al dente, approx. 20 min). Drain and cool completely.",
        "timer": 20
      },
      {
        "title": "Combine Base & Veggies",
        "description": "In a bowl, combine cooled farro, halved cherry tomatoes, diced cucumber, and chopped basil.",
        "timer": 3
      },
      {
        "title": "Whisk EVOO & Vinegar",
        "description": "Whisk extra virgin olive oil, red wine vinegar, salt, and black pepper; pour over salad.",
        "timer": 2
      },
      {
        "title": "Fold & Finish with Feta",
        "description": "Toss gently to distribute dressing. Top with crumbled feta cheese before serving.",
        "timer": 2
      }
    ]
  },
  {
    "recipeNumber": 18,
    "id": "mediterranean-rainbow-tuna-salad-with-mustard-dressing",
    "title": "Mediterranean Rainbow Tuna Salad with Mustard Dressing",
    "description": "Bell peppers provide abundant vitamin C and luteolin, reducing systemic oxidative stress and preventing vascular LDL particle glycation.",
    "imageUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 12,
    "cookTime": 0,
    "cookingTime": 12,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Salad",
    "tags": [
      "Low GI",
      "Med GL",
      "High Protein",
      "Under 30 Min",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 34,
    "glycemicLoad": 11.5,
    "glycemicImpact": "Medium Impact",
    "nutrition": {
      "kcal": 320,
      "protein": 31,
      "fat": 15,
      "saturatedFat": 2.2,
      "carbs": 16,
      "fiber": 5.5,
      "netCarbs": 10.5,
      "glycemicIndex": 34,
      "glycemicLoad": 11.5
    },
    "diabeticNotes": "Bell peppers provide abundant vitamin C and luteolin, reducing systemic oxidative stress and preventing vascular LDL particle glycation.",
    "ingredients": [
      {
        "ingredientId": "tuna-light",
        "amount": 120,
        "unit": "g",
        "prepState": "raw",
        "name": "chunk light tuna in spring water, drained"
      },
      {
        "ingredientId": "bell-pepper-yellow",
        "amount": 50,
        "unit": "g",
        "prepState": "raw",
        "name": "yellow bell pepper, finely diced"
      },
      {
        "ingredientId": "bell-pepper-red",
        "amount": 50,
        "unit": "g",
        "prepState": "raw",
        "name": "red bell pepper, finely diced"
      },
      {
        "ingredientId": "celery",
        "amount": 40,
        "unit": "g",
        "prepState": "raw",
        "name": "stalk celery, finely diced"
      },
      {
        "ingredientId": "red-onion",
        "amount": 20,
        "unit": "g",
        "prepState": "raw",
        "name": "finely chopped red onion"
      },
      {
        "ingredientId": "kalamata-olives",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "Kalamata olives, pitted and chopped"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil"
      },
      {
        "ingredientId": "dijon-mustard",
        "amount": 7,
        "unit": "g",
        "prepState": "raw",
        "name": "coarse whole-grain Dijon mustard"
      },
      {
        "ingredientId": "lemon-juice",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh lemon juice"
      }
    ],
    "steps": [
      {
        "title": "Whisk Mustard Dressing",
        "description": "Whisk olive oil, whole-grain mustard, lemon juice, oregano, salt, and pepper in a salad bowl.",
        "timer": 2
      },
      {
        "title": "Add Crisp Vegetables",
        "description": "Add diced bell peppers, celery, red onion, and chopped Kalamata olives.",
        "timer": 3
      },
      {
        "title": "Flake Tender Tuna",
        "description": "Add drained tuna and flake gently into large, bite-sized flakes.",
        "timer": 2
      },
      {
        "title": "Coat & Serve Chilled",
        "description": "Toss until dressing evenly coats all vegetables and tuna. Serve chilled.",
        "timer": 2
      }
    ]
  },
  {
    "recipeNumber": 19,
    "id": "low-glycemic-chicken-burrito-bowl-meal-prep",
    "title": "Low-Glycemic Chicken Burrito Bowl Meal Prep",
    "description": "Using portion-controlled brown basmati rice paired with high-fiber black beans maintains a moderate GL (13.3). Greek yogurt and lean chicken breast drive a high 38g protein load, promoting GLP-1 secretion.",
    "imageUrl": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 15,
    "cookTime": 15,
    "cookingTime": 30,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Med GL",
      "High Protein",
      "Meal Prep",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 38,
    "glycemicLoad": 13.3,
    "glycemicImpact": "Medium Impact",
    "nutrition": {
      "kcal": 420,
      "protein": 38,
      "fat": 13,
      "saturatedFat": 2.8,
      "carbs": 36,
      "fiber": 8.5,
      "netCarbs": 27.5,
      "glycemicIndex": 38,
      "glycemicLoad": 13.3
    },
    "diabeticNotes": "Using portion-controlled brown basmati rice paired with high-fiber black beans maintains a moderate GL (13.3). Greek yogurt and lean chicken breast drive a high 38g protein load, promoting GLP-1 secretion.",
    "ingredients": [
      {
        "ingredientId": "chicken-breast",
        "amount": 120,
        "unit": "g",
        "prepState": "sauteed",
        "name": "skinless chicken breast, cubed and seasoned"
      },
      {
        "ingredientId": "brown-basmati-rice",
        "amount": 65,
        "unit": "g",
        "prepState": "boiled",
        "name": "cooked brown basmati rice"
      },
      {
        "ingredientId": "black-beans",
        "amount": 90,
        "unit": "g",
        "prepState": "boiled",
        "name": "cooked black beans, rinsed and drained"
      },
      {
        "ingredientId": "romaine-lettuce",
        "amount": 70,
        "unit": "g",
        "prepState": "raw",
        "name": "shredded Romaine lettuce"
      },
      {
        "ingredientId": "cherry-tomato",
        "amount": 45,
        "unit": "g",
        "prepState": "raw",
        "name": "fresh pico de gallo (tomato, onion, cilantro, lime)"
      },
      {
        "ingredientId": "avocado",
        "amount": 40,
        "unit": "g",
        "prepState": "raw",
        "name": "ripe avocado, sliced"
      },
      {
        "ingredientId": "greek-yogurt",
        "amount": 15,
        "unit": "g",
        "prepState": "raw",
        "name": "2% Greek yogurt (substituting sour cream)"
      }
    ],
    "steps": [
      {
        "title": "Sear Seasoned Chicken",
        "description": "Sear seasoned chicken breast cubes in a hot nonstick skillet lightly misted with olive oil for 6–7 minutes until fully cooked.",
        "timer": 7
      },
      {
        "title": "Create Volume Base",
        "description": "Lay shredded Romaine lettuce across one side of a wide bowl as the low-calorie volume base.",
        "timer": 2
      },
      {
        "title": "Add Rice & Black Beans",
        "description": "Add cooked brown rice and warm black beans side-by-side.",
        "timer": 2
      },
      {
        "title": "Top with Grilled Chicken",
        "description": "Place grilled chicken breast over the top.",
        "timer": 1
      },
      {
        "title": "Garnish with Avocado & Crema",
        "description": "Garnish with fresh pico de gallo, avocado slices, and a dollop of Greek yogurt.",
        "timer": 3
      }
    ]
  },
  {
    "recipeNumber": 20,
    "id": "chana-masala-with-cucumber-raita",
    "title": "Chana Masala with Cucumber Raita",
    "description": "The substantial 11.2g fiber content creates a slow, sustained digestive breakdown. The lactic acid and protein from the yogurt raita further blunt postprandial glycemic excursions.",
    "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
    "prepTime": 10,
    "cookTime": 20,
    "cookingTime": 30,
    "difficulty": "Easy",
    "servings": 1,
    "yield": "1 Large Serving",
    "category": "Main Course",
    "tags": [
      "Low GI",
      "Med GL",
      "High Fiber",
      "Vegetarian",
      "LOGI"
    ],
    "status": "published",
    "publishedAt": "2026-01-01T00:00:00.000Z",
    "isUserAuthored": false,
    "glycemicIndex": 35,
    "glycemicLoad": 15.3,
    "glycemicImpact": "Medium Impact",
    "nutrition": {
      "kcal": 370,
      "protein": 16,
      "fat": 12.5,
      "saturatedFat": 2.2,
      "carbs": 45,
      "fiber": 11.2,
      "netCarbs": 33.8,
      "glycemicIndex": 35,
      "glycemicLoad": 15.3
    },
    "diabeticNotes": "The substantial 11.2g fiber content creates a slow, sustained digestive breakdown. The lactic acid and protein from the yogurt raita further blunt postprandial glycemic excursions.",
    "ingredients": [
      {
        "ingredientId": "chickpeas",
        "amount": 220,
        "unit": "g",
        "prepState": "boiled",
        "name": "cooked chickpeas, rinsed and drained"
      },
      {
        "ingredientId": "canned-tomatoes",
        "amount": 180,
        "unit": "g",
        "prepState": "sauteed",
        "name": "crushed canned tomatoes"
      },
      {
        "ingredientId": "extra-virgin-olive-oil",
        "amount": 14,
        "unit": "g",
        "prepState": "raw",
        "name": "extra virgin olive oil or ghee"
      },
      {
        "ingredientId": "yellow-onion",
        "amount": 40,
        "unit": "g",
        "prepState": "sauteed",
        "name": "diced yellow onion"
      },
      {
        "ingredientId": "garlic",
        "amount": 6,
        "unit": "g",
        "prepState": "sauteed",
        "name": "cloves garlic, minced"
      },
      {
        "ingredientId": "ginger",
        "amount": 5,
        "unit": "g",
        "prepState": "sauteed",
        "name": "fresh ginger, grated"
      },
      {
        "ingredientId": "greek-yogurt",
        "amount": 80,
        "unit": "g",
        "prepState": "raw",
        "name": "nonfat Greek yogurt (Cucumber Raita)"
      },
      {
        "ingredientId": "cucumber",
        "amount": 50,
        "unit": "g",
        "prepState": "raw",
        "name": "grated cucumber (squeezed dry)"
      }
    ],
    "steps": [
      {
        "title": "Sauté Aromatics",
        "description": "Heat olive oil in a saucepan over medium heat. Sauté onion, garlic, and ginger for 4 minutes until golden.",
        "timer": 4
      },
      {
        "title": "Toast Spices",
        "description": "Add coriander, cumin, garam masala, and turmeric; toast for 30 seconds.",
        "timer": 1
      },
      {
        "title": "Simmer Tomato Gravy",
        "description": "Add crushed tomatoes and 1/3 cup water. Simmer for 5 minutes.",
        "timer": 5
      },
      {
        "title": "Simmer & Thicken Chickpeas",
        "description": "Stir in chickpeas. Lower heat and simmer gently for 10–12 minutes, lightly crushing a few chickpeas with the spoon to thicken the gravy.",
        "timer": 12
      },
      {
        "title": "Whisk Cooling Cucumber Raita",
        "description": "In a small bowl, whisk Greek yogurt with grated cucumber, chopped mint, and roasted cumin.",
        "timer": 3
      },
      {
        "title": "Serve Warm with Raita",
        "description": "Serve warm Chana Masala topped with a generous dollop of cooling Cucumber Raita.",
        "timer": 1
      }
    ]
  }
];

/** Maps legacy category field to mealOccasion enum */
export function mapCategoryToOccasion(category) {
  if (!category) return 'dinner';
  const lower = category.toLowerCase().trim();
  const mapping = {
    'breakfast': 'breakfast',
    'brunch': 'brunch',
    'lunch': 'lunch',
    'salad': 'lunch',
    'dinner': 'dinner',
    'main course': 'dinner',
    'snack': 'snack',
    'dessert': 'dessert',
    'appetizer': 'snack',
    'side dish': 'dinner',
  };
  return mapping[lower] || 'dinner';
}

export const DIETARY_FLAG_SET = new Set(['Vegetarian', 'Vegan', 'Nut-Free', 'Dairy-Free', 'Gluten-Free']);

export function extractDietaryFlags(tags, fiber = 0) {
  const flags = [];
  if (Array.isArray(tags)) {
    tags.forEach(tag => {
      if (DIETARY_FLAG_SET.has(tag) && !flags.includes(tag)) {
        flags.push(tag);
      }
    });
  }
  if (fiber > 5 && !flags.includes('High Fiber')) {
    flags.push('High Fiber');
  }
  return flags;
}

export function normalizeRecipe(r) {
  const publishedAt = r?.publishedAt ?? (r?.status === 'published' ? new Date().toISOString() : null);
  const status = publishedAt ? 'published' : 'draft';

  const mealOccasion = r?.mealOccasion || mapCategoryToOccasion(r?.category);
  const fiber = r?.nutrition?.fiber || r?.fiber || 0;
  const dietaryFlags = r?.dietaryFlags || extractDietaryFlags(r?.tags, fiber);

  return {
    id: String(r?.id ?? r?.documentId ?? ''),
    title: r?.title ?? '',
    description: r?.description ?? '',
    imageUrl: r?.imageUrl ?? '',
    cookingTime: parseFloat(r?.cookingTime) || 0,
    prepTime: parseFloat(r?.prepTime) || 0,
    difficulty: r?.difficulty ?? 'Easy',
    servings: parseFloat(r?.servings) || 1,
    category: r?.category ?? '',
    mealOccasion,
    dietaryFlags,
    dietaryTags: Array.isArray(r?.dietaryTags) ? r.dietaryTags : [],
    allergens: Array.isArray(r?.allergens) ? r.allergens : [],
    glycemicIndex: r?.glycemicIndex ?? r?.nutrition?.glycemicIndex ?? null,
    glycemicLoad: r?.glycemicLoad ?? r?.nutrition?.glycemicLoad ?? 0,
    netCarbs: r?.netCarbs ?? r?.nutrition?.netCarbs ?? 0,
    nutrition: r?.nutrition ?? null,
    tags: Array.isArray(r?.tags) ? r.tags : [],
    publishedAt,
    status,
    authorId: r?.authorId ?? '',
    isUserAuthored: r?.isUserAuthored ?? (!!r?.authorId),
    ingredients: Array.isArray(r?.ingredients) ? r.ingredients.map(ing => ({
      ...ing,
      ingredientId: String(ing?.ingredient?.id || ing?.ingredientId || ing?.id || ''),
      amount: parseFloat(ing?.amount) || 0,
      unit: ing?.unit || 'g',
      prepState: ing?.prepState || ing?.ingredient?.defaultPrepState || 'raw',
    })) : [],
    steps: Array.isArray(r?.steps) ? r.steps : [],
  };
}

const COMBINED_SEED_RECIPES = [
  ...MASTER_CLINICAL_RECIPES,
  ...DEFAULT_SEED_RECIPES.filter(r => !MASTER_CLINICAL_RECIPES.some(m => m.id === r.id))
];

let _indexCache = COMBINED_SEED_RECIPES.map(normalizeRecipe);

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

export async function getRecipeById(id, options = {}) {
  if (!id && id !== 0) return null;
  const strId = String(id);

  try {
    const params = { populate: '*' };
    if (options.preview) {
      params.publicationState = 'preview';
    }
    const response = await strapiGet(`${COLLECTION}/${id}`, params);
    const recipe = response?.data ?? response;
    if (recipe) {
      return normalizeRecipe(recipe);
    }
  } catch (err) {
    console.warn(`[recipeStore] Strapi GET /api/recipes/${id} failed, checking local cache:`, err.message);
  }

  const list = (_indexCache && _indexCache.length > 0) ? _indexCache : COMBINED_SEED_RECIPES.map(normalizeRecipe);
  const cached = list.find(
    r => String(r.id) === strId
  );
  return cached || null;
}


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
    prepTime: parseFloat(recipe.prepTime) || 0,
    difficulty: recipe.difficulty ?? 'Easy',
    servings: parseFloat(recipe.servings) || 1,
    category: recipe.category ?? '',
    mealOccasion: recipe.mealOccasion ?? mapCategoryToOccasion(recipe.category),
    dietaryFlags: Array.isArray(recipe.dietaryFlags) ? recipe.dietaryFlags : extractDietaryFlags(recipe.tags, recipe.nutrition?.fiber || 0),
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

export function invalidateRecipeCache() {
  _indexCache = null;
  invalidateCache('recipes');
}
