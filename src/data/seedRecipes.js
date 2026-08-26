/**
 * seedRecipes.js — Master Clinical Seed & Swap Library
 *
 * Clinical Metadata & Deterministic Metabolic Registry:
 * - 12 Clinical-Grade Recipes (2 per meal occasion: breakfast, brunch, lunch, dinner, snack, dessert)
 * - Full spectrum coverage: Low GL (<= 10), Medium GL (11-19), High GL (>= 20)
 * - Thermal Preparation Multipliers: raw (1.00x), steamed (1.02x), sauteed (1.05x), roasted (1.15x), boiled (1.20x), mashed_processed (1.25x), cooled (0.85x)
 * - Smart Low-GI Swap pairings for high-impact staples (Jasmine White Rice, Mashed Potato, Wheat Pasta, All-Purpose Flour)
 */

export const MASTER_CLINICAL_RECIPES = [
  // ==========================================
  // BREAKFAST (2 Recipes)
  // ==========================================
  {
    id: "mediterranean-spinach-feta-scramble",
    title: "Mediterranean Spinach & Feta Egg Scramble",
    description: "Farm-fresh pasture-raised eggs sautéed with tender baby spinach, kalamata olives, and rich Greek sheep milk feta. Minimal net carbs and high choline deliver gentle metabolic load and sustained morning satiety.",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    prepTime: 5,
    cookTime: 7,
    cookingTime: 12,
    difficulty: "Easy",
    servings: 1,
    yield: "1 Plate (2 Large Eggs)",
    category: "Breakfast",
    mealOccasion: "breakfast",
    tags: ["Low GI", "Low GL", "Keto Friendly", "High Protein", "Quick Prep"],
    dietaryFlags: ["Gluten-Free", "Vegetarian", "Keto", "High Protein"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 10,
    glycemicLoad: 1.5,
    glycemicImpact: "Optimal Low-GI",
    nutrition: {
      kcal: 290,
      protein: 19.5,
      fat: 22.0,
      saturatedFat: 6.8,
      carbs: 3.5,
      fiber: 1.8,
      netCarbs: 1.7,
      glycemicIndex: 10,
      glycemicLoad: 1.5,
    },
    ingredients: [
      { ingredientId: "eggs", amount: 100, unit: "g", prepState: "sauteed" },
      { ingredientId: "spinach", amount: 60, unit: "g", prepState: "sauteed" },
      { ingredientId: "extra-virgin-olive-oil", amount: 10, unit: "g", prepState: "raw" },
      { ingredientId: "garlic", amount: 3, unit: "g", prepState: "sauteed" }
    ],
    instructions: [
      "Whisk farm eggs in a bowl with a pinch of sea salt and freshly cracked black pepper.",
      "Heat extra virgin olive oil in a non-stick skillet over medium-low heat; add minced garlic and baby spinach until wilted (approx. 90 seconds).",
      "Pour in whisked eggs, gently folding with a spatula for 2-3 minutes until soft curds form.",
      "Top with crumbled Greek sheep feta and fresh herbs; serve immediately."
    ]
  },
  {
    id: "golden-chia-toasted-almond-pudding",
    title: "Golden Chia & Toasted Almond Pudding with Berries",
    description: "Black chia seeds steeped in unsweetened vanilla almond milk, enriched with organic Ceylon cinnamon and topped with toasted sliced almonds and fresh antioxidant-rich wild strawberries.",
    imageUrl: "https://images.unsplash.com/photo-1490474418585-fb9bad893e20?auto=format&fit=crop&w=1200&q=80",
    prepTime: 10,
    cookTime: 0,
    cookingTime: 10,
    difficulty: "Easy",
    servings: 1,
    yield: "1 Parfait Jar (250ml)",
    category: "Breakfast",
    mealOccasion: "breakfast",
    tags: ["Low GI", "Low GL", "High Fiber", "Vegan", "LOGI"],
    dietaryFlags: ["Gluten-Free", "Dairy-Free", "Vegan", "High Fiber"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 20,
    glycemicLoad: 3.2,
    glycemicImpact: "Optimal Low-GI",
    nutrition: {
      kcal: 265,
      protein: 8.5,
      fat: 17.0,
      saturatedFat: 1.8,
      carbs: 18.0,
      fiber: 12.0,
      netCarbs: 6.0,
      glycemicIndex: 20,
      glycemicLoad: 3.2,
    },
    ingredients: [
      { ingredientId: "chia-seeds", amount: 30, unit: "g", prepState: "cooled" },
      { ingredientId: "almond-milk", amount: 180, unit: "g", prepState: "cooled" },
      { ingredientId: "sliced-almonds", amount: 15, unit: "g", prepState: "roasted" },
      { ingredientId: "strawberries", amount: 50, unit: "g", prepState: "raw" }
    ],
    instructions: [
      "In a glass jar, whisk chia seeds, unsweetened almond milk, Ceylon cinnamon, and optional pure monk fruit extract.",
      "Refrigerate for at least 4 hours or overnight until gel matrix fully hydrates.",
      "Garnish with lightly toasted sliced almonds and freshly sliced wild strawberries before enjoying."
    ]
  },

  // ==========================================
  // BRUNCH (2 Recipes)
  // ==========================================
  {
    id: "smoked-salmon-herbed-asparagus-frittata",
    title: "Smoked Salmon & Herbed Asparagus Frittata",
    description: "Slow-baked pasture-raised eggs embedded with Atlantic wild salmon ribbons, roasted tender spring asparagus spears, and fresh garden dill. Rich in omega-3 polyunsaturated fatty acids.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    prepTime: 12,
    cookTime: 18,
    cookingTime: 30,
    difficulty: "Medium",
    servings: 2,
    yield: "2 Generous Wedges",
    category: "Brunch",
    mealOccasion: "brunch",
    tags: ["Low GI", "Low GL", "Omega-3", "High Protein", "Keto"],
    dietaryFlags: ["Gluten-Free", "Dairy-Free", "High Protein", "Keto"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 12,
    glycemicLoad: 2.1,
    glycemicImpact: "Optimal Low-GI",
    nutrition: {
      kcal: 340,
      protein: 28.0,
      fat: 23.0,
      saturatedFat: 5.2,
      carbs: 4.8,
      fiber: 2.2,
      netCarbs: 2.6,
      glycemicIndex: 12,
      glycemicLoad: 2.1,
    },
    ingredients: [
      { ingredientId: "eggs", amount: 150, unit: "g", prepState: "roasted" },
      { ingredientId: "atlantic-salmon", amount: 100, unit: "g", prepState: "roasted" },
      { ingredientId: "herb-asparagus", amount: 80, unit: "g", prepState: "roasted" },
      { ingredientId: "olive-oil", amount: 10, unit: "g", prepState: "raw" },
      { ingredientId: "chives", amount: 10, unit: "g", prepState: "raw" }
    ],
    instructions: [
      "Preheat oven to 375°F (190°C). Lightly coat an oven-safe cast iron skillet with olive oil.",
      "Sauté trimmed asparagus in the skillet over medium heat for 3 minutes until bright green.",
      "Pour beaten eggs over the asparagus; distribute smoked salmon flakes and chopped chives evenly.",
      "Transfer skillet to the oven and bake for 14-16 minutes until center is just set and edges are golden."
    ]
  },
  {
    id: "almond-ricotta-fluffy-pancakes",
    title: "Almond Ricotta Pancakes with Blackberry Compote",
    description: "Fluffy low-glycemic brunch pancakes formulated with superfine almond flour, whole milk ricotta, and pure vanilla bean. Served with warm, zero-sugar reduced wild blackberry compote.",
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80",
    prepTime: 10,
    cookTime: 12,
    cookingTime: 22,
    difficulty: "Medium",
    servings: 2,
    yield: "4 Medium Pancakes (2 Servings)",
    category: "Brunch",
    mealOccasion: "brunch",
    tags: ["Med GL", "Low GI", "Smart Swap", "Grain-Free", "Brunch Classic"],
    dietaryFlags: ["Gluten-Free", "Vegetarian", "Grain-Free"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 28,
    glycemicLoad: 12.4,
    glycemicImpact: "Moderate Impact",
    nutrition: {
      kcal: 385,
      protein: 16.5,
      fat: 29.0,
      saturatedFat: 7.5,
      carbs: 18.2,
      fiber: 7.0,
      netCarbs: 11.2,
      glycemicIndex: 28,
      glycemicLoad: 12.4,
    },
    ingredients: [
      { ingredientId: "almond-flour", amount: 80, unit: "g", prepState: "sauteed" },
      { ingredientId: "eggs", amount: 100, unit: "g", prepState: "sauteed" },
      { ingredientId: "almond-milk", amount: 60, unit: "g", prepState: "sauteed" },
      { ingredientId: "strawberries", amount: 60, unit: "g", prepState: "sauteed" }
    ],
    instructions: [
      "In a medium bowl, whisk eggs, almond milk, and ricotta until smooth.",
      "Fold in almond flour, baking powder, and a pinch of salt until a thick batter forms.",
      "Ladle onto a preheated lightly greased griddle on medium-low heat; cook for 3 minutes per side.",
      "Simmer blackberries with a splash of water and monk fruit until thickened; spoon over warm pancakes."
    ]
  },

  // ==========================================
  // LUNCH (2 Recipes)
  // ==========================================
  {
    id: "low-glycemic-egg-salad-lettuce-wraps",
    title: "Low-Glycemic Egg Salad Lettuce Wraps",
    description: "Hard-boiled pastured eggs folded with creamy avocado mayonnaise, Dijon mustard, crisp organic celery, and fresh chives, cradled in crunchy living butterhead lettuce cups.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    prepTime: 10,
    cookTime: 0,
    cookingTime: 10,
    difficulty: "Easy",
    servings: 1,
    yield: "1 Serving (3 Large Wraps)",
    category: "Lunch",
    mealOccasion: "lunch",
    tags: ["Low GI", "Low GL", "Keto", "High Protein", "Under 15 Min"],
    dietaryFlags: ["Gluten-Free", "Dairy-Free", "Keto", "High Protein"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 12,
    glycemicLoad: 1.8,
    glycemicImpact: "Optimal Low-GI",
    nutrition: {
      kcal: 310,
      protein: 16.0,
      fat: 25.0,
      saturatedFat: 4.8,
      carbs: 4.2,
      fiber: 2.4,
      netCarbs: 1.8,
      glycemicIndex: 12,
      glycemicLoad: 1.8,
    },
    ingredients: [
      { ingredientId: "eggs", amount: 100, unit: "g", prepState: "boiled" },
      { ingredientId: "celery", amount: 30, unit: "g", prepState: "raw" },
      { ingredientId: "dijon-mustard", amount: 10, unit: "g", prepState: "raw" },
      { ingredientId: "chives", amount: 5, unit: "g", prepState: "raw" },
      { ingredientId: "romaine-lettuce", amount: 60, unit: "g", prepState: "raw" }
    ],
    instructions: [
      "Peel hard-boiled eggs and dice finely into a mixing bowl.",
      "Fold in diced celery, avocado mayonnaise, Dijon mustard, minced chives, sea salt, and paprika.",
      "Spoon mixture evenly into crisp romaine or butterhead lettuce leaves; serve chilled."
    ]
  },
  {
    id: "sesame-ginger-chicken-rice-bowl",
    title: "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled)",
    description: "Tender sliced chicken breast sautéed in cold-pressed sesame oil, fresh ginger root, and tamari over Jasmine white rice. Utilize 1-click Smart Swap to replace rice with steamed Cauliflower Pearl Rice to reduce GL by 92%.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    prepTime: 12,
    cookTime: 12,
    cookingTime: 24,
    difficulty: "Medium",
    servings: 1,
    yield: "1 Large Bento Bowl",
    category: "Lunch",
    mealOccasion: "lunch",
    tags: ["High GL", "Smart Swap", "High Protein", "Meal Prep", "Asian Style"],
    dietaryFlags: ["Gluten-Free", "Dairy-Free", "High Protein"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 82,
    glycemicLoad: 25.0,
    glycemicImpact: "High Spike Risk",
    nutrition: {
      kcal: 480,
      protein: 36.0,
      fat: 12.0,
      saturatedFat: 2.2,
      carbs: 58.0,
      fiber: 2.2,
      netCarbs: 55.8,
      glycemicIndex: 82,
      glycemicLoad: 25.0,
    },
    ingredients: [
      { ingredientId: "chicken-breast", amount: 150, unit: "g", prepState: "sauteed" },
      { ingredientId: "white-rice-cooked", amount: 150, unit: "g", prepState: "boiled" },
      { ingredientId: "broccoli", amount: 80, unit: "g", prepState: "steamed" },
      { ingredientId: "sesame-oil", amount: 10, unit: "g", prepState: "sauteed" },
      { ingredientId: "garlic", amount: 5, unit: "g", prepState: "sauteed" }
    ],
    instructions: [
      "Heat sesame oil in a wok; sear sliced chicken breast with minced garlic and ginger until golden and cooked through.",
      "Steam broccoli florets until crisp-tender (3-4 minutes).",
      "Assemble bowl with base of rice (or swapped cauliflower pearls), seared chicken, and broccoli; drizzle with tamari and toasted sesame seeds."
    ]
  },

  // ==========================================
  // DINNER (2 Recipes)
  // ==========================================
  {
    id: "herb-crusted-salmon-garlic-romanesco",
    title: "Herb-Crusted Atlantic Salmon with Garlic Romanesco",
    description: "Pan-roasted wild salmon fillet topped with a crust of chopped fresh rosemary, thyme, and lemon zest, paired with caramelized Romanesco broccoli florets roasted in extra virgin olive oil.",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
    prepTime: 10,
    cookTime: 15,
    cookingTime: 25,
    difficulty: "Easy",
    servings: 1,
    yield: "1 Dinner Plate (1 Fillet + Veggies)",
    category: "Dinner",
    mealOccasion: "dinner",
    tags: ["Low GI", "Low GL", "Omega-3", "High Protein", "Keto"],
    dietaryFlags: ["Gluten-Free", "Dairy-Free", "High Protein", "Keto"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 10,
    glycemicLoad: 1.9,
    glycemicImpact: "Optimal Low-GI",
    nutrition: {
      kcal: 440,
      protein: 38.0,
      fat: 29.0,
      saturatedFat: 4.8,
      carbs: 6.5,
      fiber: 3.5,
      netCarbs: 3.0,
      glycemicIndex: 10,
      glycemicLoad: 1.9,
    },
    ingredients: [
      { ingredientId: "atlantic-salmon", amount: 180, unit: "g", prepState: "roasted" },
      { ingredientId: "romanesco-broccoli", amount: 120, unit: "g", prepState: "roasted" },
      { ingredientId: "olive-oil", amount: 12, unit: "g", prepState: "roasted" },
      { ingredientId: "lemon-juice", amount: 10, unit: "g", prepState: "raw" },
      { ingredientId: "garlic", amount: 4, unit: "g", prepState: "roasted" }
    ],
    instructions: [
      "Toss Romanesco florets with olive oil, minced garlic, and sea salt; roast at 400°F (200°C) for 15 minutes.",
      "Season salmon fillet with fresh herbs, lemon zest, and cracked pepper; place alongside Romanesco during the last 10 minutes.",
      "Finish with a fresh squeeze of lemon juice and serve warm."
    ]
  },
  {
    id: "braised-beef-short-ribs-mashed-pairing",
    title: "Braised Beef Short Ribs with Mashed Potato Base",
    description: "Fork-tender slow-braised beef short ribs in a rich rosemary red wine reduction over buttery mashed russet potatoes. Smart Swap available: replace high-GI mashed potatoes with Pureed Cauliflower & Roasted Garlic to drop GL from 22 to 2.8.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    prepTime: 15,
    cookTime: 45,
    cookingTime: 60,
    difficulty: "Hard",
    servings: 1,
    yield: "1 Hearty Dinner Entrée",
    category: "Dinner",
    mealOccasion: "dinner",
    tags: ["High GL", "Smart Swap", "Comfort Food", "High Protein", "Gourmet"],
    dietaryFlags: ["Gluten-Free", "High Protein"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 78,
    glycemicLoad: 22.0,
    glycemicImpact: "High Spike Risk",
    nutrition: {
      kcal: 560,
      protein: 42.0,
      fat: 32.0,
      saturatedFat: 12.5,
      carbs: 26.0,
      fiber: 2.0,
      netCarbs: 24.0,
      glycemicIndex: 78,
      glycemicLoad: 22.0,
    },
    ingredients: [
      { ingredientId: "chicken-breast", amount: 180, unit: "g", prepState: "roasted" },
      { ingredientId: "russet-potato-mashed", amount: 150, unit: "g", prepState: "mashed_processed" },
      { ingredientId: "spinach", amount: 60, unit: "g", prepState: "sauteed" },
      { ingredientId: "olive-oil", amount: 10, unit: "g", prepState: "roasted" }
    ],
    instructions: [
      "Sear short rib cuts in hot Dutch oven until caramelized; braise with aromatics and bone broth for 2 hours.",
      "Prepare mashed russet potatoes (or execute Smart Swap for pureed cauliflower and roasted garlic).",
      "Plate the silky puree, top with tender braised beef, and spoon strained pan reduction over the top."
    ]
  },

  // ==========================================
  // SNACK (2 Recipes)
  // ==========================================
  {
    id: "spiced-crunchy-roasted-chickpeas",
    title: "Spiced Crunchy Roasted Chickpeas",
    description: "Organic chickpeas tossed with smoked Spanish paprika, ground cumin, turmeric, and cold-pressed olive oil, slow-roasted to golden crunchiness. Rich in resistant starch and prebiotic legume fiber.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    prepTime: 5,
    cookTime: 25,
    cookingTime: 30,
    difficulty: "Easy",
    servings: 2,
    yield: "1 Cup Roasted Snack",
    category: "Snack",
    mealOccasion: "snack",
    tags: ["Med GL", "Low GI", "High Fiber", "Vegan", "Crunchy Snack"],
    dietaryFlags: ["Gluten-Free", "Dairy-Free", "Vegan", "High Fiber"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 32,
    glycemicLoad: 11.2,
    glycemicImpact: "Moderate Impact",
    nutrition: {
      kcal: 220,
      protein: 9.0,
      fat: 7.5,
      saturatedFat: 1.0,
      carbs: 31.0,
      fiber: 8.5,
      netCarbs: 22.5,
      glycemicIndex: 32,
      glycemicLoad: 11.2,
    },
    ingredients: [
      { ingredientId: "chia-seeds", amount: 100, unit: "g", prepState: "roasted" },
      { ingredientId: "olive-oil", amount: 10, unit: "g", prepState: "roasted" },
      { ingredientId: "pumpkin-seeds", amount: 20, unit: "g", prepState: "roasted" }
    ],
    instructions: [
      "Rinse and thoroughly dry chickpeas with paper towels.",
      "Toss with olive oil, smoked paprika, cumin, garlic powder, and pink Himalayan sea salt.",
      "Spread evenly on baking sheet; roast at 390°F (198°C) for 25-30 minutes, shaking halfway through until crunchy."
    ]
  },
  {
    id: "avocado-lime-green-goddess-dip",
    title: "Avocado Lime Green Goddess Dip with Crisp Cucumbers",
    description: "Whipped Hass avocado blended with fresh lime juice, whole milk Greek yogurt, cilantro, and roasted garlic, served with crisp Persian cucumber rounds and celery sticks.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    prepTime: 8,
    cookTime: 0,
    cookingTime: 8,
    difficulty: "Easy",
    servings: 2,
    yield: "1 Bowl Dip + Veggies",
    category: "Snack",
    mealOccasion: "snack",
    tags: ["Low GI", "Low GL", "Keto", "High Fiber", "Raw"],
    dietaryFlags: ["Gluten-Free", "Vegetarian", "Keto", "High Fiber"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 15,
    glycemicLoad: 1.2,
    glycemicImpact: "Optimal Low-GI",
    nutrition: {
      kcal: 180,
      protein: 5.5,
      fat: 14.5,
      saturatedFat: 2.8,
      carbs: 7.0,
      fiber: 5.0,
      netCarbs: 2.0,
      glycemicIndex: 15,
      glycemicLoad: 1.2,
    },
    ingredients: [
      { ingredientId: "avocado", amount: 100, unit: "g", prepState: "raw" },
      { ingredientId: "greek-yogurt", amount: 60, unit: "g", prepState: "raw" },
      { ingredientId: "cucumber", amount: 100, unit: "g", prepState: "raw" },
      { ingredientId: "lemon-juice", amount: 10, unit: "g", prepState: "raw" }
    ],
    instructions: [
      "In a food processor, blend ripe avocado, Greek yogurt, lime juice, cilantro, garlic, and sea salt until velvety.",
      "Transfer to a dipping bowl; drizzle lightly with cold-pressed olive oil.",
      "Serve alongside sliced Persian cucumbers, radishes, and bell pepper batons."
    ]
  },

  // ==========================================
  // DESSERT (2 Recipes)
  // ==========================================
  {
    id: "dark-cocoa-almond-keto-mousse",
    title: "Dark Cocoa & Almond Keto Mousse",
    description: "Decadent 85% Valrhona Dutch cocoa blended with rich coconut cream, almond butter, pure vanilla, and granulated erythritol/monkfruit. Zero spike risk dessert with luxurious mouthfeel.",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=80",
    prepTime: 10,
    cookTime: 0,
    cookingTime: 10,
    difficulty: "Easy",
    servings: 2,
    yield: "2 Ramekins",
    category: "Dessert",
    mealOccasion: "dessert",
    tags: ["Low GI", "Low GL", "Keto", "Antioxidant", "Chilled Dessert"],
    dietaryFlags: ["Gluten-Free", "Dairy-Free", "Vegan", "Keto"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 18,
    glycemicLoad: 2.4,
    glycemicImpact: "Optimal Low-GI",
    nutrition: {
      kcal: 240,
      protein: 6.0,
      fat: 21.0,
      saturatedFat: 9.5,
      carbs: 9.0,
      fiber: 6.0,
      netCarbs: 3.0,
      glycemicIndex: 18,
      glycemicLoad: 2.4,
    },
    ingredients: [
      { ingredientId: "avocado", amount: 80, unit: "g", prepState: "cooled" },
      { ingredientId: "almond-milk", amount: 60, unit: "g", prepState: "cooled" },
      { ingredientId: "sliced-almonds", amount: 15, unit: "g", prepState: "roasted" }
    ],
    instructions: [
      "Blend chilled avocado, cocoa powder, almond milk, pure vanilla, and monkfruit sweetener in high-speed blender until silky.",
      "Divide into two ramekins and chill in refrigerator for 30 minutes.",
      "Garnish with roasted sliced almonds and shaved 85% dark chocolate before serving."
    ]
  },
  {
    id: "warm-berry-crumble-coconut-crust",
    title: "Warm Blackberry Crumble with Coconut Crust",
    description: "Sweet-tart wild blackberries baked under a golden crisp crumble of organic coconut flour, almond meal, and grass-fed butter. Zero refined sugars, sustained fiber release.",
    imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80",
    prepTime: 12,
    cookTime: 20,
    cookingTime: 32,
    difficulty: "Medium",
    servings: 2,
    yield: "2 Individual Skillets",
    category: "Dessert",
    mealOccasion: "dessert",
    tags: ["Med GL", "Low GI", "Smart Swap", "High Fiber", "Warm Dessert"],
    dietaryFlags: ["Gluten-Free", "Vegetarian", "High Fiber"],
    status: "published",
    publishedAt: "2026-01-01T00:00:00.000Z",
    isUserAuthored: false,
    glycemicIndex: 30,
    glycemicLoad: 13.5,
    glycemicImpact: "Moderate Impact",
    nutrition: {
      kcal: 310,
      protein: 7.5,
      fat: 22.0,
      saturatedFat: 8.0,
      carbs: 24.0,
      fiber: 10.0,
      netCarbs: 14.0,
      glycemicIndex: 30,
      glycemicLoad: 13.5,
    },
    ingredients: [
      { ingredientId: "strawberries", amount: 120, unit: "g", prepState: "roasted" },
      { ingredientId: "almond-flour", amount: 40, unit: "g", prepState: "roasted" },
      { ingredientId: "sliced-almonds", amount: 15, unit: "g", prepState: "roasted" }
    ],
    instructions: [
      "Preheat oven to 350°F (175°C). Place berries in small oven-safe ramekins.",
      "In a bowl, mix almond flour, coconut flour, cinnamon, monkfruit, and melted grass-fed butter until crumbly.",
      "Scatter crumble topping over berries; bake for 20 minutes until golden and bubbling.",
      "Serve warm with a dollop of unsweetened whipped cream or Greek yogurt."
    ]
  }
];

export default MASTER_CLINICAL_RECIPES;
