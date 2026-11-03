// Calls to the /coupons routes, for academy admins: their discount codes.
// lib/api.ts adds the sign-in token; the API only lists and changes the
// coupons of the admin's academy (every coupon for a super admin).
import { api } from '../lib/api';
import type { AdminCoupon, CouponPayload } from '../lib/coupons';

export const couponsService = {
  // With how many orders used each coupon, the newest first
  list: async (): Promise<AdminCoupon[]> => {
    const response = await api.get<AdminCoupon[]>('/coupons');
    return response.data;
  },

  create: async (payload: CouponPayload, active: boolean): Promise<AdminCoupon> => {
    const response = await api.post<{ message: string; coupon: AdminCoupon }>('/coupons', {
      ...payload,
      isActive: active,
    });
    return response.data.coupon;
  },

  // Pauses an active coupon, or makes a paused one work again
  toggle: async (couponId: string): Promise<AdminCoupon> => {
    const response = await api.patch<{ message: string; coupon: AdminCoupon }>(
      `/coupons/${encodeURIComponent(couponId)}/toggle`,
    );
    return response.data.coupon;
  },

  // Refused (409) for a coupon an order used
  remove: async (couponId: string): Promise<void> => {
    await api.delete(`/coupons/${encodeURIComponent(couponId)}`);
  },
};
