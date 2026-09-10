// Single source of truth for newsletter issues. Add one entry here per
// issue — src/pages/newsletter.html and src/pages/newsletter-archive.html
// both pick it up automatically via the {{NEWSLETTERS:recent}} /
// {{NEWSLETTERS:archive}} tokens (see scripts/build.mjs and
// scripts/newsletter-issues.mjs).
//
// Empty for now — no issue has gone out yet. Add an entry (and the issue's
// own src/pages/newsletter-<slug>.html + a matching entry in
// src/pages.config.mjs) once the first one is ready.
export const NEWSLETTER_ISSUES = [
  // { slug: 'newsletter-2026-10', title: 'October 2026', date: '2026-10-01', summary: 'One-line summary of what is in this issue.' },
];
