// Calls to the /orders routes: the admin Orders page (/center/orders), the
// checkout page (/checkout/[id]) and the student's Purchases page.
// lib/api.ts adds the sign-in token; the API checks the role and the academy.
import { api } from '../lib/api';
import type { AdminOrder, OrderStatus } from '../lib/orders';
import type { StudentOrder } from '../lib/purchases';

export type MarkPaidResponse = {
  message: string;
  order: { id: string; status: OrderStatus };
};

export type CreateOrderResponse = {
  message: string;
  order: StudentOrder;
};

export const ordersService = {
  // The orders of your academy (every order for a platform admin), newest first.
  getAllForAdmin: async (): Promise<AdminOrder[]> => {
    const response = await api.get<AdminOrder[]>('/orders/admin/all');
    return response.data;
  },

  // Confirms that the cash or bank transfer payment of a pending order was
  // received. The student then gets access to what they bought.
  markPaid: async (orderId: string): Promise<MarkPaidResponse> => {
    const response = await api.patch<MarkPaidResponse>(
      `/orders/${encodeURIComponent(orderId)}/mark-paid`,
    );
    return response.data;
  },

  // The signed-in student's orders, newest first. Download links are only
  // sent for paid orders.
  getMine: async (): Promise<StudentOrder[]> => {
    const response = await api.get<StudentOrder[]>('/orders/my-orders');
    return response.data;
  },

  // Places an order for one course. It waits for payment (status PENDING)
  // until an admin marks it as paid. The API applies the coupon, if any.
  createForCourse: async (
    courseId: string,
    couponCode: string,
  ): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>('/orders', {
      stageIds: [courseId],
      ...(couponCode === '' ? {} : { couponCode }),
    });
    return response.data;
  },
};
