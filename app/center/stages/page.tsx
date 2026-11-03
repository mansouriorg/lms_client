'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Edit,
  ExternalLink,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import {
  COURSE_STATUSES,
  type CourseStatus,
  type ManagedCourse,
  courseStatusName,
  filterManaged,
  isHiddenStatus,
  paidEnrollments,
  quickStatusChange,
} from '@/lib/course-admin';
import { formatPrice } from '@/lib/format';
import { courseAdminService } from '@/services/course-admin.service';

const STATUS_STYLES: Record<CourseStatus, string> = {
  DRAFT: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FULL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

type Notice = { tone: 'success' | 'error'; text: string };

export default function CenterCoursesPage() {
  // null while the first load is running
  const [courses, setCourses] = useState<ManagedCourse[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CourseStatus | ''>('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // The courses of your academy (every academy for a platform admin).
  useEffect(() => {
    let active = true;
    courseAdminService.list().then(
      (list) => {
        if (active) {
          setCourses(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load the courses. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visible = useMemo(
    () => filterManaged(courses ?? [], query, status),
    [courses, query, status],
  );

  const changeStatus = async (course: ManagedCourse, next: CourseStatus) => {
    setBusyId(course.id);
    setNotice(null);
    try {
      await courseAdminService.update(course.id, { status: next });
      setCourses((list) =>
        list === null ? list : list.map((item) => (item.id === course.id ? { ...item, status: next } : item)),
      );
      setNotice({ tone: 'success', text: `${course.title} is now ${courseStatusName(next)}.` });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not change the status. Please try again.') });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (course: ManagedCourse) => {
    setBusyId(course.id);
    setNotice(null);
    try {
      await courseAdminService.remove(course.id);
      setCourses((list) => (list === null ? list : list.filter((item) => item.id !== course.id)));
      setNotice({ tone: 'success', text: `${course.title} was deleted.` });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not delete the course. Please try again.') });
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Courses</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create a course, prepare it as a draft, then publish it to the catalog.
          </p>
        </div>
        <Link
          href="/center/stages/create"
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <Plus aria-hidden="true" className="w-4 h-4" />
          New course
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search aria-hidden="true" className="h-4 w-4 text-slate-500" />
          </div>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, level or academy"
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none sm:text-sm"
          />
        </div>
        <label htmlFor="course-status-filter" className="sr-only">
          Status
        </label>
        <select
          id="course-status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value as CourseStatus | '')}
          className="bg-slate-900/50 border border-slate-800 text-sm text-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-[160px]"
        >
          <option value="">All statuses</option>
          {COURSE_STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

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

      {loadError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
        >
          <span>{loadError}</span>
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

      {courses === null && loadError === '' && (
        <p role="status" className="text-sm text-slate-400 py-8 text-center">
          Loading the courses...
        </p>
      )}

      {courses && visible.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800">
          <BookOpen aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium">
            {courses.length === 0 ? 'No courses yet.' : 'No course matches your search.'}
          </p>
          {courses.length === 0 && (
            <Link
              href="/center/stages/create"
              className="inline-flex items-center gap-2 mt-4 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
              Create your first course
            </Link>
          )}
        </div>
      )}

      {courses && visible.length > 0 && (
        <ul className="space-y-3">
          {visible.map((course) => {
            const quick = quickStatusChange(course);
            const sold = paidEnrollments(course);
            const busy = busyId === course.id;
            return (
              <li
                key={course.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col lg:flex-row lg:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md border ${STATUS_STYLES[course.status] ?? STATUS_STYLES.DRAFT}`}
                    >
                      {courseStatusName(course.status)}
                    </span>
                    {course.category && <span className="text-xs text-slate-500">{course.category}</span>}
                  </div>
                  <h2 className="text-base font-semibold text-white truncate">{course.title}</h2>
                  <p className="text-sm text-slate-400">
                    {course.center?.name ?? 'Academy'} - {course.price === 0 ? 'Free' : formatPrice(course.price)} -{' '}
                    {course._count?.modules ?? 0} {course._count?.modules === 1 ? 'module' : 'modules'} -{' '}
                    {sold} {sold === 1 ? 'student' : 'students'}
                  </p>
                </div>

                {confirmDeleteId === course.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-300">Delete this course and its program?</span>
                    <button
                      type="button"
                      onClick={() => remove(course)}
                      disabled={busy}
                      className="py-2 px-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-60"
                    >
                      {busy ? 'Deleting...' : 'Yes, delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={busy}
                      className="py-2 px-3 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/center/stages/${encodeURIComponent(course.id)}`}
                      className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      <Edit aria-hidden="true" className="w-4 h-4" />
                      Edit
                    </Link>
                    {quick && (
                      <button
                        type="button"
                        onClick={() => changeStatus(course, quick.status)}
                        disabled={busy}
                        className="py-2 px-3 rounded-lg text-sm font-medium text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors disabled:opacity-60"
                      >
                        {busy ? 'Saving...' : quick.label}
                      </button>
                    )}
                    {isHiddenStatus(course.status) === false && (
                      <Link
                        href={`/products/${encodeURIComponent(course.id)}`}
                        className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink aria-hidden="true" className="w-4 h-4" />
                        View
                      </Link>
                    )}
                    {sold === 0 && (
                      <button
                        type="button"
                        aria-label={`Delete ${course.title}`}
                        onClick={() => {
                          setConfirmDeleteId(course.id);
                          setNotice(null);
                        }}
                        disabled={busy}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 aria-hidden="true" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
