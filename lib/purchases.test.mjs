// Unit tests for lib/purchases.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanCouponCode,
  downloadsOf,
  lessonCount,
  pendingOrderFor,
  purchaseSummary,
  safeDownloadUrl,
} from './purchases.ts';

function order(id, status, totalAmount, items) {
  return { id, status, totalAmount, createdAt: '2026-10-31T13:05:00.000Z', items, coupon: null };
}
const course = (stageId, title) => ({
  id: `${stageId}-item`,
  price: 100,
  stageId,
  productId: null,
  stage: { title },
  product: null,
});
const product = (productId, title, fileUrl) => ({
  id: `${productId}-item`,
  price: 25,
  stageId: null,
  productId,
  stage: null,
  product: { title, fileUrl },
});

const orders = [
  order('o1', 'PENDING', 160, [course('c1', 'React basics')]),
  order('o2', 'PAID', 100, [course('c2', 'Node.js APIs'), product('p1', 'Starter kit', 'https://files.example/kit.zip')]),
  order('o3', 'PAID', 0.1, [product('p2', 'Cheat sheet', 'drive.example/sheet.pdf')]),
  order('o4', 'REFUNDED', 90, [course('c3', 'Design 101')]),
  order('o5', 'PENDING', 0.2, [product('p3', 'Icons', null)]),
];

test('finds the order of a course that is still waiting for payment', () => {
  assert.equal(pendingOrderFor(orders, 'c1').id, 'o1');
  assert.equal(pendingOrderFor(orders, 'c2'), null);
  assert.equal(pendingOrderFor(orders, 'c3'), null);
  assert.equal(pendingOrderFor([], 'c1'), null);
});

test('summary of the purchases, rounded to the millime', () => {
  assert.deepEqual(purchaseSummary(orders), {
    orderCount: 5,
    paidTotal: 100.1,
    pendingCount: 2,
    pendingTotal: 160.2,
  });
  assert.deepEqual(purchaseSummary([]), {
    orderCount: 0,
    paidTotal: 0,
    pendingCount: 0,
    pendingTotal: 0,
  });
});

test('downloads only for paid orders, only with web links', () => {
  assert.deepEqual(downloadsOf(orders[1]), [
    { title: 'Starter kit', url: 'https://files.example/kit.zip' },
  ]);
  assert.deepEqual(downloadsOf(orders[2]), [
    { title: 'Cheat sheet', url: 'https://drive.example/sheet.pdf' },
  ]);
  assert.deepEqual(downloadsOf(orders[0]), []);
  assert.deepEqual(downloadsOf(orders[4]), []);
});

test('unsafe or empty download links are never shown', () => {
  assert.equal(safeDownloadUrl('javascript:alert(1)'), null);
  assert.equal(safeDownloadUrl('JavaScript:alert(1)'), null);
  assert.equal(safeDownloadUrl('ftp://files.example/kit.zip'), null);
  assert.equal(safeDownloadUrl('data:text/html,hi'), null);
  assert.equal(safeDownloadUrl('  '), null);
  assert.equal(safeDownloadUrl(null), null);
  assert.equal(safeDownloadUrl('HTTP://files.example/a'), 'HTTP://files.example/a');
});

test('coupon code and lesson count', () => {
  assert.equal(cleanCouponCode('  react20 '), 'REACT20');
  const outline = {
    modules: [
      { id: 'm1', title: 'Start', lessons: [{ id: 'l1' }, { id: 'l2' }] },
      { id: 'm2', title: 'Next', lessons: [{ id: 'l3' }] },
    ],
  };
  assert.equal(lessonCount(outline), 3);
  assert.equal(lessonCount({ modules: [] }), 0);
});
