// Unit tests for lib/reset-requests.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  linkMessage,
  needsLink,
  resetLink,
  splitResets,
  stateLabel,
  untilLabel,
  userName,
} from './reset-requests.ts';

const user = { id: 'u1', email: 'amira@example.com', firstName: 'Amira', lastName: 'Ben Ali', phone: null, role: 'STUDENT', center: null };
const reset = (id, state) => ({ id, state, requestedAt: null, expiresAt: null, usedAt: null, createdAt: '2026-11-01T10:00:00.000Z', user });

test('what is left to do with each reset', () => {
  assert.deepEqual(['requested', 'link-active', 'link-expired', 'used'].map((state) => needsLink({ state })), [true, false, true, false]);
  const split = splitResets([reset('r1', 'used'), reset('r2', 'requested'), reset('r3', 'link-active'), reset('r4', 'link-expired')]);
  assert.deepEqual(split.todo.map((item) => item.id), ['r2', 'r4']);
  assert.deepEqual(split.others.map((item) => item.id), ['r1', 'r3']);
  assert.deepEqual(
    ['requested', 'link-active', 'link-expired', 'used'].map(stateLabel),
    ['Waiting for a link', 'Link sent', 'Link expired', 'Password changed'],
  );
  assert.equal(userName(user), 'Amira Ben Ali');
  assert.equal(userName({ ...user, firstName: ' ', lastName: '' }), 'amira@example.com');
});

test('the link and the message to send', () => {
  assert.equal(resetLink('https://lms.example.com/', 'Abc_12-x'), 'https://lms.example.com/auth/reset-password?token=Abc_12-x');
  assert.equal(resetLink('http://localhost:3000', 'a b'), 'http://localhost:3000/auth/reset-password?token=a%20b');
  assert.equal(untilLabel('2026-11-02T18:51:00.000Z', 'UTC'), 'until 2 Nov 2026, 18:51');
  assert.equal(untilLabel('2026-11-02T18:51:00.000Z', 'Africa/Tunis'), 'until 2 Nov 2026, 19:51');
  assert.equal(untilLabel('not a date'), '');
  assert.equal(
    linkMessage('Amira', 'https://x.test/auth/reset-password?token=T', 'until 2 Nov 2026, 19:51'),
    'Hello Amira, here is your link to choose a new password: https://x.test/auth/reset-password?token=T It works once, until 2 Nov 2026, 19:51. If you did not ask for it, ignore this message.',
  );
  assert.ok(linkMessage('  ', 'L', 'until X').startsWith('Hello, here is your link'));
});
