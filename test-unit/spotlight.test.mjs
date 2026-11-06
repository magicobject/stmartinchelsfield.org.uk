// Unit tests for scripts/render-spotlight.mjs — pure functions, no browser.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderSpotlight, validateSpotlight } from '../scripts/render-spotlight.mjs';

const item = { title: 'Roof appeal', text: 'Help us mend the roof.', href: 'donate.html', linkLabel: 'Give to the appeal', expires: '2026-12-31' };

describe('renderSpotlight', () => {
  test('no entries renders nothing at all', () => {
    assert.equal(renderSpotlight([]), '');
  });

  test('an entry becomes a band with heading, text, link and expiry', () => {
    const html = renderSpotlight([item]);
    assert.ok(html.includes('class="spotlight" data-expires="2026-12-31"'));
    assert.ok(html.includes('<h2>Roof appeal</h2>'));
    assert.ok(html.includes('<a href="donate.html">Give to the appeal <span aria-hidden="true">&rarr;</span></a>'));
  });

  test('"from" is carried through, a link is optional, and text is escaped', () => {
    const html = renderSpotlight([{ title: 'Tea & <i>cake</i>', text: 'Come "along"', from: '2026-12-01', expires: '2026-12-05' }]);
    assert.ok(html.includes('data-from="2026-12-01"'));
    assert.ok(html.includes('Tea &amp; &lt;i&gt;cake&lt;/i&gt;'));
    assert.ok(html.includes('Come &quot;along&quot;'));
    assert.ok(!html.includes('<a '));
  });
});

describe('validateSpotlight', () => {
  test('requires title, text and a YYYY-MM-DD expiry', () => {
    assert.doesNotThrow(() => validateSpotlight(item));
    assert.throws(() => validateSpotlight({ ...item, title: '' }), /"title" is required/);
    assert.throws(() => validateSpotlight({ ...item, text: undefined }), /"text" is required/);
    assert.throws(() => validateSpotlight({ ...item, expires: undefined }), /YYYY-MM-DD/);
    assert.throws(() => validateSpotlight({ ...item, from: '1 Dec' }), /"from"/);
  });

  test('a link must be a page on this site or https, and needs a label', () => {
    assert.throws(() => validateSpotlight({ ...item, href: 'javascript:alert(1)' }), /"href"/);
    assert.throws(() => validateSpotlight({ ...item, href: 'http://example.com' }), /"href"/);
    assert.throws(() => validateSpotlight({ ...item, linkLabel: '' }), /"linkLabel"/);
    assert.doesNotThrow(() => validateSpotlight({ ...item, href: 'https://example.com/appeal' }));
  });
});
