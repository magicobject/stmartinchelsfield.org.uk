import { test, expect } from './support/fixtures';
import type { Page } from '@playwright/test';

// Regression guard: header.site is position: sticky; top: 0 and overlays
// whatever's scrolled underneath it. Jumping to any #anchor — a search
// result, a person's card, a heading ensureSectionIds gave an id to — used
// to land the target flush at the very top of the scrollport, hidden behind
// the header. Now every :target gets scroll-margin-top: var(--header-offset),
// set to the header's real measured height by the inline script right after
// {{HEADER}} in templates/page.html. These specs check the actual rendered
// position, not just that the CSS variable exists. Ported from
// kington-parishes' identical test/anchor-scroll.spec.ts (same shared
// template mechanism).
//
// Reduced motion is emulated throughout: the site's own
// @media (prefers-reduced-motion: reduce) rule switches scroll-behavior from
// smooth to auto, so the fragment-scroll lands instantly instead of over a
// CSS transition — without that, a boundingBox() read right after
// navigation can catch mid-animation and pass either way, fix or no fix.

async function expectClearOfHeader(page: Page, targetSelector: string) {
  const headerBottom = await page.evaluate(
    () => document.querySelector('header.site')!.getBoundingClientRect().bottom,
  );
  // 1px tolerance: the browser scroll-snaps to a device pixel while
  // --header-offset is a fractional CSS value, so a sub-pixel gap (well
  // under what's visible) is expected here, not a bug to chase.
  await expect
    .poll(async () => (await page.locator(targetSelector).boundingBox())?.y, {
      message: `${targetSelector} should have scrolled clear of the ${headerBottom}px-tall sticky header`,
    })
    .toBeGreaterThanOrEqual(headerBottom - 1);
}

test('following a search result to a person card scrolls it fully clear of the sticky header', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/index.html');
  await page.getByRole('combobox', { name: 'Search the site' }).fill('Barry Foale');
  const result = page.locator('#site-search-results a[href^="people.html#"]').first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/people\.html#barry-foale/);

  await expectClearOfHeader(page, ':target');
  await expect(page.locator(':target')).toBeInViewport();
});

test('a direct link to a person card anchor is not hidden behind the header, at desktop width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/people.html#steve-mccann');
  await expectClearOfHeader(page, '#steve-mccann');
});

test.describe('narrow viewport (taller, wrapped header)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('a direct link to a person card anchor is not hidden behind the header, at mobile width', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/people.html#steve-mccann');
    await expectClearOfHeader(page, '#steve-mccann');
  });
});

test('a direct link to a page section (the Brass Crosby Rooms) is not hidden behind the header', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about.html#brass-crosby-rooms');
  await expectClearOfHeader(page, '#brass-crosby-rooms');
});
