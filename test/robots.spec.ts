import { test, expect } from './support/fixtures';

// robots.txt is served as plain text with no charset, so any non-ASCII character in its
// comments (an em dash) shows as garbage ("â€”") in a browser. It must stay ASCII-only.
test('robots.txt still disallows everything and is plain ASCII', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toMatch(/User-agent: \*\s*\nDisallow: \//);
  expect(body).not.toMatch(/[^\x00-\x7F]/);
});
