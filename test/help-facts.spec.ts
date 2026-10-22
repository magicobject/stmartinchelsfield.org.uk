import { test, expect } from './support/fixtures';

// The help guide says, in plain English, which file each kind of fact lives in, so a non-technical
// person can ask for the right change. Every file named here must really exist (checked below).
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const FILES = [
  'src/people.config.mjs',
  'src/events.config.mjs',
  'src/site.config.mjs',
  'src/gallery.config.mjs',
  'src/newsletter.config.mjs',
  'src/pages/safeguarding.html',
  'src/pages/safeguarding-policy.html',
  'src/pages/about.html',
  'src/pages/churchyard.html',
  'docs/plans/2026-10-parish-requirements.md',
];

test('the help guide has a "Where each fact lives" section naming each source file', async ({ page }) => {
  await page.goto('/help-making-a-change.html');
  await expect(page.getByRole('heading', { level: 2, name: 'Where each fact lives' })).toBeVisible();
  const text = await page.locator('main').innerText();
  for (const file of FILES.slice(0, 9)) expect(text, file).toContain(file.replace('src/pages/', '').replace('src/', ''));
});

test('every file the guide names exists in the repo', () => {
  const root = join(__dirname, '..');
  for (const file of FILES) expect(existsSync(join(root, file)), file).toBe(true);
});
