const fs = require('fs');

const recipeDetails = `import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import HeroMediaCard from '../components/recipe/HeroMediaCard';
import GlycemicSnapshot from '../components/recipe/GlycemicSnapshot';
import NutritionFactsPanel from '../components/recipe/NutritionFactsPanel';
import SmartSwapsList from '../components/recipe/SmartSwapsList';
import RecipeHeaderMeta from '../components/recipe/RecipeHeaderMeta';
import IngredientsSection from '../components/recipe/IngredientsSection';
import InstructionTimeline from '../components/recipe/InstructionTimeline';
import RelatedRecipesGrid from '../components/recipe/RelatedRecipesGrid';

const RecipeDetails = () => {
  const { id } = useParams();
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [swappedIngredients, setSwappedIngredients] = useState({});

  // Mock recipe data for the refactored UI
  const recipe = {
    id: id || '123',
    title: 'Low-Glycemic Green Goddess Power Salad',
    description: 'A nutrient-dense, clinical-grade salad optimized for steady blood glucose.',
    image: '/recipe_detail_desktop.png',
    prepTime: '25 min',
    nutrition: { glycemicIndex: 22, glycemicLoad: 4, kcal: 387, fat: 18, netCarbs: 12, fiber: 8, protein: 24 }
  };

  const handleApplySwap = () => {
    console.log('Swap applied');
  };

  const handleAddToPlan = () => {
    console.log('Added to plan');
  };

  const handleServingChange = (newServings) => {
    setServingMultiplier(newServings);
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#1A2118] p-6 lg:p-10 font-sans">
      {/* Top Navigation & Action Controls */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <div className="text-sm font-bold text-[#1B3B22] flex items-center gap-2">
          <Link to="/recipes/all" className="hover:text-[#2D5A34] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            All Recipes
          </Link>
          <span>/</span>
          <span>{recipe.title}</span>
        </div>
        <div className="flex gap-3">
          <Link to={\`/admin-editor?edit=\${recipe.id}\`} className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-[#1B3B22] hover:bg-stone-50 flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit Recipe
          </Link>
          <button onClick={handleAddToPlan} className="px-4 py-2 bg-[#1B3B22] text-white rounded-xl text-xs font-bold hover:bg-[#2D5A34] flex items-center gap-1.5 shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            Add to Meal Plan
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <HeroMediaCard recipe={recipe} />
          <GlycemicSnapshot dailyGlTarget={45} profile={recipe.nutrition} />
          <NutritionFactsPanel nutrition={recipe.nutrition} />
          <SmartSwapsList onApplySwap={handleApplySwap} swaps={recipe.smartSwaps} />
        </div>

        {/* Right Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <RecipeHeaderMeta onAddToPlan={handleAddToPlan} recipe={recipe} />
          <IngredientsSection ingredients={[]} metabolicCalculation={{}} onServingChange={handleServingChange} servings={servingMultiplier} />
          <InstructionTimeline instructions={[]} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-12 border-t border-stone-200 pt-8">
        <RelatedRecipesGrid currentRecipeId={recipe.id} />
      </div>
    </div>
  );
};

export default RecipeDetails;
`;

fs.writeFileSync('src/pages/RecipeDetails.jsx', recipeDetails);
