import { test, expect } from './support/fixtures';

// Regression guard: the safeguarding page's contact cards once held long,
// unbroken strings (raw email addresses) that overflowed their card. Checks
// every link in every card stays within its card's box, and that no bare
// email address is shown as text (they're labelled mailto links instead).
test('no contact link on the safeguarding page overflows its card', async ({ page }) => {
  await page.goto('/safeguarding.html');

  const cards = page.locator('.card');
  const cardCount = await cards.count();
  expect(cardCount).toBeGreaterThan(0);

  for (let i = 0; i < cardCount; i++) {
    const card = cards.nth(i);
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    const links = card.locator('a');
    const linkCount = await links.count();
    for (let j = 0; j < linkCount; j++) {
      const linkBox = await links.nth(j).boundingBox();
      expect(linkBox).not.toBeNull();
      expect(linkBox!.x + linkBox!.width).toBeLessThanOrEqual(cardBox!.x + cardBox!.width + 1);
    }
  }
});

test('the safeguarding page shows no bare email address as text', async ({ page }) => {
  await page.goto('/safeguarding.html');
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
});
