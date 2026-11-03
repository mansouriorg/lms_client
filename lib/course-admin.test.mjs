// Unit tests for lib/course-admin.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  courseFormFrom,
  courseStatusName,
  emptyCourseForm,
  filterManaged,
  isHiddenStatus,
  parsePrice,
  quickStatusChange,
  readCourseForm,
} from './course-admin.ts';

function course(id, title, status, paid = 0, extra = {}) {
  return {
    id,
    title,
    description: null,
    price: 120,
    status,
    category: null,
    level: null,
    centerId: 'academy-1',
    center: { name: 'Code Academy' },
    _count: { modules: 2, orderItems: paid },
    ...extra,
  };
}

test('prices in dinars, with up to 3 decimals', () => {
  assert.equal(parsePrice('120'), 120);
  assert.equal(parsePrice(' 99.5 '), 99.5);
  assert.equal(parsePrice('99,500'), 99.5);
  assert.equal(parsePrice('0'), 0);
  assert.equal(parsePrice(''), null);
  assert.equal(parsePrice('-5'), null);
  assert.equal(parsePrice('12.3456'), null);
  assert.equal(parsePrice('1e3'), null);
  assert.equal(parsePrice('abc'), null);
});

test('the form: title and price are required, the academy for a super admin', () => {
  const empty = readCourseForm(emptyCourseForm(), { forCreate: true, needsAcademy: true });
  assert.equal(empty.payload, null);
  assert.deepEqual(Object.keys(empty.errors).sort(), ['centerId', 'price', 'title']);

  const values = { ...emptyCourseForm(), title: '  React from zero ', price: '160', category: ' Web ' };
  const created = readCourseForm(values, { forCreate: true, needsAcademy: false });
  assert.deepEqual(created.errors, {});
  assert.deepEqual(created.payload, {
    title: 'React from zero',
    description: '',
    price: 160,
    category: 'Web',
    level: '',
    projectBrief: '',
  });
});

test('editing sends the status; a super admin also sends the academy', () => {
  const values = { ...courseFormFrom(course('c1', 'React', 'DRAFT')), status: 'ACTIVE' };
  assert.deepEqual(readCourseForm(values, { forCreate: false, needsAcademy: false }).payload, {
    title: 'React',
    description: '',
    price: 120,
    category: '',
    level: '',
    projectBrief: '',
    status: 'ACTIVE',
  });
  const payload = readCourseForm(values, { forCreate: false, needsAcademy: true }).payload;
  assert.equal(payload.centerId, 'academy-1');
});

test('the final project: kept, trimmed, emptied, at most 4000 characters', () => {
  const brief = 'Build a todo app.\nSend the link to its code.';
  assert.equal(courseFormFrom(course('c1', 'React', 'ACTIVE', 0, { projectBrief: brief })).projectBrief, brief);
  assert.equal(courseFormFrom(course('c1', 'React', 'ACTIVE')).projectBrief, '');
  const values = { ...courseFormFrom(course('c1', 'React', 'ACTIVE')), projectBrief: `  ${brief}  ` };
  assert.equal(readCourseForm(values, { forCreate: false, needsAcademy: false }).payload.projectBrief, brief);
  const removed = readCourseForm({ ...values, projectBrief: '   ' }, { forCreate: false, needsAcademy: false });
  assert.equal(removed.payload.projectBrief, '');
  const long = readCourseForm({ ...values, projectBrief: 'x'.repeat(4001) }, { forCreate: true, needsAcademy: false });
  assert.equal(long.payload, null);
  assert.equal(long.errors.projectBrief, 'The project brief can have at most 4000 characters (now 4001).');
});

test('the course list: search and status filter', () => {
  const list = [
    course('c1', 'React from zero', 'ACTIVE', 0, { category: 'Web' }),
    course('c2', 'Node.js APIs', 'DRAFT'),
    course('c3', 'Design 101', 'CANCELLED', 0, { center: { name: 'Studio Sfax' } }),
  ];
  const ids = (found) => found.map((c) => c.id);
  assert.deepEqual(ids(filterManaged(list, '', '')), ['c1', 'c2', 'c3']);
  assert.deepEqual(ids(filterManaged(list, 'web', '')), ['c1']);
  assert.deepEqual(ids(filterManaged(list, 'sfax', '')), ['c3']);
  assert.deepEqual(ids(filterManaged(list, '', 'DRAFT')), ['c2']);
});

test('quick publish / unpublish, never for a course that was sold', () => {
  assert.deepEqual(quickStatusChange(course('c1', 'A', 'DRAFT')), { label: 'Publish', status: 'ACTIVE' });
  assert.deepEqual(quickStatusChange(course('c1', 'A', 'ACTIVE')), { label: 'Unpublish', status: 'DRAFT' });
  assert.equal(quickStatusChange(course('c1', 'A', 'ACTIVE', 3)), null);
  assert.equal(quickStatusChange(course('c1', 'A', 'FULL')), null);
});

test('status names, and which statuses hide the course from students', () => {
  assert.equal(courseStatusName('ACTIVE'), 'Published');
  assert.equal(courseStatusName('COMPLETED'), 'Finished');
  assert.equal(isHiddenStatus('DRAFT'), true);
  assert.equal(isHiddenStatus('CANCELLED'), true);
  assert.equal(isHiddenStatus('FULL'), false);
});
