import { test, expect } from './support/fixtures';

// Greg's request (6 Nov 2026): the homepage's three "At a glance" boxes become three "Coming up"
// cards (next service, next group activity, next special event), each with a "More information"
// link, filled in from the calendar.
test.describe('Homepage: Coming up cards', () => {
  test('the old At a glance boxes are gone', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).not.toContainText('Old and new, side by side');
    await expect(page.locator('main')).not.toContainText('Worship, week by week');
    await expect(page.locator('main')).not.toContainText('Easy to find');
  });

  test('on Friday 6 November 2026 the cards show the next service, group activity and special event', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-06T10:00:00'));
    await page.goto('/');
    const service = page.locator('[data-kind="service"]');
    const group = page.locator('[data-kind="group"]');
    const special = page.locator('[data-kind="special"]');

    await expect(service.getByRole('heading', { level: 3 })).toHaveText('Remembrance Day Service');
    await expect(service).toContainText('Sun 8 Nov, 10:15am');
    await expect(group.getByRole('heading', { level: 3 })).toHaveText('Churchyard Working Party');
    await expect(group).toContainText('Tomorrow, 9am');
    // Remembrance Day is special too, but it is already the service card, so the next different one shows.
    await expect(special.getByRole('heading', { level: 3 })).toHaveText('Patronal Festival');
    await expect(special).toContainText('Sun 8 Nov, 6:30pm');
  });

  test('"Today" is used on the day, and morning services already over are skipped', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-08T12:00:00'));
    await page.goto('/');
    await expect(page.locator('[data-kind="service"]')).toContainText('Today, 6:30pm');
  });

  test('each card links to its page with "More information…", and the link says which page for screen readers', async ({ page }) => {
    await page.goto('/');
    for (const [kind, href, name] of [
      ['service', 'services.html', 'More information… about services'],
      ['group', 'get-involved.html', 'More information… about groups and activities'],
      ['special', 'calendar.html', 'More information… about special events'],
    ]) {
      const link = page.locator(`[data-kind="${kind}"] a`);
      await expect(link).toHaveAttribute('href', href);
      await expect(page.getByRole('link', { name })).toHaveAttribute('href', href);
      await expect(link).toContainText('More information');
    }
  });

  test('the links are at least 44px tall, so they can be tapped on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    for (const kind of ['service', 'group', 'special']) {
      const box = await page.locator(`[data-kind="${kind}"] a`).boundingBox();
      expect(box!.height, kind).toBeGreaterThanOrEqual(44);
    }
  });

  test('the venue is shown only when it is not the church', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-06T10:00:00'));
    await page.goto('/');
    await expect(page.locator('[data-kind="service"]')).not.toContainText('St Martin of Tours');
    await expect(page.locator('[data-kind="service"] .wn-where')).toBeHidden();
    await page.clock.setFixedTime(new Date('2026-11-17T10:00:00'));
    await page.reload();
    // The next group activity is then the Community Cafe at the village hall.
    await expect(page.locator('[data-kind="group"] .wn-where')).toHaveText('Chelsfield Village Hall');
  });

  test('a special service shown as the next service is not repeated as the next special event', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-12-09T12:00:00'));
    await page.goto('/');
    await expect(page.locator('[data-kind="service"] h3')).toHaveText('Chelsfield Evening WI Christmas Service');
    await expect(page.locator('[data-kind="special"] h3')).toHaveText('Village School Christmas Service');
  });

  test('on a phone the church photo does not push the cards a screen down', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await expect(page.locator('.hero-photo')).toBeHidden();
    const top = await page.locator('.whats-next').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    expect(top).toBeLessThan(800);
  });

  test('with nothing left in the calendar the cards keep their plain wording and links', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2027-07-15T10:00:00'));
    await page.goto('/');
    await expect(page.locator('[data-kind="service"] h3')).toHaveText("Services at St Martin's");
    await expect(page.locator('[data-kind="special"] h3')).toHaveText('Special services & events');
    await expect(page.locator('[data-kind="special"] a')).toHaveAttribute('href', 'calendar.html');
  });

  test('the cards come before the Get involved section, under the banner', async ({ page }) => {
    await page.goto('/');
    const order = await page.locator('main h2').allTextContents();
    expect(order.slice(0, 2)).toEqual(['Coming up', 'Get involved']);
  });

  test('there is no spotlight band while the list is empty', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.spotlight')).toHaveCount(0);
  });
});
