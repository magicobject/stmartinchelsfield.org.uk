// Unit tests for src/event-kinds.mjs and the tags it puts on every calendar event.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classifyEvent, EVENT_KINDS } from '../src/event-kinds.mjs';
import { expandEvents } from '../src/events.config.mjs';

const kindOf = (title) => classifyEvent({ title });

describe('classifyEvent', () => {
  test('worship is a service, and ordinary services are not special', () => {
    for (const title of ['Holy Communion', 'Choral Evensong', 'Sung Eucharist (BCP)', 'Family Worship', 'Morning Worship', 'Well Hill: Morning Prayer', 'Taizé Service of Prayers and Readings']) {
      assert.deepEqual(kindOf(title), { kind: 'service', special: false }, title);
    }
  });

  test('services for a named occasion are services and special', () => {
    for (const title of ['Holy Communion (Harvest Festival)', "Holy Communion (All Saints' Day)", 'Thanksgiving and Memorial Service', 'Village School Christmas Service', 'Patronal Festival Holy Communion']) {
      assert.deepEqual(kindOf(title), { kind: 'service', special: true }, title);
    }
  });

  test('regular activities are groups, not special', () => {
    for (const title of ['Chelsfield Community Cafe', 'Repair Cafe', 'Local History Group', 'Churchyard Working Party', 'Messy Church (Benefice Event)']) {
      assert.deepEqual(kindOf(title), { kind: 'group', special: false }, title);
    }
  });

  test('ringing and choir rehearsals are practices, kept out of the group slot', () => {
    for (const title of ['Bell Ringing Practice', 'Choir Practice', 'Bells Quarter Peal', 'Visiting Ringers']) {
      assert.deepEqual(kindOf(title), { kind: 'practice', special: false }, title);
    }
  });

  test('anything else is a special event', () => {
    assert.deepEqual(kindOf("Annual St Martin's Quiz Night"), { kind: 'event', special: true });
  });

  test('tags set on the entry itself win', () => {
    assert.deepEqual(classifyEvent({ title: 'Choir Practice', kind: 'group' }), { kind: 'group', special: false });
    assert.deepEqual(classifyEvent({ title: 'Holy Communion', special: true }), { kind: 'service', special: true });
    assert.deepEqual(classifyEvent({ title: 'Quiz Night', kind: 'event', special: false }), { kind: 'event', special: false });
  });
});

describe('every calendar event is tagged', () => {
  const events = expandEvents();

  test('each has a known kind and a true/false special flag', () => {
    for (const ev of events) {
      assert.ok(EVENT_KINDS.includes(ev.kind), `${ev.date} ${ev.title}`);
      assert.equal(typeof ev.special, 'boolean', `${ev.date} ${ev.title}`);
    }
  });

  test('nothing in the calendar falls through to "event" by accident: the only events are the quiz and the autumn walk', () => {
    const titles = new Set(events.filter((ev) => ev.kind === 'event').map((ev) => ev.title));
    assert.deepEqual([...titles].sort(), ["Annual St Martin's Quiz Night", "Autumn Walk from St Martin's Church"]);
  });
});
