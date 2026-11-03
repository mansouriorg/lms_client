// Unit tests for lib/password-reset.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readNewPasswordForm, readResetEmail, tokenFrom } from './password-reset.ts';

test('the email of the Forgot password form', () => {
  assert.deepEqual(readResetEmail('  Amira@Example.COM '), { email: 'amira@example.com', error: '' });
  assert.deepEqual(readResetEmail('   '), { email: '', error: 'Please enter the email of your account.' });
  assert.equal(readResetEmail('amira').error, 'Please enter a valid email address.');
  assert.equal(readResetEmail('amira@example').error, 'Please enter a valid email address.');
  assert.equal(readResetEmail('a b@example.com').error, 'Please enter a valid email address.');
});

test('the new password: 8 to 128 characters, typed twice the same', () => {
  assert.deepEqual(readNewPasswordForm({ password: ' secret 12 ', confirm: ' secret 12 ' }), {
    errors: {},
    password: ' secret 12 ',
  });
  assert.deepEqual(readNewPasswordForm({ password: 'short', confirm: 'short' }), {
    errors: { password: 'The new password must be at least 8 characters long.' },
    password: null,
  });
  assert.deepEqual(readNewPasswordForm({ password: 'x'.repeat(129), confirm: 'x'.repeat(129) }).errors, {
    password: 'The new password can have at most 128 characters.',
  });
  assert.deepEqual(readNewPasswordForm({ password: 'x'.repeat(128), confirm: 'x'.repeat(128) }).errors, {});
  assert.deepEqual(readNewPasswordForm({ password: 'secret 12', confirm: 'secret 13' }), {
    errors: { confirm: 'The two passwords are not the same.' },
    password: null,
  });
});

test('the secret of the link in the address', () => {
  assert.equal(tokenFrom('?token=Abc_12-xyz'), 'Abc_12-xyz');
  assert.equal(tokenFrom('?a=1&token=%20Abc%20'), 'Abc');
  assert.equal(tokenFrom('?token='), '');
  assert.equal(tokenFrom(''), '');
});
