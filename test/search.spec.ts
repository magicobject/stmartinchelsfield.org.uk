import { test, expect } from './support/fixtures';

test('typing a query shows matching results as real links', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#site-search-input').fill('services');
  const results = page.locator('#site-search-results a[role="option"]');
  await expect(results.first()).toBeVisible();
  const href = await results.first().getAttribute('href');
  expect(href).toMatch(/\.html#/);
});

test('a query with no matches shows an empty state', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#site-search-input').fill('zzzznomatch');
  await expect(page.locator('.site-search-empty')).toBeVisible();
});

test('clicking a result navigates to that page and anchor', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#site-search-input').fill('safeguarding');
  const first = page.locator('#site-search-results a[role="option"]').first();
  await first.click();
  await expect(page).toHaveURL(/safeguarding\.html#/);
});

test('ordinary search never surfaces the hidden help guide', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#site-search-input').fill('claude desktop');
  await expect(page.locator('.site-search-empty')).toBeVisible();
});

test('on a help page, search is scoped to the help guide only', async ({ page }) => {
  await page.goto('/help.html');
  await expect(page.locator('#site-search-input')).toHaveAttribute('placeholder', 'Search the help guide');

  await page.locator('#site-search-input').fill('claude');
  const results = page.locator('#site-search-results a[role="option"]');
  await expect(results.first()).toBeVisible();

  // And it should NOT surface ordinary site content while scoped to help.
  await page.locator('#site-search-input').fill('eucharist');
  await expect(page.locator('.site-search-empty')).toBeVisible();
});
