// The store of digital products (/store and /store/[id]): files students buy
// and download, like a PDF guide or a ZIP of templates. The shapes the API
// sends (GET /products, GET /products/:id: never the download link), the
// search, and what the student already ordered.
// The file has no imports at run time, so `pnpm test` can run it with Node.
import type { StudentOrder } from './purchases';

// The academy that sells the product, and how to pay it
export type StoreAcademy = {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
};

export type StoreProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  centerId: string | null;
  createdAt: string;
  center: StoreAcademy | null;
};

export type StoreSort = 'newest' | 'price-asc' | 'price-desc';

// A product without an academy is sold by the platform itself.
export function sellerName(product: StoreProduct): string {
  return product.center?.name ?? 'LMS Academy';
}

// Search by title, description or academy (capitals and accents do not
// matter), then sort. The API sends the newest first.
export function filterStoreProducts(
  products: StoreProduct[],
  query: string,
  sort: StoreSort,
): StoreProduct[] {
  const simple = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const words = simple(query).split(/\s+/).filter((word) => word !== '');
  const found = products.filter((product) => {
    const text = simple(`${product.title} ${product.description ?? ''} ${sellerName(product)}`);
    return words.every((word) => text.includes(word));
  });
  if (sort === 'price-asc') return [...found].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return [...found].sort((a, b) => b.price - a.price);
  return [...found].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// What the student already did with this product: a paid order (they own
// it), or an order still waiting for payment.
export function productOrders(
  orders: StudentOrder[],
  productId: string,
): { paid: StudentOrder | null; pending: StudentOrder | null } {
  const withProduct = (status: string) =>
    orders.find(
      (order) => order.status === status && order.items.some((item) => item.productId === productId),
    ) ?? null;
  return { paid: withProduct('PAID'), pending: withProduct('PENDING') };
}

// The download link of this product in a paid order (the page only shows a
// web link: see safeDownloadUrl in lib/purchases.ts).
export function downloadLinkIn(order: StudentOrder | null, productId: string): string | null {
  const item = order?.items.find((orderItem) => orderItem.productId === productId);
  return item?.product?.fileUrl ?? null;
}

// The start of a description, for the store cards: at most `max`
// characters, cut between two words.
export function shortText(text: string | null, max = 140): string {
  const value = (text ?? '').trim().replace(/\s+/g, ' ');
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:-]+$/, '')}...`;
}
