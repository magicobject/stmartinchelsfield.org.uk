// Single source of truth for clergy and officer cards. Rendered into the
// {{PEOPLE:clergy}} / {{PEOPLE:officers}} tokens by scripts/build.mjs (see
// renderPeopleTokens) — used on people.html, so adding, removing or editing
// someone here updates the page in one place.
//
// SOURCE: the parish's "Who's Who" page on A Church Near You
// (https://www.achurchnearyou.com/church/9845/whos-who/983/), which the
// parish (Steve McCann, Oct 2026) named as the current list of post holders;
// photos, emails and phone numbers are used as shown there, at the web
// developer's instruction. Roles are worded as on that page, except that
// "Safeguarding Officer" is "Parish Safeguarding Officer" (the parish's own
// policy document). Steve McCann is the only Churchwarden (confirmed by Greg).
// Four of the images on A Church Near You (Benefice Administrator, Treasurer, PCC Secretary,
// Bookings Manager) are not portraits (a notebook, a map, a spiral pad, a calendar), so they are
// marked portrait: false. The Gift Aid Secretary has no photo, so that card shows a public-domain
// coin image instead of a portrait (credit on people.html).
//
// DATA PROTECTION: this is personal data (names, photos, emails, three phone
// numbers). Before the site goes live, each person's agreement to it, and the
// parish's permission to reuse the photos, must be on record (kept outside
// this public repo) — see docs/plans/2026-10-parish-requirements.md. Never add
// an email address as visible text, in alt text, or in structured data: emails
// go only through {{OBFUSCATE_MAILTO:...}} (see contactLinks below).
//
// Image files live in public/img/people/ — JPEG only, no EXIF/XMP/IPTC, under
// 120 KB (test/people.spec.ts enforces all three).

function contactLinks({ first, email, phone }) {
  const parts = [];
  if (phone) {
    const tel = '+44' + phone.replace(/\s+/g, '').replace(/^0/, '');
    parts.push(`<a href="tel:${tel}">${phone}</a>`);
  }
  if (email) parts.push(`<a href="{{OBFUSCATE_MAILTO:${email}}}">Email ${first} &rarr;</a>`);
  return parts.join('<br>');
}

// portrait: false marks an illustration rather than a photo of the person: it gets an empty
// alt (the name is right beside it) instead of claiming to show them.
function person({ name, first, role, email, phone, photo, alt, portrait = true }) {
  return {
    name,
    role,
    bio: contactLinks({ first, email, phone }),
    photo: { src: `/img/people/${photo}`, alt: alt ?? (portrait ? name : '') },
  };
}

export const CLERGY = [
  person({ name: 'Revd Susan Atkinson-Jones', first: 'Susan', role: 'Rector of the Benefice', email: 'revsusan@smasch.org', phone: '01689 857763', photo: 'susan-atkinson-jones.jpg' }),
  person({ name: 'Revd Martin Hayward', first: 'Martin', role: 'Associate Vicar of the Benefice', email: 'revmartin@smasch.org', photo: 'martin-hayward.jpg' }),
];

export const OFFICERS = [
  person({ name: 'Steve McCann', first: 'Steve', role: 'Churchwarden', email: 'churchwardens@stmartinchelsfield.org.uk', photo: 'steve-mccann.jpg' }),
  person({ name: 'Suzanne Diamond', first: 'Suzanne', role: 'Benefice Administrator', email: 'office@smasch.org', phone: '01689 852905', photo: 'suzanne-diamond.jpg', portrait: false }),
  person({ name: 'Margaret Warren-Axe', first: 'Margaret', role: 'Parish Safeguarding Officer', email: 'safeguarding@stmartinchelsfield.org.uk', photo: 'margaret-warren-axe.jpg' }),
  person({ name: 'Chris Mead', first: 'Chris', role: 'Treasurer &amp; Choirmaster', email: 'treasurer@stmartinchelsfield.org.uk', photo: 'chris-mead.jpg', portrait: false }),
  person({ name: 'Anne Ireland', first: 'Anne', role: 'PCC Secretary', email: 'secretary@stmartinchelsfield.org.uk', photo: 'anne-ireland.jpg', portrait: false }),
  person({ name: 'Barry Foale', first: 'Barry', role: 'Bookings Manager', email: 'bookings@stmartinchelsfield.org.uk', photo: 'barry-foale.jpg', portrait: false }),
  person({ name: 'Philippa Rooke', first: 'Philippa', role: 'Tower Captain, Archivist', email: 'philippa@stmartinchelsfield.org.uk', phone: '07826 516481', photo: 'philippa-rooke.jpg' }),
  person({ name: 'Jim Rooke', first: 'Jim', role: 'Gift Aid Secretary', email: 'giftaid@stmartinchelsfield.org.uk', photo: 'gift-aid-coin.jpg', alt: 'A Victorian gold five-pound coin (an illustration, not a portrait)' }),
];
