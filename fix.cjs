const fs = require('fs');

let nf = fs.readFileSync('src/components/recipe/NutritionFactsPanel.jsx', 'utf8');
nf = nf.replace('Discrepancies > 1g', 'Discrepancies &gt; 1g');
fs.writeFileSync('src/components/recipe/NutritionFactsPanel.jsx', nf);

let rr = fs.readFileSync('src/components/recipe/RelatedRecipesGrid.jsx', 'utf8');
rr = rr.replace('[ View Recipe -> ]', '[ View Recipe &rarr; ]');
fs.writeFileSync('src/components/recipe/RelatedRecipesGrid.jsx', rr);

let it = fs.readFileSync('src/components/recipe/InstructionTimeline.jsx', 'utf8');
it = it.replace('30 -> 31', '30 &rarr; 31');
fs.writeFileSync('src/components/recipe/InstructionTimeline.jsx', it);
