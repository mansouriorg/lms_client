'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Lock,
  Mail,
  RotateCcw,
  Smartphone,
  Tag,
  Wallet,
} from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { areaOf, homePathFor, loginPathFor } from '@/lib/auth';
import { closedForOrders } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { orderReference } from '@/lib/orders';
import {
  type CheckoutCourse,
  type StudentOrder,
  cleanCouponCode,
  lessonCount,
  pendingOrderFor,
} from '@/lib/purchases';
import { useSession } from '@/lib/use-session';
import { coursesService } from '@/services/courses.service';
import { ordersService } from '@/services/orders.service';

const PRIMARY_BUTTON =
  'inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed';
const SECONDARY_BUTTON =
  'inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors';

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
      {children}
    </div>
  );
}

// The status code of a failed API call (409 = an order already waits for payment).
function errorStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | null)?.response?.status;
}

function PaymentInstructions({
  course,
  order,
}: {
  course: CheckoutCourse;
  order: StudentOrder;
}) {
  const reference = orderReference(order.id);
  const academy = course.center?.name ?? 'the academy';
  const phone = course.center?.contactPhone ?? '';
  const email = course.center?.contactEmail ?? '';
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Clock aria-hidden="true" className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Your order is waiting for payment</h1>
          <p className="text-sm text-slate-400">{course.title}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <dt className="text-xs text-slate-400">Your reference</dt>
          <dd className="text-2xl font-bold text-indigo-300 font-mono">{reference}</dd>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <dt className="text-xs text-slate-400">Amount to pay</dt>
          <dd className="text-2xl font-bold text-white">{formatPrice(order.totalAmount)}</dd>
          {order.coupon && (
            <dd className="text-xs text-emerald-400 mt-1">
              Coupon {order.coupon.code} applied (price before discount: {formatPrice(course.price)})
            </dd>
          )}
        </div>
      </dl>

      <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
        <li>
          Pay {academy} {formatPrice(order.totalAmount)} by cash or bank transfer.
        </li>
        <li>
          Give them your reference <span className="font-mono text-indigo-300">{reference}</span>.
          For a bank transfer, write it in the transfer description.
        </li>
        <li>The course opens in your account as soon as they confirm your payment.</li>
      </ol>

      {(email || phone) && (
        <div className="flex flex-wrap gap-3 text-sm">
          {email && (
            <a href={`mailto:${email}`} className={SECONDARY_BUTTON}>
              <Mail aria-hidden="true" className="w-4 h-4" />
              {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className={SECONDARY_BUTTON}>
              <Smartphone aria-hidden="true" className="w-4 h-4" />
              {phone}
            </a>
          )}
        </div>
      )}
      {course.center?.location && (
        <p className="text-xs text-slate-500">Academy address: {course.center.location}</p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/student/orders" className={PRIMARY_BUTTON}>
          See my purchases
        </Link>
        <Link href="/products" className={SECONDARY_BUTTON}>
          Browse other courses
        </Link>
      </div>
    </Panel>
  );
}

export default function CheckoutPage() {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const { known, user } = useSession();
  // Only student accounts buy courses; admins get a short message instead
  const studentId = user !== null && areaOf(user.role) === 'student' ? user.id : null;

  const [course, setCourse] = useState<CheckoutCourse | null>(null);
  // The order of this course that waits for payment (found, or just placed)
  const [order, setOrder] = useState<StudentOrder | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [coupon, setCoupon] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');

  // Load the course and the student's orders (to find a pending order).
  useEffect(() => {
    if (studentId === null || courseId === '') return;
    let active = true;
    Promise.all([coursesService.getOne(courseId), ordersService.getMine()]).then(
      ([loadedCourse, myOrders]) => {
        if (active) {
          setCourse(loadedCourse);
          setOrder(pendingOrderFor(myOrders, courseId));
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load this course. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [studentId, courseId, reloadKey]);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (course === null) return;
    setPlacing(true);
    setPlaceError('');
    try {
      const result = await ordersService.createForCourse(course.id, cleanCouponCode(coupon));
      setOrder(result.order);
    } catch (error) {
      setPlaceError(apiErrorMessage(error, 'Could not place your order. Please try again.'));
      // 409: an order for this course already waits for payment; show it
      if (errorStatus(error) === 409) setReloadKey((key) => key + 1);
    } finally {
      setPlacing(false);
    }
  };

  const checkoutPath = `/checkout/${encodeURIComponent(courseId)}`;
  let content: React.ReactNode;

  if (known === false) {
    content = (
      <Panel>
        <p role="status" className="text-sm text-slate-400">
          Checking your sign-in...
        </p>
      </Panel>
    );
  } else if (user === null) {
    content = (
      <Panel>
        <h1 className="text-2xl font-bold text-white">Sign in to buy this course</h1>
        <p className="text-sm text-slate-400">
          You need a student account to place an order. Creating one is free, and you come
          back to this page right after.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={loginPathFor(checkoutPath)} className={PRIMARY_BUTTON}>
            Sign in
          </Link>
          <Link href={`/auth/register?next=${encodeURIComponent(checkoutPath)}`} className={SECONDARY_BUTTON}>
            Create an account
          </Link>
        </div>
      </Panel>
    );
  } else if (studentId === null) {
    content = (
      <Panel>
        <h1 className="text-2xl font-bold text-white">Checkout is for student accounts</h1>
        <p className="text-sm text-slate-400">
          You are signed in as an admin. Orders are placed by students; you confirm their
          payments on the Orders page.
        </p>
        <Link href={homePathFor(user.role)} className={PRIMARY_BUTTON}>
          Go to my dashboard
        </Link>
      </Panel>
    );
  } else if (loadError) {
    content = (
      <Panel>
        <div role="alert" className="flex items-start gap-2 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{loadError}</span>
        </div>
        <div className="flex flex-wrap gap-3">
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
          <Link href="/products" className={SECONDARY_BUTTON}>
            Browse courses
          </Link>
        </div>
      </Panel>
    );
  } else if (course === null) {
    content = (
      <Panel>
        <p role="status" className="text-sm text-slate-400">
          Loading the course...
        </p>
      </Panel>
    );
  } else if (course.hasAccess) {
    content = (
      <Panel>
        <div className="flex items-center gap-3">
          <CheckCircle2 aria-hidden="true" className="w-6 h-6 text-emerald-400 shrink-0" />
          <h1 className="text-xl font-bold text-white">You already have access to this course</h1>
        </div>
        <p className="text-sm text-slate-400">{course.title}</p>
        <Link href={`/student/courses/${encodeURIComponent(course.id)}`} className={PRIMARY_BUTTON}>
          Open the course
        </Link>
      </Panel>
    );
  } else if (order !== null) {
    content = <PaymentInstructions course={course} order={order} />;
  } else if (closedForOrders(course.status) !== null) {
    // Full, finished or no longer offered: no new orders (the API says 409)
    content = (
      <Panel>
        <div className="flex items-center gap-3">
          <AlertCircle aria-hidden="true" className="w-6 h-6 text-amber-300 shrink-0" />
          <h1 className="text-xl font-bold text-white">{course.title}</h1>
        </div>
        <p className="text-sm text-slate-300">{closedForOrders(course.status)}</p>
        <Link href="/products" className={SECONDARY_BUTTON}>
          Browse courses
        </Link>
      </Panel>
    );
  } else {
    const lessons = lessonCount(course);
    content = (
      <>
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Complete your order</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* The course */}
          <div className="flex-1 space-y-6">
            <Panel>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <BookOpen aria-hidden="true" className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white leading-snug">{course.title}</h2>
                  <p className="text-sm text-slate-400">
                    {course.center?.name ?? 'Academy'}
                    {course.level ? ` - ${course.level}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'},{' '}
                    {lessons} {lessons === 1 ? 'lesson' : 'lessons'}
                  </p>
                </div>
              </div>
              {course.description && (
                <p className="text-sm text-slate-300 line-clamp-4">{course.description}</p>
              )}
            </Panel>

            <Panel>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Wallet aria-hidden="true" className="w-5 h-5 text-emerald-400" />
                How payment works
              </h2>
              <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                <li>Place your order here. Nothing is paid online.</li>
                <li>
                  Pay {course.center?.name ?? 'the academy'} by cash or bank transfer, with the
                  order reference you get on the next screen.
                </li>
                <li>The course opens in your account as soon as they confirm your payment.</li>
              </ol>
            </Panel>
          </div>

          {/* Order summary */}
          <form onSubmit={placeOrder} className="w-full lg:w-[380px] shrink-0">
            <Panel>
              <h2 className="text-lg font-bold text-white">Order summary</h2>
              <div className="flex justify-between text-sm text-slate-300">
                <span>Course price</span>
                <span className="font-semibold text-white">{formatPrice(course.price)}</span>
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
                    placeholder="For example REACT20"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  The discount is applied when you place the order.
                </p>
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
              <p className="text-xs text-slate-500 text-center">
                No card needed: you pay the academy directly.
              </p>
            </Panel>
          </form>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      {/* Minimal header for the checkout */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ChevronLeft aria-hidden="true" className="w-5 h-5 mr-1" />
            Back to courses
          </Link>
          <div className="flex items-center gap-2 text-slate-400">
            <Lock aria-hidden="true" className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {content}
      </main>
    </div>
  );
}
