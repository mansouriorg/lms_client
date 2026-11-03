'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  HelpCircle,
  Lock,
  PlayCircle,
  RotateCcw,
} from 'lucide-react';
import LessonQuestions from '@/components/student/LessonQuestions';
import ModuleQuiz from '@/components/student/ModuleQuiz';
import { apiErrorMessage } from '@/lib/api-error';
import { formatDuration } from '@/lib/catalog';
import {
  type PlayerCourse,
  allLessons,
  firstLessonToWatch,
  nextLessonId,
  percentDone,
  videoSource,
} from '@/lib/learning';
import {
  type ModuleResult,
  bestBadge,
  moduleQuizCount,
  quizAfterLesson,
  quizLabel,
  resultFor,
  withResult,
} from '@/lib/practice-quiz';
import { learningService } from '@/services/learning.service';
import { practiceQuizService } from '@/services/practice-quiz.service';

// The video of a lesson: an embedded YouTube or Vimeo player, a video file,
// or a link that opens in a new tab (see videoSource in lib/learning.ts).
function LessonVideo({ url, title }: { url: string | null; title: string }) {
  const source = videoSource(url);
  const frame = 'w-full aspect-video rounded-2xl bg-black border border-slate-800';
  if (source === null) {
    return (
      <div className={`${frame} flex items-center justify-center text-sm text-slate-400`}>
        This lesson has no video.
      </div>
    );
  }
  if (source.kind === 'file') {
    return <video key={source.src} src={source.src} controls preload="metadata" className={frame} />;
  }
  if (source.kind === 'link') {
    return (
      <div className={`${frame} flex items-center justify-center`}>
        <a
          href={source.src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          <ExternalLink aria-hidden="true" className="w-4 h-4" />
          Open the video
        </a>
      </div>
    );
  }
  return (
    <iframe
      key={source.src}
      src={source.src}
      title={title}
      className={frame}
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

// The best score at the quiz of a module, in the program ("Best: 67%")
function QuizBest({ result }: { result: ModuleResult | null }) {
  if (result === null || result.best === null) return null;
  return <span className="mt-0.5 text-xs font-medium text-emerald-400 shrink-0">{bestBadge(result.best)}</span>;
}

export default function CoursePlayerPage() {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const [course, setCourse] = useState<PlayerCourse | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  // The module whose quiz is open (instead of the lesson), or null
  const [quizModuleId, setQuizModuleId] = useState<string | null>(null);
  // The student's best score at each module quiz they finished
  const [results, setResults] = useState<ModuleResult[]>([]);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Load the course (with the video links when the student may open it) and
  // the lessons already completed; start at the first lesson not done yet.
  useEffect(() => {
    if (courseId === '') return;
    let active = true;
    Promise.all([learningService.getCourse(courseId), learningService.getProgress(courseId)]).then(
      ([loadedCourse, progress]) => {
        if (active) {
          const done = progress.completedLessonIds ?? [];
          setCourse(loadedCourse);
          setCompletedIds(done);
          setCurrentId(firstLessonToWatch(loadedCourse, done));
          setLoadError('');
          // The best quiz scores: extra, the course works without them
          if (loadedCourse.hasAccess && loadedCourse.modules.some((courseModule) => moduleQuizCount(courseModule) > 0)) {
            practiceQuizService.courseResults(courseId).then(
              (loaded) => {
                if (active) setResults(loaded);
              },
              () => {
                // No scores shown; the quizzes still work
              },
            );
          }
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
  }, [courseId, reloadKey]);

  const markCompleted = async (lessonId: string) => {
    setSaving(true);
    setSaveError('');
    try {
      await learningService.completeLesson(lessonId);
      setCompletedIds((ids) => (ids.includes(lessonId) ? ids : [...ids, lessonId]));
    } catch (error) {
      const status = (error as { response?: { status?: number } } | null)?.response?.status;
      if (status === 409) {
        // Already completed (for example in another tab)
        setCompletedIds((ids) => (ids.includes(lessonId) ? ids : [...ids, lessonId]));
      } else {
        setSaveError(apiErrorMessage(error, 'Could not save your progress. Please try again.'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div
        role="alert"
        className="max-w-xl flex flex-col gap-4 p-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl"
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
          <Link href="/student/lessons" className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
            My courses
          </Link>
        </div>
      </div>
    );
  }

  if (course === null) {
    return (
      <p role="status" className="text-sm text-slate-400 py-8">
        Loading the course...
      </p>
    );
  }

  if (course.hasAccess === false) {
    return (
      <div className="max-w-xl p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <Lock aria-hidden="true" className="w-6 h-6 text-amber-400 shrink-0" />
          <h1 className="text-xl font-bold text-white">This course is not open for you yet</h1>
        </div>
        <p className="text-sm text-slate-400">
          {course.title} opens once you buy it and the academy confirms your payment.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/products/${encodeURIComponent(course.id)}`}
            className="py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            See the course
          </Link>
          <Link
            href="/student/orders"
            className="py-2.5 px-4 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            My purchases
          </Link>
        </div>
      </div>
    );
  }

  const lessons = allLessons(course);
  const current = lessons.find((lesson) => lesson.id === currentId) ?? null;
  const completedCount = lessons.filter((lesson) => completedIds.includes(lesson.id)).length;
  const percentage = percentDone(completedCount, lessons.length);
  const nextId = current ? nextLessonId(course, current.id) : null;
  const currentDone = current !== null && completedIds.includes(current.id);
  const quizModule = course.modules.find((courseModule) => courseModule.id === quizModuleId) ?? null;
  // After the last lesson of a module that has a quiz: offer the quiz
  const quizNext = current ? quizAfterLesson(course, current.id) : null;

  return (
    <div className="space-y-6">
      {/* Title and progress */}
      <div className="space-y-3">
        <Link
          href="/student/lessons"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ChevronLeft aria-hidden="true" className="w-4 h-4 mr-1" />
          My courses
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">{course.title}</h1>
        <div className="flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Course progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            className="flex-1 max-w-md h-2 rounded-full bg-slate-800 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-sm text-slate-400">
            {completedCount} of {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}{' '}
            completed ({percentage}%)
          </p>
        </div>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-slate-400">The lessons of this course are not published yet.</p>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* The current lesson, or the quiz of a module */}
          <div className="flex-1 min-w-0 space-y-4">
            {quizModule !== null && (
              <ModuleQuiz
                key={quizModule.id}
                moduleId={quizModule.id}
                onClose={() => setQuizModuleId(null)}
                onSaved={(result) => setResults((list) => withResult(list, result))}
              />
            )}
            {quizModule === null && current && (
              <>
                <LessonVideo url={current.videoUrl} title={current.title} />
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{current.title}</h2>
                    {current.duration ? (
                      <p className="text-xs text-slate-500 mt-1">{formatDuration(current.duration)}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {currentDone ? (
                      <span className="inline-flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
                        Completed
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markCompleted(current.id)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Mark as completed'}
                      </button>
                    )}
                    {quizNext && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuizModuleId(quizNext);
                          setSaveError('');
                        }}
                        className="inline-flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-indigo-200 border border-indigo-500/40 hover:bg-indigo-500/10 transition-colors"
                      >
                        <HelpCircle aria-hidden="true" className="w-4 h-4" />
                        Take the module quiz
                      </button>
                    )}
                    {nextId && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentId(nextId);
                          setSaveError('');
                        }}
                        className="inline-flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
                      >
                        Next lesson
                        <ArrowRight aria-hidden="true" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {saveError && (
                  <p role="alert" className="text-sm text-red-400">
                    {saveError}
                  </p>
                )}
                {current.description && (
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {current.description}
                  </p>
                )}
                {/* Questions and answers of this lesson; a new panel per lesson */}
                <LessonQuestions key={current.id} lessonId={current.id} />
              </>
            )}
          </div>

          {/* The program */}
          <nav aria-label="Lessons of the course" className="w-full xl:w-80 shrink-0 space-y-4">
            {course.modules.map((courseModule) => (
              <div key={courseModule.id} className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                <h3 className="px-4 py-3 text-sm font-semibold text-white border-b border-slate-800">
                  {courseModule.title}
                </h3>
                <ul className="py-1">
                  {courseModule.lessons.map((lesson) => {
                    const active = quizModuleId === null && lesson.id === currentId;
                    const done = completedIds.includes(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          aria-current={active ? 'step' : undefined}
                          onClick={() => {
                            setCurrentId(lesson.id);
                            setQuizModuleId(null);
                            setSaveError('');
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                            active ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-300 hover:bg-slate-800/50'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 role="img" aria-label="Completed" className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                          ) : (
                            <PlayCircle aria-hidden="true" className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.duration ? (
                            <span className="text-xs text-slate-500 shrink-0">
                              {formatDuration(lesson.duration)}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                  {moduleQuizCount(courseModule) > 0 && (
                    <li>
                      <button
                        type="button"
                        aria-current={quizModuleId === courseModule.id ? 'step' : undefined}
                        onClick={() => setQuizModuleId(courseModule.id)}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                          quizModuleId === courseModule.id
                            ? 'bg-indigo-500/10 text-indigo-300'
                            : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <HelpCircle aria-hidden="true" className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                        <span className="flex-1">{quizLabel(moduleQuizCount(courseModule))}</span>
                        <QuizBest result={resultFor(results, courseModule.id)} />
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
