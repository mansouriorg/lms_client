'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  RotateCcw,
  Search,
  Wallet,
  XCircle,
} from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { formatPrice } from '@/lib/format';
import {
  type AdminOrder,
  type OrderStatus,
  type StatusFilter,
  countLabel,
  filterOrders,
  formatOrderDate,
  orderReference,
  orderStudent,
  orderTitles,
  statusLabel,
  summarizeOrders,
  withOrderPaid,
} from '@/lib/orders';
import { ordersService } from '@/services/orders.service';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  REFUNDED: 'bg-red-500/10 text-red-400 border-red-500/20',
  FAILED: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  PAID: CheckCircle2,
  PENDING: Clock,
  REFUNDED: ArrowDownRight,
  FAILED: XCircle,
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const Icon = STATUS_ICONS[status] ?? Clock;
  return (
    <span
      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium border whitespace-nowrap ${STATUS_STYLES[status] ?? STATUS_STYLES.FAILED}`}
    >
      <Icon aria-hidden="true" className="w-3.5 h-3.5" />
      {statusLabel(status)}
    </span>
  );
}

const TONES = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
};

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  note,
}: {
  icon: typeof Clock;
  tone: keyof typeof TONES;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${TONES[tone]}`}>
          <Icon aria-hidden="true" className="w-4 h-4" />
        </div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{note}</p>
    </div>
  );
}

type Notice = { tone: 'success' | 'error'; text: string };

export default function CenterOrdersPage() {
  // null while the first load is running
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  // The order whose "Mark as paid" was clicked, waiting for the confirmation
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Load the orders, and load them again when reloadKey changes. The API
  // sends the orders of your academy, or every order to a platform admin.
  useEffect(() => {
    let active = true;
    ordersService.getAllForAdmin().then(
      (list) => {
        if (active) {
          setOrders(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load the orders. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const summary = useMemo(() => summarizeOrders(orders ?? []), [orders]);
  const visible = useMemo(
    () => filterOrders(orders ?? [], query, status),
    [orders, query, status],
  );

  const reload = () => {
    setLoadError('');
    setReloadKey((key) => key + 1);
  };

  const markPaid = async (order: AdminOrder) => {
    setSavingId(order.id);
    setNotice(null);
    try {
      await ordersService.markPaid(order.id);
      setOrders((list) => (list === null ? list : withOrderPaid(list, order.id)));
      setNotice({
        tone: 'success',
        text: `Order ${orderReference(order.id)} is paid. ${orderStudent(order)} can now open what they bought.`,
      });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: apiErrorMessage(error, 'Could not mark the order as paid. Please try again.'),
      });
      // The order may have changed meanwhile (for example, already paid).
      reload();
    } finally {
      setSavingId(null);
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
        <p className="text-sm text-slate-400 mt-1">
          Students pay by cash or bank transfer. When you receive a payment, mark
          the order as paid: the student then gets access to what they bought.
        </p>
      </div>

      {/* Totals, from the orders below */}
      {orders && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Wallet}
            tone="emerald"
            label="Paid"
            value={formatPrice(summary.paidTotal)}
            note={countLabel(summary.paidCount, 'paid order')}
          />
          <StatCard
            icon={Clock}
            tone="amber"
            label="Awaiting payment"
            value={formatPrice(summary.pendingTotal)}
            note={`${countLabel(summary.pendingCount, 'order')} to confirm`}
          />
          <StatCard
            icon={CreditCard}
            tone="indigo"
            label="All orders"
            value={String(orders.length)}
            note="Newest first"
          />
          <StatCard
            icon={ArrowDownRight}
            tone="red"
            label="Refunded"
            value={formatPrice(summary.refundedTotal)}
            note={countLabel(summary.refundedCount, 'refunded order')}
          />
        </div>
      )}

      {/* Search and status filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search aria-hidden="true" className="h-4 w-4 text-slate-500" />
          </div>
          <input
            id="order-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm outline-none backdrop-blur-sm"
            placeholder="Search by reference, student, email, course or coupon"
          />
        </div>
        <label htmlFor="order-status" className="sr-only">
          Status
        </label>
        <select
          id="order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="bg-slate-900/50 border border-slate-800 text-sm text-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none backdrop-blur-sm min-w-[180px]"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Awaiting payment</option>
          <option value="PAID">Paid</option>
          <option value="REFUNDED">Refunded</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Result of the last "Mark as paid" */}
      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 p-3 text-sm rounded-xl border ${
            notice.tone === 'error'
              ? 'text-red-400 bg-red-400/10 border-red-400/20'
              : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
          }`}
        >
          {notice.tone === 'error' ? (
            <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Loading error */}
      {loadError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden shadow-xl">
        {orders === null && loadError === '' && (
          <p role="status" className="p-8 text-center text-sm text-slate-400">
            Loading orders...
          </p>
        )}

        {orders && visible.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400">
            {orders.length === 0
              ? 'No orders yet. They appear here as soon as a student checks out.'
              : 'No orders match your search.'}
          </p>
        )}

        {orders && visible.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Orders, newest first</caption>
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses and products</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {visible.map((order) => {
                  const when = formatOrderDate(order.createdAt);
                  const saving = savingId === order.id;
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-indigo-400 font-mono">
                          {orderReference(order.id)}
                        </p>
                        {order.coupon && (
                          <p className="text-xs text-slate-500 mt-0.5">Coupon {order.coupon.code}</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-white">{orderStudent(order)}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{order.user?.email}</p>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-sm text-slate-300">{orderTitles(order)}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="text-sm text-slate-300">{when.date}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{when.time}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm font-bold text-white">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {order.status === 'PENDING' && confirmingId === order.id && (
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs text-slate-400">
                              Received {formatPrice(order.totalAmount)}?
                            </span>
                            <button
                              type="button"
                              onClick={() => markPaid(order)}
                              disabled={saving}
                              className="py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {saving ? 'Saving...' : 'Yes, mark as paid'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              disabled={saving}
                              className="py-1.5 px-3 rounded-lg text-xs font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {order.status === 'PENDING' && confirmingId !== order.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmingId(order.id);
                              setNotice(null);
                            }}
                            disabled={savingId !== null}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Check aria-hidden="true" className="w-3.5 h-3.5" />
                            Mark as paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Totals count whole orders. A cart can mix courses from several academies;
        only a platform admin can confirm the payment of such an order.
      </p>
    </div>
  );
}
