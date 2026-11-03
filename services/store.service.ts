// Calls for the store of digital products: GET /products and GET
// /products/:id (open to everyone, never the download link), and POST
// /orders to buy one product. lib/api.ts adds the sign-in token when there is
// one.
import { api } from '../lib/api';
import type { StoreProduct } from '../lib/store';
import type { CreateOrderResponse } from './orders.service';

export const storeService = {
  // The visible products, the newest first
  list: async (): Promise<StoreProduct[]> => {
    const response = await api.get<StoreProduct[]>('/products');
    return response.data;
  },

  // One visible product (404 when it is hidden or does not exist)
  getOne: async (productId: string): Promise<StoreProduct> => {
    const response = await api.get<StoreProduct>(`/products/${encodeURIComponent(productId)}`);
    return response.data;
  },

  // Orders one product. It waits for payment (status PENDING) until the
  // academy marks it as paid. The API applies the coupon, if any.
  order: async (productId: string, couponCode: string): Promise<CreateOrderResponse> => {
    const response = await api.post<CreateOrderResponse>('/orders', {
      productIds: [productId],
      ...(couponCode === '' ? {} : { couponCode }),
    });
    return response.data;
  },
};
