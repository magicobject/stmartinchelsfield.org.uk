// Rules for `npm run import:calendar` (scripts/import-calendar.mjs), which turns the
// parish's public Google Calendars into src/events.imported.mjs. Everything that decides
// what reaches the website lives here, so it can be read and changed in one place.
//
// WHAT IS PUBLISHED: a date, a time, a tidied title and a place. Never an event's notes
// (they hold names, phone numbers and email addresses) and never anything on the deny list.
// Agreed with Greg, 6 Nov 2026: the Crosby Room and Parish Room calendars are left out
// (Greg allowed the Toddler Group, but its calendar entry repeats every Tuesday with no school
// holidays, so it would show sessions that do not run; the Groups page describes it instead),
// and funerals, weddings and memorial services for a named
// person are never published. Every import comes as a pull request so the result is
// reviewed before it goes live.
//
// THE CALENDAR IDS are not in this repository (it is public, and these calendars hold
// private bookings). They live in `.calendar-sources.local.json`, which git ignores; see
// `.calendar-sources.example.json` for its shape.

export const IMPORT_RANGE = { from: '2026-09-01', until: '2027-06-30' };

// One entry per calendar the importer may read. `location` is where its events are held
// unless the title says otherwise (see TITLE_PREFIXES); `only` keeps just matching titles.
export const SOURCE_RULES = {
  'Church': { location: 'St Martin of Tours' },
  'Parish Events': { location: 'St Martin of Tours' },
  'Well Hill': { location: 'Well Hill Mission' },
};

// Titles that are never published: private occasions, bookings and internal housekeeping.
export const DENY_TITLE = /funeral|burial|wedding|baptism|christening|private|booking|rehears|unavailable|testing|preparation|preparing for|in use for|electrical|contractor/i;

// The parish writes "Church:", "Village Hall:" and so on at the start of a title to say
// where it is. We use that as the place and drop it from the title. First match wins.
export const TITLE_PREFIXES = [
  { pattern: /^all souls church\s*:\s*/i, location: 'All Souls, Pratts Bottom' },
  { pattern: /^(church\s*&\s*crosby room|church|st\.?\s?martins?)\s*:\s*/i, location: 'St Martin of Tours' },
  { pattern: /^(chelsfield )?village hall\s*:\s*/i, location: 'Chelsfield Village Hall' },
  { pattern: /^st\.?\s?mary['’]?s\s*:\s*/i, location: "St Mary's" },
  { pattern: /^crosby room\s*[:.]\s*/i, location: 'Brass Crosby Room' },
];

// The parish's own wording varies ("Church:Taize service of prayers and readings", "Local
// history group"), so known events are given one spelling. First match wins.
export const CANONICAL_TITLES = [
  { pattern: /quiz night/i, title: "Annual St Martin's Quiz Night", location: 'Chelsfield Village Hall' },
  { pattern: /autumn walk/i, title: "Autumn Walk from St Martin's Church" },
  { pattern: /quarter pe[ae]l/i, title: 'Bells Quarter Peal' },
  { pattern: /evensong.*harvest/i, title: 'Choral Evensong (Harvest Festival)' },
  { pattern: /harvest festival holy communion/i, title: 'Holy Communion (Harvest Festival)' },
  { pattern: /lessons/i, title: 'Festival of 9 Lessons & Carols' },
  { pattern: /taiz/i, title: 'Taizé Service of Prayers and Readings' },
  { pattern: /visiting ringers/i, title: 'Visiting Ringers' },
  { pattern: /ringing practice/i, title: 'Bell Ringing Practice' },
  { pattern: /choir practice/i, title: 'Choir Practice' },
  { pattern: /^holy communion \(bcp\)/i, title: 'Holy Communion (BCP)' },
  { pattern: /^holy communion service$/i, title: 'Holy Communion' },
  { pattern: /^choral evensong( service)?$/i, title: 'Choral Evensong' },
  { pattern: /^sung eucharist \(bcp\)/i, title: 'Sung Eucharist (BCP)' },
  { pattern: /churchyard working party/i, title: 'Churchyard Working Party' },
  { pattern: /community cafe/i, title: 'Chelsfield Community Cafe' },
  { pattern: /local history/i, title: 'Local History Group' },
  { pattern: /repair cafe/i, title: 'Repair Cafe' },
  { pattern: /messy church/i, title: 'Messy Church (Benefice Event)' },
];
