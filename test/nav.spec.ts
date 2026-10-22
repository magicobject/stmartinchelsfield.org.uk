import { test, expect } from './support/fixtures';
import { NAV_PAGES, SAFEGUARDING_PAGE, DONATE_PAGE, ALL_PAGES } from './support/pages';

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

// Parish requirement R1: a Home link in the menu, and a Safeguarding pill in the header.
test.describe('Home link in the primary nav', () => {
  test('Home is the first item in the primary nav and goes to the homepage', async ({ page }) => {
    await page.goto('/about.html');
    const first = page.locator('nav#primary-nav a').first();
    await expect(first).toHaveText('Home');
    await expect(first).toHaveAttribute('href', 'index.html');
  });

  test('Home is the current page on the homepage, and only there', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('nav#primary-nav a[aria-current="page"]')).toHaveText('Home');
    await page.goto('/visit-us.html');
    await expect(page.locator('nav#primary-nav a', { hasText: /^Home$/ })).not.toHaveAttribute('aria-current', 'page');
  });
});

test.describe('Safeguarding pill in the header', () => {
  for (const { path } of ALL_PAGES.filter((p) => p.hasHeader !== false)) {
    test(`${path} shows a Safeguarding pill in the header that goes to the safeguarding page`, async ({ page }) => {
      await page.goto(path);
      const pill = page.locator('header.site .header-ctas a.btn-safeguarding');
      await expect(pill).toBeVisible();
      await expect(pill).toHaveText('Safeguarding');
      await expect(pill).toHaveAttribute('href', 'safeguarding.html');
    });
  }

  test('the pill sits beside Donate and stays visible with the mobile menu closed', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/index.html');
    await expect(page.locator('#primary-nav')).not.toHaveClass(/nav-open/);
    await expect(page.locator('header.site a.btn-safeguarding')).toBeVisible();
    await expect(page.locator('header.site .btn-donate')).toBeVisible();
  });

  test('every header control stays inside the viewport at 320px, menu closed and open', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/index.html');
    const check = async () => {
      for (const sel of ['header.site .brand', 'header.site a.btn-safeguarding', 'header.site .btn-donate', 'header.site .nav-toggle', 'header.site .header-search input']) {
        const box = await page.locator(sel).boundingBox();
        expect(box!.x, sel + ' starts inside the viewport').toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width, sel + ' ends inside the viewport').toBeLessThanOrEqual(320);
      }
      const headerOverflow = await page.evaluate(() => {
        const h = document.querySelector('header.site')!;
        return h.scrollWidth - h.clientWidth;
      });
      expect(headerOverflow).toBeLessThanOrEqual(0);
    };
    await check();
    await page.getByRole('button', { name: 'Menu' }).click();
    await check();
  });

  test('on a phone the Menu button and both pills share one row under the brand (header stays compact)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/index.html');
    const menu = (await page.locator('header.site .nav-toggle').boundingBox())!;
    const pill = (await page.locator('header.site a.btn-safeguarding').boundingBox())!;
    const donate = (await page.locator('header.site .btn-donate').boundingBox())!;
    expect(Math.abs(menu.y - pill.y)).toBeLessThan(20);
    expect(Math.abs(pill.y - donate.y)).toBeLessThan(20);
    const headerHeight = (await page.locator('header.site').boundingBox())!.height;
    expect(headerHeight).toBeLessThan(200);
  });

  test('the Safeguarding pill shows a strong keyboard focus ring', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('header.site a.btn-safeguarding').focus();
    const outline = await page.locator('header.site a.btn-safeguarding').evaluate((el) => {
      const s = getComputedStyle(el);
      return { width: parseFloat(s.outlineWidth), style: s.outlineStyle, color: s.outlineColor };
    });
    expect(outline.style).not.toBe('none');
    expect(outline.width).toBeGreaterThanOrEqual(3);
    expect(outline.color).toBe('rgb(31, 42, 64)'); // --navy: 14.8:1 on the cream header, 3:1+ needed
  });

  test('the pill and the Donate button are both keyboard-reachable and meet the minimum target size', async ({ page }) => {
    await page.goto('/index.html');
    for (const sel of ['header.site a.btn-safeguarding', 'header.site .btn-donate']) {
      const box = await page.locator(sel).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(24);
      expect(box!.width).toBeGreaterThanOrEqual(24);
    }
  });
});
