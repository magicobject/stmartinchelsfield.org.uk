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

test('the Technical details page has a "Where each fact lives" section naming each source file', async ({ page }) => {
  await page.goto('/help-technical-details.html');
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

  test('Making a change says to click the Claude Code icon, then describe the change in a new session', async ({ page }) => {
    await page.goto('/help-making-a-change.html');
    await expect(page.locator('main')).toContainText('Open Claude Desktop in this project, click on the Claude Code icon, then in a new session describe the change in plain English');
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

test.describe('Help guide: written for non-technical people', () => {
  test('the front page says whose job is what, and that Claude can be asked for help any time', async ({ page }) => {
    await page.goto('/help.html');
    const main = page.locator('main');
    await expect(main).toContainText("Say clearly what you'd like changed");
    await expect(main).toContainText('Make the change, check it, and put it on the website');
    await expect(main).toContainText('ask it for help at any time');
  });

  test('Making a change tells people how to ask clearly and to ask Claude for help, and does not list file names', async ({ page }) => {
    await page.goto('/help-making-a-change.html');
    const main = page.locator('main');
    await expect(main.getByRole('heading', { level: 2, name: 'How to ask clearly' })).toBeVisible();
    await expect(main.getByRole('heading', { level: 2, name: 'Ask Claude for help at any time' })).toBeVisible();
    expect(await main.innerText()).not.toMatch(/\.mjs|npm run/);
  });

  test('Setting up tells people to tell Claude if anything confuses them', async ({ page }) => {
    await page.goto('/help-getting-set-up.html');
    await expect(page.locator('main')).toContainText('If anything confuses you, tell Claude.');
  });

  test('the guide lists When it goes wrong before Technical details, and Technical details is marked optional', async ({ page }) => {
    await page.goto('/help.html');
    const headings = await page.locator('main h3').allInnerTexts();
    expect(headings.indexOf('3. When it goes wrong')).toBe(2);
    expect(headings.indexOf('4. Technical details')).toBe(3);
    await page.goto('/help-technical-details.html');
    await expect(page.locator('main')).toContainText('Optional reading');
  });
});
