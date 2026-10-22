import { test, expect } from './support/fixtures';

// Parish requirement R11 (Steve McCann's item 24): "We'd like a button at the top
// for 'Gallery'... in Philippa's absence I can't yet provide the content." So: the
// menu item and a page that says plainly that photos are coming, built so photos
// can be added later by editing one config file (src/gallery.config.mjs).
test.describe('Gallery', () => {
  test('there is a Gallery item in the primary menu on every page, and it opens the Gallery page', async ({ page }) => {
    for (const path of ['/index.html', '/about.html', '/contact.html', '/safeguarding.html']) {
      await page.goto(path);
      await expect(page.locator('nav#primary-nav a[href="gallery.html"]')).toHaveText('Gallery');
    }
    await page.goto('/index.html');
    await page.locator('nav#primary-nav a[href="gallery.html"]').click();
    await expect(page).toHaveURL(/gallery\.html$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gallery');
  });

  test('the Gallery link is current on the Gallery page', async ({ page }) => {
    await page.goto('/gallery.html');
    await expect(page.locator('nav#primary-nav a[aria-current="page"]')).toHaveText('Gallery');
  });

  test('while there are no photos yet, the page says so plainly: no empty grid, no broken images', async ({ page }) => {
    await page.goto('/gallery.html');
    const main = page.locator('main');
    await expect(main).toContainText('photographs of the church, the churchyard and parish life');
    await expect(main).toContainText('soon');
    await expect(main.locator('.gallery-grid')).toHaveCount(0);
    await expect(main.locator('img')).toHaveCount(0);
  });

  test('invites people with photos to get in touch with a clear button, without inventing a process', async ({ page }) => {
    await page.goto('/gallery.html');
    const button = page.locator('main a.btn-outline[href="contact.html"]');
    await expect(button).toHaveCount(1);
    await expect(button).toHaveText(/Share a photograph/);
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test('is in the sitemap once and found by site search', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap.split('/gallery.html').length - 1).toBe(1);
    const index = await (await request.get('/search-index.json')).text();
    expect(index).toContain('gallery.html');
  });

  test('with eleven items the menu still sits in one row at 1150px and fits inside the page', async ({ page }) => {
    await page.setViewportSize({ width: 1150, height: 800 });
    await page.goto('/index.html');
    const links = page.locator('nav#primary-nav a');
    expect(await links.count()).toBe(11);
    const tops = new Set<number>();
    for (let i = 0; i < (await links.count()); i++) {
      const box = (await links.nth(i).boundingBox())!;
      tops.add(Math.round(box.y));
      expect(box.x + box.width).toBeLessThanOrEqual(1150);
    }
    expect(tops.size).toBe(1);
  });
});
