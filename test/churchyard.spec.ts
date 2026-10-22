import { test, expect } from './support/fixtures';

// Parish requirement R10 (Steve McCann's item 25): "We need a section for our
// churchyard (It's about 4 acres). We have monthly working parties ... which need
// advertising ... plus we need to put the official Churchyard Regulations on it."
// Background facts come from the parish's former website (church.html, gardening.html).
test.describe('Churchyard page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/churchyard.html');
  });

  const section = (page: import('@playwright/test').Page, heading: string) =>
    page.locator('section', { has: page.getByRole('heading', { level: 2, name: heading, exact: true }) }).first();

  test('says the churchyard is about four acres', async ({ page }) => {
    await expect(page.locator('main')).toContainText('about four acres');
  });

  test('has the expected sections, in order', async ({ page }) => {
    await expect(page.locator('main h2')).toHaveText(['A peaceful haven', 'Looking after the churchyard', 'Churchyard regulations']);
  });

  test('describes the churchyard through the year, from the parish\'s own words', async ({ page }) => {
    const haven = section(page, 'A peaceful haven');
    for (const fact of ['snowdrops', 'cowslips', 'cow-parsley', 'Remembrance Sunday', '61 different species', '2003', '2014', 'footpaths']) {
      await expect(haven, fact).toContainText(fact);
    }
  });

  test('advertises the monthly working party (first Saturday, 9–11am) and links to the calendar and the contact', async ({ page }) => {
    const care = section(page, 'Looking after the churchyard');
    await expect(care).toContainText('Churchyard Working Party');
    await expect(care).toContainText('first Saturday of each month');
    await expect(care).toContainText('9–11am');
    await expect(care.locator('a[href="calendar.html"]')).toHaveCount(1);
    await expect(care.locator('a[href^="mailto:churchwardens@"]')).toHaveCount(1);
    await expect(care.locator('a[href="get-involved.html"]')).toHaveCount(1);
  });

  test('is honest that the official Churchyard Regulations are still to be added, and links no unapproved document', async ({ page }) => {
    const regs = section(page, 'Churchyard regulations');
    await expect(regs).toContainText('are being added to this page');
    await expect(regs.locator('a[href^="mailto:churchwardens@"]')).toHaveCount(1);
    await expect(page.locator('main a[href$=".pdf"]')).toHaveCount(0);
  });

  test('no email address is shown as text', async ({ page }) => {
    expect(await page.locator('main').innerText()).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  });

  test('is in the sitemap once and found by site search', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap.split('/churchyard.html').length - 1).toBe(1);
    const index = await (await request.get('/search-index.json')).text();
    expect(index).toContain('churchyard.html');
  });
});

test('the Groups page Churchyard Working Party card links to the Churchyard page', async ({ page }) => {
  await page.goto('/get-involved.html');
  const card = page.locator('.card', { has: page.getByRole('heading', { level: 3, name: 'Churchyard Working Party' }) });
  await expect(card.locator('a[href="churchyard.html"]')).toHaveCount(1);
});

test('the calendar still lists the working party on first Saturdays at 9am (the page and the calendar agree)', async ({ request }) => {
  const body = await (await request.get('/js/calendar-events.js')).text();
  const events: { date: string; time: string; title: string }[] = JSON.parse(body.slice(body.indexOf('['), body.lastIndexOf(']') + 1));
  const wp = events.filter((e) => e.title === 'Churchyard Working Party');
  expect(wp.length).toBeGreaterThanOrEqual(4);
  for (const e of wp) {
    expect(new Date(e.date + 'T12:00:00Z').getUTCDay(), e.date).toBe(6);
    expect(Math.ceil(Number(e.date.slice(8, 10)) / 7), e.date).toBe(1);
    expect(e.time).toBe('09:00');
  }
});

test.describe('the header nav with the new Churchyard item', () => {
  test('stays inside the page at 1150px and 1280px (no clipping, no horizontal scroll)', async ({ page }) => {
    for (const width of [1150, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/index.html');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${width}px`).toBeLessThanOrEqual(0);
      const links = page.locator('nav#primary-nav a');
      for (let i = 0; i < (await links.count()); i++) {
        const box = (await links.nth(i).boundingBox())!;
        expect(box.x + box.width, `${width}px link ${i}`).toBeLessThanOrEqual(width);
      }
    }
  });
});
