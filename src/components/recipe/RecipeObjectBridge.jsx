import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RecipeObjectBridge — OOUX relationship bridge connecting the recipe object
 * to Meal Plans, Favorites, and the Admin Editor.
 *
 * Provides quick-action hooks:
 * - "Add to Meal Plan" with calendar slot picker
 * - "Favorite" toggle
 * - "Edit Recipe" (visible only if isUserAuthored)
 */
const MEAL_SLOTS = ['Monday Breakfast', 'Monday Lunch', 'Monday Dinner',
  'Tuesday Breakfast', 'Tuesday Lunch', 'Tuesday Dinner',
  'Wednesday Breakfast', 'Wednesday Lunch', 'Wednesday Dinner',
  'Thursday Breakfast', 'Thursday Lunch', 'Thursday Dinner',
  'Friday Breakfast', 'Friday Lunch', 'Friday Dinner',
  'Saturday Breakfast', 'Saturday Lunch', 'Saturday Dinner',
  'Sunday Breakfast', 'Sunday Lunch', 'Sunday Dinner'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['Breakfast', 'Lunch', 'Dinner'];

export const RecipeObjectBridge = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onStartCooking,
}) => {
  const { user } = useAuth();
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const isAuthor = recipe?.isUserAuthored ||
    (user?.email && recipe?.authorId?.toLowerCase() === user.email.toLowerCase());

  const handleSlotSelect = (day, slot) => {
    setSelectedSlot(`${day} ${slot}`);
    // In production: dispatch to meal plan store/API
    setTimeout(() => {
      setShowPlanPicker(false);
      setSelectedSlot(null);
    }, 800);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">hub</span>
        Quick Actions
      </h4>

      {/* Action buttons stack */}
      <div className="flex flex-col gap-2">
        {/* Start Cooking — Primary CTA */}
        <button
          onClick={onStartCooking}
          className="bg-primary hover:bg-primary-container text-on-primary h-12 rounded-full flex items-center justify-center gap-2.5 font-bold text-sm transition-all active:scale-95 shadow-md cursor-pointer w-full"
        >
          <span className="material-symbols-outlined text-[20px]">auto_videocam</span>
          Start Cooking
        </button>

        {/* Add to Meal Plan */}
        <button
          onClick={() => setShowPlanPicker(!showPlanPicker)}
          className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 h-12 rounded-full flex items-center justify-center gap-2.5 font-bold text-sm text-on-surface transition-all cursor-pointer w-full"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">calendar_add_on</span>
          Add to Meal Plan
        </button>

        {/* Favorite toggle */}
        <button
          onClick={onToggleFavorite}
          className={`border h-12 rounded-full flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer w-full ${
            isFavorite
              ? 'bg-primary/5 border-primary text-primary'
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:border-primary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
          {isFavorite ? 'Saved to Favorites' : 'Save Favorite'}
        </button>

        {/* Edit Recipe — only if author */}
        {isAuthor && (
          <Link
            to="/admin"
            className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 h-12 rounded-full flex items-center justify-center gap-2.5 font-bold text-sm text-tertiary transition-all w-full"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            Edit Recipe
          </Link>
        )}
      </div>

      {/* Calendar slot picker (expandable) */}
      {showPlanPicker && (
        <div className="bg-white rounded-xl border border-outline-variant/30 p-4 shadow-lg space-y-3 animate-fade-in">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Select a meal slot
          </p>
          <div className="grid grid-cols-3 gap-1 text-center">
            <div /> {/* empty top-left cell */}
            {SLOTS.map(slot => (
              <span key={slot} className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider py-1">
                {slot}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {DAYS.map(day => (
              <div key={day} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-1 items-center">
                <span className="text-[10px] font-bold text-on-surface pr-2 truncate">{day.slice(0, 3)}</span>
                {SLOTS.map(slot => {
                  const isSelected = selectedSlot === `${day} ${slot}`;
                  return (
                    <button
                      key={slot}
                      onClick={() => handleSlotSelect(day, slot)}
                      className={`py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary hover:text-primary'
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
