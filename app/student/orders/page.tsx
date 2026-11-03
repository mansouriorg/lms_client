'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Download,
  Receipt,
  RotateCcw,
  Wallet,
  XCircle,
} from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { formatPrice } from '@/lib/format';
import {
  type OrderStatus,
  formatOrderDate,
  orderReference,
  orderTitles,
  statusLabel,
} from '@/lib/orders';
import { type StudentOrder, downloadsOf, purchaseSummary } from '@/lib/purchases';
import { ordersService } from '@/services/orders.service';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  REFUNDED: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
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

export default function StudentOrdersPage() {
  // null while the first load is running
  const [orders, setOrders] = useState<StudentOrder[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    ordersService.getMine().then(
      (list) => {
        if (active) {
          setOrders(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load your purchases. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const summary = useMemo(() => purchaseSummary(orders ?? []), [orders]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Purchases</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your orders, newest first. An order opens its courses and downloads once the academy
          confirms your payment.
        </p>
      </div>

      {orders && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Receipt aria-hidden="true" className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Orders</p>
              <p className="text-xl font-bold text-white tracking-tight">{summary.orderCount}</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Wallet aria-hidden="true" className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total paid</p>
              <p className="text-xl font-bold text-white tracking-tight">
                {formatPrice(summary.paidTotal)}
              </p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Clock aria-hidden="true" className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Awaiting payment</p>
              <p className="text-xl font-bold text-white tracking-tight">
                {formatPrice(summary.pendingTotal)}
              </p>
            </div>
          </div>
        </div>
      )}

      {summary.pendingCount > 0 && (
        <div className="flex items-start gap-3 p-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Clock aria-hidden="true" className="w-5 h-5 shrink-0" />
          <p>
            {summary.pendingCount === 1
              ? '1 order is waiting for payment.'
              : `${summary.pendingCount} orders are waiting for payment.`}{' '}
            Pay the academy by cash or bank transfer and give them the reference of the order
            (for a bank transfer, write it in the description). Access opens as soon as they
            confirm.
          </p>
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
        >
          <span className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => {
              setLoadError('');
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden shadow-xl">
        {orders === null && loadError === '' && (
          <p role="status" className="p-8 text-center text-sm text-slate-400">
            Loading your purchases...
          </p>
        )}

        {orders && orders.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Receipt aria-hidden="true" className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-lg font-medium text-white mb-1">No purchases yet</h2>
            <p className="text-slate-400 text-sm mb-4">
              When you order a course, it appears here with its payment status.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              Browse courses
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Your orders, newest first</caption>
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reference</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses and products</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {orders.map((order) => {
                  const when = formatOrderDate(order.createdAt);
                  const downloads = downloadsOf(order);
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors align-top">
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-indigo-400 font-mono">
                          {orderReference(order.id)}
                        </p>
                        {order.coupon && (
                          <p className="text-xs text-slate-500 mt-0.5">Coupon {order.coupon.code}</p>
                        )}
                      </td>
                      <td className="py-4 px-6 max-w-sm">
                        <p className="text-sm text-white">{orderTitles(order)}</p>
                        {downloads.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {downloads.map((file) => (
                              <li key={file.url}>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                                >
                                  <Download aria-hidden="true" className="w-3.5 h-3.5" />
                                  Download {file.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                        {order.status === 'PENDING' && (
                          <p className="text-xs text-amber-300/80 mt-1">
                            Pay the academy and give them the reference {orderReference(order.id)}.
                          </p>
                        )}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
