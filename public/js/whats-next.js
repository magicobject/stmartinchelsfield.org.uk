// Homepage "Coming up" cards: fills each card with the next matching event from
// window.CALENDAR_EVENTS (set by calendar-events.js, loaded first). Each card
// carries data-kind ("service", "group" or "special"); the HTML holds a plain
// fallback (a heading and a "More information" link), which stays if there is
// nothing upcoming or scripts are off.
(function () {
  var cards = document.querySelectorAll('[data-whats-next] [data-kind]');
  if (!cards.length) return;

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function formatTime(t) {
    var parts = t.split(':');
    var h = parseInt(parts[0], 10);
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + (parts[1] === '00' ? '' : ':' + parts[1]) + suffix;
  }

  var now = new Date();
  var today = dateStr(now);
  var tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  var tomorrow = dateStr(tomorrowDate);

  function whenText(ev) {
    var day;
    if (ev.date === today) day = 'Today';
    else if (ev.date === tomorrow) day = 'Tomorrow';
    else {
      var p = ev.date.split('-');
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      day = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    }
    return day + ', ' + formatTime(ev.time);
  }

  var events = window.CALENDAR_EVENTS || [];
  var upcoming = events.filter(function (ev) {
    return new Date(ev.date + 'T' + ev.time + ':00') >= now;
  });

  function matches(kind, ev) {
    return kind === 'special' ? ev.special === true : ev.kind === kind;
  }

  function sameEvent(a, b) {
    return a && b && a.date === b.date && a.time === b.time && a.title === b.title;
  }

  // The church is the default venue, so it is only named for events held elsewhere.
  function venue(ev) {
    return ev.location && !/martin of tours/i.test(ev.location) ? ev.location : '';
  }

  // Service first, so that a special service (Harvest, Christmas, ...) is not shown twice:
  // the special card then moves on to the next special event that is a different one.
  var shown = {};
  ['service', 'group', 'special'].forEach(function (kind) {
    var card = document.querySelector('[data-whats-next] [data-kind="' + kind + '"]');
    if (!card) return;
    var ev = upcoming.find(function (e) { return matches(kind, e) && !sameEvent(e, shown.service); });
    if (!ev) return;
    shown[kind] = ev;
    card.querySelector('.wn-title').textContent = ev.title;
    card.querySelector('.wn-when').textContent = whenText(ev);
    var where = card.querySelector('.wn-where');
    if (where) {
      where.textContent = venue(ev);
      where.hidden = !where.textContent;
    }
  });
})();
