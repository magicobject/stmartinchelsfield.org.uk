// Unit tests for public/js/search-match.js — the pure matching/ranking
// logic behind the header search box. Run with `npm run test:unit`.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SearchMatch from '../public/js/search-match.js';

const { normalize, tokenize, searchEntries, isHelpPath } = SearchMatch;

describe('normalize', () => {
  test('lowercases and strips punctuation', () => {
    assert.equal(normalize("St Martin's, Chelsfield!"), 'st martin s chelsfield');
  });

  test('collapses repeated whitespace', () => {
    assert.equal(normalize('Toddler   &  Group'), 'toddler group');
  });
});

describe('tokenize', () => {
  test('splits a query into normalized words', () => {
    assert.deepEqual(tokenize('Toddler & Group'), ['toddler', 'group']);
  });

  test('returns an empty array for an empty or whitespace-only query', () => {
    assert.deepEqual(tokenize(''), []);
    assert.deepEqual(tokenize('   '), []);
  });
});

describe('searchEntries', () => {
  const entries = [
    { heading: 'Services', text: 'Sunday Holy Communion at 8am, Family Service at 9:45am.' },
    { heading: 'Visit Us', text: "Church Road, Chelsfield — a short walk from Orpington station." },
    { heading: 'Toddler Group', text: 'A weekly session for parents, carers and pre-school children.' },
    { heading: 'The Brass Crosby Rooms', text: 'A contemporary extension completed in 2007.' },
  ];

  test('returns nothing for an empty query', () => {
    assert.deepEqual(searchEntries('', entries), []);
  });

  test('finds an entry by a heading-only match', () => {
    const results = searchEntries('visit us', entries);
    assert.equal(results.length, 1);
    assert.equal(results[0].heading, 'Visit Us');
  });

  test('finds an entry by a body-text-only match', () => {
    const results = searchEntries('parents', entries);
    assert.equal(results.length, 1);
    assert.equal(results[0].heading, 'Toddler Group');
  });

  test('requires every query word to match (AND, not OR)', () => {
    const results = searchEntries('brass crosby', entries);
    assert.equal(results.length, 1);
    assert.equal(results[0].heading, 'The Brass Crosby Rooms');
  });

  test('ranks an exact heading match above a heading that merely contains the word', () => {
    const withLongerHeading = [
      { heading: 'Toddler Group Refreshments Rota', text: 'Snacks.' },
      { heading: 'Toddler Group', text: 'Weekly session.' },
    ];
    const results = searchEntries('toddler group', withLongerHeading);
    assert.equal(results[0].heading, 'Toddler Group');
  });

  test('ranks a heading match above a body-text-only match', () => {
    const results = searchEntries('services', entries);
    assert.equal(results[0].heading, 'Services');
  });

  test('when two headings both merely contain the query (neither exact nor a prefix), the shorter heading wins the tie-break', () => {
    // Neither heading equals "toddler group" outright, and neither starts
    // with it either — so both would score identically on the heading-match
    // bonus alone. The shorter, more specific heading should still come first.
    const results = searchEntries('toddler group', [
      { heading: 'A longer note about the weekly Toddler Group session', text: '' },
      { heading: 'Toddler Group Refreshments', text: '' },
    ]);
    assert.equal(results[0].heading, 'Toddler Group Refreshments');
  });

  test('a heading that starts with the whole query outranks one that merely contains it mid-heading', () => {
    const results = searchEntries('services', [
      { heading: 'Services and Special Occasions', text: '' }, // starts with the query
      { heading: 'Our Regular Weekly Services', text: '' }, // contains it, doesn't start with it
    ]);
    assert.equal(results[0].heading, 'Services and Special Occasions');
  });

  test('matching is case-insensitive and ignores punctuation', () => {
    const results = searchEntries("TODDLER & GROUP!!", entries);
    assert.equal(results.length, 1);
    assert.equal(results[0].heading, 'Toddler Group');
  });

  test('respects the limit argument', () => {
    const manyEntries = entries.concat(entries).concat(entries);
    const results = searchEntries('services', manyEntries, 2);
    assert.equal(results.length, 2);
  });

  test('returns nothing when no entry matches all query words', () => {
    assert.deepEqual(searchEntries('services zebra', entries), []);
  });
});

describe('isHelpPath', () => {
  test('matches the help hub and its sub-pages with a .html extension (local dev/test server)', () => {
    assert.equal(isHelpPath('/help.html'), true);
    assert.equal(isHelpPath('/help-technical-details.html'), true);
    assert.equal(isHelpPath('/help-getting-set-up.html'), true);
  });

  test('matches the same pages with the extension stripped (the live site)', () => {
    assert.equal(isHelpPath('/help'), true);
    assert.equal(isHelpPath('/help-technical-details'), true);
  });

  test('does not match an ordinary page, with or without the extension', () => {
    assert.equal(isHelpPath('/about.html'), false);
    assert.equal(isHelpPath('/about'), false);
    assert.equal(isHelpPath('/'), false);
  });

  test('does not match the internal changelog', () => {
    assert.equal(isHelpPath('/updates.html'), false);
    assert.equal(isHelpPath('/updates'), false);
  });
});
