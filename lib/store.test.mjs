// Unit tests for lib/store.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downloadLinkIn, filterStoreProducts, productOrders, sellerName, shortText } from './store.ts';

const academy = { id: 'c1', name: 'Code Academy', location: 'Tunis', contactEmail: 'hello@code.tn', contactPhone: '+216 71 000 000' };
const product = (id, title, price, createdAt, extra = {}) => ({
  id,
  title,
  description: null,
  price,
  centerId: 'c1',
  createdAt,
  center: academy,
  ...extra,
});
const order = (id, status, productId, fileUrl) => ({
  id,
  totalAmount: 10,
  status,
  createdAt: '2026-11-01T10:00:00.000Z',
  coupon: null,
  items: [{ id: `i-${id}`, price: 10, stageId: null, productId, stage: null, product: { title: 'x', fileUrl } }],
});

test('search (title, description, academy; no accents) and sort', () => {
  const list = [
    product('a', 'React templates', 40, '2026-10-01'),
    product('b', 'Node.js cheat sheet', 12.5, '2026-10-20', { description: 'Every command for Express' }),
    product('c', 'Guide du d\u00e9butant', 0, '2026-09-01', { center: null, centerId: null }),
  ];
  assert.deepEqual(filterStoreProducts(list, '', 'newest').map((item) => item.id), ['b', 'a', 'c']);
  assert.deepEqual(filterStoreProducts(list, 'express', 'newest').map((item) => item.id), ['b']);
  assert.deepEqual(filterStoreProducts(list, 'DEBUTANT', 'newest').map((item) => item.id), ['c']);
  assert.deepEqual(filterStoreProducts(list, 'code academy react', 'newest').map((item) => item.id), ['a']);
  assert.deepEqual(filterStoreProducts(list, '', 'price-asc').map((item) => item.id), ['c', 'b', 'a']);
  assert.deepEqual(filterStoreProducts(list, '', 'price-desc').map((item) => item.id), ['a', 'b', 'c']);
  assert.equal(sellerName(list[2]), 'LMS Academy');
});

test('what the student already ordered: paid, or waiting for payment', () => {
  const orders = [order('o1', 'PENDING', 'p1', null), order('o2', 'PAID', 'p2', 'https://files.example.com/p2.pdf'), order('o3', 'FAILED', 'p3', null)];
  assert.deepEqual(productOrders(orders, 'p1'), { paid: null, pending: orders[0] });
  assert.deepEqual(productOrders(orders, 'p2'), { paid: orders[1], pending: null });
  assert.deepEqual(productOrders(orders, 'p3'), { paid: null, pending: null });
  assert.equal(downloadLinkIn(orders[1], 'p2'), 'https://files.example.com/p2.pdf');
  assert.equal(downloadLinkIn(orders[1], 'p9'), null);
  assert.equal(downloadLinkIn(null, 'p2'), null);
});

test('short descriptions for the cards', () => {
  assert.equal(shortText(null), '');
  assert.equal(shortText('  Short   text '), 'Short text');
  assert.equal(shortText('word '.repeat(60), 30), 'word word word word word word...');
});
