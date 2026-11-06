// Pure(ish) functions behind `npm run import:calendar`: read a public Google Calendar
// ICS feed, expand repeating events into dated ones, drop anything that must not be
// published, and tidy the titles. No network and no file writing here (the command in
// scripts/import-calendar.mjs does those), so test-unit/calendar-import.test.mjs can
// cover it with small made-up feeds.
//
// PRIVACY: only a date, a time, a tidied title and a place ever leave this file. An
// event's notes are read only to spot a named person (see shouldPublish) and are never
// copied anywhere, because the parish's calendar notes hold names, phone numbers and
// email addresses.

import ICAL from 'ical.js';
import { SOURCE_RULES, DENY_TITLE, TITLE_PREFIXES, CANONICAL_TITLES } from '../src/calendar-import.config.mjs';

const LONDON = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

// A moment as the church's clock shows it: { date: 'YYYY-MM-DD', time: 'HH:MM' }.
function londonParts(date) {
  const p = Object.fromEntries(LONDON.formatToParts(date).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

const pad = (n) => String(n).padStart(2, '0');

// Why an event is kept out, or null when it may be published.
export function shouldPublish(sourceName, { title, description, status }) {
  const rule = SOURCE_RULES[sourceName];
  if (!rule) return { publish: false, reason: 'unknown calendar' };
  const text = String(title || '');
  if (/^cancelled/i.test(text) || String(status || '').toUpperCase() === 'CANCELLED') return { publish: false, reason: 'cancelled' };
  if (rule.only && !rule.only.test(text)) return { publish: false, reason: 'not on this calendar\'s list' };
  if (DENY_TITLE.test(text)) return { publish: false, reason: 'private or internal' };
  // A memorial service with notes is one for a named person; the parish-wide one has none.
  if (/memorial/i.test(text) && String(description || '').trim()) return { publish: false, reason: 'private or internal' };
  return { publish: true };
}

// "Church:Taize service of prayers and readings" -> { title: 'Taizé Service of Prayers and Readings', location: 'St Martin of Tours' }
export function tidyEvent(sourceName, rawTitle) {
  const rule = SOURCE_RULES[sourceName];
  let title = String(rawTitle || '').replace(/\s+/g, ' ').trim();
  let location = rule.location;
  let canonicalLocation;
  for (const { pattern, location: where } of TITLE_PREFIXES) {
    if (pattern.test(title)) {
      title = title.replace(pattern, '').trim();
      location = where;
      break;
    }
  }
  title = title.replace(/[.\s]+$/, '');
  for (const { pattern, title: canonical, location: where } of CANONICAL_TITLES) {
    if (pattern.test(title)) { title = canonical; canonicalLocation = where; break; }
  }
  return { title, location: canonicalLocation || location };
}

function registerTimezones(root) {
  for (const vtz of root.getAllSubcomponents('vtimezone')) {
    const tz = new ICAL.Timezone(vtz);
    ICAL.TimezoneService.register(tz.tzid, tz);
  }
}

// One calendar's feed -> dated, filtered, tidied events between `from` and `until`
// (YYYY-MM-DD, both inclusive), plus a tally of what was left out and why.
export function importFeed(sourceName, icsText, { from, until }) {
  const root = new ICAL.Component(ICAL.parse(icsText));
  registerTimezones(root);

  // Group each repeating event with its one-off changes ("this Sunday only is different").
  const masters = new Map();
  const changes = new Map();
  for (const vevent of root.getAllSubcomponents('vevent')) {
    const uid = vevent.getFirstPropertyValue('uid');
    if (vevent.hasProperty('recurrence-id')) {
      if (!changes.has(uid)) changes.set(uid, []);
      changes.get(uid).push(vevent);
    } else {
      masters.set(uid, vevent);
    }
  }

  const events = [];
  const left = {};
  const seen = new Set();
  const skip = (reason) => { left[reason] = (left[reason] || 0) + 1; };

  const add = (parts, item, weekly) => {
    if (parts.date < from || parts.date > until) return;
    const verdict = shouldPublish(sourceName, { title: item.summary, description: item.description, status: item.component.getFirstPropertyValue('status') });
    if (!verdict.publish) return skip(verdict.reason);
    const { title, location } = tidyEvent(sourceName, item.summary);
    const key = `${parts.date}|${parts.time}|${title}`;
    if (seen.has(key)) return;
    seen.add(key);
    const entry = { date: parts.date, time: parts.time, title, location };
    if (weekly) entry.weekly = true;
    events.push(entry);
  };

  const toParts = (time) => {
    if (time.isDate) return null; // all-day entries (saints' days, Sundays of the church year) have no time
    if (time.zone === ICAL.Timezone.localTimezone) {
      return { date: `${time.year}-${pad(time.month)}-${pad(time.day)}`, time: `${pad(time.hour)}:${pad(time.minute)}` };
    }
    return londonParts(time.toJSDate());
  };

  for (const [uid, vevent] of masters) {
    const event = new ICAL.Event(vevent);
    for (const change of changes.get(uid) || []) event.relateException(new ICAL.Event(change));
    const rrule = String(vevent.getFirstPropertyValue('rrule') || '');
    const weekly = /FREQ=WEEKLY/.test(rrule);
    if (!event.isRecurring()) {
      const parts = toParts(event.startDate);
      if (parts) add(parts, event, false);
      continue;
    }
    const iterator = event.iterator();
    for (let next = iterator.next(); next; next = iterator.next()) {
      const details = event.getOccurrenceDetails(next);
      const parts = toParts(details.startDate);
      if (!parts) continue;
      if (parts.date > until) break;
      add(parts, details.item, weekly);
    }
  }

  events.sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
  return { events, left };
}
