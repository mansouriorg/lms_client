'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Download,
  FileDown,
  Mail,
  RotateCcw,
  Smartphone,
  Tag,
} from 'lucide-react';
import CatalogHeader from '@/components/layout/CatalogHeader';
import { mailHref, phoneHref } from '@/lib/academies';
import { apiErrorMessage } from '@/lib/api-error';
import { areaOf, homePathFor, loginPathFor } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import { orderReference } from '@/lib/orders';
import { type StudentOrder, cleanCouponCode, safeDownloadUrl } from '@/lib/purchases';
import { type StoreProduct, downloadLinkIn, productOrders, sellerName } from '@/lib/store';
import { useSession } from '@/lib/use-session';
import { ordersService } from '@/services/orders.service';
import { storeService } from '@/services/store.service';

const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed';
const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors';

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
      {children}
    </div>
  );
}

// The status code of a failed API call (404: hidden or unknown product).
function errorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

// After the order: how to pay the academy, with the order reference.
function PaymentInstructions({ product, order }: { product: StoreProduct; order: StudentOrder }) {
  const reference = orderReference(order.id);
  const academy = sellerName(product);
  const email = product.center ? mailHref(product.center.contactEmail) : null;
  const phone = product.center ? phoneHref(product.center.contactPhone) : null;
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Clock aria-hidden="true" className="w-5 h-5 text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Your order is waiting for payment</h2>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <dt className="text-xs text-slate-400">Your reference</dt>
          <dd className="text-2xl font-bold text-indigo-300 font-mono">{reference}</dd>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <dt className="text-xs text-slate-400">Amount to pay</dt>
          <dd className="text-2xl font-bold text-white">{formatPrice(order.totalAmount)}</dd>
          {order.coupon && (
            <dd className="text-xs text-emerald-400 mt-1">
              Coupon {order.coupon.code} applied (price before discount: {formatPrice(product.price)})
            </dd>
          )}
        </div>
      </dl>
      <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
        <li>
          Pay {academy} {formatPrice(order.totalAmount)} by cash or bank transfer.
        </li>
        <li>
          Give them your reference <span className="font-mono text-indigo-300">{reference}</span>. For a bank
          transfer, write it in the transfer description.
        </li>
        <li>The download link appears in your purchases as soon as they confirm your payment.</li>
      </ol>
      {(email || phone) && (
        <div className="flex flex-wrap gap-3 text-sm">
          {email && (
            <a href={email} className={`${SECONDARY_BUTTON} min-w-0 break-all`}>
              <Mail aria-hidden="true" className="w-4 h-4 shrink-0" />
              {product.center?.contactEmail}
            </a>
          )}
          {phone && (
            <a href={phone} className={SECONDARY_BUTTON}>
              <Smartphone aria-hidden="true" className="w-4 h-4 shrink-0" />
              {product.center?.contactPhone}
            </a>
          )}
        </div>
      )}
      <Link href="/student/orders" className={PRIMARY_BUTTON}>
        See my purchases
      </Link>
    </Panel>
  );
}

// A digital product: what it is, who sells it, and how to buy it. The
// download link is never on this page: buyers get it in their purchases once
// their payment is confirmed.
export default function StoreProductPage() {
  const { id: productId = '' } = useParams<{ id: string }>();
  const { known, user } = useSession();
  // Only student accounts buy; admins get a short message instead
  const studentId = user !== null && areaOf(user.role) === 'student' ? user.id : null;

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [missing, setMissing] = useState(false);
  // The student's orders (null for visitors and admins, or while loading)
  const [orders, setOrders] = useState<StudentOrder[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');

  useEffect(() => {
    if (productId === '' || known === false) return;
    let active = true;
    const myOrders = studentId === null ? Promise.resolve(null) : ordersService.getMine();
    Promise.all([storeService.getOne(productId), myOrders]).then(
      ([loaded, mine]) => {
        if (active) {
          setProduct(loaded);
          setOrders(mine);
          setMissing(false);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active === false) return;
        if (errorStatus(error) === 404) setMissing(true);
        else setLoadError(apiErrorMessage(error, 'Could not load this product. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [productId, studentId, known, reloadKey]);

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (product === null) return;
    setPlacing(true);
    setPlaceError('');
    try {
      const result = await storeService.order(product.id, cleanCouponCode(coupon));
      setOrders((current) => [result.order, ...(current ?? [])]);
    } catch (error) {
      setPlaceError(apiErrorMessage(error, 'Could not place your order. Please try again.'));
      // The product may have been ordered from another tab, or hidden
      setReloadKey((key) => key + 1);
    } finally {
      setPlacing(false);
    }
  };

  const pagePath = `/store/${encodeURIComponent(productId)}`;
  const { paid, pending } = productOrders(orders ?? [], productId);
  const download = safeDownloadUrl(downloadLinkIn(paid, productId));

  let buy: React.ReactNode = null;
  if (product !== null) {
    if (known === false) {
      buy = (
        <Panel>
          <p role="status" className="text-sm text-slate-400">
            Checking your sign-in...
          </p>
        </Panel>
      );
    } else if (user === null) {
      buy = (
        <Panel>
          <h2 className="text-lg font-bold text-white">Sign in to buy this product</h2>
          <p className="text-sm text-slate-400">
            You need a student account to place an order. Creating one is free, and you come back to this
            page right after.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={loginPathFor(pagePath)} className={PRIMARY_BUTTON}>
              Sign in
            </Link>
            <Link href={`/auth/register?next=${encodeURIComponent(pagePath)}`} className={SECONDARY_BUTTON}>
              Create an account
            </Link>
          </div>
        </Panel>
      );
    } else if (studentId === null) {
      buy = (
        <Panel>
          <h2 className="text-lg font-bold text-white">Buying is for student accounts</h2>
          <p className="text-sm text-slate-400">
            You are signed in as an admin. Students place orders; you confirm their payments on the Orders
            page.
          </p>
          <Link href={homePathFor(user.role)} className={SECONDARY_BUTTON}>
            Go to my dashboard
          </Link>
        </Panel>
      );
    } else if (orders === null) {
      buy = (
        <Panel>
          <p role="status" className="text-sm text-slate-400">
            Loading your purchases...
          </p>
        </Panel>
      );
    } else if (paid !== null) {
      buy = (
        <Panel>
          <div className="flex items-center gap-3">
            <CheckCircle2 aria-hidden="true" className="w-6 h-6 text-emerald-400 shrink-0" />
            <h2 className="text-lg font-bold text-white">You own this product</h2>
          </div>
          {download === null && <p className="text-sm text-slate-400">The download link is in your purchases.</p>}
          <div className="flex flex-wrap gap-3">
            {download && (
              <a href={download} target="_blank" rel="noopener noreferrer" className={PRIMARY_BUTTON}>
                <Download aria-hidden="true" className="w-4 h-4" />
                Download
              </a>
            )}
            <Link href="/student/orders" className={SECONDARY_BUTTON}>
              See my purchases
            </Link>
          </div>
        </Panel>
      );
    } else if (pending !== null) {
      buy = <PaymentInstructions product={product} order={pending} />;
    } else {
      buy = (
        <form onSubmit={placeOrder}>
          <Panel>
            <h2 className="text-lg font-bold text-white">Buy this product</h2>
            <div className="flex justify-between text-sm text-slate-300">
              <span>Price</span>
              <span className="font-semibold text-white">{formatPrice(product.price)}</span>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="coupon" className="text-sm font-medium text-slate-300">
                Coupon code (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Tag aria-hidden="true" className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="coupon"
                  type="text"
                  autoComplete="off"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white uppercase placeholder-slate-500 placeholder:normal-case focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm outline-none"
                  placeholder="For example GUIDE10"
                />
              </div>
              <p className="text-xs text-slate-500">The discount is applied when you place the order.</p>
            </div>
            {placeError && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
              >
                <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{placeError}</span>
              </div>
            )}
            <button type="submit" disabled={placing} className={`${PRIMARY_BUTTON} w-full`}>
              {placing ? 'Placing your order...' : 'Place order'}
            </button>
            <p className="text-xs text-slate-500 text-center">No card needed: you pay the academy directly.</p>
          </Panel>
        </form>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      <CatalogHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/store"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-6"
        >
          <ChevronLeft aria-hidden="true" className="w-5 h-5 mr-1" />
          All digital products
        </Link>

        {missing && (
          <Panel>
            <h1 className="text-xl font-bold text-white">This product is not available</h1>
            <p className="text-sm text-slate-400">
              The academy may have removed it from the store. If you bought it, its download link is still
              in your purchases.
            </p>
            <Link href="/store" className={SECONDARY_BUTTON}>
              See the other products
            </Link>
          </Panel>
        )}

        {loadError && (
          <Panel>
            <div role="alert" className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{loadError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoadError('');
                setReloadKey((key) => key + 1);
              }}
              className={SECONDARY_BUTTON}
            >
              <RotateCcw aria-hidden="true" className="w-4 h-4" />
              Try again
            </button>
          </Panel>
        )}

        {product === null && missing === false && loadError === '' && (
          <p role="status" className="text-sm text-slate-400 py-12 text-center">
            Loading the product...
          </p>
        )}

        {product !== null && missing === false && loadError === '' && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              <Panel>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileDown aria-hidden="true" className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-white leading-snug break-words">{product.title}</h1>
                    <p className="text-sm text-slate-400">
                      By{' '}
                      {product.center ? (
                        <Link
                          href={`/centers/${encodeURIComponent(product.center.id)}`}
                          className="text-indigo-300 hover:text-indigo-200"
                        >
                          {product.center.name}
                        </Link>
                      ) : (
                        sellerName(product)
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{formatPrice(product.price)}</p>
                {product.description && (
                  <p className="text-sm text-slate-300 whitespace-pre-line break-words">{product.description}</p>
                )}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-sm text-slate-300">
                  <p className="font-medium text-white mb-1">What you get</p>
                  <p>
                    A download link in your purchases, as soon as {sellerName(product)} confirms your payment.
                    Nothing is paid online: you pay the academy by cash or bank transfer.
                  </p>
                </div>
              </Panel>
            </div>
            <div className="w-full lg:w-[360px] shrink-0">{buy}</div>
          </div>
        )}
      </main>
    </div>
  );
}
