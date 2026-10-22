import { test, expect } from './support/fixtures';

// Parish requirement R12 (Steve McCann's items 9-13): the exact wording the
// parish supplied for how to get here, opening hours and facilities.
test.describe('Visit us: getting here, opening hours, facilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visit-us.html');
  });

  test('By car gives the postcode and the what3words address', async ({ page }) => {
    const item = page.locator('li', { hasText: 'By car' });
    await expect(item).toContainText('Just off the M25 — use the postcode BR6 7SN in your sat nav.');
    await expect(item).toContainText('finger.amused.rate');
    await expect(item).not.toContainText('finger.amuse.rate'); // one wrong word is a different place; confirmed as 'amused' by the parish, Oct 2026
    await expect(item).toContainText(/what3words/i);
  });

  test('By train says a 1 mile walk, or the R7 bus from Orpington station to Chelsfield Village', async ({ page }) => {
    const item = page.locator('li', { hasText: 'By train' });
    await expect(item).toContainText('a 1 mile walk from there, or take the R7 bus from Orpington station to Chelsfield Village');
    await expect(item).not.toContainText('R3');
    await expect(item).not.toContainText('short walk');
  });

  test('On foot says walkable from Chelsfield Village and Station', async ({ page }) => {
    await expect(page.locator('li', { hasText: 'On foot' })).toContainText('Walkable from Chelsfield Village and Station');
  });

  test('opening hours use the parish\'s own sentence', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('The church is normally open each day for private prayer and reflection from 9.30am until 5pm (or dusk when that is earlier)');
    await expect(main).not.toContainText('please check with the parish office');
  });

  test('facilities and access use the parish\'s own sentence, with no "not confirmed" caveat', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('Toilets and gardens are on site. Step-free access, large car park and hearing loop during services');
    await expect(main).not.toContainText("haven't been confirmed");
  });
});

test('the homepage does not contradict the new travel facts', async ({ page }) => {
  await page.goto('/index.html');
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/short walk from chelsfield and orpington stations/i);
});
