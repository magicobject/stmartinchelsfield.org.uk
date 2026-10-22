import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

// No page may scroll sideways on a phone or a narrow window. The whole-site test pass
// (Oct 2026) found /visit-us.html 483px wide on a 375px screen, and a few help pages
// and /updates.html wider than 320px; nothing was checking every page.
// Note: this suite blocks Google Fonts, so text renders narrower than for real visitors;
// this check catches layout bugs (wide children, unwrapped code/links), not font-width ones.
const PATHS = [...ALL_PAGES.map((p) => p.path), '/404.html'];

for (const width of [320, 375, 768]) {
  for (const path of PATHS) {
    test(`${path} does not scroll sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const { scrollWidth, clientWidth, culprits } = await page.evaluate(() => {
        const cw = document.documentElement.clientWidth;
        const wide = [...document.querySelectorAll('body *')]
          .filter((e) => e.getBoundingClientRect().right > cw + 1 && getComputedStyle(e).position !== 'fixed')
          .slice(0, 4)
          .map((e) => `${e.tagName.toLowerCase()}.${(e as HTMLElement).className || ''} (right ${Math.round(e.getBoundingClientRect().right)})`);
        return { scrollWidth: document.documentElement.scrollWidth, clientWidth: cw, culprits: wide };
      });
      expect(scrollWidth, `wider than the screen: ${culprits.join('; ')}`).toBeLessThanOrEqual(clientWidth);
    });
  }
}
