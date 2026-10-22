import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

// The general parish address must not appear as plain text in any page's source (the repo rule:
// obfuscation token only), and the footer link says "Email the parish" instead of showing it.
// (Found by the whole-site review, Oct 2026; showing the 33-character address also pushed the
// footer 6px past the edge of a 320px screen with the real fonts.)
const ADDRESS = 'stmartin.chelsfield@btinternet.com';
const publicDir = join(__dirname, '..', 'public');
const PATHS = [...ALL_PAGES.map((p) => p.path), '/404.html'];

for (const path of PATHS) {
  test(`${path} footer offers "Email the parish" as a link, not the address as text`, async ({ page }) => {
    await page.goto(path);
    const link = page.locator(`footer.site a[href="mailto:${ADDRESS}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveText('Email the parish');
    expect(await page.locator('footer.site').innerText()).not.toContain('@');
  });
}

test('the address appears in no built page as plain text (structured data for search engines is exempt)', async () => {
  for (const file of readdirSync(publicDir).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(join(publicDir, file), 'utf8').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
    expect(html.includes(ADDRESS), `${ADDRESS} in plain text in public/${file}`).toBe(false);
  }
  expect(readFileSync(join(publicDir, 'search-index.json'), 'utf8')).not.toContain(ADDRESS);
});

test('the privacy policy links to the parish address without printing it', async ({ page }) => {
  await page.goto('/privacy-policy.html');
  expect(await page.locator('main').innerText()).not.toContain('@');
  await expect(page.locator(`main a[href="mailto:${ADDRESS}"]`)).not.toHaveCount(0);
});
