import { describe, it, expect } from 'vitest';
import {
  generateSmartSwapRecommendations,
  isDietarySafe,
  calculateGLPer100g,
  CandidateIngredient,
} from '../../src/services/recommendationEngine';

describe('RecommendationEngine: Deterministic Smart Swap Clinical Gates', () => {
  const mockIngredients: CandidateIngredient[] = [
    {
      id: 'white-rice',
      name: 'Jasmine White Rice',
      category: 'grain',
      glycemicIndex: 85,
      carbs: 80,
      fiber: 1,
      netCarbs: 79,
      containsGluten: false,
      dietaryFlags: ['Gluten-Free', 'Vegan'],
    },
    {
      id: 'barley',
      name: 'Pearled Barley',
      category: 'grain',
      glycemicIndex: 28,
      carbs: 73,
      fiber: 17,
      netCarbs: 56,
      containsGluten: true,
      dietaryFlags: ['Vegan'],
    },
    {
      id: 'whole-wheat-flour',
      name: 'Whole Wheat Flour',
      category: 'grain',
      glycemicIndex: 45,
      carbs: 72,
      fiber: 12,
      netCarbs: 60,
      containsGluten: true,
      dietaryFlags: ['Vegetarian'],
    },
    {
      id: 'cauliflower-rice',
      name: 'Cauliflower Pearl Rice',
      category: 'grain',
      glycemicIndex: 15,
      carbs: 5,
      fiber: 2.5,
      netCarbs: 2.5,
      containsGluten: false,
      dietaryFlags: ['Gluten-Free', 'Vegan', 'Keto'],
    },
    {
      id: 'quinoa',
      name: 'Organic Quinoa',
      category: 'grain',
      glycemicIndex: 53,
      carbs: 64,
      fiber: 7,
      netCarbs: 57,
      containsGluten: false,
      dietaryFlags: ['Gluten-Free', 'Vegan'],
    },
    {
      id: 'wild-rice',
      name: 'Wild Rice',
      category: 'grain',
      glycemicIndex: 45,
      carbs: 75,
      fiber: 6,
      netCarbs: 69,
      containsGluten: false,
      dietaryFlags: ['Gluten-Free', 'Vegan'],
    },
    {
      id: 'salmon',
      name: 'Atlantic Salmon',
      category: 'protein',
      glycemicIndex: 0,
      carbs: 0,
      fiber: 0,
      netCarbs: 0,
      dietaryFlags: ['Gluten-Free'],
    },
  ];

  it('Test A (Allergy Gate): Strictly filters out Barley and Whole Wheat Flour for Gluten-Free patients', () => {
    const glutenFreeProfile = {
      dietaryRestrictions: ['Gluten-Free'],
    };

    const recommendations = generateSmartSwapRecommendations(
      'white-rice',
      glutenFreeProfile,
      mockIngredients
    );

    const recommendedNames = recommendations.map((r) => r.name);

    // Assert that gluten-containing grains are strictly excluded
    expect(recommendedNames).not.toContain('Pearled Barley');
    expect(recommendedNames).not.toContain('Whole Wheat Flour');

    // Assert that gluten-free low-GI alternatives survive
    expect(recommendedNames).toContain('Cauliflower Pearl Rice');
    expect(recommendedNames).toContain('Organic Quinoa');
  });

  it('Test B (Metabolic Gate): Drops higher-GI candidates when source is already low-GL', () => {
    // When source is Quinoa (GL ~30.2), Jasmine White Rice (GL ~67.2) has a positive delta (+37) and must be dropped
    const recommendations = generateSmartSwapRecommendations(
      'quinoa',
      { dietaryRestrictions: [] },
      mockIngredients
    );

    const recommendedIds = recommendations.map((r) => r.id);

    // Jasmine Rice would increase GL, so it must be dropped
    expect(recommendedIds).not.toContain('white-rice');

    // Cauliflower rice has lower GL than Quinoa, so it should be recommended
    expect(recommendedIds).toContain('cauliflower-rice');

    // Every returned recommendation must have a negative deltaGL
    recommendations.forEach((rec) => {
      expect(rec.deltaGL).toBeLessThan(0);
    });
  });

  it('Test C (Sorting): Strictly ranks recommendations in ascending order from largest GL reduction to smallest', () => {
    const recommendations = generateSmartSwapRecommendations(
      'white-rice',
      { dietaryRestrictions: [] },
      mockIngredients
    );

    expect(recommendations.length).toBeGreaterThan(1);

    // Top result should be the steepest GL drop (Cauliflower Rice)
    expect(recommendations[0].id).toBe('cauliflower-rice');
    expect(recommendations[0].deltaGL).toBeLessThan(recommendations[1].deltaGL);

    // Check strict monotonic ascending sort on deltaGL
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].deltaGL).toBeLessThanOrEqual(recommendations[i + 1].deltaGL);
    }
  });

  it('Test D (Category Isolation): Does not suggest protein/salmon for grain/rice swaps', () => {
    const recommendations = generateSmartSwapRecommendations(
      'white-rice',
      null,
      mockIngredients
    );

    const categories = recommendations.map((r) => r.category);
    expect(categories.every((c) => c === 'grain')).toBe(true);
  });
});
