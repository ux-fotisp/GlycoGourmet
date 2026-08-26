import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { calculateRecipeNutrition } from '../utils/nutritionCalculator';

export const MEAL_OCCASIONS = [
  { value: 'all', label: 'All', icon: 'restaurant' },
  { value: 'breakfast', label: 'Breakfast', icon: 'egg_alt' },
  { value: 'brunch', label: 'Brunch', icon: 'brunch_dining' },
  { value: 'lunch', label: 'Lunch', icon: 'lunch_dining' },
  { value: 'dinner', label: 'Dinner', icon: 'dinner_dining' },
  { value: 'snack', label: 'Snacks', icon: 'cookie' },
  { value: 'dessert', label: 'Dessert', icon: 'cake' },
];

export const SORT_OPTIONS = [
  { value: 'gl_asc', label: 'Lowest Glycemic Load (GL ↑)', shortLabel: 'GL ↑' },
  { value: 'gi_asc', label: 'Lowest Glycemic Index (GI ↑)', shortLabel: 'GI ↑' },
  { value: 'nc_asc', label: 'Lowest Net Carbs (NC ↑)', shortLabel: 'NC ↑' },
  { value: 'fiber_desc', label: 'Highest Fiber (g ↓)', shortLabel: 'Fiber ↓' },
];

export const GL_BANDS = [
  { value: 'low', label: 'Low GL', sublabel: 'Gentle Impact', maxGL: 10, icon: 'check_circle' },
  { value: 'medium', label: 'Medium GL', sublabel: 'Moderate Impact', maxGL: 19, icon: 'info' },
  { value: 'high', label: 'High GL', sublabel: 'Spike Risk', maxGL: Infinity, icon: 'warning' },
];

export const QUICK_PRESETS = [
  { id: 'ultra_low_gl', label: 'Ultra-Low GL (<5)', icon: 'bolt', params: { maxGL: '5', sort: 'gl_asc' } },
  { id: 'quick_prep', label: 'Under 15m Prep', icon: 'schedule', params: { maxPrep: '15' } },
  { id: 'safe_dinner', label: 'Safe Dinner Options', icon: 'verified_user', params: { occasion: 'dinner', band: 'low', sort: 'gl_asc' } },
];

export const DIETARY_FLAGS = [
  { value: 'Vegetarian', label: 'Vegetarian', icon: 'eco' },
  { value: 'Vegan', label: 'Vegan', icon: 'spa' },
  { value: 'Nut-Free', label: 'Nut-Free', icon: 'block' },
  { value: 'Dairy-Free', label: 'Dairy-Free', icon: 'water_drop' },
  { value: 'Gluten-Free', label: 'Gluten-Free', icon: 'grain' },
];

function parseArrayParam(value) {
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

function serializeArrayParam(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.join(',');
}

function getRecipeMetabolics(recipe) {
  const preCalcGL = recipe?.nutrition?.glycemicLoad ?? recipe?.glycemicLoad;
  const preCalcGI = recipe?.nutrition?.glycemicIndex ?? recipe?.glycemicIndex;
  const preCalcNC = recipe?.nutrition?.netCarbs ?? recipe?.netCarbs;
  const preCalcFiber = recipe?.nutrition?.fiber ?? recipe?.fiber;

  if (preCalcGL !== null && preCalcGL !== undefined) {
    return {
      glycemicLoad: Number(preCalcGL) || 0,
      glycemicIndex: preCalcGI !== null && preCalcGI !== undefined ? Number(preCalcGI) : null,
      netCarbs: Number(preCalcNC) || 0,
      fiber: Number(preCalcFiber) || 0,
    };
  }

  const nutrition = calculateRecipeNutrition(recipe?.ingredients ?? []);
  return {
    glycemicLoad: nutrition.glycemicLoad ?? 0,
    glycemicIndex: nutrition.glycemicIndex,
    netCarbs: nutrition.netCarbs ?? 0,
    fiber: nutrition.fiber ?? 0,
  };
}

function generateMatchedTags(recipe, metabolics, activeOccasions, activeBands, activeDietary) {
  const tags = [];

  if (activeOccasions.length > 0 && activeOccasions.includes(recipe.mealOccasion)) {
    const occasion = MEAL_OCCASIONS.find(o => o.value === recipe.mealOccasion);
    if (occasion) tags.push({ type: 'occasion', label: occasion.label, icon: occasion.icon });
  }

  if (activeBands.length > 0) {
    const gl = metabolics.glycemicLoad;
    if (activeBands.includes('low') && gl <= 10) {
      tags.push({ type: 'band', label: `GL ${gl} · Gentle`, icon: 'check_circle' });
    } else if (activeBands.includes('medium') && gl >= 11 && gl <= 19) {
      tags.push({ type: 'band', label: `GL ${gl} · Moderate`, icon: 'info' });
    } else if (activeBands.includes('high') && gl >= 20) {
      tags.push({ type: 'band', label: `GL ${gl} · Spike Risk`, icon: 'warning' });
    }
  }

  if (activeDietary.length > 0) {
    const recipeDietary = recipe.dietaryFlags || [];
    activeDietary.forEach(flag => {
      if (recipeDietary.includes(flag)) {
        const def = DIETARY_FLAGS.find(d => d.value === flag);
        tags.push({ type: 'dietary', label: flag, icon: def?.icon || 'label' });
      }
    });
  }

  if (metabolics.fiber > 5) {
    tags.push({ type: 'nutrient', label: 'High Fiber', icon: 'grass' });
  }

  return tags;
}

export function useRecipeFilters(allRecipes = []) {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeOccasions = useMemo(
    () => parseArrayParam(searchParams.get('occasion')),
    [searchParams]
  );

  const activeSort = useMemo(
    () => searchParams.get('sort') || 'gl_asc',
    [searchParams]
  );

  const activeBands = useMemo(
    () => parseArrayParam(searchParams.get('band')),
    [searchParams]
  );

  const maxGL = useMemo(() => {
    const val = searchParams.get('maxGL');
    if (val === null) return null;
    const num = parseInt(val, 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }, [searchParams]);

  const maxPrep = useMemo(() => {
    const val = searchParams.get('maxPrep');
    if (val === null) return null;
    const num = parseInt(val, 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }, [searchParams]);

  const activeDietary = useMemo(
    () => parseArrayParam(searchParams.get('dietary')),
    [searchParams]
  );

  const searchText = useMemo(
    () => searchParams.get('q') || '',
    [searchParams]
  );

  const updateParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        });
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setOccasions = useCallback(
    (occasions) => {
      const filtered = occasions.filter(o => o !== 'all');
      updateParams({ occasion: serializeArrayParam(filtered) });
    },
    [updateParams]
  );

  const toggleOccasion = useCallback(
    (occasion) => {
      if (occasion === 'all') {
        updateParams({ occasion: null });
        return;
      }
      const current = parseArrayParam(searchParams.get('occasion'));
      const next = current.includes(occasion)
        ? current.filter(o => o !== occasion)
        : [...current, occasion];
      updateParams({ occasion: serializeArrayParam(next) });
    },
    [searchParams, updateParams]
  );

  const setSort = useCallback(
    (sort) => updateParams({ sort: sort === 'gl_asc' ? null : sort }),
    [updateParams]
  );

  const setBands = useCallback(
    (bands) => updateParams({ band: serializeArrayParam(bands) }),
    [updateParams]
  );

  const toggleBand = useCallback(
    (band) => {
      const current = parseArrayParam(searchParams.get('band'));
      const next = current.includes(band)
        ? current.filter(b => b !== band)
        : [...current, band];
      updateParams({ band: serializeArrayParam(next) });
    },
    [searchParams, updateParams]
  );

  const setMaxGL = useCallback(
    (value) => updateParams({ maxGL: value > 0 && value < 30 ? String(value) : null }),
    [updateParams]
  );

  const setMaxPrep = useCallback(
    (value) => updateParams({ maxPrep: value > 0 ? String(value) : null }),
    [updateParams]
  );

  const setDietary = useCallback(
    (flags) => updateParams({ dietary: serializeArrayParam(flags) }),
    [updateParams]
  );

  const toggleDietary = useCallback(
    (flag) => {
      const current = parseArrayParam(searchParams.get('dietary'));
      const next = current.includes(flag)
        ? current.filter(f => f !== flag)
        : [...current, flag];
      updateParams({ dietary: serializeArrayParam(next) });
    },
    [searchParams, updateParams]
  );

  const setSearchText = useCallback(
    (text) => updateParams({ q: text || null }),
    [updateParams]
  );

  const applyPreset = useCallback(
    (preset) => {
      const presetDef = QUICK_PRESETS.find(p => p.id === preset);
      if (presetDef) {
        updateParams(presetDef.params);
      }
    },
    [updateParams]
  );

  const resetAll = useCallback(
    () => setSearchParams({}, { replace: true }),
    [setSearchParams]
  );

  const enrichedRecipes = useMemo(() => {
    return allRecipes.map(recipe => {
      const metabolics = getRecipeMetabolics(recipe);
      return { ...recipe, _metabolics: metabolics };
    });
  }, [allRecipes]);

  const filteredRecipes = useMemo(() => {
    let results = enrichedRecipes;

    results = results.filter(r => r?.status !== 'draft' || r?.publishedAt !== null);

    if (activeOccasions.length > 0) {
      results = results.filter(r => activeOccasions.includes(r.mealOccasion));
    }

    if (activeBands.length > 0) {
      results = results.filter(r => {
        const gl = r._metabolics.glycemicLoad;
        return activeBands.some(band => {
          if (band === 'low') return gl <= 10;
          if (band === 'medium') return gl >= 11 && gl <= 19;
          if (band === 'high') return gl >= 20;
          return false;
        });
      });
    }

    if (maxGL !== null) {
      results = results.filter(r => r._metabolics.glycemicLoad <= maxGL);
    }

    if (maxPrep !== null) {
      results = results.filter(r => {
        const prep = r.prepTime || r.cookingTime || 0;
        return prep <= maxPrep;
      });
    }

    if (activeDietary.length > 0) {
      results = results.filter(r => {
        const flags = r.dietaryFlags || [];
        return activeDietary.every(flag => flags.includes(flag));
      });
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      results = results.filter(r =>
        (r.title?.toLowerCase().includes(q)) ||
        (r.description?.toLowerCase().includes(q)) ||
        (r.tags?.some(t => t.toLowerCase().includes(q)))
      );
    }

    results = [...results].sort((a, b) => {
      const ma = a._metabolics;
      const mb = b._metabolics;

      switch (activeSort) {
        case 'gl_asc': {
          const diff = ma.glycemicLoad - mb.glycemicLoad;
          return diff !== 0 ? diff : ma.netCarbs - mb.netCarbs;
        }
        case 'gi_asc': {
          const giA = ma.glycemicIndex ?? 999;
          const giB = mb.glycemicIndex ?? 999;
          return giA - giB;
        }
        case 'nc_asc':
          return ma.netCarbs - mb.netCarbs;
        case 'fiber_desc':
          return mb.fiber - ma.fiber;
        default:
          return ma.glycemicLoad - mb.glycemicLoad;
      }
    });

    return results;
  }, [enrichedRecipes, activeOccasions, activeBands, maxGL, maxPrep, activeDietary, searchText, activeSort]);

  const recipesWithTags = useMemo(() => {
    return filteredRecipes.map(recipe => ({
      ...recipe,
      _matchedTags: generateMatchedTags(
        recipe, recipe._metabolics, activeOccasions, activeBands, activeDietary
      ),
    }));
  }, [filteredRecipes, activeOccasions, activeBands, activeDietary]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeOccasions.length > 0) count += activeOccasions.length;
    if (activeBands.length > 0) count += activeBands.length;
    if (maxGL !== null) count += 1;
    if (maxPrep !== null) count += 1;
    if (activeDietary.length > 0) count += activeDietary.length;
    if (searchText.trim()) count += 1;
    if (activeSort !== 'gl_asc') count += 1;
    return count;
  }, [activeOccasions, activeBands, maxGL, maxPrep, activeDietary, searchText, activeSort]);

  const resultCountLabel = useMemo(() => {
    const count = recipesWithTags.length;
    const parts = [];

    if (activeBands.includes('low')) parts.push('Low-GL');
    else if (activeBands.includes('medium')) parts.push('Medium-GL');
    if (maxGL !== null) parts.push(`GL ≤ ${maxGL}`);

    const occasionLabels = activeOccasions.map(o => {
      const def = MEAL_OCCASIONS.find(m => m.value === o);
      return def?.label || o;
    });
    if (occasionLabels.length > 0) parts.push(occasionLabels.join(', '));

    if (activeDietary.length > 0) parts.push(activeDietary.join(', '));

    const descriptor = parts.length > 0 ? parts.join(' ') + ' ' : '';
    const noun = count === 1 ? 'recipe' : 'recipes';
    return `Showing ${count} ${descriptor}${noun}`;
  }, [recipesWithTags.length, activeBands, maxGL, activeOccasions, activeDietary]);

  const activeFiltersList = useMemo(() => {
    const filters = [];

    activeOccasions.forEach(o => {
      const def = MEAL_OCCASIONS.find(m => m.value === o);
      filters.push({
        key: `occasion:${o}`,
        type: 'occasion',
        label: def?.label || o,
        icon: def?.icon || 'restaurant',
        onRemove: () => toggleOccasion(o),
      });
    });

    activeBands.forEach(b => {
      const def = GL_BANDS.find(gl => gl.value === b);
      filters.push({
        key: `band:${b}`,
        type: 'band',
        label: `${def?.label || b} · ${def?.sublabel || ''}`,
        icon: def?.icon || 'tune',
        onRemove: () => toggleBand(b),
      });
    });

    if (maxGL !== null) {
      filters.push({
        key: 'maxGL',
        type: 'threshold',
        label: `GL ≤ ${maxGL}`,
        icon: 'tune',
        onRemove: () => setMaxGL(0),
      });
    }

    if (maxPrep !== null) {
      filters.push({
        key: 'maxPrep',
        type: 'threshold',
        label: `≤ ${maxPrep}m prep`,
        icon: 'schedule',
        onRemove: () => setMaxPrep(0),
      });
    }

    activeDietary.forEach(d => {
      const def = DIETARY_FLAGS.find(f => f.value === d);
      filters.push({
        key: `dietary:${d}`,
        type: 'dietary',
        label: d,
        icon: def?.icon || 'label',
        onRemove: () => toggleDietary(d),
      });
    });

    if (activeSort !== 'gl_asc') {
      const def = SORT_OPTIONS.find(s => s.value === activeSort);
      filters.push({
        key: 'sort',
        type: 'sort',
        label: `Sort: ${def?.shortLabel || activeSort}`,
        icon: 'sort',
        onRemove: () => setSort('gl_asc'),
      });
    }

    return filters;
  }, [activeOccasions, activeBands, maxGL, maxPrep, activeDietary, activeSort, toggleOccasion, toggleBand, setMaxGL, setMaxPrep, toggleDietary, setSort]);

  return {
    recipes: recipesWithTags,
    resultCountLabel,
    activeFilterCount,
    activeFiltersList,
    activeOccasions,
    activeSort,
    activeBands,
    maxGL,
    maxPrep,
    activeDietary,
    searchText,
    setOccasions,
    toggleOccasion,
    setSort,
    setBands,
    toggleBand,
    setMaxGL,
    setMaxPrep,
    setDietary,
    toggleDietary,
    setSearchText,
    applyPreset,
    resetAll,
  };
}

export default useRecipeFilters;
