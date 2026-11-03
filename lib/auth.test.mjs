// Unit tests for lib/auth.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import {
  afterSignInPath,
  areaOf,
  displayName,
  homePathFor,
  initials,
  loginPathFor,
  parseStoredUser,
  refreshedUser,
  roleLabel,
  sessionSnapshot,
  tokenExpiresAt,
} from './auth.ts';

// A token shaped like the API's (header.payload.signature). Only the payload
// is read in the browser; the API checks the signature.
function token(claims) {
  const part = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${part({ alg: 'HS256', typ: 'JWT' })}.${part(claims)}.signature`;
}

// A stand-in for localStorage.
function store(values) {
  return { getItem: (key) => (key in values ? values[key] : null) };
}

const amira = {
  id: 'u1',
  email: 'amira@example.com',
  firstName: 'Amira',
  lastName: 'Ben Ali',
  role: 'STUDENT',
};
const NOW = Date.UTC(2026, 9, 31, 12, 0, 0);
const inOneDay = NOW / 1000 + 86400;
const anHourAgo = NOW / 1000 - 3600;

test('reads the saved user; a missing or broken value means nobody', () => {
  assert.deepEqual(parseStoredUser(JSON.stringify(amira)), amira);
  assert.equal(parseStoredUser(null), null);
  assert.equal(parseStoredUser('{not json'), null);
  assert.equal(parseStoredUser('"text"'), null);
  assert.equal(parseStoredUser(JSON.stringify({ id: 'u1' })), null);
});

test('reads when the token expires', () => {
  assert.equal(tokenExpiresAt(token({ sub: 'u1', exp: inOneDay })), inOneDay * 1000);
  assert.equal(tokenExpiresAt(token({ sub: 'u1' })), null);
  assert.equal(tokenExpiresAt('not-a-token'), null);
  assert.equal(tokenExpiresAt('a.%%%.c'), null);
});

test('signed in while the token is valid, signed out when it expires or is missing', () => {
  const user = JSON.stringify(amira);
  const valid = store({ access_token: token({ exp: inOneDay }), user });
  assert.equal(sessionSnapshot(valid, NOW), user);

  const expired = store({ access_token: token({ exp: anHourAgo }), user });
  assert.equal(sessionSnapshot(expired, NOW), '');

  assert.equal(sessionSnapshot(store({ user }), NOW), '');
  assert.equal(sessionSnapshot(store({ access_token: token({ exp: inOneDay }) }), NOW), '');
  assert.equal(sessionSnapshot(store({}), NOW), '');
});

test('each role has one area and one dashboard', () => {
  assert.equal(areaOf('STUDENT'), 'student');
  assert.equal(areaOf('CENTER_ADMIN'), 'center');
  assert.equal(areaOf('SUPER_ADMIN'), 'center');
  assert.equal(homePathFor('STUDENT'), '/student/dashboard');
  assert.equal(homePathFor('CENTER_ADMIN'), '/center/dashboard');
});

test('after sign-in: back to the page they wanted, only inside their own area', () => {
  assert.equal(loginPathFor('/student/lessons'), '/auth/login?next=%2Fstudent%2Flessons');
  assert.equal(afterSignInPath('STUDENT', '/student/lessons'), '/student/lessons');
  assert.equal(afterSignInPath('CENTER_ADMIN', '/center/orders'), '/center/orders');
  assert.equal(afterSignInPath('STUDENT', null), '/student/dashboard');
  assert.equal(afterSignInPath('STUDENT', '/center/orders'), '/student/dashboard');
  assert.equal(afterSignInPath('STUDENT', '//evil.example/student/'), '/student/dashboard');
  assert.equal(afterSignInPath('STUDENT', 'https://evil.example/student/'), '/student/dashboard');
  assert.equal(afterSignInPath('STUDENT', '/student/../../evil'), '/student/dashboard');
  assert.equal(afterSignInPath('STUDENT', '/student/x?y=1'), '/student/dashboard');
  assert.equal(afterSignInPath('STUDENT', '/checkout/c1'), '/checkout/c1');
  assert.equal(afterSignInPath('CENTER_ADMIN', '/checkout/c1'), '/center/dashboard');
});

test('name, initials and role shown in the sidebar', () => {
  assert.equal(displayName(amira), 'Amira Ben Ali');
  assert.equal(initials(amira), 'AB');
  const noName = { ...amira, firstName: '', lastName: '' };
  assert.equal(displayName(noName), 'amira@example.com');
  assert.equal(initials(noName), 'A');
  assert.equal(roleLabel('STUDENT'), 'Student');
  assert.equal(roleLabel('CENTER_ADMIN'), 'Academy admin');
  assert.equal(roleLabel('SUPER_ADMIN'), 'Platform admin');
});

test('the saved user follows the account the API sees now', () => {
  const now = { ...amira, phone: null, createdAt: '2026-11-01T10:00:00.000Z' };
  assert.equal(refreshedUser(amira, now), null);
  assert.deepEqual(refreshedUser(amira, { ...now, role: 'CENTER_ADMIN' }), { ...amira, role: 'CENTER_ADMIN' });
  assert.deepEqual(refreshedUser({ ...amira, role: 'CENTER_ADMIN' }, now), amira);
  assert.deepEqual(refreshedUser(amira, { ...now, firstName: 'Amina' }), { ...amira, firstName: 'Amina' });
  // Another account (signed in meanwhile in another tab): nothing to change
  assert.equal(refreshedUser(amira, { ...now, id: 'other', role: 'SUPER_ADMIN' }), null);
});
