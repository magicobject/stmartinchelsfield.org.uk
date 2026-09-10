// Wires up the header search box: fetches /search-index.json once (lazily,
// on first use), and uses SearchMatch (search-match.js, loaded first) to
// filter it live as you type. No framework, no router — every result is a
// real <a href="page.html#anchor">.
document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('site-search-input');
  var resultsList = document.getElementById('site-search-results');
  var form = document.getElementById('site-search-form');
  if (!input || !resultsList || !form || !window.SearchMatch) return;

  // The hidden help guide (help.html, help-*.html) has its own entries in
  // the index, tagged scope:"help" by scripts/build.mjs — kept out of
  // ordinary site search, but fully searchable while already on a help page.
  var onHelpPage = window.SearchMatch.isHelpPath(window.location.pathname);
  if (onHelpPage) {
    var label = form.querySelector('label[for="site-search-input"]');
    if (label) label.textContent = 'Search the help guide';
    input.placeholder = 'Search the help guide';
  }

  function scopeToCurrentSearch(index) {
    return index.filter(function (entry) {
      return onHelpPage ? entry.scope === 'help' : entry.scope !== 'help';
    });
  }

  var indexPromise = null;
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch('/search-index.json', { cache: 'no-cache' })
        .then(function (res) { return res.ok ? res.json() : []; })
        .catch(function () { return []; });
    }
    return indexPromise;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function closeResults() {
    resultsList.hidden = true;
    resultsList.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function renderResults(query, matches) {
    if (!matches.length) {
      resultsList.innerHTML = '<li class="site-search-empty" role="presentation">No results for &ldquo;' + escapeHtml(query) + '&rdquo;</li>';
      resultsList.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      return;
    }
    resultsList.innerHTML = matches.map(function (entry, i) {
      return '<li role="presentation">'
        + '<a role="option" id="site-search-option-' + i + '" href="' + entry.page + '#' + entry.anchor + '">'
        + '<span class="site-search-heading">' + escapeHtml(entry.heading) + '</span>'
        + '<span class="site-search-page">' + escapeHtml(entry.pageTitle) + '</span>'
        + '</a></li>';
    }).join('');
    resultsList.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  var debounceTimer = null;
  function onInput() {
    var query = input.value;
    clearTimeout(debounceTimer);
    if (!query.trim()) { closeResults(); return; }
    debounceTimer = setTimeout(function () {
      loadIndex().then(function (index) {
        var current = input.value;
        if (!current.trim()) { closeResults(); return; }
        var matches = window.SearchMatch.searchEntries(current, scopeToCurrentSearch(index), 8);
        renderResults(current, matches);
      });
    }, 150);
  }

  input.addEventListener('focus', loadIndex);
  input.addEventListener('input', onInput);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstLink = resultsList.querySelector('a[role="option"]');
    if (firstLink) { window.location.href = firstLink.getAttribute('href'); }
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' && !resultsList.hidden) {
      var first = resultsList.querySelector('a[role="option"]');
      if (first) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape') {
      closeResults();
      input.blur();
    }
  });

  resultsList.addEventListener('keydown', function (e) {
    var current = e.target.closest('a[role="option"]');
    if (!current) return;
    if (e.key === 'ArrowDown') {
      var next = current.parentElement.nextElementSibling;
      if (next) { e.preventDefault(); next.querySelector('a').focus(); }
    } else if (e.key === 'ArrowUp') {
      var prev = current.parentElement.previousElementSibling;
      e.preventDefault();
      if (prev) { prev.querySelector('a').focus(); } else { input.focus(); }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeResults();
      input.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!form.contains(e.target) && !resultsList.contains(e.target)) {
      closeResults();
    }
  });
});
