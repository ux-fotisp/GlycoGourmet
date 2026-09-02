import React from 'react';
import Input from '../ui/Input';
import TagChip from '../ui/TagChip';
import RecipeIngredientCanvas from '../recipe-builder/RecipeIngredientCanvas';
import ImageUploader from './ImageUploader';

/**
 * EditorFormFields — Form Input Stack for Recipe Creation & Editing
 */
export const EditorFormFields = ({
  formData,
  setFormData,
}) => {
  const handleBasicsChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
      const tags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      return { ...prev, tags };
    });
  };

  const handleIngredientsChange = (newIngredientsList) => {
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredientsList
    }));
  };

  const handleAddIngredientPlaceholder = () => {
    setFormData(prev => {
      const list = Array.isArray(prev.ingredients) ? [...prev.ingredients] : [];
      list.push({ ingredientId: '', amount: 100, unit: 'g', prepState: 'raw' });
      return { ...prev, ingredients: list };
    });
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => {
      const list = (prev.ingredients || []).filter((_, i) => i !== index);
      return { ...prev, ingredients: list };
    });
  };

  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), { title: '', description: '', timer: '' }]
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: (prev.steps || []).filter((_, i) => i !== index)
    }));
  };

  const handleStepChange = (index, field, value) => {
    setFormData(prev => {
      const list = [...(prev.steps || [])];
      list[index] = {
        ...list[index],
        [field]: field === 'timer' ? (value ? parseInt(value) || '' : '') : value
      };
      return { ...prev, steps: list };
    });
  };

  const availableTags = [
    'Low GI',
    'Keto-Friendly',
    'High Fiber',
    'High Protein',
    'Low Sodium',
    'Under 30 Min',
    'Low Sugar'
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ① Basics Card */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-outline-variant/40 shadow-[0px_4px_20px_rgba(45,49,48,0.05)] space-y-4">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
            Basics & Overview
          </h3>
          <span className="text-[10px] text-on-surface-variant">Step 1 of 4</span>
        </div>

        <div className="space-y-3">
          <Input
            id="recipe-title"
            label="Recipe Title"
            value={formData.title || ''}
            onChange={(e) => handleBasicsChange('title', e.target.value)}
            placeholder="e.g. Herb-Roasted Salmon with Lemon Asparagus"
            required
          />

          <div>
            <label htmlFor="recipe-description" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Description & Health Benefits
            </label>
            <textarea
              id="recipe-description"
              value={formData.description || ''}
              onChange={(e) => handleBasicsChange('description', e.target.value)}
              className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg p-3 outline-none transition-all font-body-md text-on-surface text-sm"
              rows="3"
              placeholder="Describe the culinary flavors, aromas, and blood-sugar balancing qualities..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="prep-time"
              label="Prep Time (min)"
              type="number"
              value={formData.prepTime ?? ''}
              onChange={(e) => handleBasicsChange('prepTime', e.target.value ? parseInt(e.target.value) || '' : '')}
              min="0"
              placeholder="10"
            />
            <Input
              id="cooking-time"
              label="Cook Time (min)"
              type="number"
              value={formData.cookingTime ?? ''}
              onChange={(e) => handleBasicsChange('cookingTime', e.target.value ? parseInt(e.target.value) || 0 : 0)}
              min="0"
              placeholder="20"
            />
            <Input
              id="servings"
              label="Yield (Servings)"
              type="number"
              value={formData.servings ?? 1}
              onChange={(e) => handleBasicsChange('servings', e.target.value ? parseInt(e.target.value) || 1 : 1)}
              min="1"
              required
            />
          </div>

          {/* Strapi Media Drag & Drop Image Uploader */}
          <ImageUploader
            currentUrl={formData.imageUrl || ''}
            onUpload={(url) => handleBasicsChange('imageUrl', url)}
            onUrlChange={(url) => handleBasicsChange('imageUrl', url)}
          />
        </div>
      </div>

      {/* ② Category & Dietary Tags Card */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-outline-variant/40 shadow-[0px_4px_20px_rgba(45,49,48,0.05)] space-y-4">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">sell</span>
            Dietary Tags
          </h3>
          <span className="text-[10px] text-on-surface-variant">Step 2 of 4</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => {
            const isSelected = Array.isArray(formData.tags) && formData.tags.includes(tag);
            return (
              <TagChip
                key={tag}
                label={tag}
                active={isSelected}
                onClick={() => handleTagToggle(tag)}
              />
            );
          })}
        </div>
      </div>

      {/* ③ Ingredient Assembly Array Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Step 3 of 4</span>
        </div>
        <RecipeIngredientCanvas
          lines={formData.ingredients || []}
          onChange={handleIngredientsChange}
        />
      </div>

      {/* ④ Instructions / Steps Card */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-outline-variant/40 shadow-[0px_4px_20px_rgba(45,49,48,0.05)] space-y-4">
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">format_list_numbered</span>
            Instructions & Steps ({(formData.steps || []).length})
          </h3>
          <span className="text-[10px] text-on-surface-variant">Step 4 of 4</span>
        </div>

        <div className="space-y-4">
          {(formData.steps || []).map((step, idx) => (
            <div key={idx} className="flex gap-3 items-start relative group">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant text-xs shrink-0 mt-1">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 bg-surface-container-low/30 p-3.5 rounded-xl border border-outline-variant/20 space-y-2 relative pr-8">
                {(formData.steps || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    aria-label={`Remove step ${idx + 1}`}
                    className="absolute top-3 right-3 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}

                <input
                  type="text"
                  placeholder="Step Heading (e.g. Sear Salmon)"
                  aria-label={`Step ${idx + 1} Heading`}
                  value={step.title || ''}
                  onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant/30 focus:border-primary font-bold text-sm outline-none pb-1"
                />

                <textarea
                  placeholder="Describe step preparation tasks and timing details..."
                  aria-label={`Step ${idx + 1} Description`}
                  value={step.description || ''}
                  onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                  className="w-full bg-transparent focus:ring-0 text-sm outline-none resize-none font-body-md"
                  rows="2"
                />

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">timer</span>
                  <input
                    type="number"
                    placeholder="Timer (min, optional)"
                    aria-label={`Step ${idx + 1} Timer in minutes`}
                    value={step.timer ?? ''}
                    onChange={(e) => handleStepChange(idx, 'timer', e.target.value)}
                    className="w-40 bg-white border border-outline-variant/40 rounded-lg px-2 h-7 text-xs outline-none"
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="w-full bg-surface-container-high/60 py-3 rounded-lg font-label-md text-on-surface-variant uppercase text-[11px] font-bold hover:bg-surface-container-high transition-colors cursor-pointer border border-dashed border-outline-variant/50 flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Instruction Step
        </button>
      </div>
    </div>
  );
};

export default EditorFormFields;
