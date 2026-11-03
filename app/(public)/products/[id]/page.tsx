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
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import CatalogHeader from '@/components/layout/CatalogHeader';
import { apiErrorMessage } from '@/lib/api-error';
import { loginPathFor } from '@/lib/auth';
import {
  type CourseDetail,
  closedForOrders,
  courseAction,
  courseStatusLabel,
  formatDuration,
  lessonTotal,
  totalMinutes,
} from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { useSession } from '@/lib/use-session';
import { coursesService } from '@/services/courses.service';

const PRIMARY_BUTTON =
  'w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors';

export default function CoursePage() {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const { known, user } = useSession();
  // Load again when the viewer changes (sign-in or sign-out): the answer
  // depends on who asks (access, drafts for admins).
  const viewerKey = known ? (user?.id ?? 'visitor') : null;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (viewerKey === null || courseId === '') return;
    let active = true;
    coursesService.getOne(courseId).then(
      (loaded) => {
        if (active) {
          setCourse(loaded);
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
  }, [courseId, viewerKey, reloadKey]);

  let content: React.ReactNode;
  if (loadError) {
    content = (
      <div
        role="alert"
        className="max-w-xl mx-auto flex flex-col gap-4 p-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl"
      >
        <span className="flex items-start gap-2">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {loadError}
        </span>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setLoadError('');
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
          <Link href="/products" className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
            All courses
          </Link>
        </div>
      </div>
    );
  } else if (course === null) {
    content = (
      <p role="status" className="text-center text-sm text-slate-400 py-12">
        Loading the course...
      </p>
    );
  } else {
    const lessons = lessonTotal(course);
    const duration = formatDuration(totalMinutes(course));
    const status = courseStatusLabel(course.status);
    const action = courseAction(course, user !== null);
    content = (
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0 space-y-8">
          {/* Title and description */}
          <div>
            {(course.category || course.level || status) && (
              <p className="text-sm font-medium text-indigo-300 mb-3">
                {[course.category, course.level, status].filter(Boolean).join(' - ')}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
              {course.title}
            </h1>
            <p className="text-slate-400">
              By{' '}
              {course.center ? (
                <Link
                  href={`/centers/${encodeURIComponent(course.centerId)}`}
                  className="text-slate-200 font-medium hover:text-indigo-300 underline-offset-4 hover:underline"
                >
                  {course.center.name}
                </Link>
              ) : (
                <span className="text-slate-200 font-medium">an academy</span>
              )}
              {course.center?.location ? ` - ${course.center.location}` : ''}
            </p>
            {course.description && (
              <p className="mt-5 text-slate-300 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            )}
          </div>

          {/* Program */}
          <section aria-labelledby="program-title" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="program-title" className="text-2xl font-bold text-white">
                Program
              </h2>
              <p className="text-sm text-slate-400">
                {course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'},{' '}
                {lessons} {lessons === 1 ? 'lesson' : 'lessons'}
                {duration ? `, ${duration}` : ''}
              </p>
            </div>
            {course.modules.length === 0 ? (
              <p className="text-sm text-slate-500">The program of this course is not published yet.</p>
            ) : (
              <div className="rounded-2xl border border-slate-800 divide-y divide-slate-800 overflow-hidden">
                {course.modules.map((courseModule, index) => (
                  <details key={courseModule.id} open={index === 0} className="group bg-slate-900/50">
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-white font-semibold hover:bg-slate-800/50">
                      <span>{courseModule.title}</span>
                      <span className="text-xs font-normal text-slate-400 shrink-0">
                        {courseModule.lessons.length}{' '}
                        {courseModule.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </summary>
                    <ul className="px-5 pb-4 space-y-2">
                      {courseModule.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-start gap-3 text-sm text-slate-300">
                          <PlayCircle aria-hidden="true" className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.duration ? (
                            <span className="text-xs text-slate-500 shrink-0">
                              {formatDuration(lesson.duration)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Price and main button */}
        <aside className="w-full lg:w-[360px] shrink-0">
          <div className="lg:sticky lg:top-24 p-6 rounded-3xl bg-slate-900/80 border border-slate-700 space-y-5">
            <p className="text-3xl font-extrabold text-white">
              {course.price === 0 ? 'Free' : formatPrice(course.price)}
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <BookOpen aria-hidden="true" className="w-4 h-4 text-indigo-400" />
                {lessons} {lessons === 1 ? 'lesson' : 'lessons'} in {course.modules.length}{' '}
                {course.modules.length === 1 ? 'module' : 'modules'}
              </li>
              {duration && (
                <li className="flex items-center gap-2">
                  <Clock aria-hidden="true" className="w-4 h-4 text-indigo-400" />
                  {duration} in total
                </li>
              )}
            </ul>

            {action === 'open' && (
              <>
                <p className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
                  You have access to this course.
                </p>
                <Link href={`/student/courses/${encodeURIComponent(course.id)}`} className={PRIMARY_BUTTON}>
                  Open the course
                </Link>
              </>
            )}
            {action === 'sign-in-free' && (
              <Link href={loginPathFor(`/student/courses/${encodeURIComponent(course.id)}`)} className={PRIMARY_BUTTON}>
                Sign in to start for free
              </Link>
            )}
            {action === 'closed' && (
              <p className="flex items-start gap-2 p-3 text-sm text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-xl">
                <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
                {closedForOrders(course.status)}
              </p>
            )}
            {action === 'buy' && (
              <>
                <Link href={`/checkout/${encodeURIComponent(course.id)}`} className={PRIMARY_BUTTON}>
                  Buy this course
                </Link>
                <p className="text-xs text-slate-500 text-center">
                  You pay the academy by cash or bank transfer; the course opens once they
                  confirm your payment.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      <CatalogHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-8"
        >
          <ChevronLeft aria-hidden="true" className="w-5 h-5 mr-1" />
          All courses
        </Link>
        {content}
      </main>
    </div>
  );
}
