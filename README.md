# St Martin of Tours, Chelsfield

Static site for St Martin of Tours, a Church of England parish church in Chelsfield, Kent (Diocese of Rochester). Same lightweight templated-build pipeline as [kington-parishes](https://github.com/magicobject/kington-parishes) and other MediaWright-built parish sites.

**Not live at its real domain yet** — only previewable at the Cloudflare Workers subdomain `https://stmartinchelsfield-org-uk.magicobject.workers.dev`. This build was put together from public sources (A Church Near You, the London Borough of Bromley's community directory, Clague Architects' description of the Brass Crosby Rooms extension) rather than commissioned or reviewed by the parish — see [CLAUDE.md](CLAUDE.md)'s "About this build" for what that means and what still needs confirming before go-live. Every page carries `robots: noindex, nofollow`, `robots.txt` disallows everything, and every response sends `X-Robots-Tag: noindex, nofollow` for exactly this reason — the workers.dev preview shouldn't turn up in search results.

## Quick start

```bash
npm install       # also wires up the git hooks (build number, npm audit)
npm run build     # generate public/*.html from templates/ + src/
npm run serve     # serve public/ locally at http://localhost:4177
npm test          # run the Playwright suite
npm run test:unit # run the fast, browser-free unit tests
```

## How the build works

Twenty pages are assembled from four pieces by [scripts/build.mjs](scripts/build.mjs):

1. **[templates/](templates)** — the shared page shell (nav, safeguarding banner, footer, `<head>`) with `{{PLACEHOLDER}}` tokens.
2. **[src/pages/\*.html](src/pages)** — just the content unique to each page.
3. **[src/pages.config.mjs](src/pages.config.mjs)** — the primary nav, footer's "Explore" list, and each page's `<title>`/description/robots behaviour.
4. **[src/site.config.mjs](src/site.config.mjs)** — the single source of truth for contact details repeated across pages.

`src/people.config.mjs`, `src/events.config.mjs` and `src/newsletter.config.mjs` are three more small data sources, rendered into pages via `{{PEOPLE:...}}`, the calendar's data file, and `{{NEWSLETTERS:...}}` tokens respectively — see [CLAUDE.md](CLAUDE.md) for each.

Running `npm run build` writes the finished files into `public/`, which is what Cloudflare Workers actually serves (`wrangler.jsonc` points `assets.directory` at `./public`).

## Design

Deliberately distinct from other MediaWright-built parish sites: a light (not dark) header, pill-shaped buttons, rounded 14px cards with a soft shadow, and a navy/gold/rose palette — see [public/css/style.css](public/css/style.css)'s own opening comment. Gold is the general accent (links, primary buttons, card borders); rose is kept for anything alert-shaped (safeguarding, form errors) so it reads as its own signal rather than a second "brand" colour. The "old nave, new extension" hero illustration echoes the church's own history: a 12th-century core beside the contemporary Brass Crosby Rooms, added in 2007.

The homepage hero photo ([public/img/hero-church.jpg](public/img/hero-church.jpg)) was supplied directly by the site owner. Every other illustration (favicon, Open Graph image, the 404 page) is original inline SVG — no other photos could be sourced with clear rights to reuse.

## Git hooks: build number on commit, npm audit on push

`npm install` runs the `prepare` script, which points git at [.githooks/](.githooks) (`core.hooksPath`).

**[.githooks/pre-commit](.githooks/pre-commit)** bumps [build-number.json](build-number.json) and regenerates `public/` on every commit. **[.githooks/pre-push](.githooks/pre-push)** runs `npm run audit` and blocks the push on any high/critical finding.

## Build tags and the /updates changelog

Every commit gets a matching git tag, `build-<date>.<NNN>`. [src/pages/updates.html](src/pages/updates.html) (served at `/updates.html`) is a hand-maintained changelog, one entry per build — real, but not linked from anywhere on the site.

## Security headers

[public/_headers](public/_headers) (Cloudflare-specific, applied to every response): a Content-Security-Policy, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and HSTS. `npm run serve` doesn't apply this file (Cloudflare-only convention) — use `npx wrangler dev` to verify it for real, especially after changing what a page loads or embeds.

## Accessibility

Every page is scanned with [axe-core](https://github.com/dequelabs/axe-core) in [test/accessibility.spec.ts](test/accessibility.spec.ts), zero violations tolerated — part of `npm test`.

## Tests

Playwright specs in [test/](test) cover navigation (including the mobile menu), footer content, page metadata, the newsletter signup form, site search (including the hidden help guide's separate scope), the 404 page, and accessibility. [test-unit/](test-unit) covers the pure logic behind search indexing/ranking, newsletter issue splitting, and the newsletter worker — with Node's built-in test runner, no browser needed.

## Deployment

The GitHub repo is linked to a Cloudflare Worker, auto-deploying `main` to `https://stmartinchelsfield-org-uk.magicobject.workers.dev` on every push — no custom domain is wired up yet, and `MAILERLITE_GROUP_ID`/`MAILERLITE_API_KEY` aren't configured — see [CLAUDE.md](CLAUDE.md)'s "About this build" and "Newsletter" sections for what needs to happen before this is ready for the parish's real domain.
