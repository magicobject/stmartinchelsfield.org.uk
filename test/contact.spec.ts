import { test, expect } from './support/fixtures';
// @ts-ignore - plain ES module, no type declarations
import { CLERGY, OFFICERS } from '../src/people.config.mjs';

// Parish requirement R6 (Steve McCann's items 20-23): the Get in touch page.
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;

test.describe('Get in touch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact.html');
  });

  const block = (page: import('@playwright/test').Page, heading: string) =>
    page.locator('main div', { has: page.getByRole('heading', { level: 2, name: heading, exact: true }) }).last();

  test('"Parish office" is gone and "Chelsfield Rectory" keeps the same telephone number', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText(/parish office/i);
    const rectory = block(page, 'Chelsfield Rectory');
    await expect(rectory.locator('a[href="tel:+441689825749"]')).toHaveText('01689 825749');
  });

  test('"Benefice administrator" is now the Benefice office, with Mrs Suzanne Diamond, the office email and the existing phone number', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText(/benefice administrator/i);
    const office = block(page, 'Benefice office');
    await expect(office).toContainText('Mrs Suzanne Diamond');
    await expect(office.locator('a[href="mailto:office@smasch.org"]')).toHaveCount(1);
    await expect(office.locator('a[href="tel:+441689852905"]')).toHaveText('01689 852905');
  });

  test('Rector, Associate Vicar and Churchwarden match the Clergy & contacts page', async ({ page }) => {
    const byRole = (role: string) => [...CLERGY, ...OFFICERS].find((p: { role: string }) => p.role.startsWith(role));
    const rector = byRole('Rector');
    const vicar = byRole('Associate Vicar');
    const warden = byRole('Churchwarden');
    await expect(block(page, 'Rector')).toContainText(rector.name);
    await expect(block(page, 'Associate Vicar')).toContainText(vicar.name);
    await expect(block(page, 'Churchwarden')).toContainText(warden.name);
    await expect(block(page, 'Rector').locator('a[href="mailto:revsusan@smasch.org"]')).toHaveCount(1);
    await expect(block(page, 'Rector').locator('a[href="tel:+441689857763"]')).toHaveCount(1);
    await expect(block(page, 'Associate Vicar').locator('a[href="mailto:revmartin@smasch.org"]')).toHaveCount(1);
    await expect(block(page, 'Churchwarden').locator('a[href="mailto:churchwardens@stmartinchelsfield.org.uk"]')).toHaveCount(1);
  });

  test('"Room bookings" replaces "Room & hall bookings" and uses the parish\'s sentence', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText(/room & hall/i);
    const bookings = block(page, 'Room bookings');
    await expect(bookings).toContainText('To book the Brass Crosby Room please email');
    await expect(bookings.locator('a[href="mailto:bookings@stmartinchelsfield.org.uk"]')).toHaveCount(1);
    await expect(bookings).not.toContainText(/parish room/i);
  });

  test('no email address is shown as text, and the old "directory listings disagree" note is gone', async ({ page }) => {
    expect(await page.locator('main').innerText()).not.toMatch(EMAIL_RE);
    await expect(page.locator('main')).not.toContainText(/directory listings/i);
    await expect(page.locator('main')).not.toContainText(/please confirm both/i);
  });

  test('the address and the directions link are still there', async ({ page }) => {
    await expect(page.locator('main')).toContainText('BR6 7SN');
    await expect(page.locator('main a[href="visit-us.html"]')).toHaveCount(1);
  });
});
