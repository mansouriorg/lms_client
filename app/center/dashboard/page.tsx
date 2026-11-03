'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Clock,
  FileCheck,
  MessageCircle,
  Plus,
  RotateCcw,
  Users,
  Wallet,
} from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type DashboardOrder,
  RECENT_DAYS,
  catalogCounts,
  coursesNote,
  daysBefore,
  latestOrders,
  paidSince,
  payingStudents,
  reviewsNote,
  salesNote,
  studentsNote,
  topCourses,
  waitingSummary,
} from '@/lib/academy-dashboard';
import { type CourseStatus, type ManagedCourse, courseStatusName, paidEnrollments } from '@/lib/course-admin';
import { formatPrice } from '@/lib/format';
import {
  type OrderStatus,
  countLabel,
  formatOrderDate,
  orderStudent,
  orderTitles,
  statusLabel,
  summarizeOrders,
} from '@/lib/orders';
import type { ReviewItem } from '@/lib/project-reviews';
import { type InboxQuestion, inboxCounts } from '@/lib/qa';
import { type HostedSession, groupHostedSessions, todayIn } from '@/lib/sessions';
import { useSession } from '@/lib/use-session';
import { academySessionsService } from '@/services/academy-sessions.service';
import { courseAdminService } from '@/services/course-admin.service';
import { ordersService } from '@/services/orders.service';
import { projectReviewsService } from '@/services/project-reviews.service';
import { qaService } from '@/services/qa.service';

// How many orders and courses the lists show
const LIST_SIZE = 5;

const ORDER_STYLES: Record<OrderStatus, string> = {
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  REFUNDED: 'bg-red-500/10 text-red-400 border-red-500/20',
  FAILED: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

const COURSE_STYLES: Record<CourseStatus, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FULL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TONES = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
};

const CARD = 'p-5 rounded-2xl bg-slate-900/50 border border-slate-800';

// A number of the academy, with a short note under it
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
    <div className={CARD}>
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

// What waits for the academy, and a link to the page where it is answered.
// `count` is null while loading or when the list could not be loaded.
function WaitingCard({
  href,
  icon: Icon,
  title,
  count,
  detail,
  action,
}: {
  href: string;
  icon: typeof Clock;
  title: string;
  count: number | null;
  detail: string;
  action: string;
}) {
  const waiting = count !== null && count > 0;
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-2 p-5 rounded-2xl border transition-colors ${
        waiting
          ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Icon aria-hidden="true" className={`w-4 h-4 shrink-0 ${waiting ? 'text-amber-400' : 'text-slate-500'}`} />
          {title}
        </span>
        <span className={`text-2xl font-bold leading-none ${waiting ? 'text-amber-400' : 'text-slate-500'}`}>
          {count === null ? '-' : count}
        </span>
      </span>
      <span className="text-xs text-slate-400 flex-1">{detail}</span>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 group-hover:text-indigo-300">
        {action}
        <ArrowRight aria-hidden="true" className="w-4 h-4" />
      </span>
    </Link>
  );
}

// The academy's home: what waits for an answer (orders to confirm, session
// requests, student questions, projects to review), the numbers (paid sales,
// paying students, courses), the latest orders and the courses with the most
// students. Made from GET /orders/admin/all, /stages/manage,
// /bookings/instructor/my-sessions, /questions/inbox and
// /project-submissions/admin/pending: the same lists as the Orders, Courses,
// Live sessions, Student questions and Projects pages, so the numbers always
// agree with them.
export default function AcademyDashboard() {
  const { user } = useSession();
  // null while loading (or when the list could not be loaded)
  const [orders, setOrders] = useState<DashboardOrder[] | null>(null);
  const [courses, setCourses] = useState<ManagedCourse[] | null>(null);
  const [sessions, setSessions] = useState<HostedSession[] | null>(null);
  const [questions, setQuestions] = useState<InboxQuestion[] | null>(null);
  const [projects, setProjects] = useState<ReviewItem[] | null>(null);
  const [ordersError, setOrdersError] = useState('');
  const [coursesError, setCoursesError] = useState('');
  const [sessionsError, setSessionsError] = useState('');
  const [questionsError, setQuestionsError] = useState('');
  const [projectsError, setProjectsError] = useState('');
  // When the lists were loaded ("today" and "the last 30 days" depend on it)
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    ordersService.getAllForAdmin().then(
      (list) => {
        if (active) {
          setOrders(list);
          setOrdersError('');
          setLoadedAt(new Date());
        }
      },
      (error: unknown) => {
        if (active) setOrdersError(apiErrorMessage(error, 'Could not load the orders.'));
      },
    );
    courseAdminService.list().then(
      (list) => {
        if (active) {
          setCourses(list);
          setCoursesError('');
        }
      },
      (error: unknown) => {
        if (active) setCoursesError(apiErrorMessage(error, 'Could not load the courses.'));
      },
    );
    academySessionsService.hosted().then(
      (list) => {
        if (active) {
          setSessions(list);
          setSessionsError('');
          setLoadedAt(new Date());
        }
      },
      (error: unknown) => {
        if (active) setSessionsError(apiErrorMessage(error, 'Could not load the live sessions.'));
      },
    );
    qaService.inbox().then(
      (list) => {
        if (active) {
          setQuestions(list);
          setQuestionsError('');
        }
      },
      (error: unknown) => {
        if (active) setQuestionsError(apiErrorMessage(error, 'Could not load the student questions.'));
      },
    );
    projectReviewsService.pending().then(
      (list) => {
        if (active) {
          setProjects(list);
          setProjectsError('');
          setLoadedAt(new Date());
        }
      },
      (error: unknown) => {
        if (active) setProjectsError(apiErrorMessage(error, 'Could not load the projects to review.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  // One message per problem (an account without an academy gets the same
  // answer from every list)
  const loadError = [...new Set([ordersError, coursesError, sessionsError, questionsError, projectsError])]
    .filter((text) => text !== '')
    .join(' ');
  const tryAgain = () => {
    setOrdersError('');
    setCoursesError('');
    setSessionsError('');
    setQuestionsError('');
    setProjectsError('');
    setReloadKey((key) => key + 1);
  };

  const firstName = user?.firstName.trim() ?? '';
  const scopeName = user?.role === 'SUPER_ADMIN' ? 'the platform' : 'your academy';
  const recentSince = loadedAt === null ? null : daysBefore(loadedAt, RECENT_DAYS);

  const orderSummary = summarizeOrders(orders ?? []);
  const sessionRequests =
    sessions !== null && loadedAt !== null ? groupHostedSessions(sessions, todayIn(loadedAt)).requests.length : null;
  const waiting = {
    orders: orders === null ? null : orderSummary.pendingCount,
    sessions: sessionRequests,
    questions: questions === null ? null : inboxCounts(questions).waiting,
    projects: projects === null || loadedAt === null ? null : projects.length,
  };
  const summary = waitingSummary(waiting);
  // What a part shows while its list loads, or when it could not be loaded
  const missing = (error: string, what: string) => (error === '' ? `Loading ${what}...` : `Could not load ${what}.`);

  const sales = orders !== null && recentSince !== null ? paidSince(orders, recentSince) : null;
  const students = orders !== null && recentSince !== null ? payingStudents(orders, recentSince) : null;
  const catalog = courses === null ? null : catalogCounts(courses);
  const latest = orders === null ? [] : latestOrders(orders, LIST_SIZE);
  const top = courses === null ? [] : topCourses(courses, paidEnrollments, LIST_SIZE);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {firstName === '' ? 'Dashboard' : `Welcome back, ${firstName}`}
          </h1>
          <p className="text-sm text-slate-400 mt-1">What needs your attention, and how {scopeName} is doing.</p>
        </div>
        <Link
          href="/center/stages/create"
          className="inline-flex shrink-0 items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors whitespace-nowrap"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          Create a course
        </Link>
      </div>

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
            onClick={tryAgain}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {/* What waits for an answer */}
      <section aria-labelledby="waiting-title" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="waiting-title" className="text-lg font-semibold text-white">
            Needs your attention
          </h2>
          {summary !== '' && <p className="text-sm text-slate-400">{summary}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
          <WaitingCard
            href="/center/orders"
            icon={Clock}
            title="Orders awaiting payment"
            count={waiting.orders}
            detail={
              waiting.orders === null
                ? missing(ordersError, 'the orders')
                : waiting.orders === 0
                  ? 'No order waits for its payment.'
                  : `${formatPrice(orderSummary.pendingTotal)} to confirm once you receive the payment.`
            }
            action="Open Orders"
          />
          <WaitingCard
            href="/center/bookings"
            icon={CalendarCheck}
            title="Session requests"
            count={waiting.sessions}
            detail={
              waiting.sessions === null
                ? missing(sessionsError, 'the live sessions')
                : waiting.sessions === 0
                  ? 'No live session waits for your answer.'
                  : 'Students wait for you to confirm or decline their live session.'
            }
            action="Open Live sessions"
          />
          <WaitingCard
            href="/center/qa"
            icon={MessageCircle}
            title="Questions to answer"
            count={waiting.questions}
            detail={
              waiting.questions === null
                ? missing(questionsError, 'the student questions')
                : waiting.questions === 0
                  ? 'Every student question has an answer from the academy.'
                  : 'Student questions with no answer from the academy yet.'
            }
            action="Open Student questions"
          />
          <WaitingCard
            href="/center/projects"
            icon={FileCheck}
            title="Projects to review"
            count={waiting.projects}
            detail={
              projects === null || loadedAt === null
                ? missing(projectsError, 'the projects to review')
                : reviewsNote(projects.map((project) => project.updatedAt), loadedAt)
            }
            action="Open Projects"
          />
        </div>
      </section>

      {/* The numbers */}
      <section aria-labelledby="numbers-title" className="space-y-3">
        <h2 id="numbers-title" className="text-lg font-semibold text-white">
          Your numbers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Wallet}
            tone="emerald"
            label="Paid sales"
            value={orders === null ? '-' : formatPrice(orderSummary.paidTotal)}
            note={sales === null ? missing(ordersError, 'the orders') : salesNote(sales, formatPrice)}
          />
          <StatCard
            icon={Users}
            tone="indigo"
            label="Paying students"
            value={students === null ? '-' : String(students.total)}
            note={students === null ? missing(ordersError, 'the orders') : studentsNote(students.recent)}
          />
          <StatCard
            icon={BookOpen}
            tone="amber"
            label="Courses in the catalog"
            value={catalog === null ? '-' : String(catalog.inCatalog)}
            note={catalog === null ? missing(coursesError, 'the courses') : coursesNote(catalog.drafts)}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* The latest orders */}
        <section aria-labelledby="latest-title" className={`${CARD} space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="latest-title" className="text-lg font-semibold text-white">
              Latest orders
            </h2>
            <Link href="/center/orders" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
              See all orders
            </Link>
          </div>
          {orders === null && (
            <p role={ordersError === '' ? 'status' : undefined} className="text-sm text-slate-400">
              {missing(ordersError, 'the orders')}
            </p>
          )}
          {orders !== null && orders.length === 0 && (
            <p className="text-sm text-slate-400">
              No orders yet. They appear here when students order your courses or digital products.
            </p>
          )}
          {latest.length > 0 && (
            <ul className="divide-y divide-slate-800">
              {latest.map((order) => {
                const placed = formatOrderDate(order.createdAt);
                return (
                  <li key={order.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{orderStudent(order)}</p>
                      <p className="text-xs text-slate-400 truncate">{orderTitles(order)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{placed.date}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-sm font-semibold text-white">{formatPrice(order.totalAmount)}</p>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${ORDER_STYLES[order.status] ?? ORDER_STYLES.FAILED}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* The courses with the most students */}
        <section aria-labelledby="courses-title" className={`${CARD} space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="courses-title" className="text-lg font-semibold text-white">
              Your courses
            </h2>
            <Link href="/center/stages" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
              {courses !== null && courses.length > LIST_SIZE ? `See all ${courses.length} courses` : 'See all courses'}
            </Link>
          </div>
          {courses === null && (
            <p role={coursesError === '' ? 'status' : undefined} className="text-sm text-slate-400">
              {missing(coursesError, 'the courses')}
            </p>
          )}
          {courses !== null && courses.length === 0 && (
            <p className="text-sm text-slate-400">
              No courses yet. Create your first course: it stays a draft until you publish it.
            </p>
          )}
          {top.length > 0 && (
            <ul className="divide-y divide-slate-800">
              {top.map((course) => (
                <li key={course.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/center/stages/${encodeURIComponent(course.id)}`}
                      className="block text-sm font-medium text-white hover:text-indigo-300 truncate"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-slate-400">{countLabel(paidEnrollments(course), 'student')}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-md border ${COURSE_STYLES[course.status] ?? COURSE_STYLES.DRAFT}`}
                  >
                    {courseStatusName(course.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
