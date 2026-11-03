// The student side of buying: the checkout page (/checkout/[id]) and the
// Purchases page (/student/orders). Shapes of what the API sends, and the
// small calculations the pages show.
// The file has no imports at run time, so `pnpm test` can run it with Node.
import type { OrderStatus } from './orders';

// GET /stages/:id, as a signed-in student sees it.
export type CheckoutCourse = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  level: string | null;
  category: string | null;
  // ACTIVE, FULL, COMPLETED... (see closedForOrders in lib/catalog.ts)
  status: string;
  // True when the student may open the lessons (free course, or paid order)
  hasAccess: boolean;
  center: {
    name: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
  } | null;
  modules: { id: string; title: string; lessons: { id: string }[] }[];
};

export type StudentOrderItem = {
  id: string;
  price: number;
  stageId: string | null;
  productId: string | null;
  stage: { title: string } | null;
  // fileUrl is only sent once the order is PAID
  product: { title: string; fileUrl?: string | null } | null;
};

// GET /orders/my-orders, and the order in the answer of POST /orders.
export type StudentOrder = {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: StudentOrderItem[];
  coupon: { code: string } | null;
};

export function lessonCount(course: CheckoutCourse): number {
  return course.modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0);
}

// The student's order for this course that is still waiting for payment.
export function pendingOrderFor(orders: StudentOrder[], courseId: string): StudentOrder | null {
  return (
    orders.find(
      (order) =>
        order.status === 'PENDING' && order.items.some((item) => item.stageId === courseId),
    ) ?? null
  );
}

// Codes are stored in capitals; the API accepts any letter case too.
export function cleanCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

// Amounts in dinars, rounded to the millime (3 decimals).
function roundMillimes(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

export function purchaseSummary(orders: StudentOrder[]): {
  orderCount: number;
  paidTotal: number;
  pendingCount: number;
  pendingTotal: number;
} {
  const paid = orders.filter((order) => order.status === 'PAID');
  const pending = orders.filter((order) => order.status === 'PENDING');
  const sum = (list: StudentOrder[]) =>
    roundMillimes(list.reduce((total, order) => total + order.totalAmount, 0));
  return {
    orderCount: orders.length,
    paidTotal: sum(paid),
    pendingCount: pending.length,
    pendingTotal: sum(pending),
  };
}

// Only plain web links are shown as download buttons. A link saved without
// "https://" gets it; any other kind of link (ftp:, javascript:...) is not shown.
export function safeDownloadUrl(url: string | null | undefined): string | null {
  const link = (url ?? '').trim();
  if (link === '') return null;
  if (/^https?:\/\//i.test(link)) return link;
  if (/^[a-z][a-z0-9+.-]*:/i.test(link)) return null;
  return `https://${link.replace(/^\/+/, '')}`;
}

// The downloads of a paid order (digital products with a valid link).
export function downloadsOf(order: StudentOrder): { title: string; url: string }[] {
  if (order.status !== 'PAID') return [];
  return order.items.flatMap((item) => {
    const url = safeDownloadUrl(item.product?.fileUrl);
    return item.product && url ? [{ title: item.product.title, url }] : [];
  });
}
