'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Download, Mail, Phone, RotateCcw, Search, Users } from 'lucide-react';
import { mailHref, phoneHref } from '@/lib/academies';
import { apiErrorMessage } from '@/lib/api-error';
import { formatOrderDate } from '@/lib/orders';
import { timeAgo } from '@/lib/qa';
import { todayIn } from '@/lib/sessions';
import {
  type AcademyStudent,
  type ProgressFilter,
  type ProgressState,
  activityLabel,
  courseOptions,
  filterStudents,
  lessonsLabel,
  progressLabel,
  progressState,
  studentInitials,
  studentName,
  studentTotals,
  studentsCsv,
} from '@/lib/students';
import { useSession } from '@/lib/use-session';
import { studentsService } from '@/services/students.service';

const STATE_STYLES: Record<ProgressState, string> = {
  'no-lessons': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'not-started': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'in-progress': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  finished: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const FIELD =
  'bg-slate-900/50 border border-slate-800 text-sm text-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-2.5 outline-none';

// The students of the academy: everyone who paid for one of its courses
// (GET /stages/students), with each course they bought and how far they are.
// Search, filter by course and by progress, and download the list as CSV.
export default function StudentsPage() {
  const { user } = useSession();
  // null while loading
  const [students, setStudents] = useState<AcademyStudent[] | null>(null);
  // When the list was loaded ("3 days ago" depends on it)
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [courseId, setCourseId] = useState('');
  const [progress, setProgress] = useState<ProgressFilter>('');

  useEffect(() => {
    let active = true;
    studentsService.list().then(
      (list) => {
        if (active) {
          setStudents(list);
          setLoadedAt(new Date());
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load your students. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const all = students ?? [];
  const rows = filterStudents(all, query, courseId, progress);
  const totals = studentTotals(all);
  const options = courseOptions(all);
  const filtered = query.trim() !== '' || courseId !== '' || progress !== '';
  const showAcademy = user?.role === 'SUPER_ADMIN';

  const clearFilters = () => {
    setQuery('');
    setCourseId('');
    setProgress('');
  };

  // The students shown, as a CSV file for a spreadsheet
  const download = () => {
    if (loadedAt === null) return;
    const url = URL.createObjectURL(new Blob([studentsCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-${todayIn(loadedAt)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Students</h1>
          <p className="text-sm text-slate-400 mt-1">
            Everyone who paid for one of your courses, and how far they are. A student appears here once you mark
            their order as paid.
          </p>
        </div>
        {students !== null && students.length > 0 && (
          <button
            type="button"
            onClick={download}
            disabled={rows.length === 0}
            className="inline-flex shrink-0 items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <Download aria-hidden="true" className="w-4 h-4" />
            Download CSV
          </button>
        )}
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

      {students === null && loadError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading your students...
        </p>
      )}

      {students !== null && students.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <Users aria-hidden="true" className="w-8 h-8 text-indigo-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No students yet</h2>
          <p className="text-sm text-slate-400">
            When a student orders one of your courses and you mark the order as paid, they appear here with their
            progress.{' '}
            <Link href="/center/orders" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Open Orders
            </Link>
          </p>
        </div>
      )}

      {students !== null && students.length > 0 && (
        <>
          <p className="text-sm text-slate-400">
            {totals.students} {totals.students === 1 ? 'student' : 'students'} - {totals.enrollments}{' '}
            {totals.enrollments === 1 ? 'course bought' : 'courses bought'} - {totals.finished} finished
          </p>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <label htmlFor="student-search" className="sr-only">
                Search students
              </label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search aria-hidden="true" className="h-4 w-4 text-slate-500" />
              </div>
              <input
                id="student-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, phone or course"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
              />
            </div>
            <label htmlFor="student-course" className="sr-only">
              Course
            </label>
            <select
              id="student-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className={`${FIELD} md:max-w-[240px]`}
            >
              <option value="">All courses</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
            <label htmlFor="student-progress" className="sr-only">
              Progress
            </label>
            <select
              id="student-progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value as ProgressFilter)}
              className={FIELD}
            >
              <option value="">Any progress</option>
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          {rows.length === 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
              No student matches your search.{' '}
              <button type="button" onClick={clearFilters} className="text-indigo-400 hover:text-indigo-300 font-medium">
                Clear the filters
              </button>
            </div>
          )}

          {rows.length > 0 && (
            <>
              {filtered && (
                <p className="text-xs text-slate-500" role="status">
                  Showing {rows.length} of {all.length} {all.length === 1 ? 'student' : 'students'}.
                </p>
              )}
              <ul className="space-y-3" aria-label="Your students">
                {rows.map(({ student, courses }) => {
                  const mail = mailHref(student.email);
                  const call = student.phone === null ? null : phoneHref(student.phone);
                  return (
                    <li key={student.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                      <div className="flex items-start gap-3">
                        <div
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-slate-300 shrink-0"
                        >
                          {studentInitials(student)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-base font-semibold text-white break-words">{studentName(student)}</h2>
                          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                            {mail === null ? (
                              <span className="break-all">{student.email}</span>
                            ) : (
                              <a href={mail} className="inline-flex items-center gap-1.5 hover:text-indigo-300 break-all">
                                <Mail aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                                {student.email}
                              </a>
                            )}
                            {student.phone !== null && call !== null && (
                              <a href={call} className="inline-flex items-center gap-1.5 hover:text-indigo-300">
                                <Phone aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                                {student.phone}
                              </a>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Student since {formatOrderDate(student.since).date}
                            {loadedAt !== null && ` - ${activityLabel(student, loadedAt, timeAgo)}`}
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-3" aria-label={`Courses of ${studentName(student)}`}>
                        {courses.map((course) => {
                          const state = progressState(course);
                          return (
                            <li key={course.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-200 break-words">{course.title}</p>
                                  {showAcademy && course.academy && (
                                    <p className="text-xs text-slate-500">{course.academy}</p>
                                  )}
                                </div>
                                <span
                                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-md border ${STATE_STYLES[state]}`}
                                >
                                  {progressLabel(state)}
                                </span>
                              </div>
                              <div
                                role="progressbar"
                                aria-label={`Progress of ${studentName(student)} in ${course.title}`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={course.percentage}
                                className="h-2 w-full rounded-full bg-slate-800 overflow-hidden"
                              >
                                <div
                                  className={`h-full rounded-full ${state === 'finished' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${course.percentage}%` }}
                                />
                              </div>
                              <p className="flex flex-wrap justify-between gap-x-3 text-xs text-slate-400 mt-2">
                                <span>{lessonsLabel(course)}</span>
                                <span>Since {formatOrderDate(course.since).date}</span>
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
