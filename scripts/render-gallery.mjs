// Pure functions that turn src/gallery.config.mjs into the Gallery page's HTML.
// No file system, no browser: scripts/build.mjs checks the image files exist and
// calls these; test-unit/gallery.test.mjs covers them.

export const GALLERY_EMPTY_MESSAGE =
  'We are collecting photographs of the church, the churchyard and parish life, and will add them here soon.';

const ALLOWED_FILE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.(jpe?g|webp)$/i;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Throws (so the build fails) rather than publish a photo that visitors can't use:
// no description for screen readers, no size (the page would jump as it loads),
// or a file name that could point outside the gallery folder or at an SVG.
export function validatePhoto(photo) {
  const label = photo && photo.file ? ` (${photo.file})` : '';
  if (!photo || typeof photo.file !== 'string' || !ALLOWED_FILE.test(photo.file)) {
    throw new Error(`gallery photo${label}: "file" must be a plain .jpg, .jpeg or .webp file name inside public/img/gallery/`);
  }
  const alt = typeof photo.alt === 'string' ? photo.alt.trim() : '';
  if (!alt) throw new Error(`gallery photo${label}: "alt" text is required (say what the photo shows, for people who cannot see it)`);
  if (alt.toLowerCase() === photo.file.toLowerCase()) {
    throw new Error(`gallery photo${label}: "alt" text must describe the photo, not repeat its file name`);
  }
  for (const key of ['width', 'height']) {
    if (!Number.isInteger(photo[key]) || photo[key] <= 0) {
      throw new Error(`gallery photo${label}: "${key}" must be a positive whole number of pixels`);
    }
  }
}

function renderPhoto(photo) {
  const caption = [photo.caption, photo.credit].filter(Boolean).map((part) => escapeHtml(part));
  const figcaption = caption.length ? `\n          <figcaption>${caption.join(' &middot; ')}</figcaption>` : '';
  return `        <figure class="gallery-item">
          <img src="/img/gallery/${escapeHtml(photo.file)}" alt="${escapeHtml(photo.alt.trim())}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async">${figcaption}
        </figure>`;
}

export function renderGallery(photos) {
  if (!photos || photos.length === 0) {
    return `    <p class="gallery-empty">${GALLERY_EMPTY_MESSAGE}</p>`;
  }
  photos.forEach(validatePhoto);
  return `    <div class="gallery-grid">\n${photos.map(renderPhoto).join('\n')}\n    </div>`;
}
