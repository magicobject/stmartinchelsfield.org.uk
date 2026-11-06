// Lists the next few upcoming calendar events of one kind. Reads
// window.CALENDAR_EVENTS (set by calendar-events.js, loaded first) and fills any
// <ul data-upcoming-kind="event" data-limit="6"> on the page. The HTML holds a
// plain "none booked, see the calendar" line, which stays when nothing is
// upcoming or scripts are off.
(function () {
  var lists = document.querySelectorAll('[data-upcoming-kind]');
  if (!lists.length) return;

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function formatTime(t) {
    var parts = t.split(':');
    var h = parseInt(parts[0], 10);
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + (parts[1] === '00' ? '' : ':' + parts[1]) + suffix;
  }
  function whenText(ev) {
    var p = ev.date.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + formatTime(ev.time);
  }

  var now = new Date();
  var upcoming = (window.CALENDAR_EVENTS || []).filter(function (ev) {
    return new Date(ev.date + 'T' + ev.time + ':00') >= now;
  });

  lists.forEach(function (list) {
    var kind = list.getAttribute('data-upcoming-kind');
    var limit = parseInt(list.getAttribute('data-limit'), 10) || 6;
    var found = upcoming.filter(function (ev) { return ev.kind === kind; }).slice(0, limit);
    if (!found.length) return;
    list.innerHTML = found.map(function (ev) {
      var where = ev.location ? ' — ' + escapeHtml(ev.location) : '';
      return '<li><span class="fact-label">' + escapeHtml(whenText(ev)) + '</span> ' + escapeHtml(ev.title) + where + '</li>';
    }).join('');
  });
})();
