#!/usr/bin/env node
// Assembles public/*.html from templates/ + src/pages/*.html +
// src/pages.config.mjs + src/site.config.mjs. Run `npm run build` after
// editing anything in templates/ or src/, and commit the regenerated
// public/*.html — Cloudflare serves that directory as-is.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { NAV, FOOTER_NAV, PAGES } from '../src/pages.config.mjs';
import { SITE } from '../src/site.config.mjs';
import { CLERGY, OFFICERS } from '../src/people.config.mjs';
import { NEWSLETTER_ISSUES } from '../src/newsletter.config.mjs';
import { ONE_OFF_EVENTS, expandEvents, placeFor, formatTime12h, formatEventDate } from '../src/events.config.mjs';
import { ensureSectionIds, extractSearchEntries, isSearchablePage, isIndexable, isHelpPage } from './build-search-index.mjs';
import { splitNewsletterIssues, formatIssueMonth } from './newsletter-issues.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

// Not live yet — every page carries robots: noindex, nofollow (see
// pages.config.mjs) while this build awaits parish review. SITE_URL still
// points at the real domain so canonical/OG/JSON-LD URLs are correct and
// ready for the day it does go live — only the noindex tags need removing
// then, not this constant.
const SITE_URL = 'https://www.stmartinchelsfield.org.uk';
const DEFAULT_OG_IMAGE = '/img/og-default.svg';
const todayStr = new Date().toISOString().slice(0, 10);

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const pageTemplate = read('templates/page.html');
const headerTemplate = read('templates/header.html').trimEnd();
const footerTemplate = read('templates/footer.html').trimEnd();
const safeguardStripTemplate = read('templates/safeguard-strip.html').trimEnd();
const safeguardingEssentialsTemplate = read('templates/safeguarding-essentials.html').trim();
const newsletterSignupFormPartial = read('templates/newsletter-signup-form.html').trim();

// Cache-busting for every same-origin stylesheet, script and icon a page
// loads: `<link href="/css/style.css">` becomes `...style.css?v=<hash>`, the
// hash taken from that file's own content. A page's HTML therefore only
// changes when something it loads has changed — the build number is kept off
// every page except /updates.html. A reference to a file that doesn't exist
// fails the build. Never hand-write a ?v= in a template or page.
const assetHashes = new Map();
function assetHash(publicPath) {
  if (!assetHashes.has(publicPath)) {
    const file = join(root, 'public', publicPath);
    if (!existsSync(file)) throw new Error(`build: page references ${publicPath}, which doesn't exist in public/`);
    assetHashes.set(publicPath, createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10));
  }
  return assetHashes.get(publicPath);
}

function versionAssetUrls(html) {
  return html.replace(/<(link|script)\b[^>]*>/g, (tag) =>
    tag.replace(/\b(href|src)="(\/(?!\/)[^"?#]+)"/, (_, attr, path) => `${attr}="${path}?v=${assetHash(path)}"`));
}

function readBuildNumber() {
  const file = join(root, 'build-number.json');
  if (!existsSync(file)) return '0000.00.00.000';
  const { date, build } = JSON.parse(readFileSync(file, 'utf8'));
  return `${date}.${String(build).padStart(3, '0')}`;
}

// camelCase site.config.mjs keys become {{UPPER_SNAKE_CASE}} tokens, e.g.
// phoneDisplay -> {{PHONE_DISPLAY}}.
function tokensFromSite(site, buildNumber) {
  const tokens = { BUILD_NUMBER: buildNumber };
  for (const [key, value] of Object.entries(site)) {
    const token = key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase();
    tokens[token] = value;
  }
  return tokens;
}

function replaceTokens(html, tokens) {
  let out = html;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.replaceAll(`{{${token}}}`, value);
  }
  return out;
}

// Turns each character into a numeric HTML entity so a visitor's browser
// still renders/links a mailto: normally, but the raw page source never
// contains the literal address — stops simple regex-over-raw-HTML scrapers.
function encodeEntities(str) {
  return [...str].map((ch) => `&#${ch.codePointAt(0)};`).join('');
}

function obfuscateMailtoLinks(html) {
  return html.replace(/\{\{OBFUSCATE_MAILTO:([^}]+)\}\}/g, (_, email) => encodeEntities(`mailto:${email}`));
}

function renderPersonCard({ iconSvg, role, name, bio }) {
  return `        <div class="card reveal">
          <div class="icon-badge">${iconSvg}</div>
          <div class="tags">${role}</div>
          <h3>${name}</h3>
          <p>${bio}</p>
        </div>`;
}

function renderPeopleCards(list) {
  return list.map(renderPersonCard).join('\n');
}

// {{PEOPLE:clergy}} -> CLERGY, {{PEOPLE:officers}} -> OFFICERS.
function renderPeopleTokens(html) {
  return html.replace(/\{\{PEOPLE:([a-z-]+)\}\}/g, (_, key) => {
    if (key === 'clergy') return renderPeopleCards(CLERGY);
    if (key === 'officers') return renderPeopleCards(OFFICERS);
    return '';
  });
}

function renderSafeguardingEssentials(html) {
  return html.replace(/\{\{SAFEGUARDING_ESSENTIALS\}\}/g, () => safeguardingEssentialsTemplate);
}

function renderNewsletterCard({ slug, title, date, summary }) {
  return `        <div class="card reveal">
          <div class="meta">${formatIssueMonth(date)}</div>
          <h3>${title}</h3>
          <p>${summary}</p>
          <a href="${slug}.html">Read this issue &rarr;</a>
        </div>`;
}

const NEWSLETTER_EMPTY_MESSAGES = {
  recent: 'No issues published yet — sign up below to be the first to know.',
  archive: 'No past issues yet — check back after a few more have gone out.',
};

function renderNewsletterTokens(html) {
  const { recent, archive } = splitNewsletterIssues(NEWSLETTER_ISSUES);
  return html.replace(/\{\{NEWSLETTERS:(recent|archive)\}\}/g, (_, which) => {
    const issues = which === 'recent' ? recent : archive;
    if (issues.length === 0) {
      return `<p style="color:var(--ink-soft);">${NEWSLETTER_EMPTY_MESSAGES[which]}</p>`;
    }
    return issues.map(renderNewsletterCard).join('\n');
  });
}

function renderEventsToken(html) {
  return html.replace(/\{\{EVENTS_NOSCRIPT\}\}/g, () =>
    ONE_OFF_EVENTS.map((e) => {
      const suffix = e.location ? ` — ${escapeHtml(e.location)}` : '';
      return `          <li>${formatEventDate(e.date)}, ${formatTime12h(e.time)} — ${escapeHtml(e.title)}${suffix}</li>`;
    }).join('\n'));
}

function eventStructuredData(pageUrl) {
  const events = expandEvents()
    .filter((e) => e.date >= todayStr)
    .map((e) => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: e.title,
      startDate: `${e.date}T${e.time}:00`,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: placeFor(e.location),
      organizer: { '@type': 'Organization', name: SITE.orgName, url: SITE_URL },
      url: pageUrl,
    }));
  return events.length ? events : null;
}

function newsletterIssueStructuredData(issue) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: issue.title,
    description: issue.summary,
    datePublished: issue.date,
    url: `${SITE_URL}/${issue.slug}.html`,
    publisher: { '@type': 'Organization', name: SITE.orgName },
  };
}

function newsletterListStructuredData(issues, pageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    url: pageUrl,
    itemListElement: issues.map((issue, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${issue.slug}.html`,
      name: issue.title,
    })),
  };
}

function structuredDataFor(page, pageUrl) {
  if (page.structuredData) return page.structuredData;
  const issue = NEWSLETTER_ISSUES.find((i) => i.slug === page.slug);
  if (issue) return newsletterIssueStructuredData(issue);
  const { recent, archive } = splitNewsletterIssues(NEWSLETTER_ISSUES);
  if (page.slug === 'newsletter') return newsletterListStructuredData(recent, pageUrl);
  if (page.slug === 'newsletter-archive') return newsletterListStructuredData(archive, pageUrl);
  if (page.slug === 'calendar') return eventStructuredData(pageUrl);
  return null;
}

function renderNavItems(links, activeHref) {
  return links
    .map(({ href, label }) => {
      const current = href === activeHref ? ' aria-current="page"' : '';
      return `      <a href="${href}"${current}>${label}</a>`;
    })
    .join('\n');
}

const footerNavItems = FOOTER_NAV.map(({ href, label }) => {
  const external = /^https?:\/\//.test(href);
  const attrs = external ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${href}"${attrs}>${label}</a>`;
}).join('<br>\n        ');

const buildNumber = readBuildNumber();
const tokens = tokensFromSite(SITE, buildNumber);
tokens.NEWSLETTER_SIGNUP_FORM = newsletterSignupFormPartial;

const footer = replaceTokens(
  footerTemplate.replace('{{FOOTER_NAV_ITEMS}}', footerNavItems),
  tokens,
);

const searchEntries = [];
const sitemapUrls = [];

for (const page of PAGES) {
  const content = ensureSectionIds(renderEventsToken(renderNewsletterTokens(renderPeopleTokens(renderSafeguardingEssentials(read(`src/pages/${page.slug}.html`).trimEnd())))));

  if (isIndexable(page)) {
    const resolvedForSearch = replaceTokens(content, tokens);
    const entries = extractSearchEntries(resolvedForSearch, page);
    if (isHelpPage(page)) entries.forEach((entry) => { entry.scope = 'help'; });
    searchEntries.push(...entries);
  }

  const pageUrl = `${SITE_URL}/${page.slug}.html`;
  const pageImage = `${SITE_URL}${page.image || DEFAULT_OG_IMAGE}`;

  if (isSearchablePage(page)) sitemapUrls.push(pageUrl);

  let extraHead = '';
  if (page.robots) extraHead += `<meta name="robots" content="${page.robots}">\n`;
  if (page.canonical !== false) {
    extraHead += `<link rel="canonical" href="${pageUrl}">\n`;
  }
  extraHead += `<meta property="og:type" content="website">\n`;
  extraHead += `<meta property="og:site_name" content="${SITE.orgName}">\n`;
  extraHead += `<meta property="og:title" content="${page.title}">\n`;
  extraHead += `<meta property="og:description" content="${page.description}">\n`;
  extraHead += `<meta property="og:url" content="${pageUrl}">\n`;
  extraHead += `<meta property="og:image" content="${pageImage}">\n`;
  extraHead += `<meta name="twitter:card" content="summary_large_image">\n`;
  extraHead += `<meta name="twitter:title" content="${page.title}">\n`;
  extraHead += `<meta name="twitter:description" content="${page.description}">\n`;
  extraHead += `<meta name="twitter:image" content="${pageImage}">\n`;
  const structuredData = structuredDataFor(page, pageUrl);
  if (structuredData) extraHead += `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>\n`;

  const header = page.header
    ? replaceTokens(headerTemplate.replace('{{NAV_ITEMS}}', renderNavItems(NAV, page.active)), tokens)
    : '';
  const safeguardStrip = page.safeguardStrip === false ? '' : safeguardStripTemplate;
  const pageFooter = page.footer === false ? '' : footer;

  let html = pageTemplate
    .replace('{{TITLE}}', page.title)
    .replace('{{DESCRIPTION}}', page.description)
    .replace('{{EXTRA_HEAD}}', extraHead)
    .replace('{{HEADER}}', header)
    .replace('{{CONTENT}}', content)
    .replace('{{SAFEGUARD_STRIP}}', safeguardStrip)
    .replace('{{FOOTER}}', pageFooter);

  html = replaceTokens(html, tokens);
  html = obfuscateMailtoLinks(html);
  html = versionAssetUrls(html);

  writeFileSync(join(root, 'public', `${page.slug}.html`), html);
  console.log(`built public/${page.slug}.html`);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
  .map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(join(root, 'public', 'sitemap.xml'), sitemapXml);
console.log(`built public/sitemap.xml (${sitemapUrls.length} urls)`);

writeFileSync(join(root, 'public', 'search-index.json'), JSON.stringify(searchEntries));
console.log(`built public/search-index.json (${searchEntries.length} entries)`);

const calendarEventsJs = `// AUTO-GENERATED — DO NOT EDIT THIS FILE.
// Generated from src/events.config.mjs by scripts/build.mjs on every build.
// Edit the arrays there instead, then run \`npm run build\`.
window.CALENDAR_EVENTS = ${JSON.stringify(expandEvents())};
`;
writeFileSync(join(root, 'public', 'js', 'calendar-events.js'), calendarEventsJs);
console.log('built public/js/calendar-events.js');
