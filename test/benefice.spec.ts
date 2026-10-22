import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

// Parish requirement R2 (Steve McCann's items 2 and 26): the Benefice is named
// on the front page, and the St Mary's website is linked. Nothing else about
// the other parishes is published until they have been told.
const BENEFICE_LINE = 'Part of the Benefice of Chelsfield with Green St Green and Pratts Bottom';
const SMASCH = 'https://www.smasch.org';

test('the homepage names the Benefice below the main title and above the row of buttons', async ({ page }) => {
  await page.goto('/index.html');
  const h1 = page.locator('.hero h1');
  const line = page.locator('.hero .hero-benefice');
  const buttons = page.locator('.hero .hero-ctas');
  await expect(line).toHaveText(BENEFICE_LINE);
  const [h, l, b] = await Promise.all([h1.boundingBox(), line.boundingBox(), buttons.boundingBox()]);
  expect(l!.y).toBeGreaterThan(h!.y + h!.height - 1);
  expect(l!.y + l!.height).toBeLessThanOrEqual(b!.y + 1);
});

test('History has an "Our Benefice" section that names the Benefice and links to the St Mary\'s website', async ({ page }) => {
  await page.goto('/about.html');
  const section = page.locator('#our-benefice');
  await expect(section).toHaveText('Our Benefice');
  const link = page.locator('main a[href="' + SMASCH + '"]');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(page.locator('main')).toContainText('Benefice of Chelsfield with Green St Green and Pratts Bottom');
});

for (const { path } of ALL_PAGES) {
  test(`${path} footer names the Benefice and links to the St Mary's website`, async ({ page }) => {
    await page.goto(path);
    const footer = page.locator('footer.site');
    await expect(footer).toContainText(BENEFICE_LINE);
    const link = footer.locator('a[href="' + SMASCH + '"]');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('rel', /noopener/);
  });
}

test('nothing from the other parishes\' A Church Near You pages was imported (they are inaccurate)', async ({ page }) => {
  for (const { path } of ALL_PAGES) {
    await page.goto(path);
    expect(await page.locator('body').innerText(), path).not.toMatch(/all souls/i);
  }
});

test('the Benefice section is found by site search', async ({ request }) => {
  const index = await (await request.get('/search-index.json')).text();
  expect(index).toMatch(/our-benefice/);
});
