// Pure search-matching logic — no DOM, no fetch, nothing browser-only, so
// it's usable both as a plain classic script in the browser (attaches to
// window.SearchMatch) and via `require()`/`import` from
// test-unit/search-match.test.mjs for fast, no-browser unit tests.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SearchMatch = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function normalize(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(query) {
    var normalized = normalize(query);
    return normalized ? normalized.split(' ') : [];
  }

  // A visitor unfamiliar with Church of England terms might search for a
  // word this site never uses — "vicar" when the title is "Rector",
  // "reverend" when the site abbreviates to "Revd", "eucharist" or "mass"
  // when it says "Communion". Each key is checked verbatim too (a synonym
  // only ever ADDS candidate terms, never replaces the literal query word).
  // Grounded in this site's actual copy; re-check if that wording changes.
  var SYNONYMS = {
    vicar: ['rector'],
    priest: ['rector'],
    pastor: ['rector'],
    clergy: ['rector'],
    reverend: ['revd'],
    eucharist: ['communion'],
    mass: ['communion'],
  };

  function candidatesFor(token) {
    var extra = SYNONYMS[token];
    return extra ? [token].concat(extra) : [token];
  }

  function anyMatch(candidates, haystack) {
    for (var i = 0; i < candidates.length; i++) {
      if (haystack.indexOf(candidates[i]) !== -1) return true;
    }
    return false;
  }

  // Every query token (or one of its synonyms) must appear somewhere in the
  // entry's heading or text. A heading match counts for more than a
  // body-text match, and an exact heading match outranks a heading that
  // merely contains the word.
  function searchEntries(query, entries, limit) {
    var queryNorm = normalize(query);
    var tokens = tokenize(query);
    if (!tokens.length) return [];

    var scored = [];
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var headingNorm = normalize(entry.heading);
      var textNorm = normalize(entry.text);
      var score = 0;
      var matchesAll = true;

      for (var t = 0; t < tokens.length; t++) {
        var candidates = candidatesFor(tokens[t]);
        var inHeading = anyMatch(candidates, headingNorm);
        var inText = !inHeading && anyMatch(candidates, textNorm);
        if (!inHeading && !inText) { matchesAll = false; break; }
        score += inHeading ? 10 : 1;
      }

      if (!matchesAll) continue;

      if (headingNorm === queryNorm) {
        score += 1000;
      } else if (headingNorm.indexOf(queryNorm) === 0) {
        score += 200;
      }
      score -= headingNorm.length * 0.01;

      scored.push({ entry: entry, score: score });
    }

    scored.sort(function (a, b) { return b.score - a.score; });
    var capped = typeof limit === 'number' ? scored.slice(0, limit) : scored;
    return capped.map(function (s) { return s.entry; });
  }

  // Matches a URL pathname against the hidden help guide's own pages.
  // Deliberately tolerant of both "/help.html" (local dev/test server) and
  // "/help" (how Cloudflare Workers assets serves it — html_handling:
  // "auto-trailing-slash" strips the extension in production).
  function isHelpPath(pathname) {
    return /^\/help(?:-[a-z0-9-]+)?(?:\.html)?$/i.test(String(pathname));
  }

  return { normalize: normalize, tokenize: tokenize, searchEntries: searchEntries, isHelpPath: isHelpPath, SYNONYMS: SYNONYMS };
});
