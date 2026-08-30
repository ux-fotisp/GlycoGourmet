import React from 'react';
import { Link } from 'react-router-dom';

/**
 * RelatedRecipesGrid - Bottom full-width recommendation grid with preattentive GL badges.
 */
export const RelatedRecipesGrid = ({ currentRecipeId }) => {
  const recommendations = [
    {
      id: 'rec-rel-1',
      title: 'Mediterranean Lemon Herb Grilled Salmon',
      occasion: 'Dinner',
      prepTime: '20 min',
      image: '/catalog_desktop.png',
      gi: 14,
      gl: 2,
    },
    {
      id: 'rec-rel-2',
      title: 'Avocado Crunch Breakfast Power Bowl',
      occasion: 'Breakfast',
      prepTime: '15 min',
      image: '/catalog_desktop.png',
      gi: 18,
      gl: 1,
    },
    {
      id: 'rec-rel-3',
      title: 'Roasted Turmeric Cauliflower & Edamame',
      occasion: 'Lunch',
      prepTime: '25 min',
      image: '/catalog_desktop.png',
      gi: 20,
      gl: 3,
    },
  ];

  return (
    <section className="space-y-6 font-sans text-[#1A2118]">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-extrabold text-primary tracking-tight">
            You Might Also Like
          </h3>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">
            Clinical low-glycemic recommendations calibrated for steady metabolism
          </p>
        </div>

        <Link
          to="/recipes/all"
          className="text-xs font-extrabold text-primary hover:text-primary-variant flex items-center gap-1 transition-colors"
        >
          View All Recipes &rarr;
        </Link>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <article
            key={rec.id}
            className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all group flex flex-col"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-[4/3] bg-stone-200 overflow-hidden">
              <img
                src={rec.image}
                alt={rec.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Top-Left Low GL Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-sage-bg text-sage-text border border-sage-text/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                  LOW GL
                </span>
              </div>

              {/* Overlaid Bottom Metadata Pill */}
              <div className="absolute bottom-3 left-3 z-10">
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-xl text-white text-[11px] font-bold flex items-center gap-2 border border-white/20">
                  <span>GI: {rec.gi}</span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="text-sage-bg">GL: {rec.gl}</span>
                </div>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  <span>{rec.occasion}</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    {rec.prepTime}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-primary group-hover:text-primary-variant transition-colors line-clamp-2 leading-snug">
                  {rec.title}
                </h4>
              </div>

              {/* Footer with Standalone GL Pill and Deep Link */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-extrabold bg-sage-bg text-sage-text px-2.5 py-0.5 rounded-full border border-sage-text/20">
                  GL: {rec.gl}
                </span>

                <Link
                  to={`/recipe/${rec.id}`}
                  className="text-xs font-bold text-primary hover:text-primary-variant flex items-center gap-1 transition-colors"
                >
                  View Recipe &rarr;
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RelatedRecipesGrid;

