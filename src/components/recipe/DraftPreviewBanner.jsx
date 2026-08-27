import React from 'react';
import { Link } from 'react-router-dom';

const DraftPreviewBanner = ({ recipe, onPublish, roleType }) => {
  const isAdminOrDietitian = roleType === 'admin' || roleType === 'dietitian';
  const lastSaved = recipe?.updatedAt || recipe?.createdAt || new Date().toISOString();

  return (
    <div className="w-full bg-amber-100 border-b-4 border-amber-500 text-amber-900 px-4 py-3 flex flex-col sm:flex-row items-center justify-between z-50 sticky top-0 shadow-sm" role="alert" aria-live="assertive">
      <div className="flex items-center gap-4 mb-2 sm:mb-0 flex-wrap">
        <span className="material-symbols-outlined text-amber-600 font-bold">warning</span>
        
        <span className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
          Draft - Not Public
        </span>

        {recipe?.authorId && (
          <span className="text-sm font-medium bg-amber-200 px-2 py-1 rounded-md">
            Author: {recipe.authorId}
          </span>
        )}

        <span className="text-xs opacity-80">
          Last Saved: {new Date(lastSaved).toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          to={`/admin-editor?edit=${recipe?.id}`} 
          className="bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold py-1.5 px-4 rounded-md text-sm transition-colors shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          Edit in Studio
        </Link>
        {isAdminOrDietitian && (
          <button
            onClick={onPublish}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-4 rounded-md text-sm transition-colors shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            One-Click Publish
          </button>
        )}
      </div>
    </div>
  );
};

export default DraftPreviewBanner;
