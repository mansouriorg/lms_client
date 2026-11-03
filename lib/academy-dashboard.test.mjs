// Unit tests for lib/academy-dashboard.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  catalogCounts,
  coursesNote,
  daysBefore,
  latestOrders,
  paidSince,
  payingStudents,
  reviewsNote,
  salesNote,
  studentsNote,
  topCourses,
  waitingSummary,
} from './academy-dashboard.ts';

// Orders shaped like GET /orders/admin/all sends them
const order = (id, userId, status, totalAmount, createdAt) => ({
  id,
  userId,
  status,
  totalAmount,
  createdAt,
  user: { firstName: 'A', lastName: 'B', email: `${userId}@example.com` },
  items: [],
  coupon: null,
});
const now = new Date('2026-11-01T12:00:00.000Z');
const since = daysBefore(now, 30);
const money = (amount) => `${amount} TND`;
const ORDERS = [
  order('o1', 'u1', 'PAID', 100, '2026-09-10T10:00:00.000Z'),
  order('o2', 'u1', 'PAID', 0.1, '2026-10-20T10:00:00.000Z'),
  order('o3', 'u2', 'PAID', 0.2, '2026-10-25T10:00:00.000Z'),
  order('o4', 'u3', 'PENDING', 50, '2026-10-30T10:00:00.000Z'),
  order('o5', 'u4', 'REFUNDED', 70, '2026-10-29T10:00:00.000Z'),
  order('o6', 'u5', 'PAID', 30, '2026-10-02T11:59:59.000Z'),
];

test('sales and paying students: paid orders only, the last 30 days', () => {
  assert.equal(since.toISOString(), '2026-10-02T12:00:00.000Z');
  assert.deepEqual(paidSince(ORDERS, since), { total: 0.3, count: 2 });
  assert.deepEqual(paidSince(ORDERS, new Date(0)), { total: 130.3, count: 4 });
  // u1 first paid on 10 September: a student, not a new one
  assert.deepEqual(payingStudents(ORDERS, since), { total: 3, recent: 1 });
  assert.deepEqual(payingStudents([], since), { total: 0, recent: 0 });
  assert.equal(salesNote({ total: 0.3, count: 2 }, money), '0.3 TND from orders of the last 30 days');
  assert.equal(salesNote({ total: 0, count: 0 }, money), 'No paid order placed in the last 30 days');
  assert.equal(studentsNote(0), 'No new student in the last 30 days');
  assert.equal(studentsNote(4), '4 new in the last 30 days');
});

test('courses: in the catalog, drafts, and the ones with the most students', () => {
  const courses = [
    { id: 'c1', title: 'React', status: 'ACTIVE', _count: { orderItems: 3 } },
    { id: 'c2', title: 'Angular', status: 'FULL', _count: { orderItems: 3 } },
    { id: 'c3', title: 'Vue', status: 'DRAFT', _count: { orderItems: 0 } },
    { id: 'c4', title: 'PHP', status: 'CANCELLED', _count: { orderItems: 9 } },
    { id: 'c5', title: 'Node', status: 'COMPLETED' },
  ];
  assert.deepEqual(catalogCounts(courses), { inCatalog: 3, drafts: 1 });
  const students = (course) => course._count?.orderItems ?? 0;
  assert.deepEqual(topCourses(courses, students, 3).map((course) => course.id), ['c4', 'c2', 'c1']);
  assert.deepEqual(topCourses(courses, students, 9).map((course) => course.id), ['c4', 'c2', 'c1', 'c5', 'c3']);
  assert.equal(courses[0].id, 'c1');
  assert.equal(coursesNote(0), 'No draft in preparation');
  assert.equal(coursesNote(1), '1 draft in preparation');
  assert.equal(coursesNote(2), '2 drafts in preparation');
});

test('the latest orders, and what waits for the academy', () => {
  assert.deepEqual(latestOrders(ORDERS, 3).map((item) => item.id), ['o4', 'o5', 'o3']);
  assert.equal(ORDERS[0].id, 'o1');
  const none = { orders: 0, sessions: 0, questions: 0, projects: 0 };
  assert.equal(waitingSummary(none), 'You are all caught up: nothing waits for you.');
  assert.equal(waitingSummary({ ...none, orders: 1 }), '1 thing needs your attention.');
  assert.equal(waitingSummary({ orders: 2, sessions: null, questions: 3, projects: 0 }), '5 things need your attention.');
  assert.equal(waitingSummary({ ...none, sessions: null }), '');
  assert.equal(waitingSummary({ ...none, projects: 1 }), '1 thing needs your attention.');
  assert.equal(waitingSummary({ ...none, projects: null }), '');
  assert.equal(waitingSummary({ ...none, orders: 1, projects: 2 }), '3 things need your attention.');
});

test('projects to review: how long the oldest one has waited', () => {
  assert.equal(reviewsNote([], now), 'No final project waits for your review.');
  assert.equal(reviewsNote(['2026-11-01T02:00:00.000Z'], now), 'A student waits for your review: sent less than a day ago.');
  assert.equal(reviewsNote(['2026-10-31T11:00:00.000Z'], now), 'A student waits for your review: sent 1 day ago.');
  // The list comes the oldest first, but the note does not depend on it
  const sent = ['2026-10-31T12:00:00.000Z', '2026-10-29T12:00:00.000Z', '2026-11-01T11:00:00.000Z'];
  assert.equal(reviewsNote(sent, now), 'Students wait for your review: the oldest was sent 3 days ago.');
  assert.equal(reviewsNote(['not a date'], now), 'A student waits for your review.');
  assert.equal(reviewsNote(['not a date', 'x'], now), 'Students wait for your review.');
});
