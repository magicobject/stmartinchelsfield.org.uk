import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

// Parish requirement R2 (Steve McCann's items 2 and 26): the Benefice is named
// on the front page, and the St Mary's website is linked. Nothing else about
// the other parishes is published until they have been told.
const BENEFICE_LINE = 'Part of the Benefice of Chelsfield with Green St Green and Pratts Bottom';
const SMASCH = 'https://www.smasch.org';

// Greg clarified (22 Oct 2026) that the line belongs in the HEADER of every page: below the church
// title and above the row of buttons/links. (It was first put in the homepage banner.)
for (const { path } of ALL_PAGES) {
  test(`${path} header names the Benefice below the church title and above the menu`, async ({ page }) => {
    await page.goto(path);
    const line = page.locator('header.site .header-benefice');
    await expect(line).toHaveText(BENEFICE_LINE);
    const [brand, l, nav] = await Promise.all([
      page.locator('header.site .brand').boundingBox(),
      line.boundingBox(),
      page.locator('header.site nav#primary-nav a').first().boundingBox(),
    ]);
    expect(l!.y).toBeGreaterThanOrEqual(brand!.y + brand!.height - 1);
    expect(l!.y + l!.height).toBeLessThanOrEqual(nav!.y + 1);
  });
}

test('on a phone the line sits under the title and above the Menu button and the two buttons', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/index.html');
  const line = (await page.locator('header.site .header-benefice').boundingBox())!;
  const brand = (await page.locator('header.site .brand').boundingBox())!;
  expect(line.y).toBeGreaterThanOrEqual(brand.y + brand.height - 1);
  for (const sel of ['header.site .nav-toggle', 'header.site a.btn-safeguarding', 'header.site .btn-donate']) {
    const box = (await page.locator(sel).boundingBox())!;
    expect(box.y, sel).toBeGreaterThanOrEqual(line.y + line.height - 1);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('the homepage banner no longer repeats the line (it is in the header)', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('main')).not.toContainText(BENEFICE_LINE);
  await expect(page.locator('.hero-benefice')).toHaveCount(0);
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
