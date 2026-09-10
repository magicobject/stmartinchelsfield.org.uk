// Every spec should import `test`/`expect` from here instead of directly
// from '@playwright/test'. The only difference: this blocks every request
// that isn't to our own static-server (Google Fonts) before it leaves the
// page. None of the specs assert on webfont rendering — they check DOM
// structure, text, links and computed CSS from our own stylesheet — so this
// doesn't drop any coverage, and removes the suite's only source of real
// network I/O.
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
    await use(page);
  },
});

export { expect };
