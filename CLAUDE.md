# Standing instructions for this repo

These apply to every change here, not just when explicitly asked for.

## About this build
This site was built from public sources — A Church Near You, the London Borough of Bromley's community directory, Clague Architects' own description of the Brass Crosby Rooms extension, and (as of 2026-09-11) the parish's own interim WordPress site at `chelsfieldstmartintemp.wordpress.com` and its linked Google Calendar — not commissioned or reviewed by St Martin of Tours' own PCC. Consequences that matter for every future change:

- **Every page carries `robots: noindex, nofollow`** (`src/pages.config.mjs`), `public/robots.txt` disallows everything, and `public/_headers` sends `X-Robots-Tag: noindex, nofollow` on every response (belt-and-braces for the live Cloudflare Workers preview at `stmartinchelsfield-org-uk.magicobject.workers.dev`, which has no robots.txt/meta-tag override of its own) — so this build can't be indexed or mistaken for the parish's real site while it's unreviewed. Don't remove any of the three until the parish has actually reviewed and approved the content — see `help-technical-details.html`.
- **Several facts are still sourced, not confirmed**, and are flagged as such on the page that uses them: the Rector's name (`src/people.config.mjs`), which of two phone numbers is current (`contact.html`), and exact opening hours (`visit-us.html`). Don't quietly remove a "needs confirming" note without actually confirming the fact first. (The Parish Giving Scheme link on `donate.html`, and the Facebook link in the footer, were both supplied directly, not sourced/guessed.)
- **Three people are listed** in `src/people.config.mjs` — the Rector, the Treasurer, and (since the WordPress-site update) the Parish Safeguarding Officer, Steve McCann. Every Church of England parish has more office-holders than that (churchwardens, a PCC secretary, an organist). Don't invent names for these roles to fill the gap — add them once the parish confirms who holds them.
- **`src/events.config.mjs` is now populated with real scraped data**, not placeholders — see that file's own header comment for the source, scrape date, and the two honest gaps left in (no service listed for 29 Nov 2026; no Christmas Eve/Day services yet as of the scrape). It only covers 2026-09-01 to 2026-12-31, since that's what was asked for — extend it the same way (read the parish's combined Google Calendar, linked from the WordPress page above; the agenda view only shows from "today" forward for a live embed, so past dates need the week/month view or the calendar's own public ICS export instead) rather than guessing forward from the pattern.
- **Preview deployment**: the GitHub repo is linked to a Cloudflare Worker, auto-deploying `main` to `https://stmartinchelsfield-org-uk.magicobject.workers.dev` on every push. That's a Cloudflare-assigned `workers.dev` subdomain, not the parish's real domain — the noindex/robots.txt/X-Robots-Tag combo above applies there too, and matters more there than anywhere else, since it's the one URL that's actually reachable right now.

## Before any push to origin
- Run `npm test` (Playwright suite) and `npm run audit` (`npm audit --audit-level=high`). Fix real findings — don't suppress, downgrade, or skip them to get a push out.
- If the change touches page content, structure, or CSS, make sure `test/accessibility.spec.ts` is included in that run and still passes with zero violations.
- Whenever the whole suite (`npm test`) is run, report the number of tests run and the time taken, prefixed with this repo's name (e.g. "stmartinchelsfield: 121 tests passed in 15.2s") — the count and duration are in Playwright's own summary line, the name prefix makes it scannable when work spans multiple sites in one session.

## Accessibility
- Every page must pass an axe-core scan (`@axe-core/playwright`, via `test/accessibility.spec.ts`) with zero violations. New pages need an entry in `test/support/pages.ts` — the accessibility spec picks them up automatically from there.
- This site uses a reveal-on-scroll animation (`.reveal` / `.in`). A scan run right after `page.goto()` will false-positive on below-the-fold elements still at `opacity:0`. If you touch the accessibility spec, keep the settle step that force-adds `.in` and kills the transition/opacity/transform inline before scanning — toggling the class alone isn't enough.
- Any new heading needs to fit the existing outline (no skipped levels — h1 → h2 → h3, not h1 → h3).
- Any new text/background color pairing must clear WCAG AA contrast (4.5:1 for normal text, 3:1 for large text/UI components) — compute it (relative luminance), don't eyeball it.
- Every `<iframe>` needs a `title`; `aria-label` only belongs on elements with an ARIA role, never a bare `<div>`.

## Security
- Keep `npm run audit` clean (no unresolved high/critical) before any push.
- Don't add third-party scripts, trackers, or embeds (iframes included) without adding whatever they need to `public/_headers`' CSP first — and actually verifying it. `npm run serve` does NOT apply `_headers` (it's a Cloudflare-only convention), so a CSP gap won't show up there. Verify with `npx wrangler dev`, which serves `public/` through the real asset handler, `_headers` included — check the browser console for CSP violations after any change to `_headers` or to what a page loads/embeds.
- **The homepage and `visit-us.html` both embed a Google Maps iframe** (`https://www.google.com/maps?q=<address>&output=embed`) rather than a Leaflet pin — the query string is the plain postal address, geocoded by Google's own servers, so it sidesteps the coordinate-accuracy problem a hand-plotted pin would have (there was no reliable source for this church's exact lat/lng — see the OS grid reference note on `visit-us.html`). This needs `frame-src https://www.google.com` in `public/_headers`' CSP, already added — if you ever swap this for a different embed provider or add a second one, add its origin to `frame-src` too and re-verify with `wrangler dev`. Every map iframe needs its own descriptive `title` (see "Accessibility" above).

## Multi-developer workflow
This repo may end up with more than one person making changes through Claude Code. `users.json` (repo root) is the roster — each entry has `firstName`, `lastName` and `github` (their GitHub account name). These checks only run inside Claude's own workflow; they don't stop anyone with direct repo access, but they do keep an honest record of who did what.

- **Before starting work on any change**, run `git pull origin main` — someone else may have pushed since this session last looked.
- **Before pushing any change back to origin**, run `git pull origin main` again, to catch anything pushed while the change was in progress.
- **When adding a changelog entry** (see "Build numbers" below), identify the author automatically rather than asking: run `gh api user --jq .login` to get the current GitHub account, look it up in `users.json`, and use that person's `firstName` + `lastName` as the `changelog-author`. If the logged-in account isn't in `users.json`, stop and ask — add them to the roster first rather than guessing or leaving attribution blank.
- **Before adding anyone as a repository collaborator**, they need two-factor authentication switched on — `help-getting-set-up.html`'s own instructions already tell a new user to turn 2FA on before requesting access, so take that as read for anyone following the guide, but don't skip confirming it if someone asks for access by any other route. This repo is under a personal GitHub account, not an organisation, so GitHub itself has no setting here to enforce or verify this automatically (that's an organisation-only feature, and the API doesn't expose another account's 2FA status to an outside collaborator) — it's a policy to apply by hand, not something to rely on GitHub to check for you.

## Build pipeline
- `public/*.html` is generated from `templates/*.html` + `src/pages/*.html` + `src/pages.config.mjs` + `src/site.config.mjs` by `scripts/build.mjs` — never hand-edit it, edit the source and run `npm run build`.
- `public/css/style.css` is the one thing in `public/` that's hand-maintained, not generated.
- `public/js/calendar-events.js` is also generated (from `src/events.config.mjs`) — see "Calendar" below.
- The pre-commit hook bumps the build number and regenerates `public/` automatically on every commit — never do either by hand.

## Calendar
`src/events.config.mjs` (`ONE_OFF_EVENTS`, `RECURRING_SERIES`) is the single source of truth for the calendar — edit the arrays there, then `npm run build`. `RECURRING_SERIES` only expresses simple weekly recurrence (every Nth weekday, one fixed title) — real 2nd/4th-Sunday-only or 1st-Wednesday-only patterns (Well Hill's services, the Taizé service, Churchyard Working Party) are listed as individual dated `ONE_OFF_EVENTS` entries instead, same as genuine one-off events; extending the engine to real monthly/biweekly rules would be new work, not a data change. Only three weekly fixtures currently use `RECURRING_SERIES`: Bell Ringing Practice, Holy Communion (BCP), and Choir Practice — and only because their *own* recurrence rule on the source calendar was checked (not just "no gaps seen in the scraped range"), see `src/events.config.mjs`'s own comment. Add real entries as they're announced or scraped; never invent one to fill a gap.

## Site search
The header search box (`templates/header.html`, `public/js/search-ui.js`, `public/js/search-match.js`) is driven by `public/search-index.json`, which `scripts/build.mjs` regenerates from scratch on every build via `scripts/build-search-index.mjs` — never hand-edit that JSON file.

- **Every `h1`/`h2`/`h3` on a searchable page gets an anchor id, automatically** via `ensureSectionIds` at build time — see the kington-parishes CLAUDE.md's fuller explanation if you're unfamiliar with this pattern; the mechanism here is identical.
- **`/updates.html` and `/404.html` are never indexed at all** (`isIndexable`).
- **The hidden `/help`/`/help-*` guide has its own search scope** — indexed, but only surfaced by `search-ui.js` while already on a help page, and hidden from ordinary site search.
- **Page titles in `pages.config.mjs` are authored pre-escaped for HTML interpolation** (e.g. `'Groups &amp; Activities — ...'`) — the indexer decodes that back to a plain `&` before it goes in the JSON.
- **Unit-tested without a browser**: `scripts/build-search-index.mjs` and `public/js/search-match.js` are both pure functions, covered by `test-unit/*.test.mjs` (`npm run test:unit`). End-to-end UI behaviour is covered in `test/search.spec.ts`.

## People
`src/people.config.mjs` (`CLERGY`, `OFFICERS`) is the single source of truth for every person card on `people.html`, rendered via `{{PEOPLE:clergy}}`/`{{PEOPLE:officers}}` tokens. See "About this build" above for why this list is currently short — don't pad it out with invented names.

## Newsletter
`src/newsletter.config.mjs` (`NEWSLETTER_ISSUES`) drives `newsletter.html`/`newsletter-archive.html` via `{{NEWSLETTERS:recent}}`/`{{NEWSLETTERS:archive}}` tokens, same pattern as People above. The signup form itself works end-to-end (see `test/newsletter-signup.spec.ts`) but isn't connected to a real MailerLite account — `wrangler.jsonc`'s `MAILERLITE_GROUP_ID` is a placeholder, and no `MAILERLITE_API_KEY` secret is set. A real signup will fail until both are configured.

## Build numbers: tag every commit, and log it on /updates.html
The pre-commit hook bumps `build-number.json` on every commit (same date → counter +1; new date → counter resets to 1). Two more things go with that, both driven by the *same* build number:
1. **Before committing**, work out what the new build number will be (read `build-number.json`, apply the same same-date/new-date rule above) and add a new entry at the *top* of the changelog in `src/pages/updates.html` — that build number, the author, today's date, and a one-line summary of the change. Each entry's `changelog-meta` div is `<span class="changelog-build">`, then `<span class="changelog-author">` (see "Multi-developer workflow" above), then `<span class="changelog-date">`. Link the page(s) the change touched. Newest entry first. Include this file in the commit like any other source change.
2. **After committing**, tag it with that same build number and push the tag: `git tag build-<date>.<NNN>` (e.g. `build-2026.09.10.001`, matching the footer's "Build ..." text exactly), then `git push origin build-<date>.<NNN>`.

`/updates.html` is a real, reachable page — it's just not linked from anywhere on the site, and is marked `robots: noindex, nofollow` for the same reason as every other page right now (see "About this build").

## Data kept in sync by hand
- **The church's address/contact details appear in several places**: `src/site.config.mjs` (the DRY token source), `src/pages.config.mjs`'s `index` page structured data, and prose on `visit-us.html`/`contact.html`. `src/site.config.mjs` is the one to edit for the DRY tokens ({{EMAIL}}, {{PHONE_DISPLAY}}, etc.) — the structured data and prose mentions still need updating by hand to match.
- **`SITE_URL` in `scripts/build.mjs`** is the one constant canonical links, Open Graph tags, and JSON-LD URLs key off. It's already set to the parish's real domain, `https://www.stmartinchelsfield.org.uk` — but see "About this build": this build isn't live there, and every page is noindex until it is.
