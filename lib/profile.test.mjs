// Unit tests for lib/profile.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memberSince, profileChanged, profileValues, readPasswordForm, readProfileForm } from './profile.ts';

test('the form is filled with the profile; no phone is an empty field', () => {
  assert.deepEqual(profileValues({ firstName: 'Amira', lastName: 'Ben Ali', phone: null }), {
    firstName: 'Amira',
    lastName: 'Ben Ali',
    phone: '',
  });
});

test('the checks: like the API (names required, at most 50 characters, a valid phone)', () => {
  assert.deepEqual(readProfileForm({ firstName: ' Amira ', lastName: 'Ben Ali', phone: ' +216 20 000 000 ' }), {
    errors: {},
    payload: { firstName: 'Amira', lastName: 'Ben Ali', phone: '+216 20 000 000' },
  });
  assert.deepEqual(readProfileForm({ firstName: 'Amira', lastName: 'Ben Ali', phone: '' }).payload, {
    firstName: 'Amira',
    lastName: 'Ben Ali',
    phone: '',
  });
  const wrong = readProfileForm({ firstName: '  ', lastName: 'x'.repeat(51), phone: 'call me' });
  assert.equal(wrong.payload, null);
  assert.deepEqual(wrong.errors, {
    firstName: 'Please enter your first name.',
    lastName: 'The last name can have at most 50 characters.',
    phone: 'Please enter a valid phone number, like +216 20 000 000.',
  });
});

test('changed or not, and the member since date', () => {
  const saved = { firstName: 'Amira', lastName: 'Ben Ali', phone: '' };
  assert.equal(profileChanged(saved, { ...saved, firstName: ' Amira ' }), false);
  assert.equal(profileChanged(saved, { ...saved, phone: '71 000 000' }), true);
  assert.equal(memberSince('2026-10-03T09:00:00.000Z'), 'Member since October 2026');
  assert.equal(memberSince('not a date'), '');
});

test('the password form: like the API, and the two new passwords must match', () => {
  const ok = { currentPassword: 'old password 123', newPassword: 'new password 456', confirmPassword: 'new password 456' };
  assert.deepEqual(readPasswordForm(ok), {
    errors: {},
    payload: { currentPassword: 'old password 123', newPassword: 'new password 456' },
  });
  assert.deepEqual(readPasswordForm({ currentPassword: '', newPassword: 'short', confirmPassword: 'short' }).errors, {
    currentPassword: 'Please enter your current password.',
    newPassword: 'The new password must be at least 8 characters long.',
  });
  assert.deepEqual(
    readPasswordForm({ ...ok, newPassword: ok.currentPassword, confirmPassword: ok.currentPassword }).errors,
    { newPassword: 'Choose a new password that is different from the current one.' },
  );
  assert.deepEqual(readPasswordForm({ ...ok, confirmPassword: 'new password 457' }), {
    errors: { confirmPassword: 'The two new passwords are not the same.' },
    payload: null,
  });
  // Spaces are part of a password: they are not removed
  assert.equal(
    readPasswordForm({ ...ok, newPassword: ' spaced out ', confirmPassword: ' spaced out ' }).payload.newPassword,
    ' spaced out ',
  );
});
