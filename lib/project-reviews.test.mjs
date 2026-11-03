// Unit tests for lib/project-reviews.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  afterReview,
  filterReviews,
  readReview,
  reviewStatusLabel,
  sentAgain,
  studentName,
} from './project-reviews.ts';

const item = (id, status, extra = {}) => ({
  id,
  stageId: 'c1',
  repoUrl: 'https://github.com/amira/todo',
  liveUrl: null,
  status,
  feedback: null,
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
  user: { id: 'u1', firstName: 'Amira', lastName: 'Ben Ali', email: 'amira@example.com' },
  stage: { id: 'c1', title: 'React from zero', projectBrief: 'Build a todo app.' },
  ...extra,
});

test('names, labels, sent again', () => {
  assert.equal(studentName(item('s1', 'PENDING').user), 'Amira Ben Ali');
  assert.equal(studentName({ firstName: ' ', lastName: '', email: 'x@example.com' }), 'x@example.com');
  assert.deepEqual(['PENDING', 'APPROVED', 'NEEDS_WORK'].map(reviewStatusLabel), ['Waiting for review', 'Approved', 'Needs work']);
  assert.equal(sentAgain(item('s1', 'PENDING')), false);
  assert.equal(sentAgain(item('s1', 'PENDING', { updatedAt: '2026-11-03T09:00:00.000Z' })), true);
  assert.equal(sentAgain(item('s1', 'APPROVED', { updatedAt: '2026-11-03T09:00:00.000Z' })), false);
});

test('a review: changes need feedback, at most 2000 characters', () => {
  assert.deepEqual(readReview('APPROVED', '  '), { error: '', payload: { status: 'APPROVED' } });
  assert.deepEqual(readReview('APPROVED', ' Clean work. '), { error: '', payload: { status: 'APPROVED', feedback: 'Clean work.' } });
  assert.deepEqual(readReview('NEEDS_WORK', ''), {
    error: 'Say what to change: feedback is needed when you ask for changes.',
    payload: null,
  });
  assert.deepEqual(readReview('NEEDS_WORK', 'Add tests.').payload, { status: 'NEEDS_WORK', feedback: 'Add tests.' });
  assert.equal(readReview('APPROVED', 'x'.repeat(2001)).error, 'The feedback can have at most 2000 characters (now 2001).');
});

test('the lists after a review, and the search', () => {
  const lists = { pending: [item('s1', 'PENDING'), item('s2', 'PENDING')], reviewed: [item('s3', 'APPROVED'), item('s2', 'NEEDS_WORK')] };
  const after = afterReview(lists, item('s2', 'APPROVED'));
  assert.deepEqual(after.pending.map((one) => one.id), ['s1']);
  assert.deepEqual(after.reviewed.map((one) => [one.id, one.status]), [['s2', 'APPROVED'], ['s3', 'APPROVED']]);
  assert.equal(lists.pending.length, 2);
  const list = [
    item('s1', 'PENDING'),
    item('s2', 'PENDING', { user: { id: 'u2', firstName: 'Sami', lastName: 'Trabelsi', email: 'sami@example.com' }, stage: { id: 'c2', title: 'Node.js APIs', projectBrief: null } }),
  ];
  assert.deepEqual(filterReviews(list, '').map((one) => one.id), ['s1', 's2']);
  assert.deepEqual(filterReviews(list, 'node').map((one) => one.id), ['s2']);
  assert.deepEqual(filterReviews(list, 'amira react').map((one) => one.id), ['s1']);
  assert.deepEqual(filterReviews(list, 'SAMI@EXAMPLE').map((one) => one.id), ['s2']);
  assert.deepEqual(filterReviews(list, 'amira node').map((one) => one.id), []);
});
