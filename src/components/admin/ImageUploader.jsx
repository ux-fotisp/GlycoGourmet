import React, { useState, useRef, useCallback } from 'react';
import { uploadToSnappiMedia, validateMediaFile } from '../../services/mediaService';

/**
 * ImageUploader — Drag-and-Drop + Click-to-Upload Component
 *
 * Replaces the plain text URL input in EditorFormFields.jsx.
 * Uploads images to the Snappi Media Library and returns the hosted URL.
 *
 * Props:
 *   currentUrl {string}     — current image URL (for preview/fallback)
 *   onUpload   {Function}   — called with the new URL after successful upload
 *   onUrlChange {Function}  — called with manual URL input changes (fallback mode)
 */
export const ImageUploader = ({ currentUrl = '', onUpload, onUrlChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    // Client-side validation
    const validationError = validateMediaFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const assetUrl = await uploadToSnappiMedia(file);
      onUpload(assetUrl);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
        Recipe Image
      </label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileSelect}
        role="button"
        tabIndex={0}
        aria-label="Upload recipe image — drag and drop or click to browse"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileSelect(); }}
        className={`
          relative w-full min-h-[120px] rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center gap-2 p-4
          transition-all cursor-pointer group
          ${isDragOver
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-outline-variant/50 bg-surface-container-low/30 hover:border-primary/50 hover:bg-surface-container-low/60'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        {/* Preview Thumbnail */}
        {currentUrl && !isUploading && (
          <img
            src={currentUrl}
            alt="Current recipe image"
            className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-20 group-hover:opacity-10 transition-opacity"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-1.5">
          {isUploading ? (
            <>
              <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
              <span className="text-xs font-bold text-primary">Uploading to Snappi…</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-primary text-[28px] group-hover:scale-110 transition-transform">
                cloud_upload
              </span>
              <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                {isDragOver ? 'Drop to Upload' : 'Drag & Drop or Click to Upload'}
              </span>
              <span className="text-[10px] text-on-surface-variant/60">
                JPEG, PNG, WebP, AVIF — max 5 MB
              </span>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileInput}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-error text-xs font-medium px-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </div>
      )}

      {/* Manual URL Fallback Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[12px]">link</span>
          {showManualInput ? 'Hide URL Input' : 'Or paste image URL'}
        </button>

        {currentUrl && (
          <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] text-primary">check_circle</span>
            Image set
          </span>
        )}
      </div>

      {/* Manual URL Input (fallback) */}
      {showManualInput && (
        <input
          id="recipe-image-url"
          type="url"
          value={currentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://... (paste a recipe photo URL)"
          className="w-full bg-white border border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg px-3 h-12 outline-none transition-all font-body-md text-sm text-on-surface"
        />
      )}
    </div>
  );
};

export default ImageUploader;
