// Calls to the /products routes, for academy admins: their digital products.
// lib/api.ts adds the sign-in token; the API only lists and changes the
// products of the admin's academy (every product for a super admin).
import { api } from '../lib/api';
import type { AdminProduct, ProductPayload } from '../lib/digital-products';

export type ProductChanges = Partial<ProductPayload> & { isActive?: boolean };

export const digitalProductsService = {
  // With how many times each product was ordered, the newest first
  list: async (): Promise<AdminProduct[]> => {
    const response = await api.get<AdminProduct[]>('/products/admin/all');
    return response.data;
  },

  create: async (payload: ProductPayload, visible: boolean): Promise<AdminProduct> => {
    const response = await api.post<{ message: string; product: AdminProduct }>('/products', {
      ...payload,
      isActive: visible,
    });
    return response.data.product;
  },

  // Only the fields sent change (PATCH /products/:id)
  update: async (productId: string, changes: ProductChanges): Promise<AdminProduct> => {
    const response = await api.patch<{ message: string; product: AdminProduct }>(
      `/products/${encodeURIComponent(productId)}`,
      changes,
    );
    return response.data.product;
  },

  // Refused (409) for a product that was ordered
  remove: async (productId: string): Promise<void> => {
    await api.delete(`/products/${encodeURIComponent(productId)}`);
  },
};
