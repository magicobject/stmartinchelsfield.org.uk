import { test, expect } from './support/fixtures';

// Greg's request (22 Oct 2026): the Services page's "A 5th Sunday" line becomes "5th Sunday" with
// the text "No fixed pattern - please see the calendar", and "calendar" is a link to /calendar.
test.describe('Services page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services.html');
  });

  test('the 5th Sunday line reads "5th Sunday: No fixed pattern — please see the calendar", with the calendar linked', async ({ page }) => {
    const item = page.locator('li', { has: page.locator('.fact-label', { hasText: /^5th Sunday$/ }) });
    await expect(item).toHaveCount(1);
    await expect(item).toHaveText('5th Sunday No fixed pattern — please see the calendar');
    await expect(item.locator('a[href="calendar.html"]')).toHaveText('calendar');
  });

  test('the old "A 5th Sunday" wording is gone', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('A 5th Sunday');
    await expect(page.locator('main')).not.toContainText('when the month has one');
  });

  test('the Choir time no longer says it ends on 13 November (the calendar runs it to December)', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('13 November');
    await expect(page.locator('main')).not.toContainText('nothing further is booked');
  });

  test('every mention of "the calendar" in the page text is a link (the small print\'s "parish\'s own published calendar" names the data source, not our Calendar page)', async ({ page }) => {
    const html = await page.locator('main').innerHTML();
    const unlinked = html.replace(/<a [^>]*>[\s\S]*?<\/a>/g, '').replace(/published calendar/g, '').match(/\bcalendar\b/gi) ?? [];
    expect(unlinked).toHaveLength(0);
  });
});

// Greg's request (6 Nov 2026): a "Special services coming up" box for one-off services, driven by
// src/special-notices.config.mjs, hiding itself once the date has passed (no rebuild).
test.describe('Services page: special services box', () => {
  test('shows the Remembrance Sunday and Patronal Festival entries before 9 November 2026', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-06T10:00:00'));
    await page.goto('/services.html');
    const box = page.locator('.special-notices');
    await expect(box).toBeVisible();
    await expect(box.getByRole('heading', { level: 2, name: 'Special services coming up' })).toBeVisible();
    await expect(box.getByRole('heading', { level: 3, name: 'Remembrance Sunday' })).toBeVisible();
    await expect(box.getByRole('heading', { level: 3, name: 'Patronal Festival Holy Communion' })).toBeVisible();
    await expect(box).toContainText('Sunday 8 November, morning');
    await expect(box).toContainText('Sunday 8 November, evening');
  });

  test('is still there on the day itself', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-08T07:00:00'));
    await page.goto('/services.html');
    await expect(page.locator('.special-notices')).toBeVisible();
  });

  test('disappears entirely once every entry has passed', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-09T09:00:00'));
    await page.goto('/services.html');
    await expect(page.locator('.special-notices')).toBeHidden();
  });
});
