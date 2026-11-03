// Unit tests for lib/academies.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courseCountLabel, filterAcademies, mailHref, phoneHref } from './academies.ts';

function academy(id, name, location) {
  return { id, name, location, contactEmail: 'hello@academy.tn', contactPhone: '+216 71 000 000' };
}

test('the academy list: search by name or city, every word must match', () => {
  const list = [
    academy('a1', 'Code Academy', 'Tunis'),
    academy('a2', 'Design School', 'Sfax'),
    academy('a3', 'Data Lab', 'Tunis, Lac 2'),
  ];
  const ids = (found) => found.map((item) => item.id);
  assert.deepEqual(ids(filterAcademies(list, '')), ['a1', 'a2', 'a3']);
  assert.deepEqual(ids(filterAcademies(list, '  tunis ')), ['a1', 'a3']);
  assert.deepEqual(ids(filterAcademies(list, 'DESIGN')), ['a2']);
  assert.deepEqual(ids(filterAcademies(list, 'data tunis')), ['a3']);
  assert.deepEqual(ids(filterAcademies(list, 'code sfax')), []);
});

test('the number of courses', () => {
  assert.equal(courseCountLabel(0), 'No courses yet');
  assert.equal(courseCountLabel(1), '1 course');
  assert.equal(courseCountLabel(4), '4 courses');
});

test('contact links: email and phone', () => {
  assert.equal(mailHref(' hello@code.tn '), 'mailto:hello@code.tn');
  assert.equal(mailHref('not an email'), null);
  assert.equal(phoneHref('+216 71 000 000'), 'tel:+21671000000');
  assert.equal(phoneHref('71-000-000'), 'tel:71000000');
  assert.equal(phoneHref('n/a'), null);
});
