import { test, expect } from './support/fixtures';

// Parish requirement R9 (Steve McCann's item 7): "Please import from our old
// website - history hasn't changed much!" Facts below come from the parish's
// own former site (archived April 2024: church.html, parish.html, wellhill.html,
// historic.html, about.html). Nothing here is invented; claims that could not be
// supported are deliberately left out or softened (see the PR description).
test.describe('History & architecture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about.html');
  });

  const section = (page: import('@playwright/test').Page, heading: string) =>
    page.locator('section', { has: page.getByRole('heading', { level: 2, name: heading, exact: true }) }).first();

  test('has the expected sections, in order', async ({ page }) => {
    await expect(page.locator('main h2')).toHaveText([
      'A church built in layers',
      'The Brass Crosby Room',
      'Inside the church',
      'Brass Crosby',
      'The parish of Chelsfield',
      'Well Hill Mission',
      'Famous connections',
      "Rectors of St Martin's",
      'Our Benefice',
    ]);
  });

  test('the church: age, windows, screen, pews, St John\'s Chapel, bells', async ({ page }) => {
    const text = await page.locator('main').innerText();
    for (const fact of [
      'Textus Roffensis', '1122', 'Early English', 'Moira Forsythe', 'flying bomb', '1857', '1886',
      "St John's Chapel", 'Peter Collett', '1607', 'ring of eight bells',
    ]) expect(text, fact).toContain(fact);
  });

  test('explains who the Brass Crosby Room is named after, without repeating unsupported claims', async ({ page }) => {
    const brass = section(page, 'Brass Crosby');
    await expect(brass).toContainText('Lord of the Manor of Chelsfield');
    await expect(brass).toContainText('Lord Mayor of London');
    await expect(brass).toContainText('imprisoned in the Tower of London');
    await expect(brass).toContainText('memorial');
    await expect(brass).toContainText('Blue Plaque');
    await expect(page.locator('main')).not.toContainText('Hansard'); // the old site's causal claim is not supported
  });

  test('the parish: farming, cricket, railway, the war and the bypass', async ({ page }) => {
    const parish = section(page, 'The parish of Chelsfield');
    for (const fact of ['cricket', '1731', 'railway', '1868', 'Flying Bomb', 'Orpington Bypass', 'Deanery of Orpington', 'Archdeaconry of Bromley', 'Diocese of Rochester']) {
      await expect(parish, fact).toContainText(fact);
    }
  });

  test('Well Hill Mission: 1893, the Hart-Dyke gift, hop and fruit pickers', async ({ page }) => {
    const wh = section(page, 'Well Hill Mission');
    for (const fact of ['1893', 'Hart-Dyke', 'Lullingstone Castle', 'Shoreham', 'hop and fruit pickers']) await expect(wh, fact).toContainText(fact);
    await expect(wh.locator('a[href="services.html"]')).toHaveCount(1); // times live on Services/Calendar, not here
  });

  test('famous connections: Miss Read and Edith Nesbit, each under its own heading', async ({ page }) => {
    const fc = section(page, 'Famous connections');
    await expect(fc.getByRole('heading', { level: 3 })).toHaveText(['Miss Read', 'Edith Nesbit']);
    await expect(fc).toContainText('Dora Saint');
    await expect(fc).toContainText('Village School');
    await expect(fc).toContainText('The Railway Children');
  });

  test("lists the 43 recorded rectors of St Martin's, from 1317 to 2014, and then the Rector of the Benefice from 2021", async ({ page }) => {
    const items = section(page, "Rectors of St Martin's").locator('ul.rector-list li');
    await expect(items).toHaveCount(43);
    await expect(items.first()).toHaveText('Richard De Wotton 1317');
    await expect(items.last()).toHaveText('John Tranter 2014');
    await expect(section(page, "Rectors of St Martin's")).toContainText('Susan Atkinson-Jones');
    await expect(section(page, "Rectors of St Martin's")).toContainText('2021');
    // two names have no year in the parish's own list; none is invented
    await expect(items.filter({ hasText: 'Henry Middleham' })).toHaveText('Henry Middleham');
    await expect(items.filter({ hasText: 'Peter Greves' })).toHaveText('Peter Greves');
  });

  test('the Benefice section gives the 2021 date, Deanery, Archdeaconry and Diocese and keeps the link to St Mary\'s', async ({ page }) => {
    const b = section(page, 'Our Benefice');
    await expect(b).toContainText('1 June 2021');
    await expect(b).toContainText('November 2019');
    await expect(b.locator('a[href="https://www.smasch.org"]')).toHaveCount(1);
  });

  test('also mentions the Small Pilgrim Places Network and the Prayer Book Society', async ({ page }) => {
    const text = await page.locator('main').innerText();
    expect(text).toContain('Small Pilgrim Places Network');
    expect(text).toContain('Prayer Book Society');
  });

  test('leaves out the old site\'s out-of-date clergy paragraphs', async ({ page }) => {
    const text = await page.locator('main').innerText();
    expect(text).not.toContain('Gentry');
    expect(text).not.toContain('Associate Rector');
    expect(text).not.toContain('Skibbs Lane');
  });

  test('the lede agrees with the body about the church\'s age, and the bypass detail is kept (fact-check corrections)', async ({ page }) => {
    await expect(page.locator('.page-header .lede')).toContainText('Almost a thousand years');
    await expect(page.locator('main')).not.toContainText('Nine hundred years');
    await expect(section(page, 'The parish of Chelsfield')).toContainText('destroyed the original cricket field and fire station');
    await expect(page.locator('main')).not.toContainText('particularly beautiful and peaceful sanctuary'); // ambiguous in the source, so left out
  });

  test('headings never skip a level', async ({ page }) => {
    const levels = await page.$$eval('main h1, main h2, main h3, main h4', (els) => els.map((e) => Number(e.tagName[1])));
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading ${i}`).toBeLessThanOrEqual(1);
  });

  test('attributes the content to the parish\'s former website', async ({ page }) => {
    await expect(page.locator('main .small-print').last()).toContainText("parish's former website");
  });

  test('at 320px wide nothing overflows sideways and the rector list stays readable', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/about.html');
    const overflow = await page.evaluate(() => document.querySelector('main')!.scrollWidth - document.querySelector('main')!.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('site search finds Miss Read and the Textus Roffensis', async ({ request }) => {
    const index = await (await request.get('/search-index.json')).text();
    expect(index).toContain('Miss Read');
    expect(index).toContain('Textus Roffensis');
  });
});
