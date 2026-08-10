import React from 'react';

/**
 * ConfirmDeleteModal — Don Norman Usability Guard for Destructive Actions
 *
 * Props:
 *   isOpen: boolean
 *   title?: string
 *   itemTitle?: string
 *   message?: string
 *   onConfirm: () => void
 *   onCancel: () => void
 */
export const ConfirmDeleteModal = ({
  isOpen,
  title = 'Delete Item?',
  itemTitle = '',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-error">
          <span className="material-symbols-outlined text-[28px]">delete_forever</span>
          <h3 id="confirm-delete-title" className="font-display text-lg font-bold text-on-surface">
            {title}
          </h3>
        </div>

        <p id="confirm-delete-desc" className="text-sm text-on-surface-variant leading-relaxed">
          {itemTitle ? (
            <>Are you sure you want to permanently delete <span className="font-bold text-on-surface">"{itemTitle}"</span>? This action cannot be undone.</>
          ) : (
            message
          )}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-5 rounded-lg bg-error text-on-error text-xs font-bold hover:bg-error/90 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
