import sys

with open('src/pages/AdminEditor.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '{/* Action Buttons */}'
end_marker = '</div>\n              )}'

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Start marker not found")
    sys.exit(1)

end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("End marker not found")
    sys.exit(1)

end_idx += len(end_marker)

replacement = """{/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              disabled={isSaving || !canCreateDrafts}
              className="h-12 px-5 font-bold text-xs md:text-sm text-on-surface-variant hover:text-primary cursor-pointer border border-outline-variant/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px] mr-1">save</span>
              {canPublishPublic ? 'Save as Draft' : 'Save Personal Draft'}
            </Button>
            
            {editId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/recipe/${editId}?preview=true`)}
                className="h-12 px-5 font-bold text-xs md:text-sm text-on-surface-variant hover:text-primary cursor-pointer border border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[18px] mr-1">visibility</span>
                Preview Draft
              </Button>
            )}

            <div className="relative group">
              <Button
                type="button"
                onClick={canPublishPublic ? handlePublish : () => showNotification('Submitted to clinical review', 'success')}
                disabled={isSaving || !isPublishValid || (!canPublishPublic && !editId)}
                className="h-12 px-6 font-bold text-xs md:text-sm shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin mr-1">progress_activity</span>
                    {canPublishPublic ? 'Publishing...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] mr-1">{canPublishPublic ? 'publish' : 'grading'}</span>
                    {canPublishPublic ? 'Publish Recipe' : 'Submit to Clinical Review'}
                  </>
                )}
              </Button>

              {/* Hover Tooltip when Publish button is disabled */}
              {!isPublishValid && (
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-xl text-xs font-sans opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-bold text-tertiary border-b border-white/10 pb-1 mb-1">
                    Complete Required Fields:
                  </p>
                  <ul className="space-y-0.5 text-[11px] list-disc list-inside">
                    {!isTitleValid && <li>Enter a recipe title</li>}
                    {!isServingsValid && <li>Specify yield / servings (&gt; 0)</li>}
                    {!isIngredientsValid && <li>Add at least 1 ingredient</li>}
                  </ul>
                </div>
              )}"""

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('src/pages/AdminEditor.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement successful")
