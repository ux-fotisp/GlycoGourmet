import React from 'react';
import RecipeCard from './RecipeCard';

export const RelatedRecipesRow = ({ currentRecipe }) => {
  // In a real app, this would fetch from an API based on category or tags.
  // For now, we simulate with a few static cards similar to the mockup.
  const related = [
    { id: '101', title: 'Niçoise Salad with Tuna & Soft-Boiled Eggs', category: 'Mediterranean', cookingTime: 20, imageUrl: '/assets/recipes/nicoise.jpg', nutrition: { glycemicLoad: 1, glycemicIndex: 16 } },
    { id: '102', title: 'Low-Glycemic Egg Salad Lettuce Wraps', category: 'American', cookingTime: 15, imageUrl: '/assets/recipes/eggsalad.jpg', nutrition: { glycemicLoad: 2, glycemicIndex: 14 } },
    { id: '103', title: 'Salmon-Stuffed Avocados with Fresh Herbs', category: 'California', cookingTime: 20, imageUrl: '/assets/recipes/salmonavo.jpg', nutrition: { glycemicLoad: 2, glycemicIndex: 12 } },
  ];

  return (
    <div className="pt-8 border-t border-outline-variant/30 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 uppercase tracking-wider">
          <span className="material-symbols-outlined text-primary text-[18px]">eco</span>
          You Might Also Like
        </h3>
        <a href="#/recipes/all" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          View All Recipes <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(r => (
          <RecipeCard key={r.id} recipe={r} nutrition={r.nutrition} hideMeta />
        ))}
      </div>
    </div>
  );
};
export default RelatedRecipesRow;
