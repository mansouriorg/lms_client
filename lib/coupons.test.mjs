// Unit tests for lib/coupons.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canDeleteCoupon,
  couponState,
  couponStateLabel,
  discountLabel,
  endOfDay,
  readCouponForm,
  usesLabel,
} from './coupons.ts';

const coupon = (extra = {}) => ({
  id: 'k1',
  code: 'SUMMER20',
  discountPercentage: 20,
  discountAmount: null,
  maxUses: null,
  usedCount: 0,
  expiresAt: null,
  isActive: true,
  centerId: 'c1',
  createdAt: '2026-10-01T10:00:00.000Z',
  _count: { orders: 0 },
  ...extra,
});
const now = new Date('2026-11-01T12:00:00.000Z');
const money = (amount) => `${amount} TND`;

test('state: paused, ended, all uses taken, or active', () => {
  assert.equal(couponState(coupon(), now), 'active');
  assert.equal(couponState(coupon({ isActive: false, expiresAt: '2026-01-01T00:00:00.000Z' }), now), 'paused');
  assert.equal(couponState(coupon({ expiresAt: '2026-11-01T11:59:59.000Z' }), now), 'expired');
  assert.equal(couponState(coupon({ expiresAt: '2026-11-02T00:00:00.000Z' }), now), 'active');
  assert.equal(couponState(coupon({ maxUses: 10, usedCount: 10 }), now), 'used-up');
  assert.deepEqual(['active', 'paused', 'expired', 'used-up'].map(couponStateLabel), ['Active', 'Paused', 'Ended', 'All uses taken']);
});

test('labels: the discount, the uses, and whether it can be deleted', () => {
  assert.equal(discountLabel(coupon(), money), '20% off');
  assert.equal(discountLabel(coupon({ discountPercentage: null, discountAmount: 15 }), money), '15 TND off');
  assert.equal(usesLabel(coupon()), 'Not used yet');
  assert.equal(usesLabel(coupon({ usedCount: 1 })), 'Used once');
  assert.equal(usesLabel(coupon({ usedCount: 3 })), 'Used 3 times');
  assert.equal(usesLabel(coupon({ maxUses: 10 })), '0 of 10 uses');
  assert.equal(usesLabel(coupon({ maxUses: 10, usedCount: 4 })), '4 of 10 uses');
  assert.equal(canDeleteCoupon(coupon()), true);
  assert.equal(canDeleteCoupon(coupon({ _count: { orders: 1 } })), false);
});

test('the form: like the API (a code, one discount, an optional limit and last day)', () => {
  const ok = { code: ' summer-20 ', kind: 'percent', value: '20', maxUses: '', lastDay: '' };
  assert.deepEqual(readCouponForm(ok, '2026-11-01'), { errors: {}, payload: { code: 'SUMMER-20', discountPercentage: 20 } });
  assert.deepEqual(readCouponForm({ ...ok, kind: 'amount', value: '7,500', maxUses: '50', lastDay: '2026-12-31' }, '2026-11-01'), {
    errors: {},
    payload: { code: 'SUMMER-20', discountAmount: 7.5, maxUses: 50, expiresAt: new Date(2026, 11, 31, 23, 59, 59, 999).toISOString() },
  });
  assert.equal(endOfDay('2026-12-31'), new Date(2026, 11, 31, 23, 59, 59, 999).toISOString());
  assert.deepEqual(readCouponForm({ code: 'ab', kind: 'percent', value: '120', maxUses: '2.5', lastDay: '2026-10-31' }, '2026-11-01').errors, {
    code: 'Use 3 to 30 letters, digits, - or _ (for example SUMMER20).',
    value: 'Enter a percentage between 1 and 100.',
    maxUses: 'Enter a whole number of uses (at least 1), or leave it empty for no limit.',
    lastDay: 'Choose today or a later day.',
  });
  assert.equal(readCouponForm({ ...ok, kind: 'amount', value: '0.5' }, '2026-11-01').errors.value, 'Enter an amount in TND of at least 1, for example 15 or 7.500.');
  assert.equal(readCouponForm({ ...ok, code: 'PROMO 10' }, '2026-11-01').errors.code !== undefined, true);
});
