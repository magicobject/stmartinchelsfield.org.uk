import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from './support/fixtures';
import { ALL_PAGES } from './support/pages';

// Parish requirement R3 (Steve McCann's item 8): "Please make the Brass Crosby
// Room singular throughout. It's really just one room, plus kitchen and toilets."
const PLURAL = /crosby rooms/i;

for (const { path } of ALL_PAGES) {
  test(`${path} never calls it "Brass Crosby Rooms" (visible text, title, description, structured data)`, async ({ page }) => {
    await page.goto(path);
    const everything = await page.evaluate(() => {
      const meta = [...document.querySelectorAll('meta')].map((m) => m.getAttribute('content') ?? '').join(' ');
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? '').join(' ');
      return [document.title, meta, ld, document.body.innerText].join('\n');
    });
    expect(everything).not.toMatch(PLURAL);
  });
}

test('the search index never uses the plural, and the section heading and anchor are singular', async ({ request }) => {
  const index = await (await request.get('/search-index.json')).text();
  expect(index).not.toMatch(PLURAL);
  expect(index).toMatch(/brass-crosby-room"/);
});

test('History describes it as one room with a kitchen and toilets', async ({ page }) => {
  await page.goto('/about.html');
  await expect(page.locator('#brass-crosby-room')).toHaveText('The Brass Crosby Room');
  await expect(page.locator('main')).toContainText('one room, with a kitchen and toilets');
});

test('links to the Brass Crosby Room section land on it', async ({ page }) => {
  await page.goto('/get-involved.html');
  const link = page.locator('a[href="about.html#brass-crosby-room"]');
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page).toHaveURL(/about\.html#brass-crosby-room$/);
  await expect(page.locator('#brass-crosby-room')).toBeVisible();
});

test('no source file under src/, templates/ or scripts/ still says "Crosby Rooms" (keeps it from creeping back)', async () => {
  const { execSync } = await import('node:child_process');
  const root = join(__dirname, '..');
  let hits: string[] = [];
  try {
    const out = execSync('git grep -il "crosby rooms" -- src templates scripts test-unit ":(exclude)src/pages/updates.html"', { cwd: root, encoding: 'utf8' });
    hits = out.split(/[\r\n]+/).filter(Boolean);
  } catch (e: any) {
    if (e.status !== 1) throw e; // git grep exits 1 when nothing matches, which is what we want
  }
  expect(hits).toEqual([]);
});
