# Parish requirements (Steve McCann, Oct 2026) — delivery plan

Source: Steve's list of 26 requirements, plus *Safeguarding statements for website.docx*
(PCC-agreed 23 July 2026), plus Greg's two additions: a **Home link in the menu**, and a
**Safeguarding pill in the header** next to Donate.

This file is the tracker. **Tick a box in the same PR that delivers it**, and add the PR
link beside it. Requirement numbers are Steve's own, so the two documents can be read side by side.

## How we work (applies to every PR below)

1. **One PR per requirement (or tight group), one at a time.** Several PRs touch the same
   files (`pages.config.mjs`, the header, `people.config.mjs`), so they go in sequence, not
   in parallel. Each starts from fresh `main` (`git pull origin main`).
2. **Tests first.** The first commit in each PR is a failing test that states the requirement
   (extend the matching spec in `test/`; new pages get an entry in `test/support/pages.ts`).
   Then the change, until it passes. The PR description names the tests that prove it.
3. **Gates before pushing:** `TEST_PORT=4188 npm test` (all of it, including axe on every
   page, open states, and mobile widths) and `npm run audit`. Report "stmartinchelsfield: N tests passed in Xs".
4. **Standing rules still apply:** every page keeps `noindex`; no invented facts (anything
   unknown is an open question below, not a guess); contrast computed not eyeballed; no
   skipped heading levels; email addresses only via the obfuscation helper; one source of truth
   per fact (`site.config.mjs`, `people.config.mjs`, `events.config.mjs`).
5. **Every PR:** changelog entry on `/updates`, `build-<date>.<NNN>` tag, label `risk:simple`
   (small, single concern) or `risk:complex` (see "Review gates"). The Actions gate merges
   `risk:simple` PRs once green.
6. **After each merge:** check the live site (`smc.mediawright.uk`) — page renders, console
   clean, headers intact — and tick the box.

## Review gates (a different agent checks, never the author)

- **`risk:complex` + independent review** for the PRs that add people's names/contact
  details or touch safeguarding: R6, R7, R8. `security-architect` reviews the design first
  (what personal data goes public, and that nothing is a bare email address in the source);
  `security-engineer` checks the branch before release. Complex PRs need an approving review
  from someone other than the author; the plan is to ask Greg for that on these three only.
- **`ux-designer`** reviews R1 (header/nav, which is getting crowded) and R7 (safeguarding page) at phone and
  desktop widths, light and dark.
- **`tester`** does a final end-to-end pass over the whole site (R13).

## Open questions (answers needed; nothing is guessed meanwhile)

| # | Question | Blocks |
|---|---|---|
| Q1 | Safeguarding Officer's surname: hyphenated "Warren-Axe" (policy document, A Church Near You) or "Warren Axe" (Steve's list)? Plan: use **Warren-Axe** unless told otherwise. | R7, R8 |
| Q2 | Item 23 ends mid-sentence ("please email"). Plan: use the existing `bookings@stmartinchelsfield.org.uk`. Correct? | R6 |
| Q3 | "Chelsfield Rectory" replaces "Parish office", keeping 01689 825749. Should the existing email `stmartin.chelsfield@btinternet.com` stay on that card, or go? | R6 |
| Q4 | Item 19: show **all ten** people on the A Church Near You Who's Who (Rector, Associate Vicar, Churchwarden, Benefice Administrator, Safeguarding Officer, Treasurer & Choirmaster, PCC Secretary, Bookings Manager, Tower Captain/Archivist, Gift Aid Secretary)? And phone numbers: only those the parish already publishes (Rector 01689 857763, Benefice 01689 852905), not Philippa's mobile. Plan: yes to both. | R5 |
| Q5 | Item 22 asks for the Churchwarden to be aligned: ACNY lists one (Steve McCann). Is there a second? | R5, R6 |
| Q6 | Item 25: the official **Churchyard Regulations** document — please send it (the old site linked a PDF, but we should publish the current approved version, not guess). | R10 |
| Q7 | Messy Church (item 16): the calendar already has 3 "Messy Church (Benefice Event)" entries at St Mary's. Steve says "please check the calendar" — we'll align the page wording with those dates and not add any others. OK? | R4 |
| Q8 | Choir (item 15): the calendar's Choir Practice series stops on 13 Nov, which Steve says is an error. Plan: run it to 31 Dec 2026 (the end of the range we cover). OK? | R4 |
| Q9 | Item 7: the old site's history page. We'll import its text; any photos need the parish's permission — do we have it for the archive photos? | R9 |
| Q10 | Steve's benefice point: other parties haven't been told. We'll keep the Benefice mention to a name and one link to smasch.org, nothing about St Mary's or All Souls beyond that. Confirm no wording should be sent to them first. | R2 |

## Deferred by the parish (placeholders only; not in this plan's scope)

- [ ] **Item 5** — "what's happening next & soon" (Philippa's area). Pending her input.
- [ ] **Item 6** — more on the Donate page (Philippa's area). Pending her input.
- [ ] **Item 24 content** — Gallery photos. We build the page and button now (R11); photos come later.

## The plan

### R0 — Plan and groundwork
- [x] Add this plan (this PR).

### R1 — Header: Home link and Safeguarding pill (Greg's additions; item 1; part of item 3) — done (PR #7)
- [x] Tests: `Home` is the first item in the primary nav on every page and is marked current only on `/`; a `Safeguarding` pill sits in the header beside Donate on every page, links to `safeguarding.html`, and stays reachable in the open mobile menu; axe still clean with menu open; no overflow at 320px width.
- [x] Implement in `pages.config.mjs` (`NAV`) and `templates/header.html`; pill styling with computed contrast.
- [x] `ux-designer` review (the header now carries more): fixed the tall four-row phone header and the faint focus ring; noted a wide-desktop layout nicety (search and pills sit on a lower row than the brand) for later.

### R2 — Benefice line and link (items 2, 26) — done (PR #10)
- [x] Tests: the homepage shows "Part of the Benefice of Chelsfield with Green St Green and Pratts Bottom" below the title and above the button row; a link to `https://www.smasch.org` (opens safely, `rel=noopener`) is present; no mention of All Souls or St Mary's details imported from A Church Near You.
- [x] Implement on the homepage; add the Benefice sentence and link to History and the footer.
- [x] Structured data left alone (nothing to add without inventing facts). The link to smasch.org is in the footer of every page and in a new "Our Benefice" section on History; the hero line is plain text.

### R3 — "Brass Crosby Room", singular, everywhere (item 8) — done (PR #9)
- [x] Tests: a site-wide check that the string "Brass Crosby Rooms" never appears on any page, in the search index, or in structured data (fails first on the current site).
- [x] Replace in all sources, including `about.html`, `index.html`, `contact.html`, `get-involved.html`, `pages.config.mjs`, README, `CLAUDE.md`, unit tests; renamed the anchor to `#brass-crosby-room` and updated every link; the anchor-scroll test follows it.
- [x] Describe it as one room plus kitchen and toilets.

### R4 — Groups & activities (items 14–18) — done (PR #11)
- [x] Tests: Toddler Group text and "10.30am – 12.00 noon"; Choir text ends at "new voices are always welcome." with no date; cards exist for Messy Church, Community Café and Churchyard Working Party with Steve's wording; Choir Practice appears on the calendar through December (Q8).
- [x] Implement in `get-involved.html` and `events.config.mjs`; keep the "needs confirming" note only for what is still unconfirmed (Ladies Group time).
- [ ] Cross-link Working Party card to the Churchyard page once R10 exists.
- Choir Practice now runs to 31 Dec on the calendar, skipping Christmas Day (an assumption; to confirm with Steve). Messy Church needed no calendar change: its three dates (17 Oct, 21 Nov, 19 Dec) are all third Saturdays at St Mary's, and a test now checks that for every group.

### R5 — Clergy & contacts (items 19, 22) — done (PR #13)
- Decisions (Greg, 22 Oct 2026): all ten people from A Church Near You, with their photos, obfuscated emails and phone numbers; Steve McCann is the only Churchwarden; the parish has given permission for the people to be listed (Greg); the Gift Aid Secretary has no photo, so that card uses a public-domain coin image (Wikimedia Commons, Heritage Auctions), credited on the page.
- Security review (`security-architect`): PASS WITH CONDITIONS. Built in: photos re-encoded as JPEG, no EXIF/XMP/IPTC, under 120 KB, checked by a test; emails only as obfuscated mailto links labelled "Email <first name>", with tests that none appears as plain text anywhere in the built site, search index or structured data; a removal/correction line, a fraud warning and a pointer to the safeguarding routes on the page; a section in the privacy policy; `noindex` kept.
- [ ] Still to do outside the code: keep a record of each person's agreement outside this public repo (Greg says permission is given); consider role-based mailboxes in place of personal ones; confirm the address used for removal requests (currently the general parish email). Re-check before go-live.
- [x] Tests (from `people.config.mjs`): exactly the people agreed in Q4/Q5, correct names and roles; the Rector is Revd Susan Atkinson-Jones (not John Tranter); no bare email address in the page source; every role card passes axe.
- [x] Implement `people.config.mjs`, `people.html`; fix every other place the old names appear (`contact.html`, search index, safeguarding page, `CLAUDE.md` "About this build").
- [x] `risk:complex`; security-architect (design) done. security-engineer release check: see the PR.

### R6 — Get in touch (items 20–23) — done (PR #14)
- [x] Tests: no "Parish office" heading; "Chelsfield Rectory" with 01689 825749; "Benefice office" with Mrs Suzanne Diamond and an obfuscated mailto for `office@smasch.org` plus 01689 852905; Rector/Associate Vicar/Churchwarden agree with the people list; "Room bookings" heading and Steve's sentence; `contact-details.spec.ts` still enforces obfuscation.
- [x] Implement in `contact.html` / `site.config.mjs`; remove the "two sources disagreed" caveat only where Steve's list settles it.
- [x] Labelled `risk:simple` rather than `risk:complex` as first planned: it adds no new personal data (every name, number and address was already published and security-reviewed in R5), so no new security review was needed. (Greg can overrule this labelling.) Q2 and Q3 used the plan defaults: bookings email as given in R5; the Rectory card shows only the phone number (the general parish email stays in the footer, the privacy policy and the removal route). Rector, Associate Vicar and Churchwarden now also show names (and the Rector's phone) to match the Clergy page; a test compares them with `people.config.mjs`.

### R7 — Safeguarding page (items 3, 4.1–4.4) — done (PR #16)
- [x] Tests: page lists exactly the four contacts in item 4 with the right roles, email (obfuscated) and, for the diocesan pair, phone numbers; no mention of Steve McCann as PSO; key information about the policy, "where to go for help" (999, NSPCC, Bromley, Diocese) retained; a link to the policy statements page (R8); header pill (R1) points here; axe clean; no card overflow (existing regression test still passes).
- [x] Implement `templates/safeguarding-essentials.html`, `safeguarding.html`, and `people.config.mjs` for the Parish Safeguarding Officer.
- [x] `risk:complex`; security gates; `ux-designer` review.

- Built as: h1 "Safeguarding" (so it still ranks first in site search); sections "Our commitment" (summary of the policy, linking to the policy statements), "Our safeguarding team" (the four contacts) and "Where to get help" (NSPCC, Bromley, Diocese). Steve McCann no longer appears as the officer. The old shared template and its build token were removed. Karen Barter and the shared parish mailbox are as given by the parish; the two parish contacts share one email address (each card now says so).
- Reviews: `ux-designer` (order for someone in distress, 44px tap targets, 2x2 grid, wording — applied) and `security-engineer` (PASS; the diocesan numbers also appear in `search-index.json`, accepted as they are public on the page). The diocesan officers' roles, numbers and emails were checked against the Diocese of Rochester's own safeguarding page.

### R8 — Safeguarding policy statements (item 4.5, from the Word document) — done (PR #15); built before R7 so that R7 can link to it
- [x] Tests: new `safeguarding-policy.html` has the formal statement and the full policy (all 6 commitments and 11 parish undertakings, verbatim), dated 23 July 2026, in correct heading order, indexed by site search, in the sitemap, linked from the safeguarding page and the footer.
- [x] Implement as a real HTML page (accessible and searchable), not a download. The two signatories and the PSO appointment are in the text exactly as given.
- [x] Published word for word; section headings are "The formal statement" and "The policy" so that searching for "safeguarding" still lists the main Safeguarding page first (a test guards this). Labelled `risk:complex` (safeguarding content); no personal data beyond the names already in the signed statement, so the independent check is a content review by `tester`.

### R9 — History imported from the old site (item 7) — done (PR #17)
- [x] Tests: the history page contains the old site's key content (church built 12th century onwards, Well Hill Mission church of 1893, Benefice from 1 June 2021, Deanery/Archdeaconry/Diocese, Small Pilgrim Places Network, Prayer Book Society); headings in order; no invented additions.
- [x] Implement in `about.html`, reconciled with what is there (no duplication, one source). Each fact is checked against the archived pages (`web.archive.org/web/20240422060452/http://stmartinchelsfield.org.uk/about.html` and related pages) before inclusion; anything dated or personal (e.g. the old clergy paragraphs) is brought up to date or left out.
- [x] Attribution note updated. **No photographs imported:** Greg's go-ahead covered the people photos; the old site's church, churchyard and event photos still need the parish's permission (Q9) and will go in the Gallery (R11).
- Deliberate edits to the old text, for the parish to confirm: left out the claim that Brass Crosby's release led to "the formation of Hansard" and softened "as bold as brass" to "Tradition links him with..."; "Small Pilgrim Places Network" (the old site had "Pilgrims"); the extension is 2007 throughout (one old paragraph says 2006); the old clergy paragraphs (Associate Rector, the Rectory) are left out as out of date; Well Hill service times are left to Services/Calendar because the old "2nd and 4th Sundays at 10.00am" disagrees with the current calendar; rectors' names are said to go back to "the early 14th century" (the old text says 1312 but its own list starts 1317). The churchyard paragraphs on the old church page are kept for R10.
- A separate agent fact-checked the page against the archived pages: the 43 rectors match exactly; corrections applied (lede now "almost a thousand years"; the bypass detail restored; an ambiguous "peaceful sanctuary" sentence left out). **Questions for the parish, copied unchanged from the old site:** the stained-glass artist's name ("Moira Forsythe"; usually spelled "Forsyth"); "Early English" style beside "12th century"; whether Textus Roffensis "1122" and Brass Crosby's imprisonment "late 1700s" (usually given as 1771) are as they want them; Edith Nesbit's years at Halstead Hall; and the "13 century" date of St John's Chapel.

### R10 — Churchyard (item 25)
- [ ] Tests: a Churchyard page exists in the nav with an accurate description (about 4 acres), monthly working party details matching the Groups card and calendar (first Saturday, 9–11am), and a clearly marked link/section for the Regulations (R10b).
- [ ] Implement `churchyard.html` + nav entry + `pages.config.mjs` + test page entry.
- [ ] **R10b** — publish the official Churchyard Regulations once supplied (Q6).

### R11 — Gallery (item 24)
- [ ] Tests: "Gallery" button/nav entry at the top of every page; the page exists and states plainly that photos are coming (no empty grid, no broken images); axe clean.
- [ ] Implement the shell page so the parish can add photos later by editing one config file (single source of truth, alt text required by a test).

### R12 — Visit us (items 9–13) — done (PR #8)
- [x] Tests: By car includes "What3Words: finger.amused.rate"; By train reads "a 1 mile walk from there, or take the R7 bus from Orpington station to Chelsfield Village" (R7 per Steve's list; the old R3 text must be gone); On foot reads "Walkable from Chelsfield Village and Station"; opening hours sentence; facilities sentence; the "needs confirming" notes for these facts are removed because Steve has now confirmed them.
- [x] Implement in `visit-us.html`; update `CLAUDE.md`'s "About this build" list of unconfirmed facts.
- [x] Also fixed the homepage line ("a short walk from Chelsfield and Orpington stations") so it no longer contradicts the new facts.

### R13 — Close-out
- [ ] **Found during R1, not yet fixed:** with the real webfonts, the footer's mediawright.uk credit link pushes the page 6px wider than a 320px screen (sideways scroll). The test suite blocks Google Fonts, so it cannot see this; add a font-aware overflow check as part of the fix.
- [ ] **Found during R7 review, not yet fixed:** the footer on every page shows the parish email (stmartin.chelsfield@btinternet.com) as plain text in the page source, against the repo rule on plain emails. Needs the obfuscation token and a decision on whether the address should be visible at all.
- [ ] Whole-site review by `tester` (keyboard, zoom, 320/768/1280 widths, dark mode if present, console) and `ux-designer`; fix findings in follow-up PRs.
- [ ] README still says the site is only previewable at the workers.dev address; it is now at smc.mediawright.uk (found during R3).
- [ ] Update `/help` pages and `README` so a non-technical person can see where each fact lives.
- [ ] Update `CLAUDE.md` ("About this build": who the people are, what is now confirmed).
- [ ] Final production check on `smc.mediawright.uk` (console, headers, `robots.txt`).
- [ ] Send Steve a short "what's done and what we still need" note (**drafted for Greg to send**; outward words are drafts).

## Suggested order

R0 → R1 → R12 → R3 → R2 → R4 → R5 → R6 → R7 → R8 → R9 → R10 → R11 → R13
(small safe changes first; people and safeguarding together once Q1–Q5 are answered; R10b and the deferred items whenever the parish supplies them).
