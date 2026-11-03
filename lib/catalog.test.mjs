// Unit tests for lib/catalog.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  categoriesOf,
  closedForOrders,
  courseAction,
  courseInitials,
  courseStatusLabel,
  filterCourses,
  formatDuration,
  lessonTotal,
  totalMinutes,
} from './catalog.ts';

function course(id, title, price, extra = {}) {
  return {
    id,
    title,
    description: null,
    price,
    status: 'ACTIVE',
    category: null,
    level: null,
    center: { name: 'Code Academy' },
    ...extra,
  };
}

// The API sends the newest first: c1 is the newest.
const courses = [
  course('c1', 'React from zero', 160, { category: 'Web', level: 'Beginner' }),
  course('c2', 'Node.js APIs', 220, { category: 'Backend ', description: 'REST and auth' }),
  course('c3', 'Design 101', 0, { category: 'Design', center: { name: 'Studio Sfax' } }),
  course('c4', 'Advanced React', 90, { category: 'Web', status: 'FULL' }),
];
const ids = (list) => list.map((c) => c.id);

test('categories: sorted, trimmed, without duplicates or blanks', () => {
  assert.deepEqual(categoriesOf(courses), ['Backend', 'Design', 'Web']);
  assert.deepEqual(categoriesOf([]), []);
});

test('search in title, description, category, level and academy', () => {
  assert.deepEqual(ids(filterCourses(courses, '', '', 'newest')), ['c1', 'c2', 'c3', 'c4']);
  assert.deepEqual(ids(filterCourses(courses, 'react', '', 'newest')), ['c1', 'c4']);
  assert.deepEqual(ids(filterCourses(courses, '  AUTH ', '', 'newest')), ['c2']);
  assert.deepEqual(ids(filterCourses(courses, 'sfax', '', 'newest')), ['c3']);
  assert.deepEqual(ids(filterCourses(courses, 'react beginner', '', 'newest')), ['c1']);
  assert.deepEqual(ids(filterCourses(courses, 'nothing like this', '', 'newest')), []);
});

test('one category, and sorting by price', () => {
  assert.deepEqual(ids(filterCourses(courses, '', 'Web', 'newest')), ['c1', 'c4']);
  assert.deepEqual(ids(filterCourses(courses, '', 'Backend', 'newest')), ['c2']);
  assert.deepEqual(ids(filterCourses(courses, '', '', 'price-asc')), ['c3', 'c4', 'c1', 'c2']);
  assert.deepEqual(ids(filterCourses(courses, '', '', 'price-desc')), ['c2', 'c1', 'c4', 'c3']);
  assert.deepEqual(ids(courses), ['c1', 'c2', 'c3', 'c4']);
});

test('initials, status labels and durations', () => {
  assert.equal(courseInitials('React from zero'), 'RF');
  assert.equal(courseInitials('  node.js  '), 'N');
  assert.equal(courseInitials('***'), '?');
  assert.equal(courseStatusLabel('ACTIVE'), null);
  assert.equal(courseStatusLabel('FULL'), 'Full');
  assert.equal(courseStatusLabel('COMPLETED'), 'Finished');
  assert.equal(formatDuration(0), '');
  assert.equal(formatDuration(45), '45 min');
  assert.equal(formatDuration(60), '1 h');
  assert.equal(formatDuration(135), '2 h 15 min');
});

test('lessons and total duration of a course', () => {
  const detail = {
    modules: [
      { id: 'm1', title: 'Start', lessons: [{ duration: 30 }, { duration: null }] },
      { id: 'm2', title: 'Next', lessons: [{ duration: 45 }] },
    ],
  };
  assert.equal(lessonTotal(detail), 3);
  assert.equal(totalMinutes(detail), 75);
});

test('main button: open, sign in for a free course, or buy', () => {
  assert.equal(courseAction({ hasAccess: true, price: 160 }, true), 'open');
  assert.equal(courseAction({ hasAccess: false, price: 160 }, true), 'buy');
  assert.equal(courseAction({ hasAccess: false, price: 160 }, false), 'buy');
  assert.equal(courseAction({ hasAccess: false, price: 0 }, false), 'sign-in-free');
  assert.equal(courseAction({ hasAccess: false, price: 0 }, true), 'open');
});

test('full and finished courses take no new orders; buyers still open them', () => {
  assert.equal(closedForOrders('ACTIVE'), null);
  assert.equal(closedForOrders('FULL'), 'This course is full: it takes no new students.');
  assert.equal(closedForOrders('COMPLETED'), 'This course has finished: it takes no new students.');
  assert.equal(closedForOrders('CANCELLED'), 'This course is not offered anymore.');
  assert.equal(courseAction({ hasAccess: false, price: 160, status: 'FULL' }, true), 'closed');
  assert.equal(courseAction({ hasAccess: true, price: 160, status: 'CANCELLED' }, true), 'open');
  assert.equal(courseAction({ hasAccess: false, price: 160, status: 'ACTIVE' }, true), 'buy');
  assert.equal(courseStatusLabel('CANCELLED'), 'Cancelled');
});
