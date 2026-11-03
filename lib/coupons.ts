// Coupons (/center/coupons): discount codes an academy gives its students.
// The shapes the API sends (the /coupons routes), how a coupon is shown, and
// the checks of the coupon form (the same as the API's).
// The file has no imports, so `pnpm test` can run it with Node directly.

// GET /coupons
export type AdminCoupon = {
  id: string;
  code: string;
  // One of the two is set: a percentage, or a fixed amount in TND
  discountPercentage: number | null;
  discountAmount: number | null;
  // The limit of uses (null: no limit), and the paid orders that used it
  maxUses: number | null;
  usedCount: number;
  // The last moment the coupon works (null: no end)
  expiresAt: string | null;
  isActive: boolean;
  centerId: string | null;
  createdAt: string;
  // Every order that used the code, paid or not
  _count?: { orders: number };
};

export type CouponState = 'active' | 'paused' | 'expired' | 'used-up';
export type CouponKind = 'percent' | 'amount';

export type CouponValues = {
  code: string;
  kind: CouponKind;
  value: string;
  maxUses: string;
  // A day like "2026-12-31": the coupon works until the end of that day
  lastDay: string;
};
export type CouponErrors = Partial<Record<'code' | 'value' | 'maxUses' | 'lastDay', string>>;
export type CouponPayload = {
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  maxUses?: number;
  expiresAt?: string;
};

const CODE = /^[A-Z0-9_-]{3,30}$/;

export function emptyCouponForm(): CouponValues {
  return { code: '', kind: 'percent', value: '', maxUses: '', lastDay: '' };
}

// Paused by the academy, past its end, used as many times as allowed, or
// working.
export function couponState(coupon: AdminCoupon, now: Date): CouponState {
  if (coupon.isActive === false) return 'paused';
  if (coupon.expiresAt !== null && new Date(coupon.expiresAt).getTime() <= now.getTime()) return 'expired';
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return 'used-up';
  return 'active';
}

export function couponStateLabel(state: CouponState): string {
  if (state === 'paused') return 'Paused';
  if (state === 'expired') return 'Ended';
  if (state === 'used-up') return 'All uses taken';
  return 'Active';
}

// "20% off", or "15 TND off" (`money` formats an amount, see lib/format.ts)
export function discountLabel(coupon: AdminCoupon, money: (amount: number) => string): string {
  if (coupon.discountPercentage !== null) return `${coupon.discountPercentage}% off`;
  return `${money(coupon.discountAmount ?? 0)} off`;
}

// "Not used yet", "Used once", "Used 3 times", with " of 10" for a limit
export function usesLabel(coupon: AdminCoupon): string {
  const used = coupon.usedCount;
  const limit = coupon.maxUses === null ? '' : ` of ${coupon.maxUses}`;
  if (used === 0) return coupon.maxUses === null ? 'Not used yet' : `0${limit} uses`;
  if (coupon.maxUses !== null) return `${used}${limit} uses`;
  return used === 1 ? 'Used once' : `Used ${used} times`;
}

// "Until 31 December 2026" (in the viewer's time zone), or "No end date"
export function endLabel(coupon: AdminCoupon): string {
  if (coupon.expiresAt === null) return 'No end date';
  const day = new Date(coupon.expiresAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return `Until ${day}`;
}

// A coupon no order used can be deleted; a used one can only be paused.
export function canDeleteCoupon(coupon: AdminCoupon): boolean {
  return (coupon._count?.orders ?? 0) === 0;
}

// "2026-12-31" -> the last millisecond of that day in the viewer's time zone
export function endOfDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date, 23, 59, 59, 999).toISOString();
}

// The values to send (POST /coupons), or the errors to show. `today` is the
// viewer's day, like "2026-11-01".
export function readCouponForm(
  values: CouponValues,
  today: string,
): { errors: CouponErrors; payload: CouponPayload | null } {
  const errors: CouponErrors = {};
  const code = values.code.trim().toUpperCase();
  if (CODE.test(code) === false)
    errors.code = 'Use 3 to 30 letters, digits, - or _ (for example SUMMER20).';

  const text = values.value.trim().replace(',', '.');
  const value = Number(text);
  if (values.kind === 'percent') {
    if (/^\d+(\.\d{1,2})?$/.test(text) === false || value < 1 || value > 100)
      errors.value = 'Enter a percentage between 1 and 100.';
  } else if (/^\d+(\.\d{1,3})?$/.test(text) === false || value < 1) {
    errors.value = 'Enter an amount in TND of at least 1, for example 15 or 7.500.';
  }

  const usesText = values.maxUses.trim();
  if (usesText !== '' && (/^\d+$/.test(usesText) === false || Number(usesText) < 1 || Number(usesText) > 1000000))
    errors.maxUses = 'Enter a whole number of uses (at least 1), or leave it empty for no limit.';

  if (values.lastDay !== '') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(values.lastDay) === false) errors.lastDay = 'Choose a day.';
    else if (values.lastDay < today) errors.lastDay = 'Choose today or a later day.';
  }

  if (Object.keys(errors).length > 0) return { errors, payload: null };
  const payload: CouponPayload = { code };
  if (values.kind === 'percent') payload.discountPercentage = value;
  else payload.discountAmount = value;
  if (usesText !== '') payload.maxUses = Number(usesText);
  if (values.lastDay !== '') payload.expiresAt = endOfDay(values.lastDay);
  return { errors, payload };
}
