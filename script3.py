import sys

with open('tests/integration/RecipeFiltering.spec.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a draft recipe to MOCK_RECIPES
draft_recipe = """  {
    id: 'draft-recipe-1',
    title: 'Hidden Draft Recipe',
    mealOccasion: 'lunch',
    status: 'draft',
    publishedAt: null,
    nutrition: {
      glycemicLoad: 1,
      glycemicIndex: 10,
      netCarbs: 1,
      fiber: 1,
      kcal: 100,
    },
  },
];"""

content = content.replace('];', draft_recipe, 1)

# Modify the test to assert it doesn't render
old_test = """    it('should update URL query parameters and filter recipes when clicking occasion filter pills', () => {
      render(<FilterTestHarness initialEntries={['/']} />);

      expect(screen.getByTestId('url-params')).toHaveTextContent('');
      expect(screen.getAllByTestId(/recipe-card-/)).toHaveLength(3);"""

new_test = """    it('should update URL query parameters and filter recipes when clicking occasion filter pills', () => {
      render(<FilterTestHarness initialEntries={['/']} />);

      expect(screen.getByTestId('url-params')).toHaveTextContent('');
      // Should be 3 (draft-recipe-1 is filtered out because it is a draft)
      expect(screen.getAllByTestId(/recipe-card-/)).toHaveLength(3);
      expect(screen.queryByText('Hidden Draft Recipe')).not.toBeInTheDocument();"""

content = content.replace(old_test, new_test)

with open('tests/integration/RecipeFiltering.spec.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
