import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['Breakfast', 'Lunch', 'Dinner'];

export const RecipeObjectBridge = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onStartCooking,
  onAddToMealPlan,
}) => {
  const { user } = useAuth();
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const isAuthor = recipe?.isUserAuthored ||
    (user?.email && recipe?.authorId?.toLowerCase() === user.email.toLowerCase());

  const handleSlotSelect = (day, slot) => {
    setSelectedSlot(`${day} ${slot}`);
    setTimeout(() => {
      setShowPlanPicker(false);
      setSelectedSlot(null);
    }, 800);
  };

  const handlePlanClick = () => {
    if (onAddToMealPlan) {
      onAddToMealPlan();
    } else {
      setShowPlanPicker(!showPlanPicker);
    }
  };

  return (
    <div className="bg-card rounded-card p-4 md:p-6 border border-border-subtle shadow-card space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-body flex items-center gap-1.5 border-b border-border-subtle/40 pb-2">
        <span className="material-symbols-outlined text-brand-strong text-base">hub</span>
        Quick Actions
      </h3>

      {/* Action buttons stack */}
      <div className="flex flex-col gap-2.5">
        {/* Start Cooking — Primary CTA */}
        <button
          type="button"
          onClick={onStartCooking}
          className="bg-brand-strong hover:bg-brand-hover text-text-inverse min-h-[44px] h-12 rounded-control flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-95 shadow-sm cursor-pointer w-full focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
        >
          <span className="material-symbols-outlined text-[20px]">auto_videocam</span>
          Start Cooking
        </button>

        {/* Add to Meal Plan */}
        <button
          type="button"
          onClick={handlePlanClick}
          className="bg-card hover:bg-surface-container-low border border-border-interactive min-h-[44px] h-12 rounded-control flex items-center justify-center gap-2 font-bold text-sm text-brand-strong transition-all cursor-pointer w-full focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
        >
          <span className="material-symbols-outlined text-[20px] text-brand-strong">calendar_add_on</span>
          Add to Meal Plan
        </button>

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`border min-h-[44px] h-12 rounded-control flex items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer w-full ${
            isFavorite
              ? 'bg-success-surface border-success-border text-brand-strong'
              : 'bg-card border-border-interactive text-text-strong hover:bg-surface-container-low'
          } focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none`}
        >
          <span
            className="material-symbols-outlined text-[20px] text-brand-strong"
            style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
          {isFavorite ? 'Saved to Favorites' : 'Save Favorite'}
        </button>

        {/* Edit Recipe — only if author or admin/dietitian */}
        {(isAuthor || user?.roleType === 'admin' || user?.roleType === 'dietitian') && (
          <Link
            to={`/admin-editor?edit=${recipe?.id}`}
            className="bg-card hover:bg-surface-container-low border border-border-subtle min-h-[44px] h-12 rounded-control flex items-center justify-center gap-2 font-bold text-sm text-text-body hover:text-text-strong transition-all w-full focus-visible:ring-2 focus-visible:ring-brand-strong focus-visible:outline-none"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            Edit Recipe
          </Link>
        )}
      </div>

      {/* Calendar slot picker (expandable) */}
      {showPlanPicker && (
        <div className="bg-canvas rounded-control border border-border-subtle p-3.5 shadow-sm space-y-2.5 animate-fade-in">
          <p className="text-[11px] font-bold text-text-body uppercase tracking-wider">
            Select a meal slot
          </p>
          <div className="grid grid-cols-3 gap-1 text-center">
            <div />
            {SLOTS.map(slot => (
              <span key={slot} className="text-[9px] font-bold text-text-body uppercase tracking-wider py-1">
                {slot}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {DAYS.map(day => (
              <div key={day} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-1 items-center">
                <span className="text-[10px] font-bold text-text-strong pr-2 truncate">{day.slice(0, 3)}</span>
                {SLOTS.map(slot => {
                  const isSelected = selectedSlot === `${day} ${slot}`;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSlotSelect(day, slot)}
                      className={`py-1.5 rounded-control text-[10px] font-bold transition-all cursor-pointer border min-h-[32px] ${
                        isSelected
                          ? 'bg-brand-strong text-text-inverse border-brand-strong'
                          : 'bg-card text-text-body border-border-interactive hover:border-brand-strong hover:text-brand-strong'
                      }`}
                    >
                      {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeObjectBridge;
