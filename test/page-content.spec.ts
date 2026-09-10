import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

for (const page of ALL_PAGES) {
  test(`${page.path} shows its own title and heading`, async ({ page: pw }) => {
    await pw.goto(page.path);
    await expect(pw).toHaveTitle(new RegExp(page.titleContains));
    await expect(pw.locator('h1')).toHaveText(page.heading);
  });

  test(`${page.path} carries a canonical link`, async ({ page: pw }) => {
    await pw.goto(page.path);
    await expect(pw.locator('link[rel="canonical"]')).toHaveCount(1);
  });

  test(`${page.path} has no unreplaced {{TOKEN}} placeholders`, async ({ page: pw }) => {
    await pw.goto(page.path);
    const html = await pw.content();
    expect(html).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });
}

test('every real page carries robots noindex,nofollow while this build awaits parish review', async ({ page }) => {
  for (const p of ALL_PAGES) {
    await page.goto(p.path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  }
});
