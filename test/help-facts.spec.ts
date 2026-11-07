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

test.describe('Help guide: what you need to start', () => {
  test('Setting up says a Claude Pro account is needed for Claude Code', async ({ page }) => {
    await page.goto('/help-getting-set-up.html');
    await expect(page.locator('main')).toContainText('You need a Claude Pro account (or a higher plan) to use Claude Code');
  });

  test('Making a change says to click the Claude Code icon and start a new session', async ({ page }) => {
    await page.goto('/help-making-a-change.html');
    await expect(page.locator('main')).toContainText('click the Claude Code icon, then start a new session');
  });
});

test.describe('Help guide: Still stuck?', () => {
  test('explains held changes, links the repository and Technical Details, and says how to reach Greg', async ({ page, request }) => {
    await page.goto('/help-when-it-goes-wrong.html');
    const section = page.locator('main div', { has: page.getByRole('heading', { name: 'Still stuck?' }) }).last();
    await expect(section).toContainText('held in GitHub');
    await expect(section).toContainText('ask Greg first');
    await expect(section).toContainText('Nothing is unrecoverable');
    await expect(section.locator('a[href="https://github.com/magicobject/stmartinchelsfield.org.uk"]')).toHaveCount(1);
    await expect(section.locator('a[href="help-technical-details.html"]')).toHaveCount(1);
    await expect(section.locator('a[href="tel:+447449301083"]')).toHaveText('07449 301083');
    // the email is a link only: never printed, and not as a plain address in the page source
    await expect(section).not.toContainText('@');
    expect(await (await request.get('/help-when-it-goes-wrong.html')).text()).not.toContain('magicobject@gmail.com');
    await expect(section.locator('a[href^="mailto:"]')).toHaveCount(1);
  });
});
