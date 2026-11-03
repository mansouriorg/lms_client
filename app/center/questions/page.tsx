'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, HelpCircle, Pencil, Plus, RotateCcw, Trash2, Users, X } from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import { type ManagedCourse, courseStatusName } from '@/lib/course-admin';
import {
  type QuizErrors,
  type QuizLevel,
  type QuizModule,
  type QuizQuestion,
  type QuizType,
  type QuizValues,
  ANSWERS_MAX,
  ANSWERS_MIN,
  EXPLANATION_MAX,
  QUESTION_MAX,
  QUESTIONS_PER_MODULE,
  TRUE_FALSE_OPTIONS,
  answerLetter,
  emptyQuizForm,
  levelLabel,
  questionCount,
  quizFormFrom,
  readQuizForm,
  typeLabel,
  withoutAnswer,
} from '@/lib/quizzes';
import { courseAdminService } from '@/services/course-admin.service';
import { quizzesService } from '@/services/quizzes.service';

type Notice = { tone: 'success' | 'error'; text: string };
// The question being written: a new one in a module, or an existing one
type Editing = { moduleId: string; questionId: string | null };

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const PLAIN_BUTTON =
  'inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50';
const LEVEL_STYLES: Record<QuizLevel, string> = {
  EASY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  HARD: 'text-red-400 bg-red-500/10 border-red-500/20',
};

// The form of one question (a new one, or one being edited)
function QuestionForm({
  title,
  values,
  errors,
  saving,
  isNew,
  onChange,
  onSubmit,
  onCancel,
}: {
  title: string;
  values: QuizValues;
  errors: QuizErrors;
  saving: boolean;
  isNew: boolean;
  onChange: (values: QuizValues, field: keyof QuizErrors | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const fieldClass = (field: keyof QuizErrors) => `${FIELD} ${errors[field] ? 'border-red-500/60' : 'border-slate-700'}`;
  const setAnswer = (index: number, text: string) =>
    onChange({ ...values, answers: values.answers.map((answer, place) => (place === index ? text : answer)) }, 'answers');

  return (
    <form
      noValidate
      aria-label={title}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="p-5 rounded-2xl bg-slate-950/40 border border-indigo-500/30 space-y-5"
    >
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <div className="space-y-2">
        <label htmlFor="quiz-text" className="text-sm font-medium text-slate-300">
          Question
        </label>
        <textarea
          id="quiz-text"
          rows={2}
          maxLength={QUESTION_MAX}
          value={values.text}
          onChange={(e) => onChange({ ...values, text: e.target.value }, 'text')}
          placeholder="For example: Which HTTP method creates a new resource?"
          aria-invalid={errors.text !== undefined}
          aria-describedby={errors.text ? 'quiz-text-error' : undefined}
          className={fieldClass('text')}
        />
        <FieldError id="quiz-text-error" text={errors.text} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="quiz-type" className="text-sm font-medium text-slate-300">
            Kind of question
          </label>
          <select
            id="quiz-type"
            value={values.type}
            onChange={(e) => onChange({ ...values, type: e.target.value as QuizType, correct: null }, 'correct')}
            className={`${FIELD} border-slate-700`}
          >
            <option value="MULTIPLE_CHOICE">Multiple choice</option>
            <option value="TRUE_FALSE">True or false</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="quiz-level" className="text-sm font-medium text-slate-300">
            Difficulty
          </label>
          <select
            id="quiz-level"
            value={values.difficulty}
            onChange={(e) => onChange({ ...values, difficulty: e.target.value as QuizLevel }, null)}
            className={`${FIELD} border-slate-700`}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {values.type === 'MULTIPLE_CHOICE' ? (
        <fieldset className="space-y-3" aria-describedby="quiz-answers-help">
          <legend className="text-sm font-medium text-slate-300">Possible answers</legend>
          <p id="quiz-answers-help" className="text-xs text-slate-500">
            {ANSWERS_MIN} to {ANSWERS_MAX} answers; select the right one. Empty fields are left out.
          </p>
          {values.answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="quiz-correct"
                checked={values.correct === index}
                onChange={() => onChange({ ...values, correct: index }, 'correct')}
                aria-label={`Answer ${answerLetter(index)} is the right one`}
                className="w-4 h-4 shrink-0 border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <span aria-hidden="true" className="w-5 text-sm font-semibold text-slate-400">
                {answerLetter(index)}
              </span>
              <input
                id={`quiz-answer-${index}`}
                value={answer}
                maxLength={200}
                onChange={(e) => setAnswer(index, e.target.value)}
                aria-label={`Answer ${answerLetter(index)}`}
                className={`${FIELD} border-slate-700 min-w-0`}
              />
              {values.answers.length > ANSWERS_MIN && (
                <button
                  type="button"
                  onClick={() => onChange(withoutAnswer(values, index), 'answers')}
                  aria-label={`Remove answer ${answerLetter(index)}`}
                  className="p-2 shrink-0 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <X aria-hidden="true" className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {values.answers.length < ANSWERS_MAX && (
            <button
              type="button"
              onClick={() => onChange({ ...values, answers: [...values.answers, ''] }, null)}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300"
            >
              <Plus aria-hidden="true" className="w-4 h-4" />
              Add an answer
            </button>
          )}
          <FieldError id="quiz-answers-error" text={errors.answers} />
          <FieldError id="quiz-correct-error" text={errors.correct} />
        </fieldset>
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-300">The statement is</legend>
          <div className="flex gap-6">
            {TRUE_FALSE_OPTIONS.map((option, index) => (
              <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="radio"
                  name="quiz-correct"
                  checked={values.correct === index}
                  onChange={() => onChange({ ...values, correct: index }, 'correct')}
                  className="w-4 h-4 border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                {option}
              </label>
            ))}
          </div>
          <FieldError id="quiz-correct-error" text={errors.correct} />
        </fieldset>
      )}

      <div className="space-y-2">
        <label htmlFor="quiz-explanation" className="text-sm font-medium text-slate-300">
          Explanation (optional)
        </label>
        <textarea
          id="quiz-explanation"
          rows={2}
          maxLength={EXPLANATION_MAX}
          value={values.explanation}
          onChange={(e) => onChange({ ...values, explanation: e.target.value }, 'explanation')}
          placeholder="Why the right answer is right"
          aria-invalid={errors.explanation !== undefined}
          aria-describedby={errors.explanation ? 'quiz-explanation-error' : undefined}
          className={fieldClass('explanation')}
        />
        <FieldError id="quiz-explanation-error" text={errors.explanation} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : isNew ? 'Add the question' : 'Save the question'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={PLAIN_BUTTON}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// One question as the academy sees it: the answers, the right one, the
// explanation
function QuestionCard({ question, number }: { question: QuizQuestion; number: number }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-400">Question {number}</span>
        <span className="px-2 py-0.5 rounded-md border border-slate-700 text-slate-300">{typeLabel(question.type)}</span>
        <span className={`px-2 py-0.5 rounded-md border ${LEVEL_STYLES[question.difficulty] ?? LEVEL_STYLES.MEDIUM}`}>
          {levelLabel(question.difficulty)}
        </span>
      </div>
      <p className="text-sm font-medium text-white whitespace-pre-wrap break-words">{question.text}</p>
      <ul className="space-y-1.5" aria-label={`Answers to question ${number}`}>
        {question.options.map((option, index) => {
          const right = index === question.correctAnswer;
          return (
            <li
              key={index}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm border ${
                right ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 text-slate-300'
              }`}
            >
              <span className="font-semibold w-4 shrink-0">{answerLetter(index)}</span>
              <span className="flex-1 break-words">{option}</span>
              {right && (
                <span className="inline-flex items-center gap-1 text-xs font-medium shrink-0">
                  <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
                  Right answer
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {question.explanation && (
        <p className="text-xs text-slate-400 whitespace-pre-wrap break-words">
          <span className="font-semibold text-slate-300">Why: </span>
          {question.explanation}
        </p>
      )}
    </div>
  );
}

// Quizzes: the practice questions of each module of the academy's courses.
// Choose a course, then add, edit or delete the questions of its modules
// (GET, POST, PATCH, DELETE /quiz-questions).
export default function CenterQuizzesPage() {
  const [courses, setCourses] = useState<ManagedCourse[] | null>(null);
  const [coursesError, setCoursesError] = useState('');
  const [courseId, setCourseId] = useState('');
  // The quiz of a course, with the course it belongs to (a load for another
  // course is not shown)
  const [quiz, setQuiz] = useState<{ courseId: string; modules: QuizModule[] } | null>(null);
  const [quizError, setQuizError] = useState<{ courseId: string; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [values, setValues] = useState<QuizValues>(emptyQuizForm());
  const [errors, setErrors] = useState<QuizErrors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    quizzesService.forCourse(courseId).then(
      (modules) => {
        if (active) {
          setQuiz({ courseId, modules });
          setQuizError(null);
        }
      },
      (error: unknown) => {
        if (active)
          setQuizError({ courseId, text: apiErrorMessage(error, 'Could not load the quizzes of this course.') });
      },
    );
    return () => {
      active = false;
    };
  }, [courseId, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const modules = quiz !== null && quiz.courseId === courseId ? quiz.modules : null;
  const loadError = quizError !== null && quizError.courseId === courseId ? quizError.text : '';
  const course = courses?.find((item) => item.id === courseId) ?? null;

  const chooseCourse = (id: string) => {
    setCourseId(id);
    setEditing(null);
    setNotice(null);
    setConfirmingId(null);
  };

  const startNew = (moduleId: string) => {
    setEditing({ moduleId, questionId: null });
    setValues(emptyQuizForm());
    setErrors({});
    setNotice(null);
    setConfirmingId(null);
  };

  const startEdit = (question: QuizQuestion) => {
    setEditing({ moduleId: question.moduleId, questionId: question.id });
    setValues(quizFormFrom(question));
    setErrors({});
    setNotice(null);
    setConfirmingId(null);
  };

  const change = (next: QuizValues, field: keyof QuizErrors | null) => {
    setValues(next);
    if (field !== null) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const save = async () => {
    if (editing === null) return;
    const { errors: found, payload } = readQuizForm(values);
    setErrors(found);
    if (payload === null) return;
    setSaving(true);
    setNotice(null);
    try {
      if (editing.questionId === null) await quizzesService.create(editing.moduleId, payload);
      else await quizzesService.update(editing.questionId, payload);
      setNotice({ tone: 'success', text: editing.questionId === null ? 'Question added.' : 'Question saved.' });
      setEditing(null);
      reload();
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not save the question. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (question: QuizQuestion) => {
    setBusyId(question.id);
    setNotice(null);
    try {
      await quizzesService.remove(question.id);
      setNotice({ tone: 'success', text: 'Question deleted.' });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not delete the question. Please try again.') });
    } finally {
      setConfirmingId(null);
      setBusyId(null);
      reload();
    }
  };

  const form = (title: string, isNew: boolean) => (
    <QuestionForm
      title={title}
      values={values}
      errors={errors}
      saving={saving}
      isNew={isNew}
      onChange={change}
      onSubmit={save}
      onCancel={() => setEditing(null)}
    />
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quizzes</h1>
          <p className="text-sm text-slate-400 mt-1">
            Practice questions for each module of your courses: the question, its possible answers, the right one and
            why it is right.
          </p>
        </div>
        <Link
          href="/center/questions/results"
          className="inline-flex shrink-0 self-start items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <Users aria-hidden="true" className="w-4 h-4" />
          Results of the students
        </Link>
      </div>

      {coursesError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
        >
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
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
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
          <p className="text-sm text-slate-400 mb-4">Quizzes belong to the modules of a course. Create a course first.</p>
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
        <div className="space-y-2">
          <label htmlFor="quiz-course" className="text-sm font-medium text-slate-300">
            Course
          </label>
          <select
            id="quiz-course"
            value={courseId}
            onChange={(e) => chooseCourse(e.target.value)}
            className={`${FIELD} border-slate-700 sm:max-w-md`}
          >
            {courses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} ({courseStatusName(item.status)})
              </option>
            ))}
          </select>
        </div>
      )}

      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2 text-sm ${notice.tone === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
        >
          {notice.tone === 'error' ? (
            <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          {notice.text}
        </p>
      )}

      {courseId !== '' && loadError !== '' && (
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
              setQuizError(null);
              reload();
            }}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {courseId !== '' && modules === null && loadError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading the quizzes...
        </p>
      )}

      {modules !== null && modules.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
          <p className="mb-3">
            {course?.title ?? 'This course'} has no modules yet. A quiz belongs to a module: add modules and lessons in
            the course editor first.
          </p>
          <Link
            href={`/center/stages/${encodeURIComponent(courseId)}`}
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Open the course editor
          </Link>
        </div>
      )}

      {modules !== null &&
        modules.map((courseModule, moduleIndex) => {
          const full = courseModule.quizBank.length >= QUESTIONS_PER_MODULE;
          const adding = editing !== null && editing.moduleId === courseModule.id && editing.questionId === null;
          return (
            <section
              key={courseModule.id}
              aria-labelledby={`module-${courseModule.id}`}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id={`module-${courseModule.id}`} className="text-lg font-semibold text-white break-words">
                    Module {moduleIndex + 1}: {courseModule.title}
                  </h2>
                  <p className="text-sm text-slate-400">{questionCount(courseModule.quizBank.length)}</p>
                </div>
                {adding === false && (
                  <button
                    type="button"
                    onClick={() => startNew(courseModule.id)}
                    disabled={full || saving}
                    aria-label={`Add a question to ${courseModule.title}`}
                    className="inline-flex shrink-0 items-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    <Plus aria-hidden="true" className="w-4 h-4" />
                    {full ? `${QUESTIONS_PER_MODULE} questions: the limit` : 'Add a question'}
                  </button>
                )}
              </div>

              {courseModule.quizBank.length > 0 && (
                <ol className="space-y-3">
                  {courseModule.quizBank.map((question, index) => (
                    <li key={question.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
                      {editing !== null && editing.questionId === question.id ? (
                        form(`Edit question ${index + 1}`, false)
                      ) : (
                        <>
                          <QuestionCard question={question} number={index + 1} />
                          {confirmingId === question.id ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                              <span>Delete this question? This cannot be undone.</span>
                              <button
                                type="button"
                                onClick={() => remove(question)}
                                disabled={busyId !== null}
                                className="py-2 px-3 rounded-xl text-sm font-medium text-red-300 border border-red-400/30 hover:bg-red-400/10 disabled:opacity-50"
                              >
                                {busyId === question.id ? 'Deleting...' : 'Yes, delete it'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingId(null)}
                                disabled={busyId !== null}
                                className={PLAIN_BUTTON}
                              >
                                Keep it
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(question)}
                                disabled={saving}
                                aria-label={`Edit question ${index + 1}`}
                                className={PLAIN_BUTTON}
                              >
                                <Pencil aria-hidden="true" className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmingId(question.id);
                                  setNotice(null);
                                }}
                                disabled={busyId !== null}
                                aria-label={`Delete question ${index + 1}`}
                                className="inline-flex items-center gap-1.5 py-2 px-3 text-sm text-slate-400 hover:text-red-300 transition-colors disabled:opacity-50"
                              >
                                <Trash2 aria-hidden="true" className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              {adding && form(`New question in ${courseModule.title}`, true)}
            </section>
          );
        })}
    </div>
  );
}
