// Pure functions that turn src/special-notices.config.mjs into the Services
// page's "Special services coming up" box. No file system, no browser:
// scripts/build.mjs calls these; test-unit/special-notices.test.mjs covers them.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Throws (so the build fails) rather than publish an entry that would never
// expire or has no date for visitors to read.
export function validateNotice(notice) {
  const label = notice && notice.title ? ` (${notice.title})` : '';
  for (const key of ['title', 'when']) {
    if (!notice || typeof notice[key] !== 'string' || !notice[key].trim()) {
      throw new Error(`special notice${label}: "${key}" is required`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(notice.expires || '') || Number.isNaN(Date.parse(notice.expires))) {
    throw new Error(`special notice${label}: "expires" must be a date written YYYY-MM-DD (the first day it is no longer shown)`);
  }
}

function renderNotice(notice) {
  const note = notice.note ? `\n        <p>${escapeHtml(notice.note)}</p>` : '';
  return `      <div class="card" data-expires="${notice.expires}">
        <p class="meta">${escapeHtml(notice.when)}</p>
        <h3>${escapeHtml(notice.title)}</h3>${note}
      </div>`;
}

// With no entries the box is simply absent. Past entries are hidden in the
// browser (public/js/main.js), so a rebuild is not needed when a date passes.
export function renderSpecialNotices(notices) {
  if (!notices.length) return '';
  notices.forEach(validateNotice);
  return `<section class="special-notices">
  <div class="wrap">
    <h2>Special services coming up</h2>
    <div class="card-grid">
${notices.map(renderNotice).join('\n')}
    </div>
  </div>
</section>`;
}
