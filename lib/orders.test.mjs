// Unit tests for lib/orders.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  countLabel,
  filterOrders,
  formatOrderDate,
  orderReference,
  orderStudent,
  orderTitles,
  statusLabel,
  summarizeOrders,
  withOrderPaid,
} from './orders.ts';

// Orders shaped like GET /orders/admin/all sends them.
function order(id, status, totalAmount, extra = {}) {
  return {
    id,
    status,
    totalAmount,
    createdAt: '2026-10-31T13:05:00.000Z',
    user: { firstName: 'Amira', lastName: 'Ben Ali', email: 'amira@example.com' },
    items: [{ id: `${id}-1`, price: totalAmount, stage: { title: 'React basics' }, product: null }],
    coupon: null,
    ...extra,
  };
}

const orders = [
  order('cmh1aaaaaaaapaid0001', 'PAID', 280),
  order('cmh1aaaaaaaapaid0002', 'PAID', 0.1),
  order('cmh1aaaaaaaapaid0003', 'PAID', 0.2),
  order('cmh1aaaaaaaapend0001', 'PENDING', 160, {
    user: { firstName: 'Sami', lastName: 'Trabelsi', email: 'sami@code.tn' },
    items: [
      { id: 'i1', price: 120, stage: { title: 'Node.js APIs' }, product: null },
      { id: 'i2', price: 40, stage: null, product: { title: 'Starter kit' } },
    ],
    coupon: { code: 'REACT20' },
  }),
  order('cmh1aaaaaaaarefd0001', 'REFUNDED', 90),
  order('cmh1aaaaaaaafail0001', 'FAILED', 50),
];

test('totals per status, rounded to the millime', () => {
  assert.deepEqual(summarizeOrders(orders), {
    paidTotal: 280.3,
    paidCount: 3,
    pendingTotal: 160,
    pendingCount: 1,
    refundedTotal: 90,
    refundedCount: 1,
  });
  assert.deepEqual(summarizeOrders([]), {
    paidTotal: 0,
    paidCount: 0,
    pendingTotal: 0,
    pendingCount: 0,
    refundedTotal: 0,
    refundedCount: 0,
  });
});

test('student, titles, reference and status as shown in the table', () => {
  const pending = orders[3];
  assert.equal(orderStudent(pending), 'Sami Trabelsi');
  assert.equal(orderTitles(pending), 'Node.js APIs, Starter kit');
  assert.equal(orderReference(pending.id), '#PEND0001');
  assert.equal(statusLabel('PENDING'), 'Awaiting payment');
  assert.equal(statusLabel('PAID'), 'Paid');
  assert.equal(statusLabel('REFUNDED'), 'Refunded');
  assert.equal(statusLabel('FAILED'), 'Failed');
  assert.equal(orderStudent({ ...pending, user: null }), 'Deleted account');
  assert.equal(
    orderStudent({ ...pending, user: { firstName: '', lastName: '', email: 'x@y.tn' } }),
    'x@y.tn',
  );
  assert.equal(orderTitles({ ...pending, items: [] }), 'No items');
  assert.equal(countLabel(1, 'order'), '1 order');
  assert.equal(countLabel(3, 'paid order'), '3 paid orders');
});

test('date and time of the order', () => {
  assert.deepEqual(formatOrderDate('2026-10-31T13:05:00.000Z', 'UTC'), {
    date: '31 Oct 2026',
    time: '13:05',
  });
  assert.deepEqual(formatOrderDate('2026-10-31T13:05:00.000Z', 'Africa/Tunis'), {
    date: '31 Oct 2026',
    time: '14:05',
  });
  assert.deepEqual(formatOrderDate('not a date', 'UTC'), { date: '', time: '' });
});

test('search by reference, student, email, title or coupon; filter by status', () => {
  const ids = (list) => list.map((o) => o.id);
  assert.equal(filterOrders(orders, '', '').length, 6);
  assert.deepEqual(ids(filterOrders(orders, '', 'PENDING')), ['cmh1aaaaaaaapend0001']);
  assert.deepEqual(ids(filterOrders(orders, '  sami ', '')), ['cmh1aaaaaaaapend0001']);
  assert.deepEqual(ids(filterOrders(orders, 'react20', '')), ['cmh1aaaaaaaapend0001']);
  assert.deepEqual(ids(filterOrders(orders, '#pend0001', '')), ['cmh1aaaaaaaapend0001']);
  assert.deepEqual(ids(filterOrders(orders, 'starter kit', '')), ['cmh1aaaaaaaapend0001']);
  assert.equal(filterOrders(orders, 'amira react', 'PAID').length, 3);
  assert.equal(filterOrders(orders, 'nobody', '').length, 0);
});

test('after "Mark as paid", only that order changes', () => {
  const updated = withOrderPaid(orders, 'cmh1aaaaaaaapend0001');
  assert.equal(updated[3].status, 'PAID');
  assert.equal(updated[3].coupon.code, 'REACT20');
  assert.deepEqual(updated.slice(0, 3), orders.slice(0, 3));
  assert.equal(orders[3].status, 'PENDING');
  assert.equal(summarizeOrders(updated).paidCount, 4);
});
