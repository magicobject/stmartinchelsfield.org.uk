// Tags every calendar event with what sort of thing it is, so the homepage's
// "Coming up" cards (Next service / Next group activity / Next special event)
// and later the Groups & activities page can pick the right ones.
//
//   kind     'service'  worship (Holy Communion, Evensong, Family Worship, ...)
//            'group'    a regular activity people can join (Community Cafe, Repair Cafe, ...)
//            'practice' ringing and choir rehearsals (left out of "next group activity")
//            'event'    anything else: a one-off outing, quiz, concert, ...
//   special  true for the occasional extras: every 'event', plus services for a named
//            occasion (Harvest, All Saints', Christmas, Remembrance, Patronal Festival, ...)
//
// An entry in src/events.config.mjs can set `kind` and/or `special` itself, and that wins:
// this is also how a future import from the church's Google Calendar should pass its own tags.
// Otherwise the title decides, using the rules below. test-unit/event-kinds.test.mjs
// checks every event in the calendar gets a kind, so a new title that matches nothing
// is noticed (it becomes 'event', and so 'special').

const PRACTICE = /ringing practice|choir practice|quarter peal|visiting ringers/i;
const GROUP = /community caf|repair caf|local history|working party|messy church/i;
const SERVICE = /holy communion|eucharist|evensong|worship|morning prayer|taiz|christmas service|memorial service|\bservice\b|\bmass\b|mattins|lessons|patronal festival/i;
const OCCASION = /harvest|all saints|christmas|memorial|patronal|remembrance|festival|easter|carol|candlemas|ash wednesday|christingle|midnight mass/i;

export const EVENT_KINDS = ['service', 'group', 'practice', 'event'];

export function classifyEvent(ev) {
  const title = ev.title || '';
  let kind = ev.kind;
  if (!kind) {
    if (PRACTICE.test(title)) kind = 'practice';
    else if (GROUP.test(title)) kind = 'group';
    else if (SERVICE.test(title)) kind = 'service';
    else kind = 'event';
  }
  const special = typeof ev.special === 'boolean' ? ev.special : (kind === 'event' || (kind === 'service' && OCCASION.test(title)));
  return { kind, special };
}
