// Pure functions that turn src/spotlight.config.mjs into the optional band
// at the top of the homepage. No file system, no browser: scripts/build.mjs
// calls these; test-unit/spotlight.test.mjs covers them.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (value) => DATE.test(value || '') && !Number.isNaN(Date.parse(value));

// Throws (so the build fails) rather than publish a band that never ends, has
// no words, or links somewhere unsafe.
export function validateSpotlight(item) {
  const label = item && item.title ? ` (${item.title})` : '';
  for (const key of ['title', 'text']) {
    if (!item || typeof item[key] !== 'string' || !item[key].trim()) {
      throw new Error(`spotlight${label}: "${key}" is required`);
    }
  }
  if (!isDate(item.expires)) {
    throw new Error(`spotlight${label}: "expires" must be a date written YYYY-MM-DD (the first day it is no longer shown)`);
  }
  if (item.from !== undefined && !isDate(item.from)) {
    throw new Error(`spotlight${label}: "from" must be a date written YYYY-MM-DD (the first day it is shown)`);
  }
  if (item.href !== undefined) {
    if (typeof item.href !== 'string' || !/^(https:\/\/|[a-z0-9][a-z0-9._/#?=&-]*$)/i.test(item.href)) {
      throw new Error(`spotlight${label}: "href" must be a page on this site (e.g. donate.html) or an https:// address`);
    }
    if (typeof item.linkLabel !== 'string' || !item.linkLabel.trim()) {
      throw new Error(`spotlight${label}: "linkLabel" is required when there is an "href"`);
    }
  }
}

function renderItem(item) {
  const from = item.from ? ` data-from="${item.from}"` : '';
  const link = item.href ? `\n    <p><a href="${escapeHtml(item.href)}">${escapeHtml(item.linkLabel)} <span aria-hidden="true">&rarr;</span></a></p>` : '';
  return `<section class="spotlight" data-expires="${item.expires}"${from}>
  <div class="wrap">
    <h2>${escapeHtml(item.title)}</h2>
    <p>${escapeHtml(item.text)}</p>${link}
  </div>
</section>`;
}

// With no entries the homepage simply has no band. Out-of-date entries are
// hidden in the browser (public/js/main.js), so no rebuild is needed.
export function renderSpotlight(items) {
  items.forEach(validateSpotlight);
  return items.map(renderItem).join('\n');
}
