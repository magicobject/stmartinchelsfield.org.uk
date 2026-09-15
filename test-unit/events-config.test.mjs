// Unit tests for src/events.config.mjs — pure functions, no build, no
// browser. Covers placeFor(), the address-mapping rule behind calendar.html's
// Event structured data, plus the recurring-series expansion and the 12h
// time/date formatters. Ported from kington-parishes' identical
// test-unit/events-config.test.mjs, adapted to this site's single-church
// placeFor() (a substring match on "martin", not a five-church lookup).
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { placeFor, expandEvents, formatTime12h, formatEventDate } from '../src/events.config.mjs';

describe('placeFor', () => {
  test('a location naming the church gets its full postal address', () => {
    assert.deepEqual(placeFor('St Martin of Tours'), {
      '@type': 'Place',
      name: 'St Martin of Tours',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Church Road',
        postalCode: 'BR6 7SN',
        addressLocality: 'Chelsfield',
        addressRegion: 'Kent',
        addressCountry: 'GB',
      },
    });
  });

  test('matching is case-insensitive and by substring, not exact match', () => {
    assert.equal(placeFor('ST MARTIN OF TOURS PARISH HALL').address.postalCode, 'BR6 7SN');
  });

  test('an off-site venue with no "martin" in its name gets a bare-name Place, never a guessed address', () => {
    assert.deepEqual(placeFor('Well Hill Mission'), { '@type': 'Place', name: 'Well Hill Mission' });
    assert.deepEqual(placeFor('Chelsfield Village Hall'), { '@type': 'Place', name: 'Chelsfield Village Hall' });
    assert.deepEqual(placeFor("St Mary's"), { '@type': 'Place', name: "St Mary's" });
  });

  test('no location given falls back to the generic org name, without attaching an address', () => {
    // Regression: the generic fallback name is "St Martin of Tours, Chelsfield",
    // which itself contains "martin" — must not recurse into the address branch.
    assert.deepEqual(placeFor(''), { '@type': 'Place', name: 'St Martin of Tours, Chelsfield' });
    assert.deepEqual(placeFor(undefined), { '@type': 'Place', name: 'St Martin of Tours, Chelsfield' });
  });
});

describe('expandEvents', () => {
  test('a recurring series expands to one occurrence per matching weekday between from and until, inclusive', () => {
    const events = expandEvents().filter((e) => e.title === 'Bell Ringing Practice');
    // Mondays (ISO weekday 1), 2026-09-01 to 2026-12-31, no exceptions.
    assert.ok(events.length > 0);
    for (const e of events) {
      assert.equal(new Date(`${e.date}T00:00:00`).getDay(), 1); // Monday
      assert.ok(e.date >= '2026-09-01' && e.date <= '2026-12-31');
    }
  });

  test("a series with an earlier `until` than the others stops expanding past it", () => {
    // Choir Practice's own recurrence rule stops after 13 November 2026.
    const dates = expandEvents()
      .filter((e) => e.title === 'Choir Practice')
      .map((e) => e.date);
    assert.ok(dates.every((d) => d <= '2026-11-13'));
    assert.ok(!dates.some((d) => d > '2026-11-13'));
  });

  test('one-off events and expanded recurring events are merged into a single chronologically sorted list', () => {
    const events = expandEvents();
    for (let i = 1; i < events.length; i++) {
      const prevKey = events[i - 1].date + events[i - 1].time;
      const key = events[i].date + events[i].time;
      assert.ok(prevKey <= key, `expected ${prevKey} <= ${key}`);
    }
  });
});

describe('formatTime12h', () => {
  test('formats morning and evening times with am/pm', () => {
    assert.equal(formatTime12h('09:30'), '9:30am');
    assert.equal(formatTime12h('18:30'), '6:30pm');
  });

  test('midnight and noon are 12, not 0', () => {
    assert.equal(formatTime12h('00:00'), '12:00am');
    assert.equal(formatTime12h('12:00'), '12:00pm');
  });
});

describe('formatEventDate', () => {
  test('formats as "Ddd D Month"', () => {
    assert.equal(formatEventDate('2026-09-06'), 'Sun 6 September');
  });
});
