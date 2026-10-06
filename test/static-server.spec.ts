import { test, expect } from './support/fixtures';

test('a path traversal attempt cannot escape public/', async ({ page }) => {
  const response = await page.goto('/../package.json');
  // The browser normalizes ../ before the request even leaves, so this
  // mainly documents intent; the server-side guard is what actually matters
  // and is covered by resolveWithinRoot's own logic in static-server.ts.
  expect(response?.status()).not.toBe(200);
});

test('calendar events data loads and the calendar renders this month', async ({ page }) => {
  await page.goto('/calendar.html');
  await expect(page.locator('#cal-month-label')).not.toBeEmpty();
  await expect(page.locator('.cal-day').first()).toBeVisible();
});

test('the static test server refuses to serve files outside public/, however the traversal is encoded', async ({ request }) => {
  const attempts = [
    '/../../../../../../Windows/win.ini',
    '/..%5c..%5c..%5c..%5c..%5cWindows%5cwin.ini',
    '/..%2f..%2f..%2f..%2f..%2fWindows%2fwin.ini',
  ];
  for (const path of attempts) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), `expected ${path} to be refused`).toBe(404);
  }
});
