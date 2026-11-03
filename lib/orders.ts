// The admin Orders page (/center/orders): the shape of the orders sent by
// GET /orders/admin/all, and the small calculations the page shows.
// The file has no imports, so `pnpm test` can run it with Node directly.

// The OrderStatus enum of the API (server/prisma/schema.prisma).
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

// '' means every status.
export type StatusFilter = OrderStatus | '';

export type AdminOrderItem = {
  id: string;
  price: number;
  stage: { title: string } | null;
  product: { title: string } | null;
};

export type AdminOrder = {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string } | null;
  items: AdminOrderItem[];
  coupon: { code: string } | null;
};

export type OrderSummary = {
  paidTotal: number;
  paidCount: number;
  pendingTotal: number;
  pendingCount: number;
  refundedTotal: number;
  refundedCount: number;
};

// Amounts in dinars, rounded to the millime (3 decimals), so that adding
// 0.1 and 0.2 gives 0.3 and not 0.30000000000000004.
function roundMillimes(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

export function summarizeOrders(orders: AdminOrder[]): OrderSummary {
  const totals = (status: OrderStatus) => {
    const matching = orders.filter((order) => order.status === status);
    const total = matching.reduce((sum, order) => sum + order.totalAmount, 0);
    return { total: roundMillimes(total), count: matching.length };
  };
  const paid = totals('PAID');
  const pending = totals('PENDING');
  const refunded = totals('REFUNDED');
  return {
    paidTotal: paid.total,
    paidCount: paid.count,
    pendingTotal: pending.total,
    pendingCount: pending.count,
    refundedTotal: refunded.total,
    refundedCount: refunded.count,
  };
}

// "1 order", "2 orders".
export function countLabel(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

export function orderStudent(order: AdminOrder): string {
  if (order.user === null) return 'Deleted account';
  const name = `${order.user.firstName} ${order.user.lastName}`.trim();
  return name === '' ? order.user.email : name;
}

// The titles of the courses and products in the order, in one line.
export function orderTitles(order: Pick<AdminOrder, 'items'>): string {
  const titles = order.items
    .map((item) => item.stage?.title ?? item.product?.title ?? '')
    .filter((title) => title !== '');
  return titles.length === 0 ? 'No items' : titles.join(', ');
}

// A short reference that is easy to read out or write on a bank transfer:
// the last 8 characters of the order ID.
export function orderReference(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`;
}

export function statusLabel(status: OrderStatus): string {
  if (status === 'PAID') return 'Paid';
  if (status === 'PENDING') return 'Awaiting payment';
  if (status === 'REFUNDED') return 'Refunded';
  return 'Failed';
}

// Date and time of the order, in the browser's time zone unless one is given.
export function formatOrderDate(
  iso: string,
  timeZone?: string,
): { date: string; time: string } {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return { date: '', time: '' };
  return {
    date: when.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone,
    }),
    time: when.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    }),
  };
}

// Search in the reference, the student name and email, the titles and the
// coupon code, in any letter case. Every word typed must match.
export function filterOrders(
  orders: AdminOrder[],
  query: string,
  status: StatusFilter,
): AdminOrder[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  return orders.filter((order) => {
    if (status !== '' && order.status !== status) return false;
    const searchable = [
      order.id,
      orderReference(order.id),
      orderStudent(order),
      order.user?.email ?? '',
      orderTitles(order),
      order.coupon?.code ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
}

// The same list after PATCH /orders/:id/mark-paid succeeded for `orderId`.
export function withOrderPaid(orders: AdminOrder[], orderId: string): AdminOrder[] {
  return orders.map(
    (order): AdminOrder => (order.id === orderId ? { ...order, status: 'PAID' } : order),
  );
}
