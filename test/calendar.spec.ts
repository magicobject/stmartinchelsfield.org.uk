import { test, expect } from './support/fixtures';

// Ported from kington-parishes' test/calendar.spec.ts (public/js/calendar.js
// is byte-for-byte the same engine on both sites) — dates below are chosen
// against this site's own src/events.config.mjs data instead.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function currentMonthLabel(): string {
  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

async function gotoMonth(page: import('@playwright/test').Page, target: string) {
  const label = page.locator('#cal-month-label');
  while ((await label.textContent()) !== target) {
    const text = await label.textContent();
    if (text && new Date(`1 ${text}`) < new Date(`1 ${target}`)) {
      await page.locator('#cal-next').click();
    } else {
      await page.locator('#cal-prev').click();
    }
  }
}

test('calendar defaults to the current month', async ({ page }) => {
  await page.goto('/calendar.html');
  await expect(page.locator('#cal-month-label')).toHaveText(currentMonthLabel());
});

test('Next/Prev move a month at a time, Today returns to the current month', async ({ page }) => {
  await page.goto('/calendar.html');
  const label = page.locator('#cal-month-label');
  const start = await label.textContent();

  await page.locator('#cal-next').click();
  await expect(label).not.toHaveText(start!);

  await page.locator('#cal-prev').click();
  await expect(label).toHaveText(start!);

  await page.locator('#cal-next').click();
  await page.locator('#cal-next').click();
  await page.locator('#cal-today').click();
  await expect(label).toHaveText(currentMonthLabel());
});

test('selecting a day shows its events in the agenda panel', async ({ page }) => {
  await page.goto('/calendar.html');
  // 6 September 2026 is seeded with two real events: Holy Communion (9:30am)
  // then Choral Evensong (6:30pm).
  await gotoMonth(page, 'September 2026');
  await page.locator('.cal-day[data-date="2026-09-06"]').click();
  await expect(page.locator('#cal-agenda')).toContainText('Holy Communion');
  await expect(page.locator('#cal-agenda')).toContainText('9:30am');
});

test('a day with two events shows both, in time order', async ({ page }) => {
  await page.goto('/calendar.html');
  // 6 September 2026: Holy Communion (9:30am) then Choral Evensong (6:30pm).
  await gotoMonth(page, 'September 2026');
  const cell = page.locator('.cal-day[data-date="2026-09-06"]');
  await expect(cell.locator('.cal-chip')).toHaveCount(2);
  await expect(cell).toContainText('Holy Communion');
  await expect(cell).toContainText('Choral Evensong');

  await cell.click();
  const agendaItems = page.locator('#cal-agenda .cal-agenda-list li');
  await expect(agendaItems).toHaveCount(2);
  await expect(agendaItems.nth(0)).toContainText('Holy Communion'); // 9:30am, sorts first
  await expect(agendaItems.nth(1)).toContainText('Choral Evensong'); // 6:30pm, sorts second
});

test('a day with more than two events shows a "+N more" chip, but the full list in the agenda', async ({ page }) => {
  await page.goto('/calendar.html');
  // 13 September 2026 is seeded with three real events: Family Worship
  // (9:30am), Well Hill: Morning Prayer (11am), Sung Eucharist BCP (6:30pm)
  // — a genuine overflow day, no need to stub calendar-events.js for it.
  await gotoMonth(page, 'September 2026');
  const cell = page.locator('.cal-day[data-date="2026-09-13"]');
  await expect(cell.locator('.cal-chip:not(.cal-chip--more)')).toHaveCount(2); // 2 real chips...
  await expect(cell.locator('.cal-chip--more')).toHaveText('+1 more'); // ...plus the overflow chip

  await cell.click();
  // ...but the agenda panel still shows all three, uncapped.
  await expect(page.locator('#cal-agenda .cal-agenda-list li')).toHaveCount(3);
  await expect(page.locator('#cal-agenda')).toContainText('Well Hill: Morning Prayer');
});

test('a day with no events shows the agenda\'s empty state, not a blank panel', async ({ page }) => {
  await page.goto('/calendar.html');
  // 1 September 2026 is a Tuesday with nothing seeded on it — the recurring
  // series (Mon/Wed/Fri) don't land on it, and no one-off event falls on
  // this date either — a genuine zero-events day.
  await gotoMonth(page, 'September 2026');
  await page.locator('.cal-day[data-date="2026-09-01"]').click();
  await expect(page.locator('#cal-agenda')).toContainText('Nothing on our calendar for this day.');
  await expect(page.locator('#cal-agenda .cal-agenda-list')).toHaveCount(0);
});

test('Next from December crosses into January of the following year', async ({ page }) => {
  await page.goto('/calendar.html');
  await gotoMonth(page, 'December 2026');
  await page.locator('#cal-next').click();
  await expect(page.locator('#cal-month-label')).toHaveText('January 2027');
});

test('the calendar never causes the page to scroll horizontally, on mobile or desktop', async ({ page }) => {
  await page.goto('/calendar.html');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);

  await page.setViewportSize({ width: 360, height: 800 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
});
