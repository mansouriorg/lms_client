'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BookOpen, CheckCircle2, PlayCircle, RotateCcw } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { type MyCourse, courseButtonLabel, isFinished } from '@/lib/learning';
import { learningService } from '@/services/learning.service';

// "My courses": the courses the student bought, with their progress.
export default function MyCoursesPage() {
  // null while the first load is running
  const [courses, setCourses] = useState<MyCourse[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    learningService.myCourses().then(
      (list) => {
        if (active) {
          setCourses(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load your courses. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My courses</h1>
        <p className="text-sm text-slate-400 mt-1">
          The courses you bought. A course appears here as soon as the academy confirms your
          payment.
        </p>
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

      {courses === null && loadError === '' && (
        <p role="status" className="text-sm text-slate-400 py-8 text-center">
          Loading your courses...
        </p>
      )}

      {courses && courses.length === 0 && (
        <div className="p-12 text-center flex flex-col items-center rounded-3xl bg-slate-900/50 border border-slate-800">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <BookOpen aria-hidden="true" className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-lg font-medium text-white mb-1">No courses yet</h2>
          <p className="text-slate-400 text-sm mb-5 max-w-md">
            Courses you buy appear here once the academy confirms your payment. You can follow
            your orders in Purchases.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              Browse courses
            </Link>
            <Link
              href="/student/orders"
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              My purchases
            </Link>
          </div>
        </div>
      )}

      {courses && courses.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const done = isFinished(course);
            return (
              <li
                key={course.id}
                className="flex flex-col p-6 rounded-3xl bg-slate-900/50 border border-slate-800"
              >
                {(course.category || course.level) && (
                  <p className="text-xs font-semibold text-indigo-300 mb-2">
                    {[course.category, course.level].filter(Boolean).join(' - ')}
                  </p>
                )}
                <h2 className="text-lg font-bold text-white leading-snug">{course.title}</h2>
                <p className="text-sm text-slate-400 mb-5">{course.center?.name ?? 'Academy'}</p>
                {(course.status === 'CANCELLED' || course.status === 'DRAFT') && (
                  <p className="-mt-3 mb-5 text-xs text-amber-300">
                    No longer offered by the academy. You keep access.
                  </p>
                )}

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>
                      {course.completedLessons} of {course.totalLessons}{' '}
                      {course.totalLessons === 1 ? 'lesson' : 'lessons'} completed
                    </span>
                    <span className="font-semibold text-slate-200">{course.percentage}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Progress in ${course.title}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={course.percentage}
                    className="h-2 rounded-full bg-slate-800 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                  <Link
                    href={`/student/courses/${encodeURIComponent(course.id)}`}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                  >
                    {done ? (
                      <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
                    ) : (
                      <PlayCircle aria-hidden="true" className="w-4 h-4" />
                    )}
                    {courseButtonLabel(course)}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
