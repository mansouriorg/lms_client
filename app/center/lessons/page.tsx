'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BookOpen, Pencil, PlayCircle, Plus, RotateCcw, TrendingDown } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { formatDuration } from '@/lib/catalog';
import { type ManagedCourse, courseStatusName } from '@/lib/course-admin';
import {
  type LessonProgress,
  biggestDrop,
  completedLabel,
  dropLabel,
  lessonCountLabel,
  lessonTotal,
  shareOf,
} from '@/lib/lesson-progress';
import { courseAdminService } from '@/services/course-admin.service';

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const ERROR_BOX =
  'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl';
const RETRY_BUTTON =
  'inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors';

// One figure of the summary
function Figure({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {detail && <p className="text-xs text-slate-500">{detail}</p>}
    </div>
  );
}

// Lessons: how far the students of each course got (GET
// /stages/:id/lesson-progress): how many of them completed each lesson, and
// where most of them stop. The lessons themselves are edited in the course
// editor (/center/stages/[id]).
export default function CenterLessonsPage() {
  const [courses, setCourses] = useState<ManagedCourse[] | null>(null);
  const [coursesError, setCoursesError] = useState('');
  const [courseId, setCourseId] = useState('');
  // The report of a course, with the course it belongs to (a load for
  // another course is not shown)
  const [report, setReport] = useState<{ courseId: string; data: LessonProgress } | null>(null);
  const [reportError, setReportError] = useState<{ courseId: string; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    courseAdminService.list().then(
      (list) => {
        if (active) {
          setCourses(list);
          setCoursesError('');
          setCourseId((current) => (current === '' && list.length > 0 ? list[0].id : current));
        }
      },
      (error: unknown) => {
        if (active) setCoursesError(apiErrorMessage(error, 'Could not load your courses. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (courseId === '') return;
    let active = true;
    courseAdminService.lessonProgress(courseId).then(
      (data) => {
        if (active) {
          setReport({ courseId, data });
          setReportError(null);
        }
      },
      (error: unknown) => {
        if (active)
          setReportError({ courseId, text: apiErrorMessage(error, 'Could not load the lessons of this course.') });
      },
    );
    return () => {
      active = false;
    };
  }, [courseId, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const data = report !== null && report.courseId === courseId ? report.data : null;
  const loadError = reportError !== null && reportError.courseId === courseId ? reportError.text : '';
  const course = courses?.find((item) => item.id === courseId) ?? null;
  const total = data === null ? 0 : lessonTotal(data);
  const drop = data === null ? null : biggestDrop(data);
  const editorHref = `/center/stages/${encodeURIComponent(courseId)}`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Lessons</h1>
        <p className="text-sm text-slate-400 mt-1">
          How far the students of each course got: how many of them completed each lesson. Lessons are added and
          changed in the course editor.
        </p>
      </div>

      {coursesError && (
        <div role="alert" className={ERROR_BOX}>
          <span className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
            {coursesError}
          </span>
          <button
            type="button"
            onClick={() => {
              setCoursesError('');
              reload();
            }}
            className={RETRY_BUTTON}
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {courses === null && coursesError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading your courses...
        </p>
      )}

      {courses !== null && courses.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <BookOpen aria-hidden="true" className="w-8 h-8 text-indigo-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No courses yet</h2>
          <p className="text-sm text-slate-400 mb-4">Lessons belong to the modules of a course. Create a course first.</p>
          <Link
            href="/center/stages/create"
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            Create a course
          </Link>
        </div>
      )}

      {courses !== null && courses.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end justify-between">
          <div className="space-y-2 sm:w-80">
            <label htmlFor="lessons-course" className="text-sm font-medium text-slate-300">
              Course
            </label>
            <select id="lessons-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} className={FIELD}>
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({courseStatusName(item.status)})
                </option>
              ))}
            </select>
          </div>
          {courseId !== '' && (
            <Link
              href={editorHref}
              className="inline-flex shrink-0 self-start sm:self-auto items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <Pencil aria-hidden="true" className="w-4 h-4" />
              Edit the lessons
            </Link>
          )}
        </div>
      )}

      {courseId !== '' && loadError !== '' && (
        <div role="alert" className={ERROR_BOX}>
          <span className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => {
              setReportError(null);
              reload();
            }}
            className={RETRY_BUTTON}
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {courseId !== '' && data === null && loadError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading the lessons...
        </p>
      )}

      {data !== null && total === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
          <p className="mb-3">
            {course?.title ?? 'This course'} has no lessons yet. Add modules and lessons in the course editor.
          </p>
          <Link href={editorHref} className="font-medium text-indigo-400 hover:text-indigo-300">
            Open the course editor
          </Link>
        </div>
      )}

      {data !== null && total > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Figure label="Students" value={String(data.students)} />
            <Figure label="Lessons" value={String(total)} />
            <Figure
              label="Finished every lesson"
              value={String(data.finished)}
              detail={data.students === 0 ? undefined : `${shareOf(data.finished, data.students)}% of the students`}
            />
          </div>

          {data.students === 0 && (
            <p className="p-4 rounded-xl text-sm text-slate-400 bg-slate-900/50 border border-slate-800">
              No students yet. Once students buy {course?.title ?? 'this course'} (or, for a free course, complete a
              lesson), you will see here how far each lesson got.
            </p>
          )}

          {drop !== null && (
            <p
              role="note"
              className="flex items-start gap-2 p-4 rounded-xl text-sm text-amber-200 bg-amber-500/10 border border-amber-500/20"
            >
              <TrendingDown aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              {dropLabel(drop)}
            </p>
          )}

          {data.modules.map((courseModule, moduleIndex) => (
            <section
              key={courseModule.id}
              aria-labelledby={`lessons-module-${courseModule.id}`}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3"
            >
              <div>
                <h2 id={`lessons-module-${courseModule.id}`} className="text-lg font-semibold text-white break-words">
                  Module {moduleIndex + 1}: {courseModule.title}
                </h2>
                <p className="text-sm text-slate-400">{lessonCountLabel(courseModule.lessons.length)}</p>
              </div>
              {courseModule.lessons.length > 0 && (
                <ol className="divide-y divide-slate-800">
                  {courseModule.lessons.map((lesson, index) => {
                    const share = shareOf(lesson.completed, data.students);
                    return (
                      <li key={lesson.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <PlayCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white break-words">
                              {index + 1}. {lesson.title}
                            </p>
                            {lesson.duration ? (
                              <p className="text-xs text-slate-500">{formatDuration(lesson.duration)}</p>
                            ) : null}
                          </div>
                        </div>
                        {data.students > 0 && (
                          <div className="sm:w-56 shrink-0 space-y-1 pl-7 sm:pl-0">
                            <div aria-hidden="true" className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${share}%` }} />
                            </div>
                            <p className="text-xs text-slate-400">
                              Completed by {completedLabel(lesson.completed, data.students)}
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
