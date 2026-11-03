// Unit tests for lib/legal.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LEGAL_MIN_AGE,
  LEGAL_UPDATED,
  contactText,
  hostingText,
  linkPaths,
  privacyDoc,
  termsDoc,
  textParts,
  updatedLabel,
} from './legal.ts';

const FACTS = { brand: 'LMS Academy', contactEmail: '', hosting: '' };
const DOCS = [termsDoc(FACTS), privacyDoc(FACTS)];
const allTexts = (doc) => [doc.intro, ...doc.summary, ...doc.sections.flatMap((section) => section.blocks.flat())];

// The pages of the site: the folders of app/ with a page.tsx ("(group)"
// folders are not part of the address)
function sitePages() {
  const app = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
  const pages = [];
  const walk = (folder, path) => {
    if (existsSync(join(folder, 'page.tsx'))) pages.push(path === '' ? '/' : path);
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (entry.isDirectory() === false) continue;
      const part = /^\(.*\)$/.test(entry.name) ? '' : `/${entry.name}`;
      walk(join(folder, entry.name), path + part);
    }
  };
  walk(app, '');
  return pages;
}

test('the date, the contact and the hosting place', () => {
  assert.equal(updatedLabel('2026-11-01'), 'Last updated: 1 November 2026');
  assert.equal(updatedLabel('not a date'), '');
  assert.match(updatedLabel(LEGAL_UPDATED), /^Last updated: \d{1,2} [A-Z][a-z]+ 20\d\d$/);
  assert.equal(contactText(' privacy@lms.example.tn '), 'For a question or a request, write to privacy@lms.example.tn.');
  assert.match(contactText(''), /the academy you study with: .*\[Academies\]\(\/centers\)/);
  assert.equal(hostingText('in Tunisia'), 'The server and the database of the platform are hosted in Tunisia.');
  assert.match(hostingText(' '), /^The hosting place .* is not chosen yet/);
});

test('links inside a text', () => {
  assert.deepEqual(textParts('See [Academies](/centers) now.'), [
    { text: 'See ' },
    { text: 'Academies', href: '/centers' },
    { text: ' now.' },
  ]);
  assert.deepEqual(textParts('[A](/a) and [B](/b)'), [{ text: 'A', href: '/a' }, { text: ' and ' }, { text: 'B', href: '/b' }]);
  assert.deepEqual(textParts('Plain text.'), [{ text: 'Plain text.' }]);
  // Only pages of this site become links
  assert.deepEqual(textParts('[x](https://evil.example)'), [{ text: '[x](https://evil.example)' }]);
});

test('both documents are complete and only link to real pages', () => {
  const pages = sitePages();
  assert.ok(pages.includes('/terms') && pages.includes('/privacy') && pages.includes('/centers'), pages.join(' '));
  for (const doc of DOCS) {
    const ids = doc.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length, `${doc.title}: two sections share an id`);
    assert.ok(ids.every((id) => /^[a-z][a-z-]*$/.test(id)), ids.join(' '));
    assert.equal(doc.summary.length, 4);
    for (const section of doc.sections) {
      assert.ok(section.title.trim() !== '' && section.blocks.length > 0, section.id);
    }
    for (const text of allTexts(doc)) {
      assert.ok(text.trim() !== '', `${doc.title}: an empty text`);
      // No half-written link, no note left in the text
      const plain = textParts(text).filter((part) => part.href === undefined).map((part) => part.text).join('');
      assert.equal(/\[|\]\(|TODO|XXX/.test(plain), false, text);
    }
    for (const path of linkPaths(doc)) assert.ok(pages.includes(path), `${doc.title} links to ${path}, which is not a page`);
  }
  assert.ok(linkPaths(DOCS[0]).includes('/privacy') && linkPaths(DOCS[1]).includes('/terms'));
});

test('the facts reach the text', () => {
  const age = `${LEGAL_MIN_AGE} or older`;
  assert.equal(LEGAL_MIN_AGE, 18);
  assert.ok(DOCS[0].summary.join(' ').includes(age) && allTexts(DOCS[1]).join(' ').includes(`aged ${age}`));
  const named = { brand: 'Acme School', contactEmail: 'help@acme.tn', hosting: 'in Tunisia' };
  const terms = JSON.stringify(termsDoc(named));
  const privacy = JSON.stringify(privacyDoc(named));
  assert.ok(terms.includes('What Acme School is') && privacy.includes('Acme School is run by the platform team'));
  assert.equal(`${terms}${privacy}`.includes('LMS Academy'), false, 'the brand comes from lib/brand.ts');
  assert.ok(terms.includes('write to help@acme.tn.') && privacy.includes('write to help@acme.tn. We answer within one month.'));
  assert.ok(privacy.includes('hosted in Tunisia.') && privacy.includes('not chosen yet') === false);
  // Nothing is paid online: the pages must not say otherwise
  assert.ok(terms.includes('Nothing is paid on the website') && privacy.includes('No bank card details'));
});
