// Unit tests for lib/format.ts. Run with `pnpm test` (uses the Node.js test
// runner, no extra package). Node 22.18 or newer reads the .ts file directly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice } from './format.ts';

test('whole amounts have no decimals', () => {
  assert.equal(formatPrice(280), '280 TND');
});

test('thousands get a separator', () => {
  assert.equal(formatPrice(38600), '38,600 TND');
});

test('amounts with millimes use three decimals', () => {
  assert.equal(formatPrice(212.5), '212.500 TND');
  assert.equal(formatPrice(0.25), '0.250 TND');
});

test('zero and negative amounts', () => {
  assert.equal(formatPrice(0), '0 TND');
  assert.equal(formatPrice(-180), '-180 TND');
});

test('sums of decimal amounts: to the nearest millime', () => {
  // 0.9999999999999999, 3.0000000000000004 and 0.30000000000000004 in JavaScript
  assert.equal(formatPrice(0.2 + 0.7 + 0.1), '1 TND');
  assert.equal(formatPrice(0.7 + 2.2 + 0.1), '3 TND');
  assert.equal(formatPrice(0.1 + 0.2), '0.300 TND');
  // 0.5005 * 1000 is 500.49999999999994: still half a millime, so up
  assert.equal(formatPrice(0.5005), '0.501 TND');
  assert.equal(formatPrice(169.999), '169.999 TND');
});
