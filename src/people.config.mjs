// Single source of truth for clergy and officer cards. Rendered into the
// {{PEOPLE:clergy}} / {{PEOPLE:officers}} tokens by scripts/build.mjs (see
// renderPeopleTokens) — used on people.html, so adding, removing or editing
// someone here updates the page in one place.
//
// Confirmed from two public sources: A Church Near You / the Bromley
// community directory (the Rector, the Treasurer), and the parish's own
// interim WordPress site (the Parish Safeguarding Officer) — see CLAUDE.md's
// "About this build" for both. A churchwarden, PCC secretary, organist etc.
// almost certainly exist but weren't published anywhere this build could
// check, and a parish website should never guess at who holds a role. Add
// real names here as the parish confirms them; each entry is a
// self-contained card, so this list only grows.

const PERSON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#866017" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></svg>';
const PEN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A40" stroke-width="1.6"><path d="M4 20h4L18 10l-4-4L4 16v4Z"/><path d="M13 7l4 4"/></svg>';
const SHIELD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#8C3B31" stroke-width="1.6"><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z"/></svg>';

function contactLink(email) {
  return email ? ` <a href="{{OBFUSCATE_MAILTO:${email}}}">Get in touch &rarr;</a>` : '';
}

export const CLERGY = [
  {
    name: 'Revd John Tranter',
    role: 'Rector',
    bio: 'Leads worship and ministry at St Martin of Tours.' + contactLink('rector@stmartinchelsfield.org.uk'),
    iconSvg: PERSON_ICON,
  },
];

export const OFFICERS = [
  {
    name: 'Barry Foale',
    role: 'Honorary Treasurer &middot; Magazine Editor &middot; Website Manager',
    bio: 'Looks after the church accounts, edits the parish magazine, and manages this website.' + contactLink('treasurer@stmartinchelsfield.org.uk'),
    iconSvg: PEN_ICON,
  },
  {
    name: 'Steve McCann',
    role: 'Parish Safeguarding Officer',
    bio: 'Our named contact for any safeguarding concern — see the <a href="safeguarding.html">Safeguarding page</a> for how to get in touch, and for the Diocesan Safeguarding Advisor who supports him.' + contactLink('safeguarding@stmartinchelsfield.org.uk'),
    iconSvg: SHIELD_ICON,
  },
];
