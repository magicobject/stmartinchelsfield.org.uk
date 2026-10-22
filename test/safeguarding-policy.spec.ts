import { test, expect } from './support/fixtures';

// Parish requirement R8 (Steve McCann's item 4.5): the PCC-agreed safeguarding
// statement and policy from "Safeguarding statements for website.docx",
// published as a real HTML page (accessible, searchable), word for word.
const PATH = '/safeguarding-policy.html';

const COMMITMENTS = [
  'Promoting a safer environment and culture.',
  'Safely recruiting and supporting all those with any responsibility related to children, young people and vulnerable adults within the church.',
  'Responding promptly to every safeguarding concern or allegation.',
  'Caring pastorally for victims/survivors of abuse and other affected persons.',
  'Caring pastorally for those who are the subject of concerns or allegations of abuse and other affected persons.',
  'Responding to those that may pose a present risk to others.',
];

const UNDERTAKINGS = [
  'Create a safe and caring place for all.',
  'Have a named Parish Safeguarding Officer (PSO) to work with the incumbent and the PCC to implement policy and procedures.',
  'Safely recruit, train and support all those with any responsibility for children, young people and adults to have the confidence and skills to recognise and respond to abuse.',
  'Ensure that there is appropriate insurance cover for all activities involving children and adults undertaken in the name of the parish.',
  'Display in church premises and on the Parish website the details of who to contact if there are safeguarding concerns or support needs.',
  'Listen to and take seriously all those who disclose abuse.',
  'Take steps to protect children and adults when a safeguarding concern of any kind arises, following House of Bishops guidance, including notifying the Diocesan Safeguarding Adviser (DSA) and statutory agencies immediately.',
  'Offer support to victims/survivors of abuse regardless of the type of abuse, when or where it occurred.',
  'Care for and monitor any member of the church community who may pose a risk to children and adults whilst maintaining appropriate confidentiality and the safety of all parties.',
  'Ensure that health and safety policy, procedures and risk assessments are in place and that these are reviewed annually.',
  'Review the implementation of the Safeguarding Policy, Procedures and Practices at least annually.',
];

test.describe('Safeguarding policy statements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PATH);
  });

  test('has the formal statement, agreed on 23 July 2026, with both signatories', async ({ page }) => {
    const main = page.locator('main');
    await expect(main.getByRole('heading', { level: 2, name: 'The formal statement' })).toBeVisible();
    await expect(main).toContainText("The Parish of Chelsfield is committed to implementing the House of Bishops' safeguarding policies and good practice guidance.");
    await expect(main).toContainText('recorded in the minutes of the meeting on 23 July 2026');
    await expect(main).toContainText('Susan Atkinson-Jones');
    await expect(main).toContainText('Steve McCann');
  });

  test('lists all six commitments, word for word, in order', async ({ page }) => {
    const items = page.locator('main section.alt ul').nth(0).locator('li');
    await expect(items).toHaveCount(COMMITMENTS.length);
    for (let i = 0; i < COMMITMENTS.length; i++) await expect(items.nth(i)).toHaveText(COMMITMENTS[i]);
  });

  test('lists all eleven things the Parish will do, word for word, in order', async ({ page }) => {
    const items = page.locator('main section.alt ul').nth(1).locator('li');
    await expect(items).toHaveCount(UNDERTAKINGS.length);
    for (let i = 0; i < UNDERTAKINGS.length; i++) await expect(items.nth(i)).toHaveText(UNDERTAKINGS[i]);
  });

  test('records the closing undertaking and the appointment of the Parish Safeguarding Officer', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toContainText('Each person who works within this church community will agree to abide by this policy and the guidelines established by this church.');
    await expect(main).toContainText('This church appoints Margaret Warren-Axe as the Parish Safeguarding Officer.');
    await expect(main).toContainText('Incumbent: Susan Atkinson-Jones');
    await expect(main).toContainText('Churchwarden: Steve McCann');
  });

  test('headings go h1, h2, h3 with no skipped levels', async ({ page }) => {
    const levels = await page.$$eval('main h1, main h2, main h3, main h4', (els) => els.map((e) => Number(e.tagName[1])));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading ${i}`).toBeLessThanOrEqual(1);
  });

  test('links back to the Safeguarding page, and the footer links here from every page', async ({ page }) => {
    await expect(page.locator('main a[href="safeguarding.html"]')).not.toHaveCount(0);
    await page.goto('/about.html');
    await expect(page.locator('footer.site a[href="safeguarding-policy.html"]')).toHaveText('Safeguarding policy');
  });

  test('searching for just "safeguarding" still puts the main Safeguarding page first, and "safeguarding policy" finds this page first', async ({ page }) => {
    await page.goto('/index.html');
    const results = page.locator('#site-search-results a[role="option"]');
    await page.locator('#site-search-input').fill('safeguarding');
    await expect(results.first()).toHaveAttribute('href', /^safeguarding.html#/);
    await page.locator('#site-search-input').fill('safeguarding policy');
    await expect(results.first()).toHaveAttribute('href', /^safeguarding-policy.html#/);
  });

  test('is in the sitemap exactly once and found by site search', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap.split('/safeguarding-policy.html').length - 1).toBe(1);
    const index = await (await request.get('/search-index.json')).text();
    expect(index).toContain('safeguarding-policy.html');
    expect(index).toContain('Safeguarding policy statements');
  });
});
