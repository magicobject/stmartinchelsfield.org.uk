// Single source of truth for the "Special services coming up" box at the top of
// services.html (the {{SPECIAL_NOTICES}} token, rendered by
// scripts/render-special-notices.mjs). Add an entry here, run `npm run build`
// (or just commit: the hook rebuilds), and it appears on the Services page.
//
// Each entry:
//   title    what is happening ("Remembrance Sunday")
//   when     plain words for the date and time ("Sunday 8 November, morning"). Only
//            give a time you have been told: never guess one.
//   note     optional extra sentence (a different time, where to meet, who is welcome)
//   expires  YYYY-MM-DD: the first day the entry is NOT shown. Use the day after the
//            event. public/js/main.js hides it from that day on, with no rebuild;
//            with no entries left showing, the whole box disappears.
//
// When an entry has passed, delete it at your leisure: it is already hidden.
// A matching entry on the calendar (src/events.config.mjs) should be added too,
// once the times are confirmed, so the two never disagree.
export const SPECIAL_NOTICES = [
  { title: 'Remembrance Sunday', when: 'Sunday 8 November, morning', expires: '2026-11-09' },
  { title: 'Patronal Festival Holy Communion', when: 'Sunday 8 November, evening', expires: '2026-11-09' },
];
