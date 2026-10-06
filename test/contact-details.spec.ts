import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

// Regression guard for the DRY token system (src/site.config.mjs): every
// {{TOKEN}} must have been substituted by the build on every page.
const ALL_PATHS = [...ALL_PAGES.map((p) => p.path), '/404.html'];

for (const path of ALL_PATHS) {
  test(`${path} has no leftover {{TOKEN}} placeholders`, async ({ page }) => {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });
}
