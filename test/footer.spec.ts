import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

const ALL_PATHS = [...ALL_PAGES.map((p) => p.path), '/404.html'];

// The build number lives only on /updates.html, not in every page's footer:
// stamping it sitewide meant every commit rewrote every page in public/.
test('/updates.html shows the current build number', async ({ page }) => {
  await page.goto('/updates.html');

  const buildNumber = page.locator('.page-header .build-number');
  await expect(buildNumber).toBeVisible();
  await expect(buildNumber).toHaveText(/^Current build: \d{4}\.\d{2}\.\d{2}\.\d{3}$/);
});

for (const path of ALL_PATHS) {
  test(`${path} has no build number in the footer`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('footer .build-number')).toHaveCount(0);
  });

  test(`${path} credits mediawright.uk in the footer`, async ({ page }) => {
    await page.goto(path);

    const credit = page.locator('.fine a[href="https://mediawright.uk"]');
    await expect(credit).toBeVisible();
    await expect(credit).toHaveText('mediawright.uk');
  });
}

// Greg's request (22 Oct 2026): "Church of England" and "Diocese of Rochester" in the footer
// link to those organisations' own sites, each in a separate tab.
for (const path of ALL_PATHS) {
  test(`${path} footer links Church of England and Diocese of Rochester to their own sites, in new tabs`, async ({ page }) => {
    await page.goto(path);
    const coe = page.locator('footer.site a[href="https://www.churchofengland.org/"]');
    const diocese = page.locator('footer.site a[href="https://www.rochester.anglican.org/"]');
    await expect(coe).toHaveCount(1);
    await expect(diocese).toHaveCount(1);
    await expect(coe).toContainText('Church of England');
    await expect(diocese).toContainText('Diocese of Rochester');
    for (const link of [coe, diocese]) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link.locator('.visually-hidden')).toHaveText('(opens in a new tab)');
    }
  });
}

test('the footer still reads "Church of England · Diocese of Rochester" as one line of text', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('footer.site .foot-note').first()).toHaveText(/^Church of England \(opens in a new tab\) · Diocese of Rochester \(opens in a new tab\)$/);
});

// Greg's request (22 Oct 2026), option A: the footer address on three lines, with commas.
for (const path of ALL_PATHS) {
  test(`${path} footer shows the address on three lines: venue, "Church Road, Chelsfield, Orpington,", then "Kent BR6 7SN"`, async ({ page }) => {
    await page.goto(path);
    const address = page.locator('footer.site .foot-grid > div').first().locator('p').nth(1);
    const lines = (await address.innerText()).split(/\r?\n/).map((l) => l.trim());
    expect(lines).toEqual([
      'St Martin of Tours Church,',
      'Church Road, Chelsfield, Orpington,',
      'Kent BR6 7SN',
    ]);
  });
}
