// Unit tests for lib/students.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  activityLabel,
  courseOptions,
  filterStudents,
  lessonsLabel,
  progressLabel,
  progressState,
  studentInitials,
  studentName,
  studentTotals,
  studentsCsv,
} from './students.ts';

// Shaped like GET /stages/students sends them
const course = (id, title, total, completed, extra = {}) => ({
  id,
  title,
  status: 'ACTIVE',
  academy: 'Code Academy',
  since: '2026-10-01T10:00:00.000Z',
  totalLessons: total,
  completedLessons: completed,
  percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  lastActivityAt: null,
  ...extra,
});
const amira = {
  id: 'u1',
  firstName: 'Amira',
  lastName: 'Ben Ali',
  email: 'amira@example.com',
  phone: '+216 20 000 000',
  since: '2026-09-01T10:00:00.000Z',
  lastActivityAt: '2026-10-30T10:00:00.000Z',
  courses: [
    course('react', 'React from zero', 10, 7, { lastActivityAt: '2026-10-30T10:00:00.000Z' }),
    course('node', 'Node.js APIs', 4, 4),
  ],
};
const youssef = {
  id: 'u2',
  firstName: 'Youssef',
  lastName: 'Gharbi',
  email: 'youssef@example.com',
  phone: null,
  since: '2026-10-05T10:00:00.000Z',
  lastActivityAt: null,
  courses: [course('react', 'React from zero', 10, 0), course('soon', 'Docker soon', 0, 0)],
};
const STUDENTS = [youssef, amira];

test('progress: the state of a course, and its labels', () => {
  assert.deepEqual(amira.courses.concat(youssef.courses).map(progressState), ['in-progress', 'finished', 'not-started', 'no-lessons']);
  assert.deepEqual(['no-lessons', 'not-started', 'in-progress', 'finished'].map(progressLabel), ['No lessons yet', 'Not started', 'In progress', 'Finished']);
  assert.equal(lessonsLabel(amira.courses[0]), '7 of 10 lessons - 70%');
  assert.equal(lessonsLabel(course('x', 'X', 1, 1)), '1 of 1 lesson - 100%');
  assert.equal(lessonsLabel(youssef.courses[1]), 'No lessons yet');
  assert.equal(studentName(amira), 'Amira Ben Ali');
  assert.equal(studentName({ firstName: ' ', lastName: '', email: 'x@example.com' }), 'x@example.com');
  assert.equal(studentInitials(amira), 'AB');
  assert.equal(studentInitials({ firstName: '', lastName: '', email: 'x@example.com' }), 'X');
  const ago = (iso) => `ago(${iso.slice(0, 10)})`;
  assert.equal(activityLabel(amira, new Date(), ago), 'Last lesson completed ago(2026-10-30)');
  assert.equal(activityLabel(youssef, new Date(), ago), 'No lesson completed yet');
  assert.deepEqual(studentTotals(STUDENTS), { students: 2, enrollments: 4, finished: 1 });
  assert.deepEqual(courseOptions(STUDENTS), [
    { id: 'soon', title: 'Docker soon' },
    { id: 'node', title: 'Node.js APIs' },
    { id: 'react', title: 'React from zero' },
  ]);
});

test('filters: the search, the course and the progress choose the students and their courses', () => {
  const show = (rows) => rows.map((row) => `${row.student.id}:${row.courses.map((item) => item.id).join('+')}`);
  assert.deepEqual(show(filterStudents(STUDENTS, '', '', '')), ['u2:react+soon', 'u1:react+node']);
  assert.deepEqual(show(filterStudents(STUDENTS, '  AMIRA  ben ', '', '')), ['u1:react+node']);
  assert.deepEqual(show(filterStudents(STUDENTS, '+216 20', '', '')), ['u1:react+node']);
  assert.deepEqual(show(filterStudents(STUDENTS, 'node', '', '')), ['u1:react+node']);
  assert.deepEqual(show(filterStudents(STUDENTS, '', 'react', '')), ['u2:react', 'u1:react']);
  assert.deepEqual(show(filterStudents(STUDENTS, '', '', 'not-started')), ['u2:react']);
  assert.deepEqual(show(filterStudents(STUDENTS, '', 'node', 'not-started')), []);
  assert.deepEqual(show(filterStudents(STUDENTS, 'youssef node', '', '')), []);
});

test('the CSV: one line per course, quoted cells, no formulas', () => {
  const tricky = {
    ...youssef,
    firstName: '=HYPERLINK("x")',
    lastName: '',
    courses: [course('c', 'Design, "basics"', 3, 1, { lastActivityAt: '2026-10-29T08:00:00.000Z' })],
  };
  const csv = studentsCsv(filterStudents([amira, tricky], '', '', ''));
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.equal(csv.endsWith('\r\n'), true);
  assert.deepEqual(csv.slice(1).split('\r\n'), [
    'Student,Email,Phone,Course,Since,Lessons completed,Lessons,Progress (%),Last lesson completed',
    "Amira Ben Ali,amira@example.com,'+216 20 000 000,React from zero,2026-10-01,7,10,70,2026-10-30",
    "Amira Ben Ali,amira@example.com,'+216 20 000 000,Node.js APIs,2026-10-01,4,4,100,",
    `"'=HYPERLINK(""x"")",youssef@example.com,,"Design, ""basics""",2026-10-01,1,3,33,2026-10-29`,
    '',
  ]);
});
