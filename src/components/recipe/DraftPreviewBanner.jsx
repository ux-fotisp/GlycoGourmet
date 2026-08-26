import React from 'react';

const DraftPreviewBanner = ({ onPublish, roleType }) => {
  return (
    <div className="w-full bg-amber-100 border-b-4 border-amber-500 text-amber-900 px-4 py-3 flex flex-col sm:flex-row items-center justify-between z-50 sticky top-0 shadow-sm" role="alert" aria-live="assertive">
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <span className="material-symbols-outlined text-amber-600 font-bold">warning</span>
        <div>
          <p className="font-bold text-sm">Preview Mode: Draft Recipe</p>
          <p className="text-xs">This recipe is currently a draft and is not publicly visible.</p>
        </div>
      </div>
      {roleType === 'admin' && (
        <button
          onClick={onPublish}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-4 rounded-md text-sm transition-colors shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          Publish Now
        </button>
      )}
    </div>
  );
};

export default DraftPreviewBanner;
