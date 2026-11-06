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

    await expect(service.getByRole('heading', { level: 3 })).toHaveText('Family Worship');
    await expect(service).toContainText('Sun 8 Nov, 9:30am');
    await expect(group.getByRole('heading', { level: 3 })).toHaveText('Churchyard Working Party');
    await expect(group).toContainText('Tomorrow, 9am');
    await expect(special.getByRole('heading', { level: 3 })).toHaveText('Chelsfield Evening WI Christmas Service');
    await expect(special).toContainText('Wed 9 Dec, 2pm');
  });

  test('"Today" is used on the day, and morning services already over are skipped', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-08T12:00:00'));
    await page.goto('/');
    await expect(page.locator('[data-kind="service"]')).toContainText('Today, 6:30pm');
  });

  test('each card links to its page with "More information…"', async ({ page }) => {
    await page.goto('/');
    for (const [kind, href] of [['service', 'services.html'], ['group', 'get-involved.html'], ['special', 'calendar.html']]) {
      const link = page.locator(`[data-kind="${kind}"] a`);
      await expect(link).toHaveText('More information…');
      await expect(link).toHaveAttribute('href', href);
    }
  });

  test('with nothing left in the calendar the cards keep their plain wording and links', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2027-02-01T10:00:00'));
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
