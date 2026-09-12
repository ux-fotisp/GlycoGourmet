// tests/unit/DemoModeFixtures.spec.jsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  resolveDemoFixture,
  resetDemoFixtures,
  apiFetch,
  strapiGet,
  setDemoMode,
  isDemoMode,
  isDemoAllowed,
  IS_DEMO_MODE,
  DEMO_DRAFT_FIXTURES,
} from '../../src/services/strapiClient';
import { calculateMetabolicProfile, applyServingScale } from '../../src/services/metabolicEngine';
import { DEMO_PERSONAS } from '../../src/context/AuthContext';

describe('DEMO_MODE Fixture Layer & Resolvers', () => {
  const initialDemoMode = IS_DEMO_MODE;

  beforeEach(() => {
    setDemoMode(true);
    resetDemoFixtures();
  });

  afterEach(() => {
    setDemoMode(initialDemoMode);
  });

  describe('resolveDemoFixture Dispatcher', () => {
    it('returns published recipes by default on GET /api/recipes', () => {
      const result = resolveDemoFixture('GET', '/api/recipes');
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      // Confirms all default items are live recipes
      expect(result.data.every((r) => r.id !== 'draft_201')).toBe(true);
    });

    it('returns draft recipes matching DraftAuditQueue query filters[publishedAt][$null]=true', () => {
      const result = resolveDemoFixture('GET', '/api/recipes?filters[publishedAt][$null]=true&populate=*');
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(DEMO_DRAFT_FIXTURES.length);

      const draft201 = result.data.find((r) => r.id === 'draft_201');
      expect(draft201).toBeDefined();
      expect(draft201.title).toContain('Roasted Cauliflower & Chickpea');
      expect(draft201.publishedAt).toBeNull();
      expect(draft201.ingredients).toBeDefined();
      expect(draft201.ingredients.length).toBeGreaterThan(0);
    });

    it('returns draft recipes when params object includes filters[publishedAt][$null]', () => {
      const result = resolveDemoFixture('GET', '/api/recipes', {
        'filters[publishedAt][$null]': 'true',
        populate: '*',
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      const ids = result.data.map((r) => r.id);
      expect(ids).toContain('draft_201');
      expect(ids).toContain('draft_202');
      expect(ids).toContain('draft_203');
    });

    it('returns default seed ingredients on GET /api/ingredients', () => {
      const result = resolveDemoFixture('GET', '/api/ingredients');
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      const broccoli = result.data.find((i) => i.id === 'broccoli');
      expect(broccoli).toBeDefined();
      expect(broccoli.glycemicIndex).toBeDefined();
    });

    it('returns simulated media object on POST /api/upload', () => {
      const result = resolveDemoFixture('POST', '/api/upload');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe('demo-dish.jpg');
      expect(result[0].url).toContain('unsplash');
      expect(result[0].mime).toBe('image/jpeg');
    });

    it('supports GET and PUT on individual recipes /api/recipes/:id', () => {
      const getRes = resolveDemoFixture('GET', '/api/recipes/draft_201');
      expect(getRes.data).toBeDefined();
      expect(getRes.data.id).toBe('draft_201');

      const putRes = resolveDemoFixture('PUT', '/api/recipes/draft_201', {}, {
        data: { claimedGI: 38, publishedAt: '2026-03-12T00:00:00.000Z' },
      });
      expect(putRes.data.claimedGI).toBe(38);
    });
  });

  describe('Clinical Determinism Invariant on Fixture Data', () => {
    it('executes calculateMetabolicProfile deterministically against draft_201 without errors', () => {
      const draftResult = resolveDemoFixture('GET', '/api/recipes/draft_201');
      const draftRecipe = draftResult.data;

      const profile = calculateMetabolicProfile(draftRecipe.ingredients, draftRecipe.servings || 1);
      expect(profile).toBeDefined();
      expect(typeof profile.netCarbs).toBe('number');
      expect(typeof profile.glycemicLoad).toBe('number');
      expect(typeof profile.glycemicIndex).toBe('number');
      expect(profile.glycemicLoad).toBeGreaterThanOrEqual(0);
    });

    it('executes applyServingScale deterministically against draft_201 without mutation', () => {
      const draftResult = resolveDemoFixture('GET', '/api/recipes/draft_201');
      const draftRecipe = draftResult.data;

      const scaled2x = applyServingScale(draftRecipe.ingredients, 2);
      expect(scaled2x.multiplier).toBe(2);
      expect(scaled2x.scaledIngredients[0].amount).toBe(draftRecipe.ingredients[0].amount * 2);

      // Verify original draftRecipe ingredients were not mutated
      expect(draftRecipe.ingredients[0].amount).toBe(150);
    });
  });

  describe('apiFetch Shared Routing', () => {
    it('returns a mock Response when given a Strapi endpoint in demo mode', async () => {
      const res = await apiFetch('/api/recipes?filters[publishedAt][$null]=true');
      expect(res).toBeDefined();
      expect(res.ok).toBe(true);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.some((r) => r.id === 'draft_201')).toBe(true);
    });

    it('falls through to standard fetch for external URLs not targeting Strapi API', async () => {
      const originalFetch = window.fetch;
      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ external: true })));
      window.fetch = mockFetch;

      try {
        const res = await apiFetch('https://api.nal.usda.gov/fdc/v1/foods/search?query=cheddar');
        expect(mockFetch).toHaveBeenCalled();
        expect(res).toBeDefined();
      } finally {
        window.fetch = originalFetch;
      }
    });

    it('passes through to fetch in live mode when demo mode is disabled', async () => {
      setDemoMode(false);
      const originalFetch = window.fetch;
      const mockFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ live: true })));
      window.fetch = mockFetch;

      try {
        const res = await apiFetch('/api/recipes');
        expect(mockFetch).toHaveBeenCalled();
        const json = await res.json();
        expect(json.live).toBe(true);
      } finally {
        window.fetch = originalFetch;
      }
    });
  });

  describe('One-Click Persona Switcher', () => {
    it('defines standard personas matching preseedDemoUser accounts', () => {
      expect(DEMO_PERSONAS.length).toBe(3);
      const emails = DEMO_PERSONAS.map((p) => p.email);
      expect(emails).toContain('dietitian@glyco.com');
      expect(emails).toContain('patient@glyco.com');
      expect(emails).toContain('demo@glyco.com');
    });

    it('renders persona switch buttons on Login page when demo mode is active', async () => {
      const { render, screen, cleanup } = await import('@testing-library/react');
      const { MemoryRouter } = await import('react-router-dom');
      const { AuthProvider } = await import('../../src/context/AuthContext');
      const Login = (await import('../../src/pages/Login')).default;

      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByTestId('demo-persona-panel')).toBeInTheDocument();
      expect(screen.getByTestId('demo-login-dietitian')).toBeInTheDocument();
      expect(screen.getByTestId('demo-login-patient')).toBeInTheDocument();
      expect(screen.getByTestId('demo-login-admin')).toBeInTheDocument();
      cleanup();
    });

    it('does NOT render demo-persona-panel when demo mode is disabled', async () => {
      setDemoMode(false);
      const { render, screen, cleanup } = await import('@testing-library/react');
      const { MemoryRouter } = await import('react-router-dom');
      const { AuthProvider } = await import('../../src/context/AuthContext');
      const Login = (await import('../../src/pages/Login')).default;

      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('demo-persona-panel')).not.toBeInTheDocument();
      cleanup();
    });
  });

  describe('Production Build Gate & localStorage Immunity (Anti-Bypass Invariant)', () => {
    let originalDemoMode;
    let originalAllowDemoMode;

    beforeEach(() => {
      originalDemoMode = import.meta.env.VITE_DEMO_MODE;
      originalAllowDemoMode = import.meta.env.VITE_ALLOW_DEMO_MODE;

      // Simulate real production build where both build-time capability flags are absent
      delete import.meta.env.VITE_DEMO_MODE;
      delete import.meta.env.VITE_ALLOW_DEMO_MODE;
      setDemoMode(false);
      localStorage.clear();
      delete window.__DEMO_MODE__;
    });

    afterEach(() => {
      import.meta.env.VITE_DEMO_MODE = originalDemoMode;
      import.meta.env.VITE_ALLOW_DEMO_MODE = originalAllowDemoMode;
      setDemoMode(false);
      localStorage.clear();
      delete window.__DEMO_MODE__;
      vi.restoreAllMocks();
    });

    it('returns false from isDemoMode() even if localStorage has glyco_demo_mode=true or window.__DEMO_MODE__=true', () => {
      localStorage.setItem('glyco_demo_mode', 'true');
      window.__DEMO_MODE__ = true;

      expect(isDemoAllowed()).toBe(false);
      expect(isDemoMode()).toBe(false);
    });

    it('does NOT render demo-persona-panel in Login even if localStorage has glyco_demo_mode=true', async () => {
      localStorage.setItem('glyco_demo_mode', 'true');
      window.__DEMO_MODE__ = true;

      const { render, screen, cleanup } = await import('@testing-library/react');
      const { MemoryRouter } = await import('react-router-dom');
      const { AuthProvider } = await import('../../src/context/AuthContext');
      const Login = (await import('../../src/pages/Login')).default;

      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('demo-persona-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('demo-login-dietitian')).not.toBeInTheDocument();
      expect(screen.queryByTestId('demo-login-patient')).not.toBeInTheDocument();
      cleanup();
    });

    it('forces strapiGet and apiFetch to execute real network calls (fetch) even when localStorage has glyco_demo_mode=true', async () => {
      localStorage.setItem('glyco_demo_mode', 'true');
      window.__DEMO_MODE__ = true;

      const originalFetch = window.fetch;
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [{ id: 'live-prod-recipe', title: 'Live Production Recipe' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
      window.fetch = mockFetch;

      try {
        const result = await strapiGet('/api/recipes');
        expect(mockFetch).toHaveBeenCalled();
        expect(result).toBeDefined();
        // Confirms real network response was returned, NOT intercepted demo fixtures
        expect(result).toEqual([{ id: 'live-prod-recipe', title: 'Live Production Recipe' }]);
      } finally {
        window.fetch = originalFetch;
      }
    });
  });
});
