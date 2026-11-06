// Privacy regression tests for the calendar importer. The parish's calendars hold funerals,
// weddings and named people; these pin the protections that keep them off the public site.
// (Added after the security review of PR #34 found that a block list alone let realistic
// private titles through.)
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { importFeed, shouldPublish, normaliseText } from '../scripts/calendar-import.mjs';
import { IMPORTED_EVENTS } from '../src/events.imported.mjs';
import { ALLOWED_TITLES, CANONICAL_TITLES, BLOCKED_TEXT } from '../src/calendar-import.config.mjs';
import { jsonForScript } from '../scripts/json-for-script.mjs';

const feed = (...events) => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//test//EN', ...events.flat(), 'END:VCALENDAR'].join('\r\n');
const vevent = (uid, lines) => ['BEGIN:VEVENT', `UID:${uid}`, 'DTSTAMP:20260101T000000Z', ...lines, 'END:VEVENT'];
const RANGE = { from: '2026-09-01', until: '2027-06-30' };
const fromCodes = (...codes) => codes.map((c) => String.fromCharCode(c)).join('');

// Private or unfamiliar titles, as a volunteer might realistically type them. None may publish.
const SLIPPED = [
  'Church: Thanksgiving for the life of Jo Smith', 'Church: Interment', 'Interment of ashes', 'Committal', 'Wake', 'Requiem',
  'Requiem Mass for Jo Smith', 'Cremation', 'Celebration of Life - J Smith', 'Service for John Smith',
  'Memorial for Jo Smith', 'Marriage of A and B', 'Blessing of marriage', 'Renewal of vows', 'Banns',
  'Thanksgiving for the birth of baby Jo', 'Naming ceremony', 'Confirmation of Jo',
  'Booked: Smith', 'Hire: Smith family', 'Church hire', 'Reserved', 'Church: J Smith',
  'Home communion: Mrs Jones', 'Pastoral visit', 'Flowers - Mrs Jones', 'PCC meeting', 'Safeguarding meeting', 'Rector away', '90th birthday party',
  'Holy Communion - call 07700 900123', 'jo@example.com', 'See https://example.com',
  'Funeral', 'Funeral Service', 'Church: Wedding', 'Baptism', 'Christening', 'Private hire',
];

describe('the approved list is the main protection', () => {
  test('every private or unfamiliar title in the review list is refused', () => {
    for (const title of SLIPPED) {
      assert.equal(shouldPublish('Church', { title, description: '' }).publish, false, title);
    }
  });

  test('an unfamiliar harmless title is held back, and reported so a person can approve it', () => {
    const verdict = shouldPublish('Church', { title: 'Church: Summer Fete Planning Chat', description: '' });
    assert.equal(verdict.publish, false);
    assert.equal(verdict.reason, 'not yet approved');
    assert.equal(verdict.unlisted, 'Summer Fete Planning Chat');
    const { events, unlisted } = importFeed('Church', feed(vevent('u', ['DTSTART:20261203T100000Z', 'SUMMARY:Church: Summer Fete Planning Chat'])), RANGE);
    assert.deepEqual(events, []);
    assert.deepEqual(unlisted, ['Summer Fete Planning Chat']);
  });

  test('a title spelled with hidden characters or letter-spacing tricks cannot slip past', () => {
    const soft = fromCodes(0xad);
    const zero = fromCodes(0x200b);
    for (const title of [`Fun${soft}eral`, `Wed${soft}ding`, `Fu${zero}neral`, 'F u n e r a l', `Church: Fun${soft}eral for Jo`]) {
      assert.equal(shouldPublish('Church', { title, description: '' }).publish, false, JSON.stringify(title));
    }
  });

  test('normaliseText removes hidden characters and compatibility forms', () => {
    assert.equal(normaliseText(`Fun${fromCodes(0xad)}eral`), 'Funeral');
    assert.equal(normaliseText('  a \n\t b '), 'a b');
    assert.equal(normaliseText(fromCodes(0xff26, 0xff55, 0xff4e)), 'Fun'); // full-width letters
  });

  test('phone numbers, emails and web addresses in a title are refused even on an approved event', () => {
    for (const title of ['Church: Holy Communion Service 01689 825749', 'Church: Choir Practice jo@example.com', 'Church: Mattins www.example.com']) {
      assert.equal(shouldPublish('Church', { title, description: '' }).publish, false, title);
    }
  });
});

describe('what is in the published calendar data', () => {
  const approved = new Set([...ALLOWED_TITLES, ...CANONICAL_TITLES.map((c) => c.title)]);

  test('every imported title is on the approved list', () => {
    for (const ev of IMPORTED_EVENTS) assert.ok(approved.has(ev.title), `${ev.date} ${ev.title}`);
  });

  test('no imported title or place looks like a phone number, email or web address', () => {
    for (const ev of IMPORTED_EVENTS) {
      assert.equal(BLOCKED_TEXT.test(ev.title), false, ev.title);
      assert.equal(BLOCKED_TEXT.test(ev.location || ''), false, ev.location);
    }
  });

  test('only the four expected fields are present', () => {
    for (const ev of IMPORTED_EVENTS) {
      assert.deepEqual(Object.keys(ev).filter((k) => !['date', 'time', 'title', 'location', 'weekly'].includes(k)), [], ev.title);
    }
  });
});

describe('robustness', () => {
  test('an endless yearly all-day event does not hang or crash the import', () => {
    const { events } = importFeed('Church', feed(
      vevent('y', ['DTSTART;VALUE=DATE:20200101', 'RRULE:FREQ=YEARLY', 'SUMMARY:Church: Anniversary']),
      vevent('ok', ['DTSTART:20261203T100000Z', 'SUMMARY:Church: Holy Communion Service']),
    ), RANGE);
    assert.deepEqual(events.map((e) => e.title), ['Holy Communion']);
  });
});

describe('jsonForScript', () => {
  test('a title that tries to close the script block cannot, and still reads back unchanged', () => {
    const title = 'Evil </script><script>alert(1)</script> ' + fromCodes(0x2028);
    const out = jsonForScript({ name: title });
    assert.equal(out.includes('</'), false);
    assert.equal(out.includes('<'), false);
    assert.equal(out.includes(fromCodes(0x2028)), false);
    assert.deepEqual(JSON.parse(out), { name: title });
  });
});
