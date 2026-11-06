// Unit tests for scripts/calendar-import.mjs — made-up feeds, no network. The rules these
// cover (what is never published, how titles are tidied, UK clock changes) matter because
// the real calendars hold private bookings, funerals and phone numbers.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { importFeed, shouldPublish, tidyEvent } from '../scripts/calendar-import.mjs';

const RANGE = { from: '2026-09-01', until: '2027-06-30' };

const feed = (...events) => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//test//EN', ...events.flat(), 'END:VCALENDAR'].join('\r\n');
const vevent = (uid, lines) => ['BEGIN:VEVENT', `UID:${uid}`, 'DTSTAMP:20260101T000000Z', ...lines, 'END:VEVENT'];

describe('importFeed', () => {
  test('a repeating event becomes dated events inside the range, with the weekly flag', () => {
    const { events } = importFeed('Church', feed(vevent('a', [
      'DTSTART:20260902T093000Z', 'RRULE:FREQ=WEEKLY;BYDAY=WE', 'SUMMARY:Church: Holy Communion (BCP)',
    ])), { from: '2026-09-01', until: '2026-09-30' });
    assert.deepEqual(events.map((e) => e.date), ['2026-09-02', '2026-09-09', '2026-09-16', '2026-09-23', '2026-09-30']);
    assert.ok(events.every((e) => e.title === 'Holy Communion (BCP)' && e.location === 'St Martin of Tours' && e.weekly === true));
  });

  test('UTC times are shown as the church clock reads: an hour later in summer, the same in winter', () => {
    const { events } = importFeed('Church', feed(
      vevent('summer', ['DTSTART:20260906T083000Z', 'SUMMARY:Church: Holy Communion Service']),
      vevent('winter', ['DTSTART:20261206T093000Z', 'SUMMARY:Church: Holy Communion Service']),
    ), RANGE);
    assert.deepEqual(events.map((e) => `${e.date} ${e.time}`), ['2026-09-06 09:30', '2026-12-06 09:30']);
  });

  test('a one-off change to a repeating event replaces just that day', () => {
    const { events } = importFeed('Church', feed(
      vevent('s', ['DTSTART:20261101T093000Z', 'RRULE:FREQ=MONTHLY;BYDAY=2SU', 'SUMMARY:Church: Family Worship']),
      vevent('s', ['DTSTART:20261108T101500Z', 'RECURRENCE-ID:20261108T093000Z', 'SUMMARY:Church: Remembrance Day Service']),
    ), { from: '2026-11-01', until: '2026-12-31' });
    const titles = events.map((e) => `${e.date} ${e.time} ${e.title}`);
    assert.ok(titles.includes('2026-11-08 10:15 Remembrance Day Service'));
    assert.ok(!titles.some((t) => t.includes('2026-11-08 09:30')));
    assert.ok(titles.includes('2026-12-13 09:30 Family Worship'));
  });

  test('a date removed from a repeating event (EXDATE) does not appear', () => {
    const { events } = importFeed('Church', feed(vevent('x', [
      'DTSTART:20261224T200000Z', 'RRULE:FREQ=WEEKLY;COUNT=3', 'EXDATE:20261231T200000Z', 'SUMMARY:Church: Choir Practice',
    ])), RANGE);
    assert.deepEqual(events.map((e) => e.date), ['2026-12-24', '2027-01-07']);
  });

  test('all-day entries (no time) are skipped', () => {
    const { events } = importFeed('Church', feed(vevent('d', ['DTSTART;VALUE=DATE:20261129', 'SUMMARY:Advent Sunday'])), RANGE);
    assert.deepEqual(events, []);
  });

  test('events outside the range are left out, and a repeat that started years ago still reaches it', () => {
    const { events } = importFeed('Church', feed(
      vevent('old', ['DTSTART:20190102T190000Z', 'RRULE:FREQ=WEEKLY;BYDAY=WE', 'SUMMARY:Church: Holy Communion (BCP)']),
      vevent('past', ['DTSTART:20260801T100000Z', 'SUMMARY:Church: Holy Communion Service']),
    ), { from: '2026-09-01', until: '2026-09-07' });
    assert.deepEqual(events.map((e) => e.date), ['2026-09-02']);
  });

  test('funerals, weddings, bookings and a memorial service with notes are never published, and the tally says why', () => {
    const { events, left } = importFeed('Church', feed(
      vevent('1', ['DTSTART:20261102T113000Z', 'SUMMARY:Church: Funeral followed by Burial', 'DESCRIPTION:Advised 23 Oct']),
      vevent('2', ['DTSTART:20270925T120000Z', 'SUMMARY:Church:Wedding', 'DESCRIPTION:A and B']),
      vevent('3', ['DTSTART:20261119T140000Z', 'SUMMARY:Church: Memorial Service times tba', 'DESCRIPTION:M Smith']),
      vevent('4', ['DTSTART:20261201T100000Z', 'SUMMARY:Crosby Room: Private booking']),
      vevent('5', ['DTSTART:20261203T100000Z', 'SUMMARY:Church: Holy Communion Service']),
    ), RANGE);
    assert.deepEqual(events.map((e) => e.title), ['Holy Communion']);
    assert.equal(left['private or internal'], 3); // the 2027 wedding is outside the range, so not counted
  });

  test('nothing from an event\'s notes reaches the output', () => {
    const { events } = importFeed('Church', feed(vevent('n', [
      'DTSTART:20261203T100000Z', 'SUMMARY:Church: Holy Communion Service', 'DESCRIPTION:Call Jo on 07700 900123 or jo@example.com', 'LOCATION:Somewhere',
    ])), RANGE);
    assert.equal(JSON.stringify(events).includes('07700'), false);
    assert.equal(JSON.stringify(events).includes('example.com'), false);
    assert.deepEqual(Object.keys(events[0]).sort(), ['date', 'location', 'time', 'title']);
  });

  test('cancelled events and the same event on two feeds are not repeated', () => {
    const { events, left } = importFeed('Parish Events', feed(
      vevent('c', ['DTSTART:20261104T140000Z', 'STATUS:CANCELLED', 'SUMMARY:Village Hall: Chelsfield Community Cafe']),
      vevent('d1', ['DTSTART:20261118T143000Z', 'SUMMARY:Village Hall: Chelsfield Community Cafe']),
      vevent('d2', ['DTSTART:20261118T143000Z', 'SUMMARY:Village Hall:Chelsfield Community Cafe.']),
    ), RANGE);
    assert.equal(events.length, 1);
    assert.equal(left.cancelled, 1);
  });

  test('an unknown calendar is refused rather than published', () => {
    const { events, left } = importFeed('Crosby Room', feed(vevent('z', ['DTSTART:20261203T100000Z', 'SUMMARY:Toddler Group'])), RANGE);
    assert.deepEqual(events, []);
    assert.equal(left['unknown calendar'], 1);
  });
});

describe('tidyEvent', () => {
  test('the "Church:" style prefix becomes the place, and known titles get one spelling', () => {
    assert.deepEqual(tidyEvent('Church', 'Church:Taize service of prayers and readings'), { title: 'Taizé Service of Prayers and Readings', location: 'St Martin of Tours' });
    assert.deepEqual(tidyEvent('Parish Events', 'Village Hall: Chelsfield Community Cafe'), { title: 'Chelsfield Community Cafe', location: 'Chelsfield Village Hall' });
    assert.deepEqual(tidyEvent('Parish Events', "St.Mary’s: Repair Cafe"), { title: 'Repair Cafe', location: "St Mary's" });
    assert.deepEqual(tidyEvent('Well Hill', 'Well Hill: Morning Prayer'), { title: 'Well Hill: Morning Prayer', location: 'Well Hill Mission' });
    assert.deepEqual(tidyEvent('Church', 'All Souls Church: Benefice Holy Communion'), { title: 'Benefice Holy Communion', location: 'All Souls, Pratts Bottom' });
  });

  test('a venue written into the title moves to the place', () => {
    assert.deepEqual(tidyEvent('Parish Events', 'Annual St.Martins Quiz Night. Chelsfield Village Hall'), { title: "Annual St Martin's Quiz Night", location: 'Chelsfield Village Hall' });
  });

  test('stray spaces and a trailing full stop are removed', () => {
    assert.equal(tidyEvent('Church', '  Church:  Mattins. ').title, 'Mattins');
  });
});

describe('shouldPublish', () => {
  test('the parish-wide memorial service (no notes) is fine; one with a named person is not', () => {
    assert.equal(shouldPublish('Church', { title: 'Thanksgiving and Memorial Service', description: '' }).publish, true);
    assert.equal(shouldPublish('Church', { title: 'Memorial Service', description: 'Family name' }).publish, false);
  });

  test('housekeeping is not published', () => {
    for (const title of ['Church: Electrical contractors', 'Church: Preparing for Harvest', 'Church:in use for concert rehearsals']) {
      assert.equal(shouldPublish('Church', { title }).publish, false, title);
    }
  });
});
