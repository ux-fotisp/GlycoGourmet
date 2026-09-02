import React, { useState, useRef } from 'react';
import IngredientCanvasRow from './IngredientCanvasRow';
import IngredientAddModal from './IngredientAddModal';

/**
 * RecipeIngredientCanvas — Private Recipe Authoring Ingredient Assembly Canvas
 *
 * Props:
 *   lines: ProvenanceReadyRecipeIngredientLine[]
 *   onChange: (updatedLines: ProvenanceReadyRecipeIngredientLine[]) => void
 */
export const RecipeIngredientCanvas = ({ lines = [], onChange }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const addTriggerRef = useRef(null);

  const announce = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleAddLine = (newLine) => {
    const updated = [...lines, newLine];
    onChange(updated);
    announce(`Added ${newLine.displayName || 'ingredient'} to recipe`);
  };

  const handleUpdateLine = (index, updatedLine) => {
    const copy = [...lines];
    copy[index] = updatedLine;
    onChange(copy);
  };

  const handleRemoveLine = (index) => {
    const lineToRemove = lines[index];
    const copy = lines.filter((_, i) => i !== index);
    onChange(copy);
    announce(`Removed ${lineToRemove?.displayName || 'ingredient'} from recipe`);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const copy = [...lines];
    const target = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = target;
    onChange(copy);
    announce(`Moved ${target.displayName} up to position ${index}`);
  };

  const handleMoveDown = (index) => {
    if (index >= lines.length - 1) return;
    const copy = [...lines];
    const target = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = target;
    onChange(copy);
    announce(`Moved ${target.displayName} down to position ${index + 2}`);
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-outline-variant/40 shadow-xs space-y-4">
      {/* Screen Reader Status Announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-outline-variant/20 pb-3 gap-2">
        <div>
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">restaurant</span>
            Recipe Ingredients ({lines.length})
          </h3>
          <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
            Assemble ingredients with verified provenance, explicit units, and preparation states.
          </p>
        </div>

        <button
          ref={addTriggerRef}
          type="button"
          data-testid="add-ingredient-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary-container transition-all cursor-pointer flex items-center gap-1 shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Add Ingredient Slot
        </button>
      </div>

      {/* Empty State */}
      {lines.length === 0 ? (
        <div
          data-testid="ingredient-canvas-empty-state"
          className="py-12 text-center text-on-surface-variant space-y-3 bg-surface-container-low/20 border border-dashed border-outline-variant/40 rounded-xl"
        >
          <span className="material-symbols-outlined text-[36px] text-primary/40">egg_alt</span>
          <p className="text-xs font-semibold">No ingredients added yet.</p>
          <p className="text-[11px] text-on-surface-variant/80 max-w-sm mx-auto">
            Click "Add Ingredient" to choose from verified database items, USDA FoodData Central imports, or custom ingredients.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="ingredient-canvas-lines">
          {lines.map((line, idx) => (
            <IngredientCanvasRow
              key={line.id || idx}
              line={line}
              index={idx}
              totalCount={lines.length}
              onUpdate={(updated) => handleUpdateLine(idx, updated)}
              onRemove={() => handleRemoveLine(idx)}
              onMoveUp={() => handleMoveUp(idx)}
              onMoveDown={() => handleMoveDown(idx)}
            />
          ))}
        </div>
      )}

      {/* Add Ingredient Modal */}
      <IngredientAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelect={handleAddLine}
        triggerRef={addTriggerRef}
      />
    </div>
  );
};

export default RecipeIngredientCanvas;
