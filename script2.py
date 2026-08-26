import sys

with open('src/pages/MyRecipes.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('authoredRecipes.map((recipe)', 'filteredAuthored.map((recipe)')

old_action_bar = """{/* Action Bar */}
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant border-t border-outline-variant/15 pt-2.5 mt-auto">
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {recipe.cookingTime || 0} min
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin?edit=${recipe.id}`);
                        }}
                        className={`flex items-center gap-1 font-bold text-xs px-3 py-1 rounded-full transition-all cursor-pointer ${
                          isDraft
                            ? 'bg-tertiary text-on-tertiary hover:bg-tertiary-container'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        {isDraft ? 'Resume Editing' : 'Edit Recipe'}
                        <span className="material-symbols-outlined text-xs">edit</span>
                      </button>
                    </div>"""

new_action_bar = """{/* Action Bar */}
                    <div className="flex flex-col gap-2 border-t border-outline-variant/15 pt-2.5 mt-auto">
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span className="flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {recipe.cookingTime || 0} min
                        </span>
                      </div>
                      <div className="flex gap-2 w-full justify-end">
                        {isDraft && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/recipe/${recipe.id}?preview=true`);
                            }}
                            className="flex-1 flex justify-center items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer border border-outline-variant/50 hover:bg-surface-container"
                          >
                            Preview Draft
                            <span className="material-symbols-outlined text-xs">visibility</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin-editor?edit=${recipe.id}`);
                          }}
                          className={`flex-1 flex justify-center items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                            isDraft
                              ? 'bg-tertiary text-on-tertiary hover:bg-tertiary-container'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {isDraft ? 'Resume Editing' : 'Edit Recipe'}
                          <span className="material-symbols-outlined text-xs">edit</span>
                        </button>
                      </div>
                    </div>"""

content = content.replace(old_action_bar, new_action_bar)

with open('src/pages/MyRecipes.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
