// Unit tests for lib/digital-products.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canDelete,
  fileLink,
  orderCountLabel,
  productFormFrom,
  readProductForm,
} from './digital-products.ts';

const product = {
  id: 'p1',
  title: 'Node cheat sheet',
  description: null,
  price: 12.5,
  fileUrl: 'https://files.example.com/node.pdf',
  isActive: true,
  centerId: 'c1',
  createdAt: '2026-11-01T10:00:00.000Z',
  _count: { orderItems: 0 },
};

test('the form: like the API (a title, a price in TND, a web link)', () => {
  const ok = { title: ' Node cheat sheet ', description: ' One page ', price: '12,500', fileUrl: 'drive.google.com/file/d/abc' };
  assert.deepEqual(readProductForm(ok), {
    errors: {},
    payload: { title: 'Node cheat sheet', description: 'One page', price: 12.5, fileUrl: 'https://drive.google.com/file/d/abc' },
  });
  assert.deepEqual(readProductForm({ title: ' ', description: '', price: '12.3456', fileUrl: '' }).errors, {
    title: 'Give the product a title.',
    price: 'Enter a price in TND, for example 25 or 12.500 (0 for a free product).',
    fileUrl: 'Paste the link to the file (Google Drive, Dropbox, AWS S3...).',
  });
  assert.equal(readProductForm({ ...ok, price: '-1' }).errors.price !== undefined, true);
  assert.equal(readProductForm({ ...ok, title: 'x'.repeat(121) }).errors.title, 'The title can have at most 120 characters.');
  assert.deepEqual(productFormFrom(product), { title: 'Node cheat sheet', description: '', price: '12.5', fileUrl: product.fileUrl });
});

test('the file link: web addresses only', () => {
  assert.equal(fileLink(' https://files.example.com/a.zip '), 'https://files.example.com/a.zip');
  assert.equal(fileLink('dropbox.com/s/abc'), 'https://dropbox.com/s/abc');
  for (const value of ['javascript:alert(1)', 'ftp://files.example.com/a', 'my file.pdf', 'localhost/a', '']) {
    assert.equal(fileLink(value), null, value);
  }
});

test('ordered: shown, and only a product nobody ordered can be deleted', () => {
  assert.equal(orderCountLabel(0), 'Not ordered yet');
  assert.equal(orderCountLabel(1), 'Ordered once');
  assert.equal(orderCountLabel(4), 'Ordered 4 times');
  assert.equal(canDelete(product), true);
  assert.equal(canDelete({ ...product, _count: { orderItems: 2 } }), false);
  assert.equal(canDelete({ ...product, _count: undefined }), true);
});
