'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  PlayCircle,
  Receipt,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type MyProject,
  type ProjectState,
  assignmentsNote,
  assignmentsToDo,
  projectState,
  stateLabel,
} from '@/lib/assignments';
import { formatPrice } from '@/lib/format';
import {
  type MyCourse,
  courseButtonLabel,
  courseToContinue,
  learningStats,
} from '@/lib/learning';
import { countLabel, orderReference, orderTitles } from '@/lib/orders';
import { type StudentOrder, purchaseSummary } from '@/lib/purchases';
import { useSession } from '@/lib/use-session';
import { assignmentsService } from '@/services/assignments.service';
import { learningService } from '@/services/learning.service';
import { ordersService } from '@/services/orders.service';

// How many projects to change or send the Assignments card lists
const PROJECTS_SHOWN = 3;

const PROJECT_STYLES: Partial<Record<ProjectState, string>> = {
  'needs-work': 'text-red-300 bg-red-500/10 border-red-500/20',
  'to-send': 'text-slate-300 bg-slate-500/10 border-slate-500/30',
};

function ProgressBar({ course }: { course: MyCourse }) {
  return (
    <div
      role="progressbar"
      aria-label={`Progress in ${course.title}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={course.percentage}
      className="h-2 w-full rounded-full bg-slate-800 overflow-hidden"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
        style={{ width: `${course.percentage}%` }}
      />
    </div>
  );
}

// The student's home: the course to continue, their numbers, their other
// courses, the final projects to change or send, and the orders still
// waiting for payment (GET /stages/mine, GET /project-submissions/mine and
// GET /orders/my-orders).
export default function StudentDashboard() {
  const { user } = useSession();
  // null while loading
  const [courses, setCourses] = useState<MyCourse[] | null>(null);
  const [orders, setOrders] = useState<StudentOrder[] | null>(null);
  const [projects, setProjects] = useState<MyProject[] | null>(null);
  const [coursesError, setCoursesError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [projectsError, setProjectsError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    learningService.myCourses().then(
      (list) => {
        if (active) {
          setCourses(list);
          setCoursesError('');
        }
      },
      (error: unknown) => {
        if (active) setCoursesError(apiErrorMessage(error, 'Could not load your courses.'));
      },
    );
    ordersService.getMine().then(
      (list) => {
        if (active) {
          setOrders(list);
          setOrdersError('');
        }
      },
      (error: unknown) => {
        if (active) setOrdersError(apiErrorMessage(error, 'Could not load your orders.'));
      },
    );
    assignmentsService.mine().then(
      (list) => {
        if (active) {
          setProjects(list);
          setProjectsError('');
        }
      },
      (error: unknown) => {
        if (active) setProjectsError(apiErrorMessage(error, 'Could not load your assignments.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const loadError = [...new Set([coursesError, ordersError, projectsError])].filter((text) => text !== '').join(' ');
  const current = courses === null ? null : courseToContinue(courses);
  const stats = learningStats(courses ?? []);
  const others = (courses ?? []).filter((course) => course.id !== current?.id).slice(0, 3);
  const waiting = (orders ?? []).filter((order) => order.status === 'PENDING');
  const payments = purchaseSummary(orders ?? []);
  const todo = assignmentsToDo(projects ?? [], PROJECTS_SHOWN);
  const firstName = user?.firstName.trim() ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {firstName === '' ? 'My learning' : `Welcome back, ${firstName}`}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Pick up where you left off.</p>
        </div>
        <Link
          href="/student/lessons"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <BookOpen aria-hidden="true" className="w-4 h-4" />
          My courses
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
            onClick={() => {
              setCoursesError('');
              setOrdersError('');
              setProjectsError('');
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* The course to continue */}
          {courses === null && coursesError === '' && (
            <p role="status" className="p-6 text-sm text-slate-400 rounded-2xl bg-slate-900/50 border border-slate-800">
              Loading your courses...
            </p>
          )}
          {current && (
            <section
              aria-labelledby="up-next"
              className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20"
            >
              <p id="up-next" className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-3">
                {current.completedLessons > 0 ? 'Continue where you stopped' : 'Ready to start'}
              </p>
              <h2 className="text-2xl font-bold text-white mb-1">{current.title}</h2>
              <p className="text-sm text-slate-400 mb-6">{current.center?.name ?? 'Academy'}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>
                  {current.completedLessons} of {countLabel(current.totalLessons, 'lesson')} completed
                </span>
                <span className="font-semibold text-white">{current.percentage}%</span>
              </div>
              <ProgressBar course={current} />
              <Link
                href={`/student/courses/${encodeURIComponent(current.id)}`}
                className="mt-6 inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                <PlayCircle aria-hidden="true" className="w-4 h-4" />
                {courseButtonLabel(current)}
              </Link>
            </section>
          )}
          {courses !== null && current === null && (
            <section className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-1">
                {courses.length === 0
                  ? 'No course yet'
                  : stats.finished > 0
                    ? 'You finished all your courses. Well done.'
                    : 'Your courses have no lessons yet.'}
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                {courses.length === 0
                  ? 'A course you buy appears here once the academy confirms your payment.'
                  : stats.finished > 0
                    ? 'Find your next course in the catalog.'
                    : 'The academy is preparing them: come back soon.'}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Browse courses
              </Link>
            </section>
          )}

          {/* The numbers */}
          {courses !== null && courses.length > 0 && (
            <ul className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { name: 'Courses', value: stats.courses, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { name: 'Lessons completed', value: stats.lessonsCompleted, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { name: 'Courses finished', value: stats.finished, icon: Trophy, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <li key={stat.name} className="p-3 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center text-center">
                    <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
                      <Icon aria-hidden="true" className={`w-6 h-6 ${stat.color}`} />
                    </span>
                    <span className="text-xl font-bold text-white">{stat.value}</span>
                    <span className="text-slate-400 text-[11px] sm:text-xs font-medium uppercase tracking-wider mt-1">{stat.name}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* The other courses */}
          {others.length > 0 && (
            <section aria-labelledby="other-courses" className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <h2 id="other-courses" className="text-sm font-semibold text-white mb-4">
                {current ? 'Your other courses' : 'Your courses'}
              </h2>
              <ul className="space-y-4">
                {others.map((course) => (
                  <li key={course.id}>
                    <Link
                      href={`/student/courses/${encodeURIComponent(course.id)}`}
                      className="group block space-y-2"
                    >
                      <span className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-200 group-hover:text-white truncate">{course.title}</span>
                        <span className="text-xs text-slate-400 shrink-0">{course.percentage}%</span>
                      </span>
                      <ProgressBar course={course} />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/student/lessons"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                All my courses <ArrowRight aria-hidden="true" className="w-4 h-4 ml-1" />
              </Link>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {/* Final projects to change or send (once a course has a project) */}
          {projects !== null && projects.length > 0 && (
            <section aria-labelledby="assignments" className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
              <span className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <FileText aria-hidden="true" className="w-5 h-5 text-indigo-400" />
              </span>
              <h2 id="assignments" className="text-lg font-semibold text-white mb-1">
                Assignments
              </h2>
              <p className="text-sm text-slate-300">{assignmentsNote(todo)}</p>
              {todo.shown.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {todo.shown.map((project) => {
                    const state = projectState(project);
                    return (
                      <li
                        key={project.course.id}
                        className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 flex items-center justify-between gap-3"
                      >
                        <span className="min-w-0 text-sm text-slate-200 truncate">{project.course.title}</span>
                        <span
                          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap ${PROJECT_STYLES[state] ?? ''}`}
                        >
                          {stateLabel(state)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link
                href="/student/project-submissions"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                My assignments <ArrowRight aria-hidden="true" className="w-4 h-4 ml-1" />
              </Link>
            </section>
          )}

          {/* Orders waiting for payment */}
          <section aria-labelledby="payments" className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
              <Receipt aria-hidden="true" className="w-5 h-5 text-amber-400" />
            </span>
            <h2 id="payments" className="text-lg font-semibold text-white mb-1">
              Waiting for payment
            </h2>
            {orders === null && ordersError === '' && (
              <p role="status" className="text-sm text-slate-400">
                Loading your orders...
              </p>
            )}
            {orders !== null && waiting.length === 0 && (
              <p className="text-sm text-slate-400">Nothing to pay: every order is settled.</p>
            )}
            {waiting.length > 0 && (
              <>
                <p className="text-sm text-slate-300">
                  {countLabel(payments.pendingCount, 'order')}, {formatPrice(payments.pendingTotal)} in total.
                </p>
                <ul className="mt-4 space-y-3">
                  {waiting.map((order) => (
                    <li key={order.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                      <p className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-mono text-slate-200">{orderReference(order.id)}</span>
                        <span className="font-semibold text-white">{formatPrice(order.totalAmount)}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{orderTitles(order)}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-400">
                  Pay the academy by cash or bank transfer and give the reference. The course opens once
                  they confirm your payment.
                </p>
              </>
            )}
            <Link
              href="/student/orders"
              className="mt-4 inline-flex items-center text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              My purchases <ArrowRight aria-hidden="true" className="w-4 h-4 ml-1" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
