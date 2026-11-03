// Unit tests for lib/lesson-progress.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  biggestDrop,
  completedLabel,
  dropLabel,
  lessonCountLabel,
  lessonTotal,
  shareOf,
} from './lesson-progress.ts';

const lesson = (id, title, completed) => ({ id, title, duration: 10, completed });
const report = (...modules) => ({ students: 20, finished: 3, modules });
const REPORT = report(
  { id: 'm1', title: 'Getting started', lessons: [lesson('l1', 'Your first component', 18), lesson('l2', 'Props', 15)] },
  { id: 'm2', title: 'Empty', lessons: [] },
  { id: 'm3', title: 'State', lessons: [lesson('l3', 'useState', 7), lesson('l4', 'useReducer', 8), lesson('l5', 'Context', 0)] },
);

test('the share of the students who completed a lesson', () => {
  assert.equal(shareOf(12, 20), 60);
  assert.equal(shareOf(2, 3), 67);
  assert.equal(shareOf(0, 0), 0);
  assert.equal(completedLabel(12, 20), '12 of 20 students (60%)');
  assert.equal(completedLabel(1, 1), '1 of 1 student (100%)');
  assert.equal(completedLabel(0, 3), '0 of 3 students (0%)');
});

test('the lessons of the course', () => {
  assert.equal(lessonTotal(REPORT), 5);
  assert.equal(lessonTotal(report()), 0);
  assert.equal(lessonCountLabel(0), 'No lessons yet');
  assert.equal(lessonCountLabel(1), '1 lesson');
  assert.equal(lessonCountLabel(4), '4 lessons');
});

test('where most students stop: the biggest fall from one lesson to the next', () => {
  // 18 -> 15 (3), 15 -> 7 across the empty module (8), 7 -> 8 (none), 8 -> 0 (8, not bigger)
  const drop = biggestDrop(REPORT);
  assert.deepEqual([drop.after.id, drop.next.id, drop.lost], ['l2', 'l3', 8]);
  assert.equal(dropLabel(drop), 'The biggest drop is after "Props": 8 fewer students completed the next lesson, "useState".');
  assert.equal(
    dropLabel({ after: lesson('l1', 'A', 2), next: lesson('l2', 'B', 1), lost: 1 }),
    'The biggest drop is after "A": 1 fewer student completed the next lesson, "B".',
  );
  // No fall, one lesson, no lesson
  assert.equal(biggestDrop(report({ id: 'm1', title: 'M', lessons: [lesson('l1', 'A', 4), lesson('l2', 'B', 4)] })), null);
  assert.equal(biggestDrop(report({ id: 'm1', title: 'M', lessons: [lesson('l1', 'A', 4)] })), null);
  assert.equal(biggestDrop(report()), null);
});
