// Unit tests for lib/assignments.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assignmentsNote,
  assignmentsToDo,
  canSend,
  isHttpsLink,
  projectCounts,
  projectState,
  readProjectLinks,
  safeLink,
  sentLabel,
  sortProjects,
  stateLabel,
  withSubmission,
} from './assignments.ts';

const sent = (stageId, status, extra = {}) => ({
  id: 's-' + stageId,
  stageId,
  repoUrl: 'https://github.com/amira/' + stageId,
  liveUrl: null,
  status,
  feedback: null,
  createdAt: '2026-11-01T10:00:00.000Z',
  updatedAt: '2026-11-01T10:00:00.000Z',
  ...extra,
});
const project = (id, submission = null, brief = 'Build it.') => ({
  course: { id, title: 'Course ' + id, center: { name: 'Code Academy' } },
  brief,
  submission,
});

test('what is left to do with each project', () => {
  const list = [
    project('a', sent('a', 'APPROVED')),
    project('b'),
    project('c', sent('c', 'PENDING')),
    project('d', sent('d', 'NEEDS_WORK')),
    project('e'),
  ];
  assert.deepEqual(list.map(projectState), ['approved', 'to-send', 'waiting', 'needs-work', 'to-send']);
  assert.deepEqual(['needs-work', 'to-send', 'waiting', 'approved'].map(stateLabel), [
    'Needs work',
    'To send',
    'Waiting for review',
    'Approved',
  ]);
  assert.deepEqual(sortProjects(list).map((item) => item.course.id), ['d', 'b', 'e', 'c', 'a']);
  assert.deepEqual(projectCounts(list), { 'needs-work': 1, 'to-send': 2, waiting: 1, approved: 1 });
  // Sending: not once approved, not when the academy removed the project
  assert.deepEqual(list.map(canSend), [false, true, true, true, true]);
  assert.equal(canSend(project('f', sent('f', 'NEEDS_WORK'), null)), false);
});

test('the Dashboard card: what to change and to send first', () => {
  const list = [
    project('a', sent('a', 'APPROVED')),
    project('b'),
    project('c', sent('c', 'PENDING')),
    project('d', sent('d', 'NEEDS_WORK')),
    project('e'),
    // Changes asked, but the academy removed the project since: nothing to send
    project('f', sent('f', 'NEEDS_WORK'), null),
  ];
  const todo = assignmentsToDo(list, 2);
  assert.deepEqual(todo.shown.map((item) => item.course.id), ['d', 'b']);
  assert.deepEqual({ ...todo, shown: todo.shown.length }, { shown: 2, toChange: 1, toSend: 2, waiting: 1, approved: 1 });
  assert.equal(assignmentsToDo(list, 9).shown.length, 3);
  assert.equal(assignmentsNote(todo), '1 project to change and 2 to send.');
  const none = { toChange: 0, toSend: 0, waiting: 0, approved: 0 };
  assert.equal(assignmentsNote({ ...none, toChange: 2 }), "2 projects to change: read the academy's feedback.");
  assert.equal(assignmentsNote({ ...none, toSend: 1, waiting: 3 }), '1 project to send.');
  assert.equal(assignmentsNote({ ...none, waiting: 1, approved: 2 }), "Nothing to do: 1 project waits for the academy's review.");
  assert.equal(assignmentsNote({ ...none, waiting: 2 }), "Nothing to do: 2 projects wait for the academy's review.");
  assert.equal(assignmentsNote({ ...none, approved: 2 }), 'Nothing to do: your projects are approved. Well done.');
  assert.equal(assignmentsNote(none), 'Nothing to send for now.');
  assert.deepEqual(assignmentsToDo([], 3), { shown: [], toChange: 0, toSend: 0, waiting: 0, approved: 0 });
});

test('the links: full https:// addresses, the site link is optional', () => {
  assert.equal(isHttpsLink('https://github.com/amira/todo'), true);
  assert.equal(isHttpsLink('https://todo.example.tn/'), true);
  assert.equal(isHttpsLink('http://github.com/amira/todo'), false);
  assert.equal(isHttpsLink('github.com/amira/todo'), false);
  assert.equal(isHttpsLink('https://localhost/x'), false);
  assert.equal(isHttpsLink('https://git hub.com/x'), false);
  assert.deepEqual(readProjectLinks({ repoUrl: ' https://github.com/amira/todo ', liveUrl: ' ' }), {
    errors: {},
    links: { repoUrl: 'https://github.com/amira/todo' },
  });
  assert.deepEqual(readProjectLinks({ repoUrl: 'https://github.com/a/b', liveUrl: 'https://b.example.com' }).links, {
    repoUrl: 'https://github.com/a/b',
    liveUrl: 'https://b.example.com',
  });
  const wrong = readProjectLinks({ repoUrl: '', liveUrl: 'http://b.example.com' });
  assert.equal(wrong.links, null);
  assert.equal(wrong.errors.repoUrl, 'Paste the link to your code.');
  assert.equal(wrong.errors.liveUrl, 'Enter the full link to your site, starting with https://, or leave it empty.');
  const long = 'https://github.com/' + 'x'.repeat(490);
  assert.equal(readProjectLinks({ repoUrl: long, liveUrl: '' }).errors.repoUrl, 'A link can have at most 500 characters.');
});

test('links shown, the date, and the project after sending', () => {
  assert.equal(safeLink('https://github.com/a/b'), 'https://github.com/a/b');
  assert.equal(safeLink('javascript:alert(1)'), null);
  assert.equal(safeLink(null), null);
  assert.equal(sentLabel(sent('a', 'APPROVED'), 'Africa/Tunis'), 'Sent on 1 November 2026');
  const again = sent('a', 'PENDING', { updatedAt: '2026-11-03T09:00:00.000Z' });
  assert.equal(sentLabel(again, 'Africa/Tunis'), 'Sent again on 3 November 2026');
  const list = [project('a'), project('b')];
  const updated = withSubmission(list, sent('b', 'PENDING'));
  assert.equal(updated[0].submission, null);
  assert.equal(updated[1].submission.status, 'PENDING');
  assert.equal(list[1].submission, null);
});
