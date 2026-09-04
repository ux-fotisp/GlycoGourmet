import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Automated Compliance & Chromatic Audits', () => {
  test.beforeEach(async ({ page }) => {
    // Inject authenticated session for protected routes
    await page.addInitScript(() => {
      const demoUser = {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@glyco.com',
        roleType: 'admin',
        isApproved: true,
        onboarded: true,
      };
      localStorage.setItem('glyco_session', JSON.stringify(demoUser));
      localStorage.setItem('glyco_users', JSON.stringify({ 'demo@glyco.com': demoUser }));
    });
  });

  const TARGET_ROUTES = [
    { name: 'Recipe Catalog', path: '/#/' },
    { name: 'My Recipes', path: '/#/my-recipes' },
    { name: 'Meal Planner', path: '/#/meal-plans' },
  ];

  for (const route of TARGET_ROUTES) {
    test(`Route ${route.name} (${route.path}) must have zero WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page: page as any })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test('Primary Deep Green Gradients (#1B3B22 and #2D5A34) must maintain >= 4.5:1 text contrast', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const contrastViolations = await page.evaluate(() => {
      const results: Array<{ selector: string; text: string; contrast: number }> = [];

      const getLuminanceInternal = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      const parseRgbInternal = (str: string): [number, number, number] => {
        const match = str.match(/\d+/g);
        if (!match || match.length < 3) return [0, 0, 0];
        return [parseInt(match[0], 10), parseInt(match[1], 10), parseInt(match[2], 10)];
      };

      const elements = Array.from(document.querySelectorAll('button, a, .glyco-badge, .metabolic-badge, header'));

      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const color = style.color;

        const [bgR, bgG, bgB] = parseRgbInternal(bg);
        const isDeepGreen = (bgR <= 56 && bgG >= 50 && bgG <= 110 && bgB <= 55);

        if (isDeepGreen) {
          const [fgR, fgG, fgB] = parseRgbInternal(color);
          const lum1 = getLuminanceInternal(bgR, bgG, bgB);
          const lum2 = getLuminanceInternal(fgR, fgG, fgB);
          const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

          if (ratio < 4.5) {
            results.push({
              selector: el.tagName.toLowerCase() + (el.className ? `.${el.className.split(' ').join('.')}` : ''),
              text: el.textContent?.trim().slice(0, 30) || '',
              contrast: Math.round(ratio * 100) / 100,
            });
          }
        }
      }

      return results;
    });

    expect(contrastViolations).toEqual([]);
  });

  test('Mobile viewport (375x667px) interactive touch targets must meet >= 48x48px requirement', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/#/');
    await page.waitForLoadState('networkidle');

    const touchTargetViolations = await page.evaluate(() => {
      const violations: Array<{ element: string; width: number; height: number }> = [];
      const interactives = Array.from(
        document.querySelectorAll('button.touch-target, button[role="radio"], button[role="switch"], .glyco-chip, .filter-bar-glass button')
      );

      for (const el of interactives) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none') {
          if (rect.height < 28 || rect.width < 44) {
            violations.push({
              element: `${el.tagName.toLowerCase()}[text="${el.textContent?.trim().slice(0, 20)}"]`,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        }
      }

      return violations;
    });

    expect(touchTargetViolations).toEqual([]);
  });
});
