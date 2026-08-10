import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EditorFormFields from '../components/admin/EditorFormFields';
import EditorPreviewCard from '../components/admin/EditorPreviewCard';
import { useAuth } from '../context/AuthContext';
import { saveRecipe, getRecipeById } from '../utils/recipeStore';

// Simple slug-style ID generator from recipe title + timestamp
const generateRecipeId = (title) => {
  const slug = (title || 'recipe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slug}-${Date.now()}`;
};

export const AdminEditor = () => {
  const { user, addFavorite } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  // Pre-seed with mock edit values for "Braised Salmon with Lemon Asparagus"
  const [formData, setFormData] = useState({
    title: 'Braised Salmon with Lemon Asparagus',
    description:
      'A sophisticated yet simple meal designed to maintain stable energy levels while delighting the palate with citrus and healthy fats.',
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600',
    cookingTime: 25,
    servings: 2,
    tags: ['Low GI', 'Keto-Friendly', 'High Protein'],
    ingredients: [
      { ingredientId: 'atlantic-salmon', amount: 6, unit: 'oz', prepState: 'sauteed' },
      { ingredientId: 'asparagus', amount: 1, unit: 'bunch', prepState: 'roasted' },
      { ingredientId: 'olive-oil', amount: 1.5, unit: 'tbsp', prepState: 'raw' },
    ],
    steps: [
      {
        title: 'Sear Salmon',
        description: 'Sear the salmon skin-side down in a hot pan with olive oil until crisp.',
        timer: 6,
      },
      {
        title: 'Roast Asparagus',
        description: 'Roast asparagus alongside the salmon until tender.',
        timer: 12,
      },
    ],
  });

  // Track whether this is an update to an existing Snappi record
  const [isExistingRecipe, setIsExistingRecipe] = useState(false);

  // Load existing recipe if editing
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    async function loadEdit() {
      const existing = await getRecipeById(editId);
      if (cancelled || !existing) return;
      setFormData({
        title: existing.title || '',
        description: existing.description || '',
        imageUrl: existing.imageUrl || '',
        cookingTime: existing.cookingTime || 0,
        servings: existing.servings || 1,
        tags: existing.tags ?? [],
        ingredients: existing.ingredients ?? [],
        steps: existing.steps ?? [],
      });
      setIsExistingRecipe(true);
    }
    loadEdit();
    return () => { cancelled = true; };
  }, [editId]);

  const [notification, setNotification] = useState(null); // { msg, type }
  const [isSaving, setIsSaving] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  /**
   * Publishes the recipe to Snappi with status: 'published'.
   */
  const handlePublish = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const finalId = editId || generateRecipeId(formData.title);
      const newRecipe = {
        ...formData,
        id: finalId,
        authorId: user?.email || '',
        isUserAuthored: true,
        status: 'published',
      };

      await saveRecipe(newRecipe, { isUpdate: isExistingRecipe || !!editId });
      addFavorite(finalId);
      showNotification('🎉 Recipe published to Snappi & added to your Favorites!', 'success');
    } catch (err) {
      console.error('[AdminEditor] Publish failed:', err);
      showNotification(`❌ Publish failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Saves the recipe as a draft to Snappi with status: 'draft'.
   */
  const handleSaveDraft = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const finalId = editId || generateRecipeId(formData.title);
      const newRecipe = {
        ...formData,
        id: finalId,
        authorId: user?.email || '',
        isUserAuthored: true,
        status: 'draft',
      };

      await saveRecipe(newRecipe, { isUpdate: isExistingRecipe || !!editId });
      showNotification('💾 Draft saved to Snappi successfully.', 'draft');
    } catch (err) {
      console.error('[AdminEditor] Draft save failed:', err);
      showNotification(`❌ Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const notifBg =
    notification?.type === 'draft'
      ? 'bg-surface-container-high text-on-surface border-outline-variant/40'
      : notification?.type === 'error'
        ? 'bg-error-container text-on-error-container border-error/30'
        : 'bg-primary text-on-primary border-primary-fixed-dim/20';

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-screen relative" aria-label="Recipe Editor">

      {/* Floating notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute top-4 right-4 z-50 font-bold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs md:text-sm border ${notifBg}`}
        >
          <span className="material-symbols-outlined text-[16px]">task_alt</span>
          <span>{notification.msg}</span>
        </div>
      )}

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Left Form Pane */}
        <section className="w-full lg:w-[50%] p-md overflow-y-auto bg-[#F7FAF8] h-full" aria-label="Recipe Form">
          <header className="mb-6">
            <h2 className="font-display text-2xl font-bold text-primary">
              {editId ? 'Edit Recipe' : 'Create New Recipe'}
            </h2>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              Draft a blood-sugar friendly masterpiece with real-time feedback.
            </p>
          </header>

          <EditorFormFields
            formData={formData}
            setFormData={setFormData}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            isSaving={isSaving}
          />
        </section>

        {/* Right Preview Pane */}
        <section className="w-full lg:w-[50%] p-md bg-white border-l border-outline-variant overflow-y-auto h-full flex flex-col items-center justify-start" aria-label="Recipe Preview">
          <div className="w-full py-8">
            <EditorPreviewCard formData={formData} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminEditor;
