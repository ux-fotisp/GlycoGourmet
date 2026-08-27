# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\metabolicJourneys.spec.ts >> Clinical Metabolic End-to-End User Journeys >> Single-Recipe GI/GL Rendering and Secondary Macro Expansion
- Location: tests\e2e\metabolicJourneys.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('GI 50')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('GI 50')

```

```yaml
- complementary:
  - link "GlycoGourmet Admin":
    - /url: "#/"
    - heading "GlycoGourmet Admin" [level=1]
  - paragraph: Managing Blood Sugar & Flavor
  - navigation:
    - button "restaurant_menu Recipes expand_more"
    - link "calendar_today Meal Plans":
      - /url: "#/meal-plans"
    - link "settings Profile Settings":
      - /url: "#/settings"
  - text: t testuser USER
  - button "logout Log Out"
- main:
  - text: Metabolic Health Dashboard
  - heading "Good evening, testuser" [level=2]
  - paragraph: Here is your daily metabolic glycemic overview and blood-sugar balanced menu.
  - link "bloodtype mg/dL":
    - /url: "#/settings"
  - link "straighten Imperial":
    - /url: "#/settings"
  - 'link "flag Target: 45 GL"':
    - /url: "#/settings"
  - text: "monitoring Daily GL Budget On Track 0 / 45 GL 0% 0 GL Target: 45 GL calendar_today"
  - heading "Today's Meal Plan" [level=4]
  - paragraph: Scheduled low-glycemic daily meals
  - text: "Total GL: 37 55g Net Carbs"
  - 'link "Low-Glycemic Egg Salad Lettuce Wraps Breakfast Low-Glycemic Egg Salad Lettuce Wraps GL: 0"':
    - /url: "#/recipe/low-glycemic-egg-salad-lettuce-wraps"
    - img "Low-Glycemic Egg Salad Lettuce Wraps"
    - text: Breakfast
    - heading "Low-Glycemic Egg Salad Lettuce Wraps" [level=5]
    - text: "GL: 0"
  - 'link "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled) Lunch Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled) GL: 36"':
    - /url: "#/recipe/sesame-ginger-chicken-rice-bowl"
    - img "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled)"
    - text: Lunch
    - heading "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled)" [level=5]
    - text: "GL: 36"
  - 'link "Herb-Crusted Atlantic Salmon with Garlic Romanesco Dinner Herb-Crusted Atlantic Salmon with Garlic Romanesco GL: 1"':
    - /url: "#/recipe/herb-crusted-salmon-garlic-romanesco"
    - img "Herb-Crusted Atlantic Salmon with Garlic Romanesco"
    - text: Dinner
    - heading "Herb-Crusted Atlantic Salmon with Garlic Romanesco" [level=5]
    - text: "GL: 1"
  - link "View Today's Full Schedule arrow_forward":
    - /url: "#/meal-plans"
  - search "Recipe filters":
    - text: search
    - textbox "Search recipes":
      - /placeholder: "Search recipes: low-GI breakfast, high protein..."
    - group "Meal occasion filter":
      - switch "All Meals meals" [checked]: restaurant All Meals
      - switch "Breakfast meals": egg_alt Breakfast
      - switch "Brunch meals": brunch_dining Brunch
      - switch "Lunch meals": lunch_dining Lunch
      - switch "Dinner meals": dinner_dining Dinner
      - switch "Snacks meals": cookie Snacks
      - switch "Dessert meals": cake Dessert
    - text: "sort Sort:"
    - combobox "Sort recipes by metabolic metric":
      - option "Lowest Glycemic Load (GL ↑)" [selected]
      - option "Lowest Glycemic Index (GI ↑)"
      - option "Lowest Net Carbs (NC ↑)"
      - option "Highest Fiber (g ↓)"
    - text: "expand_more speed GL Impact:"
    - switch "Low GL (Gentle (≤10))": check_circle Low GL (Gentle (≤10))
    - switch "Med GL (Mod (11–19))": info Med GL (Mod (11–19))
    - switch "High GL (Spike (≥20))": warning High GL (Spike (≥20))
    - text: "Max GL: Any"
    - slider "Filter maximum glycemic load": "30"
    - text: "restaurant_menu Dietary:"
    - switch "Vegetarian dietary filter": eco Vegetarian
    - switch "Vegan dietary filter": spa Vegan
    - switch "Nut-Free dietary filter": block Nut-Free
    - switch "Dairy-Free dietary filter": water_drop Dairy-Free
    - switch "Gluten-Free dietary filter": grain Gluten-Free
    - text: "bolt Quick:"
    - 'button "Apply preset: Ultra-Low GL (<5)"': bolt Ultra-Low GL (<5)
    - 'button "Apply preset: Under 15m Prep"': schedule Under 15m Prep
    - 'button "Apply preset: Safe Dinner Options"': verified_user Safe Dinner Options
  - heading "auto_awesome Recommended For You" [level=3]
  - text: Based on your glycemic profile
  - link "Mediterranean Spinach & Feta Egg Scramble Quick Prep schedule 12m Mediterranean Spinach & Feta Egg Scramble Farm-fresh pasture-raised eggs sautéed with tender baby spinach, kalamata olives, and rich Greek sheep milk feta. Minimal net carbs and high choline deliver gentle metabolic load and sustained morning satiety. arrow_forward":
    - /url: "#/recipe/mediterranean-spinach-feta-scramble"
    - img "Mediterranean Spinach & Feta Egg Scramble"
    - text: Quick Prep schedule 12m
    - heading "Mediterranean Spinach & Feta Egg Scramble" [level=4]
    - paragraph: Farm-fresh pasture-raised eggs sautéed with tender baby spinach, kalamata olives, and rich Greek sheep milk feta. Minimal net carbs and high choline deliver gentle metabolic load and sustained morning satiety.
    - text: arrow_forward
  - link "Golden Chia & Toasted Almond Pudding with Berries LOGI schedule 10m Golden Chia & Toasted Almond Pudding with Berries Black chia seeds steeped in unsweetened vanilla almond milk, enriched with organic Ceylon cinnamon and topped with toasted sliced almonds and fresh antioxidant-rich wild strawberries. arrow_forward":
    - /url: "#/recipe/golden-chia-toasted-almond-pudding"
    - img "Golden Chia & Toasted Almond Pudding with Berries"
    - text: LOGI schedule 10m
    - heading "Golden Chia & Toasted Almond Pudding with Berries" [level=4]
    - paragraph: Black chia seeds steeped in unsweetened vanilla almond milk, enriched with organic Ceylon cinnamon and topped with toasted sliced almonds and fresh antioxidant-rich wild strawberries.
    - text: arrow_forward
  - link "Smoked Salmon & Herbed Asparagus Frittata Keto schedule 30m Smoked Salmon & Herbed Asparagus Frittata Slow-baked pasture-raised eggs embedded with Atlantic wild salmon ribbons, roasted tender spring asparagus spears, and fresh garden dill. Rich in omega-3 polyunsaturated fatty acids. arrow_forward":
    - /url: "#/recipe/smoked-salmon-herbed-asparagus-frittata"
    - img "Smoked Salmon & Herbed Asparagus Frittata"
    - text: Keto schedule 30m
    - heading "Smoked Salmon & Herbed Asparagus Frittata" [level=4]
    - paragraph: Slow-baked pasture-raised eggs embedded with Atlantic wild salmon ribbons, roasted tender spring asparagus spears, and fresh garden dill. Rich in omega-3 polyunsaturated fatty acids.
    - text: arrow_forward
  - heading "Explore Diabetic Kitchen Recipes 31 meals" [level=3]
  - link "Low-Glycemic Green Goddess Power Salad GI 20 GL 0.9 Low GI":
    - /url: "#/recipe/low-glycemic-green-goddess-power-salad"
    - img "Low-Glycemic Green Goddess Power Salad"
    - text: GI 20 GL 0.9 Low GI
  - link "Low-Glycemic Green Goddess Power Salad Kale and pumpkin seeds supply magnesium and phytosterols, which compete with dietary cholesterol absorption in the gut. The monounsaturated fats from avocado enhance the bioavailability of fat-soluble antioxidant carotenoids.":
    - /url: "#/recipe/low-glycemic-green-goddess-power-salad"
    - heading "Low-Glycemic Green Goddess Power Salad" [level=3]
    - paragraph: Kale and pumpkin seeds supply magnesium and phytosterols, which compete with dietary cholesterol absorption in the gut. The monounsaturated fats from avocado enhance the bioavailability of fat-soluble antioxidant carotenoids.
  - text: grain
  - strong: 2.8g
  - text: Net Carbs eco
  - strong: 5.2g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Avocado Lime Green Goddess Dip with Crisp Cucumbers GI 15 GL 1.2 Low GI":
    - /url: "#/recipe/avocado-lime-green-goddess-dip"
    - img "Avocado Lime Green Goddess Dip with Crisp Cucumbers"
    - text: GI 15 GL 1.2 Low GI
  - link "Avocado Lime Green Goddess Dip with Crisp Cucumbers Whipped Hass avocado blended with fresh lime juice, whole milk Greek yogurt, cilantro, and roasted garlic, served with crisp Persian cucumber rounds and celery sticks.":
    - /url: "#/recipe/avocado-lime-green-goddess-dip"
    - heading "Avocado Lime Green Goddess Dip with Crisp Cucumbers" [level=3]
    - paragraph: Whipped Hass avocado blended with fresh lime juice, whole milk Greek yogurt, cilantro, and roasted garlic, served with crisp Persian cucumber rounds and celery sticks.
  - text: grain
  - strong: 2g
  - text: Net Carbs eco
  - strong: 5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Salmon-Stuffed Avocados with Fresh Herbs GI 15 GL 1.4 Low GI":
    - /url: "#/recipe/salmon-stuffed-avocados-with-fresh-herbs"
    - img "Salmon-Stuffed Avocados with Fresh Herbs"
    - text: GI 15 GL 1.4 Low GI
  - link "Salmon-Stuffed Avocados with Fresh Herbs Rich in marine omega-3 polyunsaturated fatty acids (EPA and DHA) and plant monounsaturated oleic acid. This lipid pairing elevates HDL, lowers circulating triglycerides, and improves cell-membrane insulin sensitivity.":
    - /url: "#/recipe/salmon-stuffed-avocados-with-fresh-herbs"
    - heading "Salmon-Stuffed Avocados with Fresh Herbs" [level=3]
    - paragraph: Rich in marine omega-3 polyunsaturated fatty acids (EPA and DHA) and plant monounsaturated oleic acid. This lipid pairing elevates HDL, lowers circulating triglycerides, and improves cell-membrane insulin sensitivity.
  - text: grain
  - strong: 2.2g
  - text: Net Carbs eco
  - strong: 6.8g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Mediterranean Spinach & Feta Egg Scramble GI 10 GL 1.5 Low GI":
    - /url: "#/recipe/mediterranean-spinach-feta-scramble"
    - img "Mediterranean Spinach & Feta Egg Scramble"
    - text: GI 10 GL 1.5 Low GI
  - link "Mediterranean Spinach & Feta Egg Scramble Farm-fresh pasture-raised eggs sautéed with tender baby spinach, kalamata olives, and rich Greek sheep milk feta. Minimal net carbs and high choline deliver gentle metabolic load and sustained morning satiety.":
    - /url: "#/recipe/mediterranean-spinach-feta-scramble"
    - heading "Mediterranean Spinach & Feta Egg Scramble" [level=3]
    - paragraph: Farm-fresh pasture-raised eggs sautéed with tender baby spinach, kalamata olives, and rich Greek sheep milk feta. Minimal net carbs and high choline deliver gentle metabolic load and sustained morning satiety.
  - text: grain
  - strong: 1.7g
  - text: Net Carbs eco
  - strong: 1.8g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Low-Glycemic Egg Salad Lettuce Wraps GI 12 GL 1.8 Low GI":
    - /url: "#/recipe/low-glycemic-egg-salad-lettuce-wraps"
    - img "Low-Glycemic Egg Salad Lettuce Wraps"
    - text: GI 12 GL 1.8 Low GI
  - link "Low-Glycemic Egg Salad Lettuce Wraps Hard-boiled pastured eggs folded with creamy avocado mayonnaise, Dijon mustard, crisp organic celery, and fresh chives, cradled in crunchy living butterhead lettuce cups.":
    - /url: "#/recipe/low-glycemic-egg-salad-lettuce-wraps"
    - heading "Low-Glycemic Egg Salad Lettuce Wraps" [level=3]
    - paragraph: Hard-boiled pastured eggs folded with creamy avocado mayonnaise, Dijon mustard, crisp organic celery, and fresh chives, cradled in crunchy living butterhead lettuce cups.
  - text: grain
  - strong: 1.8g
  - text: Net Carbs eco
  - strong: 2.4g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Herb-Crusted Atlantic Salmon with Garlic Romanesco GI 10 GL 1.9 Low GI":
    - /url: "#/recipe/herb-crusted-salmon-garlic-romanesco"
    - img "Herb-Crusted Atlantic Salmon with Garlic Romanesco"
    - text: GI 10 GL 1.9 Low GI
  - link "Herb-Crusted Atlantic Salmon with Garlic Romanesco Pan-roasted wild salmon fillet topped with a crust of chopped fresh rosemary, thyme, and lemon zest, paired with caramelized Romanesco broccoli florets roasted in extra virgin olive oil.":
    - /url: "#/recipe/herb-crusted-salmon-garlic-romanesco"
    - heading "Herb-Crusted Atlantic Salmon with Garlic Romanesco" [level=3]
    - paragraph: Pan-roasted wild salmon fillet topped with a crust of chopped fresh rosemary, thyme, and lemon zest, paired with caramelized Romanesco broccoli florets roasted in extra virgin olive oil.
  - text: grain
  - strong: 3g
  - text: Net Carbs eco
  - strong: 3.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Cantonese Steamed Sea Bass with Ginger & Scallion GI 20 GL 2.1 Low GI":
    - /url: "#/recipe/cantonese-steamed-sea-bass-with-ginger-scallion"
    - img "Cantonese Steamed Sea Bass with Ginger & Scallion"
    - text: GI 20 GL 2.1 Low GI
  - link "Cantonese Steamed Sea Bass with Ginger & Scallion Sea bass provides ultra-lean protein (34g) with minimal calories, making it ideal for aggressive fat loss protocols. Ginger and scallions contain gingerols and allicin, compounds shown to enhance peripheral insulin sensitivity and reduce vascular inflammation.":
    - /url: "#/recipe/cantonese-steamed-sea-bass-with-ginger-scallion"
    - heading "Cantonese Steamed Sea Bass with Ginger & Scallion" [level=3]
    - paragraph: Sea bass provides ultra-lean protein (34g) with minimal calories, making it ideal for aggressive fat loss protocols. Ginger and scallions contain gingerols and allicin, compounds shown to enhance peripheral insulin sensitivity and reduce vascular inflammation.
  - text: grain
  - strong: 2.2g
  - text: Net Carbs eco
  - strong: 1.8g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Smoked Salmon & Herbed Asparagus Frittata GI 12 GL 2.1 Low GI":
    - /url: "#/recipe/smoked-salmon-herbed-asparagus-frittata"
    - img "Smoked Salmon & Herbed Asparagus Frittata"
    - text: GI 12 GL 2.1 Low GI
  - link "Smoked Salmon & Herbed Asparagus Frittata Slow-baked pasture-raised eggs embedded with Atlantic wild salmon ribbons, roasted tender spring asparagus spears, and fresh garden dill. Rich in omega-3 polyunsaturated fatty acids.":
    - /url: "#/recipe/smoked-salmon-herbed-asparagus-frittata"
    - heading "Smoked Salmon & Herbed Asparagus Frittata" [level=3]
    - paragraph: Slow-baked pasture-raised eggs embedded with Atlantic wild salmon ribbons, roasted tender spring asparagus spears, and fresh garden dill. Rich in omega-3 polyunsaturated fatty acids.
  - text: grain
  - strong: 2.6g
  - text: Net Carbs eco
  - strong: 2.2g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Dark Cocoa & Almond Keto Mousse GI 18 GL 2.4 Low GI":
    - /url: "#/recipe/dark-cocoa-almond-keto-mousse"
    - img "Dark Cocoa & Almond Keto Mousse"
    - text: GI 18 GL 2.4 Low GI
  - link "Dark Cocoa & Almond Keto Mousse Decadent 85% Valrhona Dutch cocoa blended with rich coconut cream, almond butter, pure vanilla, and granulated erythritol/monkfruit. Zero spike risk dessert with luxurious mouthfeel.":
    - /url: "#/recipe/dark-cocoa-almond-keto-mousse"
    - heading "Dark Cocoa & Almond Keto Mousse" [level=3]
    - paragraph: Decadent 85% Valrhona Dutch cocoa blended with rich coconut cream, almond butter, pure vanilla, and granulated erythritol/monkfruit. Zero spike risk dessert with luxurious mouthfeel.
  - text: grain
  - strong: 3g
  - text: Net Carbs eco
  - strong: 6g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Vietnamese Chicken & Vegetable Noodle Bowl GI 25 GL 2.4 Low GI":
    - /url: "#/recipe/vietnamese-chicken-vegetable-noodle-bowl"
    - img "Vietnamese Chicken & Vegetable Noodle Bowl"
    - text: GI 25 GL 2.4 Low GI
  - link "Vietnamese Chicken & Vegetable Noodle Bowl Shirataki noodles are composed of glucomannan, a viscous water-soluble fiber with zero digestible carbohydrates. Glucomannan slows carbohydrate breakdown and traps dietary cholesterol, aiding excretion.":
    - /url: "#/recipe/vietnamese-chicken-vegetable-noodle-bowl"
    - heading "Vietnamese Chicken & Vegetable Noodle Bowl" [level=3]
    - paragraph: Shirataki noodles are composed of glucomannan, a viscous water-soluble fiber with zero digestible carbohydrates. Glucomannan slows carbohydrate breakdown and traps dietary cholesterol, aiding excretion.
  - text: grain
  - strong: 3.5g
  - text: Net Carbs eco
  - strong: 4.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Golden Chia & Toasted Almond Pudding with Berries GI 20 GL 3.2 Low GI":
    - /url: "#/recipe/golden-chia-toasted-almond-pudding"
    - img "Golden Chia & Toasted Almond Pudding with Berries"
    - text: GI 20 GL 3.2 Low GI
  - link "Golden Chia & Toasted Almond Pudding with Berries Black chia seeds steeped in unsweetened vanilla almond milk, enriched with organic Ceylon cinnamon and topped with toasted sliced almonds and fresh antioxidant-rich wild strawberries.":
    - /url: "#/recipe/golden-chia-toasted-almond-pudding"
    - heading "Golden Chia & Toasted Almond Pudding with Berries" [level=3]
    - paragraph: Black chia seeds steeped in unsweetened vanilla almond milk, enriched with organic Ceylon cinnamon and topped with toasted sliced almonds and fresh antioxidant-rich wild strawberries.
  - text: grain
  - strong: 6g
  - text: Net Carbs eco
  - strong: 12g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Niçoise Salad with Tuna & Soft-Boiled Eggs GI 25 GL 3.3 Low GI":
    - /url: "#/recipe/nicoise-salad-with-tuna-soft-boiled-eggs"
    - img "Niçoise Salad with Tuna & Soft-Boiled Eggs"
    - text: GI 25 GL 3.3 Low GI
  - link "Niçoise Salad with Tuna & Soft-Boiled Eggs Removing traditional boiled potatoes eliminates the primary glycemic spike of classical French Niçoise. Extra virgin olive oil provides oleocanthal and polyphenols that protect LDL particles against oxidation.":
    - /url: "#/recipe/nicoise-salad-with-tuna-soft-boiled-eggs"
    - heading "Niçoise Salad with Tuna & Soft-Boiled Eggs" [level=3]
    - paragraph: Removing traditional boiled potatoes eliminates the primary glycemic spike of classical French Niçoise. Extra virgin olive oil provides oleocanthal and polyphenols that protect LDL particles against oxidation.
  - text: grain
  - strong: 5.8g
  - text: Net Carbs eco
  - strong: 4.2g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Thai Chili-Lime Tofu & Broccoli Stir-Fry GI 25 GL 3.6 Low GI":
    - /url: "#/recipe/thai-chili-lime-tofu-broccoli-stir-fry"
    - img "Thai Chili-Lime Tofu & Broccoli Stir-Fry"
    - text: GI 25 GL 3.6 Low GI
  - link "Thai Chili-Lime Tofu & Broccoli Stir-Fry Soy isoflavones and plant proteins lower serum total cholesterol and LDL. Broccoli delivers sulforaphane, a bioactive isothiocyanate with proven anti-inflammatory and glucose-stabilizing properties.":
    - /url: "#/recipe/thai-chili-lime-tofu-broccoli-stir-fry"
    - heading "Thai Chili-Lime Tofu & Broccoli Stir-Fry" [level=3]
    - paragraph: Soy isoflavones and plant proteins lower serum total cholesterol and LDL. Broccoli delivers sulforaphane, a bioactive isothiocyanate with proven anti-inflammatory and glucose-stabilizing properties.
  - text: grain
  - strong: 6g
  - text: Net Carbs eco
  - strong: 5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Low-Glycemic Tuna Avocado Power Slaw GI 22 GL 4.3 Low GI":
    - /url: "#/recipe/low-glycemic-tuna-avocado-power-slaw"
    - img "Low-Glycemic Tuna Avocado Power Slaw"
    - text: GI 22 GL 4.3 Low GI
  - link "Low-Glycemic Tuna Avocado Power Slaw Cruciferous cabbage provides insoluble bulk that prolongs fullness, while the monounsaturated fats from avocado and lean marine proteins maintain stable postprandial blood sugar.":
    - /url: "#/recipe/low-glycemic-tuna-avocado-power-slaw"
    - heading "Low-Glycemic Tuna Avocado Power Slaw" [level=3]
    - paragraph: Cruciferous cabbage provides insoluble bulk that prolongs fullness, while the monounsaturated fats from avocado and lean marine proteins maintain stable postprandial blood sugar.
  - text: grain
  - strong: 5g
  - text: Net Carbs eco
  - strong: 6g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Shirataki Noodle Stir-Fry with Chicken & Veggies GI 28 GL 5 Low GI":
    - /url: "#/recipe/shirataki-noodle-stir-fry-with-chicken-veggies"
    - img "Shirataki Noodle Stir-Fry with Chicken & Veggies"
    - text: GI 28 GL 5 Low GI
  - link "Shirataki Noodle Stir-Fry with Chicken & Veggies The combination of beta-glucans in cremini mushrooms and glucomannan in shirataki creates a powerful dual-fiber barrier that blunts carbohydrate absorption and aids bile acid binding.":
    - /url: "#/recipe/shirataki-noodle-stir-fry-with-chicken-veggies"
    - heading "Shirataki Noodle Stir-Fry with Chicken & Veggies" [level=3]
    - paragraph: The combination of beta-glucans in cremini mushrooms and glucomannan in shirataki creates a powerful dual-fiber barrier that blunts carbohydrate absorption and aids bile acid binding.
  - text: grain
  - strong: 5.5g
  - text: Net Carbs eco
  - strong: 6.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Low-GI Coronation Chicken Salad GI 30 GL 5.8 Low GI":
    - /url: "#/recipe/low-gi-coronation-chicken-salad"
    - img "Low-GI Coronation Chicken Salad"
    - text: GI 30 GL 5.8 Low GI
  - link "Low-GI Coronation Chicken Salad Turmeric's active compound curcumin improves glycemic markers and insulin receptor activity, while almond fats provide monounsaturated lipid protection.":
    - /url: "#/recipe/low-gi-coronation-chicken-salad"
    - heading "Low-GI Coronation Chicken Salad" [level=3]
    - paragraph: Turmeric's active compound curcumin improves glycemic markers and insulin receptor activity, while almond fats provide monounsaturated lipid protection.
  - text: grain
  - strong: 6.2g
  - text: Net Carbs eco
  - strong: 2.8g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Smashed White Bean Skillet with Cherry Tomatoes & Feta GI 32 GL 6.1 Low GI":
    - /url: "#/recipe/smashed-white-bean-skillet-with-cherry-tomatoes-feta"
    - img "Smashed White Bean Skillet with Cherry Tomatoes & Feta"
    - text: GI 32 GL 6.1 Low GI
  - link "Smashed White Bean Skillet with Cherry Tomatoes & Feta Cannellini beans are rich in soluble resistant starch and alpha-amylase inhibitors (phaseolamin) which slow the conversion of complex carbohydrates into blood glucose. High soluble fiber binds LDL cholesterol.":
    - /url: "#/recipe/smashed-white-bean-skillet-with-cherry-tomatoes-feta"
    - heading "Smashed White Bean Skillet with Cherry Tomatoes & Feta" [level=3]
    - paragraph: Cannellini beans are rich in soluble resistant starch and alpha-amylase inhibitors (phaseolamin) which slow the conversion of complex carbohydrates into blood glucose. High soluble fiber binds LDL cholesterol.
  - text: grain
  - strong: 15.5g
  - text: Net Carbs eco
  - strong: 8.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Tuna & White Bean Salad with Spring Asparagus GI 30 GL 6.4 Low GI":
    - /url: "#/recipe/tuna-white-bean-salad-with-spring-asparagus"
    - img "Tuna & White Bean Salad with Spring Asparagus"
    - text: GI 30 GL 6.4 Low GI
  - link "Tuna & White Bean Salad with Spring Asparagus Asparagus contains prebiotic inulin fiber, which fuels beneficial gut microbiota to produce short-chain fatty acids (SCFAs), improving systemic insulin sensitivity and hepatic lipid handling.":
    - /url: "#/recipe/tuna-white-bean-salad-with-spring-asparagus"
    - heading "Tuna & White Bean Salad with Spring Asparagus" [level=3]
    - paragraph: Asparagus contains prebiotic inulin fiber, which fuels beneficial gut microbiota to produce short-chain fatty acids (SCFAs), improving systemic insulin sensitivity and hepatic lipid handling.
  - text: grain
  - strong: 14.8g
  - text: Net Carbs eco
  - strong: 7.2g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Low-GI Frikadeller with Cucumber-Dill Salad GI 35 GL 7 Low GI":
    - /url: "#/recipe/low-gi-frikadeller-with-cucumber-dill-salad"
    - img "Low-GI Frikadeller with Cucumber-Dill Salad"
    - text: GI 35 GL 7 Low GI
  - link "Low-GI Frikadeller with Cucumber-Dill Salad Traditional Danish Frikadeller use white flour and soaked white bread; replacing them with rolled oats introduces beta-glucan soluble fiber. The acetic acid in the cucumber salad actively blunts postprandial glucose absorption.":
    - /url: "#/recipe/low-gi-frikadeller-with-cucumber-dill-salad"
    - heading "Low-GI Frikadeller with Cucumber-Dill Salad" [level=3]
    - paragraph: Traditional Danish Frikadeller use white flour and soaked white bread; replacing them with rolled oats introduces beta-glucan soluble fiber. The acetic acid in the cucumber salad actively blunts postprandial glucose absorption.
  - text: grain
  - strong: 11.5g
  - text: Net Carbs eco
  - strong: 3.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Low-GI Chili con Carne with Two-Bean Base GI 35 GL 10.5 Low GI":
    - /url: "#/recipe/low-gi-chili-con-carne-with-two-bean-base"
    - img "Low-GI Chili con Carne with Two-Bean Base"
    - text: GI 35 GL 10.5 Low GI
  - link "Low-GI Chili con Carne with Two-Bean Base Omitting white rice and utilizing a two-bean foundation provides 10.5g of dietary fiber. The high proportion of resistant starch creates a low glycemic excursion and fuels colonic SCFA production.":
    - /url: "#/recipe/low-gi-chili-con-carne-with-two-bean-base"
    - heading "Low-GI Chili con Carne with Two-Bean Base" [level=3]
    - paragraph: Omitting white rice and utilizing a two-bean foundation provides 10.5g of dietary fiber. The high proportion of resistant starch creates a low glycemic excursion and fuels colonic SCFA production.
  - text: grain
  - strong: 19.5g
  - text: Net Carbs eco
  - strong: 10.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Smoked Paprika Chickpea Bowl with Spinach & Feta GI 33 GL 10.6 Low GI":
    - /url: "#/recipe/smoked-paprika-chickpea-bowl-with-spinach-feta"
    - img "Smoked Paprika Chickpea Bowl with Spinach & Feta"
    - text: GI 33 GL 10.6 Low GI
  - link "Smoked Paprika Chickpea Bowl with Spinach & Feta Chickpeas boast an exceptionally low GI (~33) due to dense legume protein and soluble fiber walls. The nearly 10g of fiber contributes directly to the entrapment and clearance of circulating LDL cholesterol.":
    - /url: "#/recipe/smoked-paprika-chickpea-bowl-with-spinach-feta"
    - heading "Smoked Paprika Chickpea Bowl with Spinach & Feta" [level=3]
    - paragraph: Chickpeas boast an exceptionally low GI (~33) due to dense legume protein and soluble fiber walls. The nearly 10g of fiber contributes directly to the entrapment and clearance of circulating LDL cholesterol.
  - text: grain
  - strong: 24.2g
  - text: Net Carbs eco
  - strong: 9.8g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Bulgogi Beef Lettuce Wraps GI 36 GL 11 Low GI":
    - /url: "#/recipe/bulgogi-beef-lettuce-wraps"
    - img "Bulgogi Beef Lettuce Wraps"
    - text: GI 36 GL 11 Low GI
  - link "Bulgogi Beef Lettuce Wraps Replacing cane sugar and corn syrup with minimal grated fresh pear and allulose delivers authentic Korean bulgogi flavors without glycemic volatility. Kimchi provides live lactobacilli that modulate gut inflammation.":
    - /url: "#/recipe/bulgogi-beef-lettuce-wraps"
    - heading "Bulgogi Beef Lettuce Wraps" [level=3]
    - paragraph: Replacing cane sugar and corn syrup with minimal grated fresh pear and allulose delivers authentic Korean bulgogi flavors without glycemic volatility. Kimchi provides live lactobacilli that modulate gut inflammation.
  - text: grain
  - strong: 11g
  - text: Net Carbs eco
  - strong: 3g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Spiced Crunchy Roasted Chickpeas GI 32 GL 11.2 Med GL":
    - /url: "#/recipe/spiced-crunchy-roasted-chickpeas"
    - img "Spiced Crunchy Roasted Chickpeas"
    - text: GI 32 GL 11.2 Med GL
  - link "Spiced Crunchy Roasted Chickpeas Organic chickpeas tossed with smoked Spanish paprika, ground cumin, turmeric, and cold-pressed olive oil, slow-roasted to golden crunchiness. Rich in resistant starch and prebiotic legume fiber.":
    - /url: "#/recipe/spiced-crunchy-roasted-chickpeas"
    - heading "Spiced Crunchy Roasted Chickpeas" [level=3]
    - paragraph: Organic chickpeas tossed with smoked Spanish paprika, ground cumin, turmeric, and cold-pressed olive oil, slow-roasted to golden crunchiness. Rich in resistant starch and prebiotic legume fiber.
  - text: grain
  - strong: 22.5g
  - text: Net Carbs eco
  - strong: 8.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Italian Farro Salad with Cherry Tomatoes, Basil & Feta GI 40 GL 11.4 Low GI":
    - /url: "#/recipe/italian-farro-salad-with-cherry-tomatoes-basil-feta"
    - img "Italian Farro Salad with Cherry Tomatoes, Basil & Feta"
    - text: GI 40 GL 11.4 Low GI
  - link "Italian Farro Salad with Cherry Tomatoes, Basil & Feta Farro is an ancient wheat grain with an intact bran coat and low GI (~40). Its dense amylose starch matrix requires prolonged enzymatic breakdown, sustaining satiety without sharp glucose spikes.":
    - /url: "#/recipe/italian-farro-salad-with-cherry-tomatoes-basil-feta"
    - heading "Italian Farro Salad with Cherry Tomatoes, Basil & Feta" [level=3]
    - paragraph: Farro is an ancient wheat grain with an intact bran coat and low GI (~40). Its dense amylose starch matrix requires prolonged enzymatic breakdown, sustaining satiety without sharp glucose spikes.
  - text: grain
  - strong: 28g
  - text: Net Carbs eco
  - strong: 7g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Mediterranean Rainbow Tuna Salad with Mustard Dressing GI 34 GL 11.5 Low GI":
    - /url: "#/recipe/mediterranean-rainbow-tuna-salad-with-mustard-dressing"
    - img "Mediterranean Rainbow Tuna Salad with Mustard Dressing"
    - text: GI 34 GL 11.5 Low GI
  - link "Mediterranean Rainbow Tuna Salad with Mustard Dressing Bell peppers provide abundant vitamin C and luteolin, reducing systemic oxidative stress and preventing vascular LDL particle glycation.":
    - /url: "#/recipe/mediterranean-rainbow-tuna-salad-with-mustard-dressing"
    - heading "Mediterranean Rainbow Tuna Salad with Mustard Dressing" [level=3]
    - paragraph: Bell peppers provide abundant vitamin C and luteolin, reducing systemic oxidative stress and preventing vascular LDL particle glycation.
  - text: grain
  - strong: 10.5g
  - text: Net Carbs eco
  - strong: 5.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Almond Ricotta Pancakes with Blackberry Compote GI 28 GL 12.4 Med GL":
    - /url: "#/recipe/almond-ricotta-fluffy-pancakes"
    - img "Almond Ricotta Pancakes with Blackberry Compote"
    - text: GI 28 GL 12.4 Med GL
  - link "Almond Ricotta Pancakes with Blackberry Compote Fluffy low-glycemic brunch pancakes formulated with superfine almond flour, whole milk ricotta, and pure vanilla bean. Served with warm, zero-sugar reduced wild blackberry compote.":
    - /url: "#/recipe/almond-ricotta-fluffy-pancakes"
    - heading "Almond Ricotta Pancakes with Blackberry Compote" [level=3]
    - paragraph: Fluffy low-glycemic brunch pancakes formulated with superfine almond flour, whole milk ricotta, and pure vanilla bean. Served with warm, zero-sugar reduced wild blackberry compote.
  - text: grain
  - strong: 11.2g
  - text: Net Carbs eco
  - strong: 7g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Low-Glycemic Chicken Burrito Bowl Meal Prep GI 38 GL 13.3 Low GI":
    - /url: "#/recipe/low-glycemic-chicken-burrito-bowl-meal-prep"
    - img "Low-Glycemic Chicken Burrito Bowl Meal Prep"
    - text: GI 38 GL 13.3 Low GI
  - link "Low-Glycemic Chicken Burrito Bowl Meal Prep Using portion-controlled brown basmati rice paired with high-fiber black beans maintains a moderate GL (13.3). Greek yogurt and lean chicken breast drive a high 38g protein load, promoting GLP-1 secretion.":
    - /url: "#/recipe/low-glycemic-chicken-burrito-bowl-meal-prep"
    - heading "Low-Glycemic Chicken Burrito Bowl Meal Prep" [level=3]
    - paragraph: Using portion-controlled brown basmati rice paired with high-fiber black beans maintains a moderate GL (13.3). Greek yogurt and lean chicken breast drive a high 38g protein load, promoting GLP-1 secretion.
  - text: grain
  - strong: 27.5g
  - text: Net Carbs eco
  - strong: 8.5g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Warm Blackberry Crumble with Coconut Crust GI 30 GL 13.5 Med GL":
    - /url: "#/recipe/warm-berry-crumble-coconut-crust"
    - img "Warm Blackberry Crumble with Coconut Crust"
    - text: GI 30 GL 13.5 Med GL
  - link "Warm Blackberry Crumble with Coconut Crust Sweet-tart wild blackberries baked under a golden crisp crumble of organic coconut flour, almond meal, and grass-fed butter. Zero refined sugars, sustained fiber release.":
    - /url: "#/recipe/warm-berry-crumble-coconut-crust"
    - heading "Warm Blackberry Crumble with Coconut Crust" [level=3]
    - paragraph: Sweet-tart wild blackberries baked under a golden crisp crumble of organic coconut flour, almond meal, and grass-fed butter. Zero refined sugars, sustained fiber release.
  - text: grain
  - strong: 14g
  - text: Net Carbs eco
  - strong: 10g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Chana Masala with Cucumber Raita GI 35 GL 15.3 Low GI":
    - /url: "#/recipe/chana-masala-with-cucumber-raita"
    - img "Chana Masala with Cucumber Raita"
    - text: GI 35 GL 15.3 Low GI
  - link "Chana Masala with Cucumber Raita The substantial 11.2g fiber content creates a slow, sustained digestive breakdown. The lactic acid and protein from the yogurt raita further blunt postprandial glycemic excursions.":
    - /url: "#/recipe/chana-masala-with-cucumber-raita"
    - heading "Chana Masala with Cucumber Raita" [level=3]
    - paragraph: The substantial 11.2g fiber content creates a slow, sustained digestive breakdown. The lactic acid and protein from the yogurt raita further blunt postprandial glycemic excursions.
  - text: grain
  - strong: 33.8g
  - text: Net Carbs eco
  - strong: 11.2g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Braised Beef Short Ribs with Mashed Potato Base GI 78 GL 22 High GL":
    - /url: "#/recipe/braised-beef-short-ribs-mashed-pairing"
    - img "Braised Beef Short Ribs with Mashed Potato Base"
    - text: GI 78 GL 22 High GL
  - 'link "Braised Beef Short Ribs with Mashed Potato Base Fork-tender slow-braised beef short ribs in a rich rosemary red wine reduction over buttery mashed russet potatoes. Smart Swap available: replace high-GI mashed potatoes with Pureed Cauliflower & Roasted Garlic to drop GL from 22 to 2.8."':
    - /url: "#/recipe/braised-beef-short-ribs-mashed-pairing"
    - heading "Braised Beef Short Ribs with Mashed Potato Base" [level=3]
    - paragraph: "Fork-tender slow-braised beef short ribs in a rich rosemary red wine reduction over buttery mashed russet potatoes. Smart Swap available: replace high-GI mashed potatoes with Pureed Cauliflower & Roasted Garlic to drop GL from 22 to 2.8."
  - text: grain
  - strong: 24g
  - text: Net Carbs eco
  - strong: 2g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle
  - link "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled) GI 82 GL 25 High GL":
    - /url: "#/recipe/sesame-ginger-chicken-rice-bowl"
    - img "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled)"
    - text: GI 82 GL 25 High GL
  - link "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled) Tender sliced chicken breast sautéed in cold-pressed sesame oil, fresh ginger root, and tamari over Jasmine white rice. Utilize 1-click Smart Swap to replace rice with steamed Cauliflower Pearl Rice to reduce GL by 92%.":
    - /url: "#/recipe/sesame-ginger-chicken-rice-bowl"
    - heading "Sesame Ginger Chicken & Rice Bowl (Smart Swap Enabled)" [level=3]
    - paragraph: Tender sliced chicken breast sautéed in cold-pressed sesame oil, fresh ginger root, and tamari over Jasmine white rice. Utilize 1-click Smart Swap to replace rice with steamed Cauliflower Pearl Rice to reduce GL by 92%.
  - text: grain
  - strong: 55.8g
  - text: Net Carbs eco
  - strong: 2.2g
  - text: Fiber
  - button "Add to Meal Plan": calendar_add_on + Meal Plan
  - button "Add to favorites": favorite
  - text: GL 0 � Gentle add
  - paragraph: Request a Custom Recipe
  - paragraph: Have a meal in mind? Ask our AI assistant to compile a low-GI version.
```

# Test source

```ts
  1   | ﻿import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Clinical Metabolic End-to-End User Journeys', () => {
  4   | 
  5   |   test('Single-Recipe GI/GL Rendering and Secondary Macro Expansion', async ({ page }) => {
  6   |     // 1. Inject backend-truth auth session via JWT
  7   |     await page.addInitScript(() => {
  8   |       window.localStorage.setItem('glyco_jwt', 'valid-test-jwt');
  9   |     });
  10  | 
  11  |     // 2. Mock /api/users/me response matching backend-truth AuthContext
  12  |     await page.route('**/api/users/me*', async route => {
  13  |       await route.fulfill({
  14  |         status: 200,
  15  |         contentType: 'application/json',
  16  |         body: JSON.stringify({
  17  |           id: 1,
  18  |           username: 'testuser',
  19  |           email: 'test@example.com',
  20  |           roleType: 'user',
  21  |           isApproved: true,
  22  |           onboarded: true,
  23  |         }),
  24  |       });
  25  |     });
  26  | 
  27  |     // 3. Mock network response for recipe 1
  28  |     await page.route('**/api/recipes/1*', async route => {
  29  |       await route.fulfill({
  30  |         status: 200,
  31  |         contentType: 'application/json',
  32  |         body: JSON.stringify({
  33  |           data: {
  34  |             id: 1,
  35  |             documentId: 'doc1',
  36  |             title: 'Testing GL rendering',
  37  |             servings: 1,
  38  |             status: 'published',
  39  |             publishedAt: '2026-01-01T00:00:00Z',
  40  |             ingredients: [
  41  |               {
  42  |                 id: 10,
  43  |                 amount: 100,
  44  |                 unit: 'g',
  45  |                 ingredient: {
  46  |                   id: 99,
  47  |                   name: 'Test Carb',
  48  |                   defaultPrepState: 'raw',
  49  |                   nutrition: {
  50  |                     defaultAmount: 100,
  51  |                     carbs: 50,
  52  |                     fiber: 0,
  53  |                     protein: 0,
  54  |                     fat: 0,
  55  |                     kcal: 200,
  56  |                     glycemicIndex: 50
  57  |                   }
  58  |                 }
  59  |               }
  60  |             ]
  61  |           }
  62  |         })
  63  |       });
  64  |     });
  65  | 
  66  |     // 4. Visit Recipe details
  67  |     await page.goto('/recipe/1');
  68  | 
  69  |     // 5. Verify GL and GI anchor badges are rendered (using text-based locators)
  70  |     await expect(page.getByText('GL 25')).toBeVisible({ timeout: 15000 });
> 71  |     await expect(page.getByText('GI 50')).toBeVisible();
      |                                           ^ Error: expect(locator).toBeVisible() failed
  72  | 
  73  |     // 6. Verify Secondary Macros are visible by default (using role-based locator)
  74  |     const detailsAccordion = page.getByRole('group', { name: /secondary macronutrient breakdown/i });
  75  |     await expect(detailsAccordion).toBeVisible();
  76  |     await expect(detailsAccordion).toHaveAttribute('open', '');
  77  |     
  78  |     // Check calories badge is inside
  79  |     await expect(page.getByText('Calories').first()).toBeVisible();
  80  |   });
  81  | 
  82  |   test('Persona A (Type 1 Manager): Filter by Low GL and execute Smart Low-GI Swap', async ({ page }) => {
  83  |     page.on('pageerror', err => console.log(`[PAGE ERROR]: ${err.message}`));
  84  |     page.on('console', msg => console.log(`[CONSOLE]: ${msg.text()}`));
  85  | 
  86  |     // 1. Inject Authenticated Patient Session
  87  |     await page.addInitScript(() => {
  88  |       const standardUser = {
  89  |         id: 'demo_user',
  90  |         name: 'Demo User',
  91  |         email: 'demo@glyco.com',
  92  |         roleType: 'admin',
  93  |         isApproved: true,
  94  |         onboarded: true,
  95  |       };
  96  |       localStorage.setItem('glyco_session', JSON.stringify(standardUser));
  97  |       const users = { 'demo@glyco.com': standardUser };
  98  |       localStorage.setItem('glyco_users', JSON.stringify(users));
  99  |     });
  100 | 
  101 |     // 2. Navigate to Catalog
  102 |     await page.goto('/#/');
  103 |     await page.waitForLoadState('networkidle');
  104 | 
  105 |     // 3. Open first recipe card from the catalog
  106 |     const recipeLink = page.locator('[data-testid="recipe-card"] a').first();
  107 |     await expect(recipeLink).toBeVisible({ timeout: 15000 });
  108 |     await recipeLink.click();
  109 | 
  110 |     // 4. Verify Recipe Detail view loaded and GL badge is visible
  111 |     await expect(page).toHaveURL(/#\/recipe\//);
  112 |     const glBadge = page.locator('[data-testid="recipe-gl-badge"]').first();
  113 |     await expect(glBadge).toBeVisible({ timeout: 15000 });
  114 | 
  115 |     // 5. Test Smart Low-GI Swap Trigger if present
  116 |     const swapTrigger = page.locator('[data-testid="btn-smart-swap-white-rice"], button:has-text("Swap")').first();
  117 |     if (await swapTrigger.isVisible()) {
  118 |       await swapTrigger.click();
  119 | 
  120 |       // Check for substitution modal
  121 |       const subModal = page.locator('[role="dialog"]');
  122 |       if (await subModal.isVisible()) {
  123 |         const swapApplyButton = subModal.locator('button', { hasText: /Swap|Apply/i });
  124 |         await swapApplyButton.click();
  125 |         await expect(subModal).not.toBeVisible();
  126 |       }
  127 | 
  128 |       await expect(glBadge).toHaveClass(/voice-pulse/);
  129 |     }
  130 |   });
  131 | 
  132 |   test('Persona C (Dietitian Audit): Detect macro discrepancies > 1.0g and Sync to USDA Truth', async ({ page }) => {
  133 |     // 1. Inject Dietitian / Admin Session with full permissions
  134 |     await page.addInitScript(() => {
  135 |       const dietitianUser = {
  136 |         id: 'demo_user',
  137 |         name: 'Demo Dietitian Admin',
  138 |         email: 'demo@glyco.com',
  139 |         roleType: 'admin',
  140 |         isApproved: true,
  141 |         onboarded: true,
  142 |       };
  143 |       localStorage.setItem('glyco_session', JSON.stringify(dietitianUser));
  144 |       const users = {
  145 |         'demo@glyco.com': dietitianUser,
  146 |       };
  147 |       localStorage.setItem('glyco_users', JSON.stringify(users));
  148 |     });
  149 | 
  150 |     // 2. Navigate to Admin Audit Queue via HashRouter path
  151 |     await page.goto('/#/admin/audit-queue');
  152 |     await page.waitForLoadState('networkidle');
  153 |     await expect(page.locator('h2, h1').locator('visible=true').first()).toBeVisible();
  154 | 
  155 |     // 3. Assert Discrepancy indicator and execute Overwrite / Sync
  156 |     const discrepancyBadge = page.locator('span:has-text("Discrepancy"), span:has-text("1.0")').first();
  157 |     if (await discrepancyBadge.isVisible()) {
  158 |       const syncButton = page.locator('button:has-text("Overwrite with Ground Truth"), button:has-text("Sync")').first();
  159 |       await syncButton.click();
  160 |       await expect(discrepancyBadge).not.toBeVisible();
  161 |     }
  162 | 
  163 |     // 4. Assert Approve & Publish Action
  164 |     const approveButton = page.locator('button:has-text("Approve"), button:has-text("Publish")').first();
  165 |     if (await approveButton.isVisible()) {
  166 |       await approveButton.click();
  167 |     }
  168 |   });
  169 | 
  170 |   test('RBAC Security Gate: Unapproved user is intercepted and redirected to /pending-approval', async ({ page }) => {
  171 |     // 1. Inject unapproved user (isApproved = false) into local session
```