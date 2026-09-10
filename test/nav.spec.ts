import { test, expect } from './support/fixtures';
import { NAV_PAGES, SAFEGUARDING_PAGE, DONATE_PAGE } from './support/pages';

test.describe('primary nav', () => {
  for (const page of NAV_PAGES) {
    test(`${page.path} highlights its own nav link as current`, async ({ page: pw }) => {
      await pw.goto(page.path);
      const current = pw.locator('nav#primary-nav a[aria-current="page"]');
      await expect(current).toHaveText(page.navLabel);
    });
  }

  test('Safeguarding is reachable but never shows as current in the primary nav', async ({ page }) => {
    await page.goto(SAFEGUARDING_PAGE.path);
    await expect(page.locator('nav#primary-nav a[aria-current="page"]')).toHaveCount(0);
    await expect(page.locator('footer.site a[href="safeguarding.html"]')).toBeVisible();
  });

  test('the Donate button appears in the header on every page', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('header.site .btn-donate')).toBeVisible();
  });
});

test.describe('mobile nav toggle', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('closed by default, opens on click, and Escape returns focus to the toggle', async ({ page }) => {
    await page.goto('/index.html');
    const toggle = page.getByRole('button', { name: 'Menu' });
    const nav = page.locator('#primary-nav');

    await expect(nav).not.toHaveClass(/nav-open/);
    await toggle.click();
    await expect(nav).toHaveClass(/nav-open/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(nav).not.toHaveClass(/nav-open/);
    await expect(toggle).toBeFocused();
  });

  test('clicking a link closes the menu', async ({ page }) => {
    await page.goto('/index.html');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('#primary-nav a').first().click();
    await expect(page.locator('#primary-nav')).not.toHaveClass(/nav-open/);
  });
});

test.describe('desktop nav', () => {
  test('the nav toggle is not shown above the collapse breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/index.html');
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.locator('#primary-nav')).toBeVisible();
  });
});
