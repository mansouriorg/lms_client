'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronLeft, Download, HelpCircle, Plus, RotateCcw, Search, Users } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { type ManagedCourse, courseStatusName } from '@/lib/course-admin';
import {
  type CourseResults,
  type ScoreTone,
  columnSummary,
  moduleNumber,
  personName,
  resultColumns,
  resultsCsv,
  resultsFileName,
  scoreDetail,
  scoreOf,
  scoreTone,
  takenLabel,
  visibleStudents,
} from '@/lib/quiz-results';
import { todayIn } from '@/lib/sessions';
import { courseAdminService } from '@/services/course-admin.service';
import { quizzesService } from '@/services/quizzes.service';

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const TONE_STYLES: Record<ScoreTone, string> = {
  high: 'text-emerald-400',
  mid: 'text-amber-400',
  low: 'text-red-400',
};
const ERROR_BOX =
  'flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl';
const RETRY_BUTTON =
  'inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors';

// Quiz results: the best score of each student of a course at the quiz of
// each module (GET /quiz-questions/course/:stageId/results), with the
// average of each quiz. Read only.
export default function CenterQuizResultsPage() {
  const [courses, setCourses] = useState<ManagedCourse[] | null>(null);
  const [coursesError, setCoursesError] = useState('');
  const [courseId, setCourseId] = useState('');
  // The results of a course, with the course they belong to (a load for
  // another course is not shown)
  const [results, setResults] = useState<{ courseId: string; data: CourseResults } | null>(null);
  const [resultsError, setResultsError] = useState<{ courseId: string; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');

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
    quizzesService.results(courseId).then(
      (data) => {
        if (active) {
          setResults({ courseId, data });
          setResultsError(null);
        }
      },
      (error: unknown) => {
        if (active)
          setResultsError({ courseId, text: apiErrorMessage(error, 'Could not load the results of this course.') });
      },
    );
    return () => {
      active = false;
    };
  }, [courseId, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const data = results !== null && results.courseId === courseId ? results.data : null;
  const loadError = resultsError !== null && resultsError.courseId === courseId ? resultsError.text : '';
  const course = courses?.find((item) => item.id === courseId) ?? null;
  const columns = data === null ? [] : resultColumns(data);
  const rows = data === null ? [] : visibleStudents(data.students, query);

  // The students shown, as a CSV file for a spreadsheet
  const download = () => {
    if (data === null) return;
    const url = URL.createObjectURL(new Blob([resultsCsv(data, rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = resultsFileName(course?.title ?? '', todayIn(new Date()));
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl min-w-0">
      <div className="space-y-2">
        <Link
          href="/center/questions"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ChevronLeft aria-hidden="true" className="w-4 h-4 mr-1" />
          Quizzes
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Quiz results</h1>
        <p className="text-sm text-slate-400">
          The best score of each student at the quiz of each module. Students can take a quiz as often as they like; their
          best score counts.
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
          <HelpCircle aria-hidden="true" className="w-8 h-8 text-indigo-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No courses yet</h2>
          <p className="text-sm text-slate-400 mb-4">Quiz results belong to the modules of a course. Create a course first.</p>
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
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="space-y-2 md:w-80">
            <label htmlFor="results-course" className="text-sm font-medium text-slate-300">
              Course
            </label>
            <select
              id="results-course"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setQuery('');
              }}
              className={FIELD}
            >
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({courseStatusName(item.status)})
                </option>
              ))}
            </select>
          </div>
          {data !== null && data.students.length > 0 && columns.length > 0 && (
            <div className="relative flex-1">
              <label htmlFor="results-search" className="sr-only">
                Search students
              </label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search aria-hidden="true" className="h-4 w-4 text-slate-500" />
              </div>
              <input
                id="results-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
              />
            </div>
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
              setResultsError(null);
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
          Loading the results...
        </p>
      )}

      {data !== null && columns.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
          <p className="mb-3">
            {course?.title ?? 'This course'} has no quiz yet. Add questions to its modules first: the results appear
            once students finish the quizzes.
          </p>
          <Link href="/center/questions" className="font-medium text-indigo-400 hover:text-indigo-300">
            Add quiz questions
          </Link>
        </div>
      )}

      {data !== null && columns.length > 0 && data.students.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
          <Users aria-hidden="true" className="w-8 h-8 text-indigo-400 mb-3" />
          <p>
            No students yet. Once students buy {course?.title ?? 'this course'} or finish one of its quizzes, their best
            scores appear here.
          </p>
        </div>
      )}

      {data !== null && columns.length > 0 && data.students.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400" role="status">
              {query.trim() === ''
                ? `${data.students.length} ${data.students.length === 1 ? 'student' : 'students'}`
                : `Showing ${rows.length} of ${data.students.length} ${data.students.length === 1 ? 'student' : 'students'}`}{' '}
              - {columns.length} {columns.length === 1 ? 'module quiz' : 'module quizzes'}
            </p>
            <button
              type="button"
              onClick={download}
              disabled={rows.length === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <Download aria-hidden="true" className="w-4 h-4" />
              Download CSV
            </button>
          </div>
          {/* Wide courses scroll sideways inside the frame, not the page */}
          <div className="max-w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="min-w-full text-sm">
              <caption className="sr-only">Best quiz scores of the students of {course?.title ?? 'the course'}</caption>
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-slate-300 min-w-48">
                    Student
                  </th>
                  {columns.map((courseModule) => (
                    <th key={courseModule.id} scope="col" className="px-4 py-3 font-semibold text-slate-300 min-w-40 align-bottom">
                      <span className="block text-xs font-medium text-slate-500">
                        Module {moduleNumber(data, courseModule.id)}
                      </span>
                      <span className="block break-words">{courseModule.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                      No student matches your search.{' '}
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        Clear the search
                      </button>
                    </td>
                  </tr>
                )}
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-slate-800/60 last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal align-top">
                      <span className="block font-medium text-white break-words">{personName(student)}</span>
                      {personName(student) !== student.email && (
                        <span className="block text-xs text-slate-500 break-all">{student.email}</span>
                      )}
                    </th>
                    {columns.map((courseModule) => {
                      const score = scoreOf(student, courseModule.id);
                      return (
                        <td key={courseModule.id} className="px-4 py-3 align-top">
                          {score === null || score.best === null ? (
                            <span className="text-slate-500">Not taken</span>
                          ) : (
                            <>
                              <span className={`block font-semibold ${TONE_STYLES[scoreTone(score.best.percentage)]}`}>
                                {score.best.percentage}%
                              </span>
                              <span className="block text-xs text-slate-500">{scoreDetail(score)}</span>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-700 bg-slate-950/30">
                  <th scope="row" className="px-4 py-3 text-left font-semibold text-slate-300 align-top">
                    Average best score
                  </th>
                  {columns.map((courseModule) => {
                    const summary = columnSummary(data.students, courseModule.id);
                    return (
                      <td key={courseModule.id} className="px-4 py-3 align-top">
                        <span className="block font-semibold text-white">
                          {summary.average === null ? '-' : `${summary.average}%`}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {takenLabel(summary.taken, data.students.length)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
