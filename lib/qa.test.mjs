// Unit tests for lib/qa.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  authorName,
  canAccept,
  filterInbox,
  inboxCounts,
  isAcademyStaff,
  questionCount,
  readAnswer,
  readQuestionForm,
  timeAgo,
  waitsForAcademy,
} from './qa.ts';

test('author names: first name and initial; the academy label', () => {
  assert.equal(authorName({ firstName: 'Amira', lastName: 'ben Ali' }), 'Amira B.');
  assert.equal(authorName({ firstName: ' Sami ', lastName: '' }), 'Sami');
  assert.equal(authorName({ firstName: '', lastName: 'Trabelsi' }), 'Trabelsi');
  assert.equal(authorName(null), 'A student');
  assert.equal(isAcademyStaff({ firstName: 'Sami', lastName: 'T', role: 'CENTER_ADMIN' }), true);
  assert.equal(isAcademyStaff({ firstName: 'Amira', lastName: 'B', role: 'STUDENT' }), false);
});

test('how long ago', () => {
  const now = new Date('2026-11-01T12:00:00Z');
  assert.equal(timeAgo('2026-11-01T11:59:40Z', now), 'just now');
  assert.equal(timeAgo('2026-11-01T11:55:00Z', now), '5 min ago');
  assert.equal(timeAgo('2026-11-01T09:00:00Z', now), '3 h ago');
  assert.equal(timeAgo('2026-10-31T10:00:00Z', now), 'yesterday');
  assert.equal(timeAgo('2026-10-28T12:00:00Z', now), '4 days ago');
  // Older: the date ("15 Sep 2026"; the month spelling depends on Node)
  assert.match(timeAgo('2026-09-15T12:00:00Z', now), /^15 Sep.* 2026$/);
  assert.equal(timeAgo('not a date', now), '');
  assert.equal(questionCount(0), 'No questions yet');
  assert.equal(questionCount(1), '1 question');
  assert.equal(questionCount(3), '3 questions');
});

test('the question form: like the API (5 to 150 characters, at most 5000)', () => {
  assert.deepEqual(readQuestionForm({ title: '  Why does useState lag? ', body: ' I click twice. ' }), {
    errors: {},
    payload: { title: 'Why does useState lag?', body: 'I click twice.' },
  });
  const empty = readQuestionForm({ title: ' ', body: '' });
  assert.equal(empty.payload, null);
  assert.deepEqual(Object.keys(empty.errors).sort(), ['body', 'title']);
  assert.equal(readQuestionForm({ title: 'Why', body: 'x' }).errors.title, 'The title needs at least 5 characters.');
  assert.equal(readQuestionForm({ title: 'x'.repeat(151), body: 'x' }).payload, null);
  assert.equal(readQuestionForm({ title: 'Long text', body: 'x'.repeat(5001) }).errors.body !== undefined, true);
});

test('answers: not empty, at most 5000 characters', () => {
  assert.deepEqual(readAnswer('  Use the updater form. '), { error: null, body: 'Use the updater form.' });
  assert.equal(readAnswer('   ').error, 'Write your answer first.');
  assert.equal(readAnswer('x'.repeat(5001)).error, 'Your answer can have at most 5000 characters.');
});

test('accepting an answer: the author of the question (or an admin), once', () => {
  const question = { userId: 'u1' };
  const open = { isAcceptedAnswer: false };
  assert.equal(canAccept(question, open, { id: 'u1', role: 'STUDENT' }), true);
  assert.equal(canAccept(question, open, { id: 'u2', role: 'STUDENT' }), false);
  assert.equal(canAccept(question, open, { id: 'a1', role: 'CENTER_ADMIN' }), true);
  assert.equal(canAccept(question, { isAcceptedAnswer: true }, { id: 'u1', role: 'STUDENT' }), false);
  assert.equal(canAccept(question, open, null), false);
});

test('the academy inbox: waiting for the academy, not resolved, all, and the search', () => {
  const staff = { firstName: 'Sami', lastName: 'Trabelsi', role: 'CENTER_ADMIN' };
  const student = { firstName: 'Youssef', lastName: 'Gharbi', role: 'STUDENT' };
  const reply = (user, accepted = false) => ({ id: 'r', body: 'x', isAcceptedAnswer: accepted, userId: 'x', createdAt: '', user });
  const inboxQuestion = (id, title, resolved, replies, lessonTitle = 'Hooks') => ({
    id,
    title,
    body: 'Details',
    resolved,
    userId: 'u1',
    createdAt: '',
    user: { firstName: 'Amira', lastName: 'Ben Ali' },
    replies,
    lesson: { id: 'l1', title: lessonTitle, module: { stage: { id: 'c1', title: 'React from zero' } } },
  });
  const list = [
    inboxQuestion('q1', 'Counter skips a number', false, []),
    inboxQuestion('q2', 'useEffect runs twice', false, [reply(student)], 'Effects'),
    inboxQuestion('q3', 'Props or state', false, [reply(staff)]),
    inboxQuestion('q4', 'Keys in lists', true, [reply(student, true)]),
  ];
  assert.equal(waitsForAcademy(list[1]), true);
  assert.equal(waitsForAcademy(list[2]), false);
  assert.equal(waitsForAcademy(list[3]), false);
  assert.deepEqual(inboxCounts(list), { waiting: 2, open: 3, all: 4 });
  const ids = (found) => found.map((question) => question.id);
  assert.deepEqual(ids(filterInbox(list, 'waiting', '')), ['q1', 'q2']);
  assert.deepEqual(ids(filterInbox(list, 'open', '')), ['q1', 'q2', 'q3']);
  assert.deepEqual(ids(filterInbox(list, 'all', 'effects')), ['q2']);
  assert.deepEqual(ids(filterInbox(list, 'all', 'amira react')), ['q1', 'q2', 'q3', 'q4']);
});
