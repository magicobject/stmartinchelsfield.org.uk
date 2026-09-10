// Single source of truth for contact details and facts repeated across the
// site — the header's donate button, the footer, and several content pages.
// Edit a value here to update it everywhere at once; scripts/build.mjs
// replaces every {{TOKEN}} (e.g. {{EMAIL}}, {{DONATE_URL}}) with the
// matching value below, in templates and in src/pages/*.html content alike.
//
// SOURCING NOTE (read before editing): the contact details below were
// gathered from public directory listings (A Church Near You, the London
// Borough of Bromley's community directory) while this site was built, not
// supplied first-hand by the parish. The two listings disagree on which
// phone number is current, and neither could be cross-checked against the
// parish's own live site at build time. Confirm every value in this file
// with the parish office/PCC before this site goes live.
export const SITE = {
  orgName: 'St Martin of Tours, Chelsfield',

  // Bromley's directory lists this as the church/rectory number. A Church
  // Near You separately lists a benefice administrator number, 01689 852905
  // — kept out of this single token since the two may serve different
  // purposes; see contact.html, which lists both with their source.
  email: 'stmartin.chelsfield@btinternet.com',
  phoneDisplay: '01689 825749',
  phoneTel: '+441689825749',

  venue: 'St Martin of Tours Church',
  street: 'Church Road',
  town: 'Chelsfield, Orpington',
  county: 'Kent',
  postcode: 'BR6 7SN',

  donateUrl: 'donate.html',

  mediawrightHref: 'https://mediawright.uk',
  mediawrightLabel: 'mediawright.uk',
};
