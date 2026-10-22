// Unit tests for scripts/render-gallery.mjs — pure functions, no browser, no build step.
// Run with `npm run test:unit` (node --test).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderGallery, validatePhoto, GALLERY_EMPTY_MESSAGE } from '../scripts/render-gallery.mjs';

const photo = {
  file: 'church-from-the-south.jpg',
  alt: 'St Martin of Tours Church from the south, with the spire above the trees',
  width: 1200,
  height: 800,
};

describe('renderGallery', () => {
  test('an empty gallery shows a plain message, and no grid and no images', () => {
    const html = renderGallery([]);
    assert.ok(html.includes(GALLERY_EMPTY_MESSAGE));
    assert.ok(!html.includes('<img'));
    assert.ok(!html.includes('gallery-grid'));
  });

  test('a photo becomes a figure with its alt text, intrinsic size and lazy loading', () => {
    const html = renderGallery([photo]);
    assert.ok(html.includes('class="gallery-grid"'));
    assert.ok(html.includes('src="/img/gallery/church-from-the-south.jpg"'));
    assert.ok(html.includes(`alt="${photo.alt}"`));
    assert.ok(html.includes('width="1200"') && html.includes('height="800"'));
    assert.ok(html.includes('loading="lazy"'));
    assert.ok(!html.includes(GALLERY_EMPTY_MESSAGE));
  });

  test('keeps the order given, and shows a caption and a credit when supplied', () => {
    const html = renderGallery([
      { ...photo, file: 'a.jpg', caption: 'First', credit: 'Photo: A. Photographer' },
      { ...photo, file: 'b.jpg', caption: 'Second' },
    ]);
    assert.ok(html.indexOf('a.jpg') < html.indexOf('b.jpg'));
    assert.ok(html.includes('<figcaption>'));
    assert.ok(html.includes('First') && html.includes('Photo: A. Photographer') && html.includes('Second'));
  });

  test('escapes text so a quote or angle bracket in alt, caption or credit cannot break the markup', () => {
    const html = renderGallery([{ ...photo, alt: 'A "quoted" <b>name</b>', caption: '<script>x</script>', credit: 'M&S' }]);
    assert.ok(!html.includes('<script>'));
    assert.ok(!html.includes('<b>name</b>'));
    assert.ok(html.includes('alt="A &quot;quoted&quot; &lt;b&gt;name&lt;/b&gt;"'));
    assert.ok(html.includes('M&amp;S'));
  });
});

describe('validatePhoto (the build fails rather than publish a photo without what visitors need)', () => {
  test('accepts a complete photo', () => {
    assert.doesNotThrow(() => validatePhoto(photo));
  });

  test('rejects a missing or empty alt text', () => {
    assert.throws(() => validatePhoto({ ...photo, alt: '' }), /alt/);
    assert.throws(() => validatePhoto({ ...photo, alt: '   ' }), /alt/);
    const { alt, ...noAlt } = photo;
    assert.throws(() => validatePhoto(noAlt), /alt/);
  });

  test('rejects alt text that just repeats the file name', () => {
    assert.throws(() => validatePhoto({ ...photo, alt: 'church-from-the-south.jpg' }), /alt/);
  });

  test('rejects missing or non-positive width and height (they stop the page jumping as images load)', () => {
    assert.throws(() => validatePhoto({ ...photo, width: 0 }), /width/);
    assert.throws(() => validatePhoto({ ...photo, height: undefined }), /height/);
  });

  test('allows only .jpg, .jpeg and .webp files, with a plain file name (no folders, no SVG)', () => {
    assert.throws(() => validatePhoto({ ...photo, file: 'plan.svg' }), /file/);
    assert.throws(() => validatePhoto({ ...photo, file: '../secret.jpg' }), /file/);
    assert.throws(() => validatePhoto({ ...photo, file: 'sub/dir.jpg' }), /file/);
    assert.doesNotThrow(() => validatePhoto({ ...photo, file: 'x.webp' }));
    assert.doesNotThrow(() => validatePhoto({ ...photo, file: 'x.jpeg' }));
  });
});
