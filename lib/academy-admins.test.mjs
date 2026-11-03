// Unit tests for lib/academy-admins.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  academiesNote,
  academyValues,
  addedText,
  adminName,
  deleteBlockers,
  emptyAcademyForm,
  readAcademyForm,
  readAdminEmail,
  removedText,
} from './academy-admins.ts';

const amira = { id: 'u1', email: 'amira@example.com', firstName: 'Amira', lastName: 'Ben Ali' };
const sami = { id: 'u2', email: 'sami@example.com', firstName: 'Sami', lastName: 'Trabelsi' };
const academy = (id, admins) => ({
  id,
  name: `Academy ${id}`,
  location: 'Tunis',
  contactEmail: 'hello@academy.tn',
  contactPhone: '+216 71 000 000',
  createdAt: '2026-11-01T10:00:00.000Z',
  _count: { stages: 0, products: 0, coupons: 0 },
  admins,
});

test('the form of a new academy: every field, trimmed, the email in lower case', () => {
  assert.deepEqual(emptyAcademyForm(), { name: '', location: '', contactEmail: '', contactPhone: '' });
  const empty = readAcademyForm({ name: ' ', location: '', contactEmail: '  ', contactPhone: '' });
  assert.equal(empty.payload, null);
  assert.deepEqual(empty.errors, {
    name: 'Please enter the name of the academy.',
    location: 'Please enter the city of the academy.',
    contactEmail: 'Please enter the contact email of the academy.',
    contactPhone: 'Please enter the contact phone of the academy.',
  });
  const wrong = readAcademyForm({ name: 'R&D Academy', location: 'Sfax', contactEmail: 'hello', contactPhone: 'call us' });
  assert.deepEqual(wrong.errors, {
    contactEmail: 'Please enter a valid email address.',
    contactPhone: 'Please enter a valid phone number, like +216 71 000 000.',
  });
  const good = readAcademyForm({
    name: '  R&D Academy ',
    location: ' Tunis, Lac 2 ',
    contactEmail: ' Hello@RD.tn ',
    contactPhone: ' +216 (71) 000-000 ',
  });
  assert.deepEqual(good.errors, {});
  assert.deepEqual(good.payload, {
    name: 'R&D Academy',
    location: 'Tunis, Lac 2',
    contactEmail: 'hello@rd.tn',
    contactPhone: '+216 (71) 000-000',
  });
});

test('the Edit form and what keeps an academy from being deleted', () => {
  assert.deepEqual(academyValues(academy('a', [amira])), {
    name: 'Academy a',
    location: 'Tunis',
    contactEmail: 'hello@academy.tn',
    contactPhone: '+216 71 000 000',
  });
  assert.equal(deleteBlockers(academy('a', [])), '');
  assert.equal(deleteBlockers(academy('a', [amira])), 'This academy cannot be deleted while it has 1 admin.');
  const full = { ...academy('a', [amira, sami]), _count: { stages: 3, products: 1, coupons: 2 } };
  assert.equal(
    deleteBlockers(full),
    'This academy cannot be deleted while it has 3 courses, 1 digital product, 2 coupons and 2 admins.',
  );
  assert.equal(
    deleteBlockers({ ...academy('a', []), _count: { stages: 1, products: 0, coupons: 1 } }),
    'This academy cannot be deleted while it has 1 course and 1 coupon.',
  );
});

test('the email of a new admin', () => {
  assert.deepEqual(readAdminEmail(' Amira@Example.COM '), { email: 'amira@example.com', error: '' });
  assert.deepEqual(readAdminEmail('  '), { email: '', error: 'Please enter the email of the account.' });
  assert.deepEqual(readAdminEmail('amira'), { email: 'amira', error: 'Please enter a valid email address.' });
});

test('names and messages', () => {
  assert.equal(adminName(amira), 'Amira Ben Ali');
  assert.equal(adminName({ ...amira, firstName: ' ', lastName: '' }), 'amira@example.com');
  assert.equal(
    addedText(amira, 'Code Academy'),
    'Amira Ben Ali is now an admin of Code Academy. The app opens the academy space for them the next time they load it.',
  );
  assert.equal(
    removedText(amira, 'Code Academy'),
    'Amira Ben Ali is no longer an admin of Code Academy: the account is a student account again.',
  );
});

test('the line under the title', () => {
  assert.equal(academiesNote([]), 'No academy yet. Create the first one, then add its admin.');
  assert.equal(academiesNote([academy('a', [])]), '1 academy, without an admin yet: add one so someone can manage it.');
  assert.equal(
    academiesNote([academy('a', []), academy('b', [])]),
    '2 academies, without admins yet: add one to each so someone can manage them.',
  );
  assert.equal(academiesNote([academy('a', [amira])]), '1 academy and 1 admin.');
  assert.equal(academiesNote([academy('a', [amira, sami]), academy('b', [])]), '2 academies and 2 admins. 1 academy has no admin yet: add one so someone can manage it.');
  assert.equal(
    academiesNote([academy('a', [amira]), academy('b', []), academy('c', [])]),
    '3 academies and 1 admin. 2 academies have no admin yet: add one to each so someone can manage them.',
  );
});
