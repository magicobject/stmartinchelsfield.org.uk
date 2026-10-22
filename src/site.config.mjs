// Single source of truth for contact details and facts repeated across the
// site — the header's donate button, the footer, and several content pages.
// Edit a value here to update it everywhere at once; scripts/build.mjs
// replaces every {{TOKEN}} (e.g. {{EMAIL}}, {{DONATE_URL}}) with the
// matching value below, in templates and in src/pages/*.html content alike.
//
// SOURCING NOTE: these details were first gathered from public directory
// listings (A Church Near You, the London Borough of Bromley's community
// directory). The parish (Steve McCann, Oct 2026) has since confirmed that
// 01689 825749 is the Chelsfield Rectory number and that the Benefice office
// is 01689 852905 (see contact.html). The email address below is the general
// parish address and has not been separately confirmed.
export const SITE = {
  orgName: 'St Martin of Tours, Chelsfield',

  // The Chelsfield Rectory number (confirmed by the parish, Oct 2026). The
  // Benefice office number, 01689 852905, is a separate fact kept on
  // contact.html and in src/people.config.mjs.
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
