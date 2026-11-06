// Optional "spotlight" band at the top of the homepage, between the banner and the
// "Coming up" cards (the {{SPOTLIGHT}} token, rendered by scripts/render-spotlight.mjs).
// Use it for what the parish wants everyone to see first: a fundraising campaign,
// an urgent notice, a big event. Leave the list empty and there is no band.
//
// Each entry:
//   title      short heading
//   text       one or two sentences (plain text)
//   href       optional: a page on this site ("donate.html") or an https:// address
//   linkLabel  words for the link ("Give to the roof appeal"); required with href
//   from       optional YYYY-MM-DD: first day it is shown (to line one up in advance)
//   expires    YYYY-MM-DD: the first day it is NOT shown (the day after it ends)
//
// public/js/main.js hides an entry outside those dates, with no rebuild. Several
// entries stack in the order listed, so keep it to one or two.
export const SPOTLIGHT = [];
