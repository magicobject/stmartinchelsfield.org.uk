import { test, expect } from './support/fixtures';
// @ts-ignore - plain ES module, no type declarations
import { OFFICERS } from '../src/people.config.mjs';

// Parish requirement R7 (Steve McCann's items 3 and 4.1-4.4): the main
// Safeguarding page: key information about our policy, our safeguarding team,
// and where to go for help, plus a link to the policy statements (R8).
const TEAM = [
  { role: 'Parish Safeguarding Officer', name: 'Margaret Warren-Axe', email: 'safeguarding@stmartinchelsfield.org.uk' },
  { role: 'Parish Safeguarding Administrator', name: 'Karen Barter', email: 'safeguarding@stmartinchelsfield.org.uk' },
  { role: 'Diocesan Safeguarding Officer and Head of Safeguarding', name: 'Greg Barry', email: 'greg.barry@rochester.anglican.org', tel: 'tel:+447585952174', phone: '07585 952174' },
  { role: 'Diocesan Safeguarding Adviser', name: 'Caroline Smith', email: 'caroline.smith@rochester.anglican.org', tel: 'tel:+447768036590', phone: '07768 036590' },
];

test.describe('Safeguarding page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/safeguarding.html');
  });

  const card = (page: import('@playwright/test').Page, role: string) =>
    page.locator('.card', { has: page.getByRole('heading', { level: 3, name: role, exact: true }) });

  test('is headed "Safeguarding" and starts with the 999 emergency message', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Safeguarding');
    await expect(page.locator('main .emergency-box')).toContainText('Call 999');
  });

  test('puts the people to contact first: 999 box, then the team, then where to get help, then our commitment', async ({ page }) => {
    const h2s = page.locator('main h2');
    await expect(h2s).toHaveText(['Our safeguarding team', 'Where to get help', 'Our commitment']);
    // someone in distress on a phone should reach a contact without long scrolling
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/safeguarding.html');
    const firstContact = (await page.locator('main .card a[href^="mailto:"]').first().boundingBox())!;
    expect(firstContact.y).toBeLessThan(900);
  });

  test('every phone and email link is a comfortable tap target (at least 44px tall) and there is space under the 999 box', async ({ page }) => {
    const links = page.locator('main .card a[href^="tel:"], main .card a[href^="mailto:"]');
    expect(await links.count()).toBeGreaterThanOrEqual(7);
    for (let i = 0; i < (await links.count()); i++) {
      const box = (await links.nth(i).boundingBox())!;
      expect(box.height, `link ${i}`).toBeGreaterThanOrEqual(44);
    }
    const box999 = (await page.locator('.emergency-box').boundingBox())!;
    const next = (await page.locator('main h2').first().boundingBox())!;
    expect(next.y - (box999.y + box999.height)).toBeGreaterThanOrEqual(20);
  });

  test('the two parish contacts say they share one inbox', async ({ page }) => {
    await expect(card(page, 'Parish Safeguarding Officer')).toContainText('shared inbox');
    await expect(card(page, 'Parish Safeguarding Administrator')).toContainText('shared inbox');
  });

  test("the diocesan numbers are sourced to the Diocese's own safeguarding page", async ({ page }) => {
    const team = page.locator('section', { has: page.getByRole('heading', { level: 2, name: 'Our safeguarding team' }) });
    await expect(team).toContainText('listed on the Diocese of Rochester');
    await expect(team.locator('a[href="https://www.rochester.anglican.org/safeguarding"]')).toHaveCount(1);
  });

  test('the NSPCC card links to the NSPCC website as well as its helpline', async ({ page }) => {
    await expect(card(page, 'NSPCC Helpline').locator('a[href="https://www.nspcc.org.uk"]')).toHaveCount(1);
  });

  test('summarises the policy and links to the policy statements', async ({ page }) => {
    const section = page.locator('section', { has: page.getByRole('heading', { level: 2, name: 'Our commitment' }) });
    await expect(section).toContainText('House of Bishops');
    await expect(section).toContainText('23 July 2026');
    await expect(section.locator('a[href="safeguarding-policy.html"]')).toHaveCount(1);
  });

  test('the team is exactly the four contacts the parish gave us, with the right roles, names and obfuscated emails', async ({ page }) => {
    const team = page.locator('section', { has: page.getByRole('heading', { level: 2, name: 'Our safeguarding team' }) });
    await expect(team.locator('.card')).toHaveCount(TEAM.length);
    for (const person of TEAM) {
      const c = card(page, person.role);
      await expect(c).toContainText(person.name);
      await expect(c.locator(`a[href="mailto:${person.email}"]`)).toHaveCount(1);
      if (person.tel) await expect(c.locator(`a[href="${person.tel}"]`)).toHaveText(person.phone!);
      else await expect(c.locator('a[href^="tel:"]')).toHaveCount(0);
    }
  });

  test('the Parish Safeguarding Officer agrees with the Clergy & contacts page, and Steve McCann is not shown as the officer any more', async ({ page }) => {
    const pso = OFFICERS.find((p: { role: string }) => p.role === 'Parish Safeguarding Officer');
    await expect(card(page, 'Parish Safeguarding Officer')).toContainText(pso.name);
    await expect(page.locator('main')).not.toContainText('Steve McCann');
  });

  test('"Where to get help" keeps the NSPCC, Bromley and Diocese of Rochester routes', async ({ page }) => {
    const help = page.locator('section', { has: page.getByRole('heading', { level: 2, name: 'Where to get help' }) });
    await expect(help.locator('a[href="tel:+448088005000"]')).toHaveText('0808 800 5000');
    await expect(help.locator('a[href="https://www.bromley.gov.uk/safeguarding"]')).toHaveCount(1);
    await expect(help.locator('a[href="https://www.rochester.anglican.org/safeguarding"]')).toHaveCount(1);
    await expect(help.locator('a[rel~="noopener"]')).not.toHaveCount(0);
  });

  test('says concerns go through these routes, and who can direct you if you are unsure', async ({ page }) => {
    await expect(page.locator('main')).toContainText('Revd Susan Atkinson-Jones');
    await expect(page.locator('main a[href="people.html"]')).not.toHaveCount(0);
  });

  test('no email address is shown as text', async ({ page }) => {
    expect(await page.locator('main').innerText()).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  });

  test('the diocesan phone numbers are not in structured data or the search index', async ({ page, request }) => {
    const ld = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => e.textContent ?? '').join(' '));
    expect(ld).not.toContain('7585');
    const index = await (await request.get('/search-index.json')).text();
    expect(index).not.toMatch(/greg\.barry|caroline\.smith/);
  });

  test('at 320px wide nothing in the team cards overflows', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/safeguarding.html');
    const cards = page.locator('main .card');
    for (let i = 0; i < (await cards.count()); i++) {
      const box = (await cards.nth(i).boundingBox())!;
      const inner = cards.nth(i).locator('a, h3');
      for (let j = 0; j < (await inner.count()); j++) {
        const b = (await inner.nth(j).boundingBox())!;
        expect(b.x + b.width).toBeLessThanOrEqual(box.x + box.width + 1);
      }
    }
  });
});
