// Unit tests for lib/terms-acceptance.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { termsNotice, versionDate } from './terms-acceptance.ts';

test('the date of a version', () => {
  assert.equal(versionDate('2026-11-01'), '1 November 2026');
  assert.equal(versionDate('2027-02-28'), '28 February 2027');
  assert.equal(versionDate('v2'), '');
  assert.equal(versionDate('2026-13-45'), '');
});

test('when the notice is shown, and what it says', () => {
  // Accepted, or an API that does not say: nothing to show
  assert.equal(termsNotice('2026-11-01', '2026-11-01'), null);
  assert.equal(termsNotice(undefined, '2026-11-01'), null);
  // Never accepted (accounts from before the terms were recorded)
  assert.equal(termsNotice(null, '2026-11-01').title, 'Please read and accept our Terms of Service and Privacy Policy');
  assert.equal(termsNotice('', '2026-11-01').title, 'Please read and accept our Terms of Service and Privacy Policy');
  // An older version accepted: the texts changed
  assert.deepEqual(termsNotice('2026-11-01', '2027-02-28'), {
    title: 'Our Terms of Service and Privacy Policy changed',
    text: 'A new version, dated 28 February 2027, replaces the one you accepted. Please read it and accept it.',
  });
  assert.equal(termsNotice('2026-11-01', 'next').text, 'A new version replaces the one you accepted. Please read it and accept it.');
});
