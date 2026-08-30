import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import HeroMediaCard from '../components/recipe/HeroMediaCard';
import GlycemicSnapshot from '../components/recipe/GlycemicSnapshot';
import NutritionFactsPanel from '../components/recipe/NutritionFactsPanel';
import SmartSwapsModule from '../components/recipe/SmartSwapsModule';
import RecipeHeaderMeta from '../components/recipe/RecipeHeaderMeta';
import IngredientsMatrix from '../components/recipe/IngredientsMatrix';
import InstructionTimeline from '../components/recipe/InstructionTimeline';
import RelatedRecipesGrid from '../components/recipe/RelatedRecipesGrid';

/**
 * RecipeDetails - Clinical recipe detail page conforming to Phase 3 MagicPath tokens and Framer Motion micro-interactions.
 */
const RecipeDetails = () => {
  const { id } = useParams();
  const [servings, setServings] = useState(2);
  const [activeSwaps, setActiveSwaps] = useState({});

  // Base raw recipe ingredients (for 2 servings)
  const baseIngredients = [
    { id: 'ing-1', name: 'Broccoli Florets (Fresh)', gi: 15, prepState: 'Steamed', prepMultiplier: '1.02', baseAmount: 150, unit: 'g', baseNC: 6, kcal: 50, fat: 0.5, fiber: 4, protein: 4 },
    { id: 'ing-2', name: 'Wild Atlantic Salmon', gi: 0, prepState: 'Roasted', prepMultiplier: '1.15', baseAmount: 180, unit: 'g', baseNC: 0, kcal: 280, fat: 12, fiber: 0, protein: 34 },
    { id: 'ing-3', name: 'Edamame Beans (Shelled)', gi: 18, prepState: 'Boiled', prepMultiplier: '1.20', baseAmount: 80, unit: 'g', baseNC: 4, kcal: 95, fat: 4, fiber: 4, protein: 9 },
    { id: 'ing-4', name: 'Extra Virgin Olive Oil', gi: 0, prepState: 'Raw', prepMultiplier: '1.00', baseAmount: 20, unit: 'ml', baseNC: 0, kcal: 160, fat: 18, fiber: 0, protein: 0 },
    { id: 'ing-5', name: 'Avocado (Hass)', gi: 10, prepState: 'Raw', prepMultiplier: '1.00', baseAmount: 75, unit: 'g', baseNC: 2, kcal: 120, fat: 11, fiber: 5, protein: 1.5 },
  ];

  // Smart swap substitution rules
  const availableSwaps = [
    {
      id: 'swap-edamame-lupini',
      sourceName: 'Edamame (shelled)',
      sourceGL: '1.2',
      targetName: 'Lupini Beans',
      deltaGL: '-0.6 GL',
      replacement: { id: 'ing-3-sub', name: 'Lupini Beans', gi: 10, prepState: 'Boiled', prepMultiplier: '1.00', baseAmount: 80, unit: 'g', baseNC: 1.5, kcal: 90, fat: 2, fiber: 6, protein: 12 },
    },
  ];

  // Compute active ingredients based on applied swaps & serving multiplier
  const scale = servings / 2;
  const currentIngredients = baseIngredients.map((ing) => {
    if (ing.id === 'ing-3' && activeSwaps['swap-edamame-lupini']) {
      const sub = availableSwaps[0].replacement;
      return {
        ...sub,
        amount: sub.baseAmount * scale,
        netCarbs: sub.baseNC * scale,
      };
    }
    return {
      ...ing,
      amount: ing.baseAmount * scale,
      netCarbs: ing.baseNC * scale,
    };
  });

  // Calculate dynamic nutritional rollups
  const totalNetCarbs = currentIngredients.reduce((sum, ing) => sum + ing.netCarbs, 0);
  const netCarbsPerServing = Math.max(1, Math.round((totalNetCarbs / servings) * 10) / 10);
  
  // Composite GI: Weighted average
  const weightedGIProduct = currentIngredients.reduce((sum, ing) => sum + (ing.gi * ing.netCarbs), 0);
  const compositeGI = totalNetCarbs > 0 ? Math.round(weightedGIProduct / totalNetCarbs) : 20;

  // Recipe Glycemic Load per Serving: round((GI * NC_per_serving) / 100)
  const glycemicLoad = Math.max(1, Math.round((compositeGI * netCarbsPerServing) / 100));

  const totalKcal = currentIngredients.reduce((sum, ing) => sum + (ing.kcal * scale), 0) / servings;
  const totalFat = currentIngredients.reduce((sum, ing) => sum + (ing.fat * scale), 0) / servings;
  const totalFiber = currentIngredients.reduce((sum, ing) => sum + (ing.fiber * scale), 0) / servings;
  const totalProtein = currentIngredients.reduce((sum, ing) => sum + (ing.protein * scale), 0) / servings;

  const dynamicNutrition = {
    glycemicIndex: compositeGI,
    glycemicLoad,
    netCarbs: netCarbsPerServing,
    kcal: Math.round(totalKcal),
    fat: Math.round(totalFat),
    fiber: Math.round(totalFiber),
    protein: Math.round(totalProtein),
  };

  const handleApplySwap = (swapId, isApplied) => {
    setActiveSwaps((prev) => ({
      ...prev,
      [swapId]: isApplied,
    }));
  };

  const handleAddToPlan = () => {
    alert('Recipe added to your active 7-Day Meal Plan!');
  };

  const recipeMeta = {
    id: id || 'rec-power-salad',
    title: 'Low-Glycemic Green Goddess Power Salad',
    description: 'A nutrient-dense, clinical-grade salad optimized for steady postprandial blood glucose, featuring fiber-matrix preservation and raw cold-pressed lipids.',
    image: '/recipe_detail_desktop.png',
    prepTime: '25 min',
    tags: ['Lunch', 'Mediterranean', 'Salad'],
    nutrition: dynamicNutrition,
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A2118] p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Navigation & Action Controls */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="text-sm font-bold text-primary flex items-center gap-2">
          <Link to="/recipes/all" className="hover:text-primary-variant transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            All Recipes
          </Link>
          <span className="text-stone-400">/</span>
          <span className="truncate max-w-xs sm:max-w-md">{recipeMeta.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to={`/admin-editor?edit=${recipeMeta.id}`} 
            className="px-4 py-2 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-primary hover:bg-stone-50 flex items-center gap-1.5 shadow-2xs transition-colors min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit Recipe
          </Link>
          <button 
            onClick={handleAddToPlan} 
            className="px-4 py-2 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary-variant flex items-center gap-1.5 shadow-sm transition-all cursor-pointer min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            Add to Meal Plan
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <HeroMediaCard recipe={recipeMeta} />
          <GlycemicSnapshot dailyGlTarget={45} profile={dynamicNutrition} servingMultiplier={scale} />
          <NutritionFactsPanel nutrition={dynamicNutrition} servingMultiplier={scale} />
          <SmartSwapsModule swaps={availableSwaps} onApplySwap={handleApplySwap} />
        </div>

        {/* Right Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <RecipeHeaderMeta recipe={recipeMeta} onAddToPlan={handleAddToPlan} />
          <IngredientsMatrix
            ingredients={currentIngredients}
            servings={servings}
            onServingChange={setServings}
            metabolicCalculation={{
              compositeGI,
              netCarbsTotal: netCarbsPerServing,
              resultGL: glycemicLoad,
            }}
          />
          <InstructionTimeline />
        </div>
      </main>

      {/* Bottom Full-Width Section */}
      <footer className="max-w-7xl mx-auto mt-12 border-t border-stone-200/80 pt-8">
        <RelatedRecipesGrid currentRecipeId={recipeMeta.id} />
      </footer>
    </div>
  );
};

export default RecipeDetails;
