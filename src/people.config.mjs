// Single source of truth for clergy and officer cards. Rendered into the
// {{PEOPLE:clergy}} / {{PEOPLE:officers}} tokens by scripts/build.mjs (see
// renderPeopleTokens) — used on people.html, so adding, removing or editing
// someone here updates the page in one place.
//
// Deliberately short right now: only two people could be confirmed from
// public sources (A Church Near You, the Bromley community directory) while
// this site was built — a churchwarden, PCC secretary, safeguarding officer,
// organist etc. almost certainly exist but weren't published anywhere this
// build could check, and a parish website should never guess at who holds a
// safeguarding-relevant role. Add real names here as the parish confirms
// them; each entry is a self-contained card, so this list only grows.

const PERSON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#B1512D" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/></svg>';
const PEN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#24463C" stroke-width="1.6"><path d="M4 20h4L18 10l-4-4L4 16v4Z"/><path d="M13 7l4 4"/></svg>';

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
];
