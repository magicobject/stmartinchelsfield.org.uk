import { test, expect } from './support/fixtures';

test('submitting without ticking consent shows an inline error and leaves the form visible', async ({ page }) => {
  await page.goto('/newsletter.html');

  await page.locator('#newsletter-email').fill('person@example.com');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.locator('#newsletter-signup-message')).toBeVisible();
  await expect(page.locator('#newsletter-signup-message')).toHaveText(/tick the box/i);
  await expect(page.locator('#newsletter-signup-form')).toBeVisible();
});

test('a successful signup replaces the form with a focused confirmation', async ({ page }) => {
  await page.route('**/api/subscribe', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, message: "You're all set!" }),
    }),
  );

  await page.goto('/newsletter.html');
  await page.locator('#newsletter-email').fill('person@example.com');
  await page.locator('#newsletter-consent').check();
  await page.getByRole('button', { name: 'Sign up' }).click();

  const success = page.locator('#newsletter-signup-success');
  await expect(success).toBeVisible();
  await expect(success).toHaveText("You're all set!");
  await expect(page.locator('#newsletter-signup-form')).toBeHidden();
  await expect(success).toBeFocused();
});

test('a failed signup shows the server\'s error message, and the form stays usable', async ({ page }) => {
  await page.route('**/api/subscribe', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, message: 'Something went wrong on our end — please try again shortly.' }),
    }),
  );

  await page.goto('/newsletter.html');
  await page.locator('#newsletter-email').fill('person@example.com');
  await page.locator('#newsletter-consent').check();
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.locator('#newsletter-signup-message')).toHaveText('Something went wrong on our end — please try again shortly.');
  await expect(page.locator('#newsletter-signup-form')).toBeVisible();
});

test('a second consecutive failure adds a fallback contact link', async ({ page }) => {
  await page.route('**/api/subscribe', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, message: 'Something went wrong on our end — please try again shortly.' }),
    }),
  );

  await page.goto('/newsletter.html');
  await page.locator('#newsletter-email').fill('person@example.com');
  await page.locator('#newsletter-consent').check();

  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.locator('#newsletter-signup-message')).not.toContainText('Email');

  await page.getByRole('button', { name: 'Sign up' }).click();
  const message = page.locator('#newsletter-signup-message');
  await expect(message).toContainText('Still not working?');
  await expect(message.getByRole('link', { name: 'stmartin.chelsfield@btinternet.com' })).toHaveAttribute('href', 'mailto:stmartin.chelsfield@btinternet.com');
});

test('the homepage has its own working copy of the same signup form', async ({ page }) => {
  await page.route('**/api/subscribe', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, message: "You're all set!" }),
    }),
  );

  await page.goto('/index.html');
  await expect(page.locator('#newsletter-signup')).toBeVisible();

  await page.locator('#newsletter-email').fill('person@example.com');
  await page.locator('#newsletter-consent').check();
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.locator('#newsletter-signup-success')).toBeVisible();
});
