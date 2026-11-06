// Unit tests for scripts/render-special-notices.mjs — pure functions, no browser.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderSpecialNotices, validateNotice } from '../scripts/render-special-notices.mjs';

const notice = { title: 'Remembrance Sunday', when: 'Sunday 8 November, morning', expires: '2026-11-09' };

describe('renderSpecialNotices', () => {
  test('no entries renders nothing at all', () => {
    assert.equal(renderSpecialNotices([]), '');
  });

  test('an entry becomes a card with its date, title and expiry', () => {
    const html = renderSpecialNotices([notice]);
    assert.ok(html.includes('<h2>Special services coming up</h2>'));
    assert.ok(html.includes('data-expires="2026-11-09"'));
    assert.ok(html.includes('<h3>Remembrance Sunday</h3>'));
    assert.ok(html.includes('Sunday 8 November, morning'));
  });

  test('an optional note is shown, and all text is escaped', () => {
    const html = renderSpecialNotices([{ ...notice, title: 'Tea & <b>cake</b>', note: 'Meet at the "lych gate"' }]);
    assert.ok(html.includes('Tea &amp; &lt;b&gt;cake&lt;/b&gt;'));
    assert.ok(html.includes('Meet at the &quot;lych gate&quot;'));
    assert.ok(!html.includes('<b>'));
  });
});

describe('validateNotice', () => {
  test('requires a title, a "when" and a YYYY-MM-DD expiry', () => {
    assert.doesNotThrow(() => validateNotice(notice));
    assert.throws(() => validateNotice({ ...notice, title: '' }), /"title" is required/);
    assert.throws(() => validateNotice({ ...notice, when: ' ' }), /"when" is required/);
    assert.throws(() => validateNotice({ ...notice, expires: undefined }), /YYYY-MM-DD/);
    assert.throws(() => validateNotice({ ...notice, expires: '9 Nov 2026' }), /YYYY-MM-DD/);
    assert.throws(() => validateNotice({ ...notice, expires: '2026-13-45' }), /YYYY-MM-DD/);
  });
});
