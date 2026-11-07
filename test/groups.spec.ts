import { test, expect } from './support/fixtures';

// Parish requirement R4 (Steve McCann's items 14-18): the wording and times for
// each group, taken from the parish's own text, and checked against the calendar.
interface CalEvent { date: string; time: string; title: string; location: string }

async function loadEvents(request: import('@playwright/test').APIRequestContext): Promise<CalEvent[]> {
  const body = await (await request.get('/js/calendar-events.js')).text();
  return JSON.parse(body.slice(body.indexOf('['), body.lastIndexOf(']') + 1));
}
// Which occurrence of its weekday in the month a date is (1 = first).
const nth = (date: string) => Math.ceil(Number(date.slice(8, 10)) / 7);
const weekday = (date: string) => new Date(date + 'T12:00:00Z').getUTCDay(); // 0 = Sunday

test.describe('Groups & activities cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/get-involved.html');
  });
  const card = (page: import('@playwright/test').Page, name: string) =>
    page.locator('.card', { has: page.getByRole('heading', { level: 3, name }) });

  test('Toddler Group: term-time wording and 10.30am to 12.00 noon', async ({ page }) => {
    const c = card(page, 'Toddler Group');
    await expect(c).toContainText('A weekly session during school term time for parents, carers and pre-school children — play, songs and a cup of tea. Meets in the Brass Crosby Room');
    await expect(c.locator('.tags')).toContainText('10.30am – 12.00 noon');
    await expect(c).not.toContainText('12:30');
  });

  test('Choir stops at "new voices are always welcome." with no date', async ({ page }) => {
    const c = card(page, 'Choir');
    await expect(c).toContainText('Leads the music at our services — new voices are always welcome.');
    await expect(c).not.toContainText('13 November');
    await expect(c).not.toContainText('Currently running');
  });

  test('Messy Church card', async ({ page }) => {
    const c = card(page, 'Messy Church');
    await expect(c).toContainText("Meets monthly on the 3rd Saturday of most months at St Mary's Church, Green Street Green (part of the same Benefice).");
    await expect(c.locator('a[href="calendar.html"]')).toHaveCount(1);
    await expect(c.locator('.tags')).toContainText('4pm to 6pm');
  });

  test('a note above the groups says to check the calendar in case a session is not going ahead', async ({ page }) => {
    await page.goto('/get-involved.html');
    const note = page.locator('main .group-note');
    await expect(note).toHaveText("These groups meet regularly but please check the calendar just in case the session isn't going ahead that week.");
    await expect(note.locator('a[href="calendar.html"]')).toHaveCount(1);
  });

  test('Community Café card', async ({ page }) => {
    const c = card(page, 'Community Café');
    await expect(c).toContainText('Meets at 2.30pm on the first and third Wednesday of the month at Chelsfield Village Hall. Although it is not a Church group many church members are involved with it and all are welcome.');
  });

  test('Churchyard Working Party card', async ({ page }) => {
    const c = card(page, 'Churchyard Working Party');
    await expect(c).toContainText('Meets on the first Saturday morning each month, from 9–11am, to keep our beautiful churchyard looking good. All are welcome.');
  });

  test('the old "times come from the parish calendar" note no longer mentions the choir running to a date', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('Currently running to');
  });

  test('the Ladies Group time is said to be unconfirmed once, in its card, not repeated below the grid', async ({ page }) => {
    const text = await page.locator('main').innerText();
    expect(text.match(/Ladies Group/g)?.length).toBe(1);
    await expect(card(page, 'Ladies Group')).toContainText(/get in touch/i);
  });
});

test.describe('the calendar agrees with what the cards say', () => {
  test('Choir Practice carries on past 13 November (it was a calendar error), but not on Christmas Day', async ({ request }) => {
    const choir = (await loadEvents(request)).filter((e) => e.title === 'Choir Practice').map((e) => e.date);
    expect(choir).toContain('2026-11-20');
    expect(choir).toContain('2026-12-18');
    expect(choir).not.toContain('2026-12-25');
    expect(choir.every((d) => weekday(d) === 5)).toBe(true);
  });

  test('Churchyard Working Party is always the first Saturday, 9am', async ({ request }) => {
    const wp = (await loadEvents(request)).filter((e) => e.title === 'Churchyard Working Party');
    expect(wp.length).toBeGreaterThanOrEqual(4);
    for (const e of wp) {
      expect(weekday(e.date), e.date).toBe(6);
      expect(nth(e.date), e.date).toBe(1);
      expect(e.time).toBe('09:00');
    }
  });

  test('Community Café is always the first or third Wednesday, 2.30pm', async ({ request }) => {
    const cafe = (await loadEvents(request)).filter((e) => e.title === 'Chelsfield Community Cafe');
    expect(cafe.length).toBeGreaterThanOrEqual(4);
    for (const e of cafe) {
      expect(weekday(e.date), e.date).toBe(3);
      expect([1, 3], e.date).toContain(nth(e.date));
      expect(e.time).toBe('14:30');
    }
  });

  test('Messy Church is always the third Saturday, at St Mary\'s', async ({ request }) => {
    const mc = (await loadEvents(request)).filter((e) => e.title.startsWith('Messy Church'));
    expect(mc.length).toBeGreaterThanOrEqual(3);
    for (const e of mc) {
      expect(weekday(e.date), e.date).toBe(6);
      expect(nth(e.date), e.date).toBe(3);
      expect(e.location).toBe("St Mary's");
    }
  });
});

// Greg's request (6 Nov 2026): Groups & activities also lists upcoming one-off events from the calendar.
test.describe('Groups & activities: one-off events', () => {
  const section = (page: import('@playwright/test').Page) =>
    page.locator('section', { has: page.getByRole('heading', { level: 2, name: 'One-off events' }) });

  test('lists the next six one-off events, with the date, time and place, in date order', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-01T10:00:00'));
    await page.goto('/get-involved.html');
    const items = section(page).locator('li');
    await expect(items).toHaveCount(6);
    await expect(items.nth(0)).toContainText('Sat 19 Sep, 10am');
    await expect(items.nth(0)).toContainText("Autumn Walk from St Martin's Church");
    await expect(items.nth(2)).toContainText('Sat 24 Oct, 7pm');
    await expect(items.nth(2)).toContainText("Annual St Martin's Quiz Night");
    await expect(items.nth(2)).toContainText('Chelsfield Village Hall');
  });

  test('services and regular groups are not listed as one-off events', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-01T10:00:00'));
    await page.goto('/get-involved.html');
    await expect(section(page)).not.toContainText('Holy Communion');
    await expect(section(page)).not.toContainText('Repair Cafe');
  });

  test('an event that has already happened is not listed', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-01T10:00:00'));
    await page.goto('/get-involved.html');
    await expect(section(page).locator('li')).toHaveCount(6);
    await expect(section(page)).not.toContainText('Autumn Walk');
    await expect(section(page).locator('li').first()).toContainText('Fri 23 Oct, 7pm');
  });

  test('with none upcoming the page says so and points to the calendar', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2027-07-15T10:00:00'));
    await page.goto('/get-involved.html');
    await expect(section(page).locator('li')).toHaveCount(1);
    await expect(section(page).locator('li')).toContainText('No one-off events are booked at the moment');
    await expect(section(page).locator('li a')).toHaveAttribute('href', 'calendar.html');
  });
});
