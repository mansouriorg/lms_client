'use client';

import { useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Pencil,
  PlayCircle,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { videoSource } from '@/lib/learning';
import {
  type LessonFormErrors,
  type LessonFormValues,
  type LessonPayload,
  type ProgramLesson,
  type ProgramModule,
  canMove,
  emptyLessonForm,
  isWebAddress,
  lessonFormFrom,
  programSummary,
  readLessonForm,
  titleError,
  videoKindName,
} from '@/lib/program';
import { courseAdminService } from '@/services/course-admin.service';
import { programService } from '@/services/program.service';

type Notice = { tone: 'success' | 'error'; text: string };

const FIELD =
  'block w-full px-3 py-2 bg-slate-800/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const PRIMARY =
  'inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const SECONDARY =
  'inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

function border(error: string | undefined): string {
  return error ? 'border-red-500/60' : 'border-slate-700';
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// "YouTube video", "No video"...: what the player will show for the lesson.
function lessonVideoName(lesson: ProgramLesson): string {
  return videoKindName(videoSource(lesson.videoUrl)?.kind ?? null);
}

function FieldError({ id, error }: { id: string; error: string | undefined }) {
  if (error === undefined) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
      {error}
    </p>
  );
}

// The result of the last change, shown where the admin is working.
function NoticeLine({ notice }: { notice: Notice | null }) {
  if (notice === null) return null;
  const error = notice.tone === 'error';
  return (
    <p
      role={error ? 'alert' : 'status'}
      className={`flex items-start gap-2 text-sm ${error ? 'text-red-400' : 'text-emerald-400'}`}
    >
      {error ? (
        <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
      )}
      {notice.text}
    </p>
  );
}

// A small button with an icon; the label is its name for screen readers.
function IconButton({
  label,
  onClick,
  disabled,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger ? 'text-slate-400 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function ModuleTitleForm({
  initial,
  submitLabel,
  saving,
  notice,
  onSubmit,
  onCancel,
}: {
  initial: string;
  submitLabel: string;
  saving: boolean;
  notice: Notice | null;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial);
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = titleError(title, 'module');
    setError(problem ?? undefined);
    if (problem === null) onSubmit(title.trim());
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      noValidate
      className="space-y-2"
    >
      <label htmlFor="module-title" className="text-xs font-medium text-slate-300">
        Module title
      </label>
      <input
        id="module-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'module-title-error' : undefined}
        className={`${FIELD} ${border(error)}`}
        placeholder="For example: Getting started"
      />
      <FieldError id="module-title-error" error={error} />
      <NoticeLine notice={notice} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={PRIMARY}>
          <Save aria-hidden="true" className="w-4 h-4" />
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={SECONDARY}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function LessonForm({
  initial,
  submitLabel,
  cancelLabel,
  saving,
  notice,
  onSubmit,
  onCancel,
}: {
  initial: LessonFormValues;
  submitLabel: string;
  cancelLabel: string;
  saving: boolean;
  notice: Notice | null;
  onSubmit: (lesson: LessonPayload) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<LessonFormErrors>({});
  const update = (field: keyof LessonFormValues, value: string) => setValues({ ...values, [field]: value });

  const link = values.videoUrl.trim();
  const videoHelp =
    link === ''
      ? 'Optional: a YouTube or Vimeo link, or a link to a video file (.mp4).'
      : isWebAddress(link)
        ? `Students will see: ${videoKindName(videoSource(link)?.kind ?? null)}.`
        : 'Paste the full link, starting with https://';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { errors: found, payload } = readLessonForm(values);
    setErrors(found);
    if (payload !== null) onSubmit(payload);
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      noValidate
      className="space-y-3 p-4 bg-slate-900/60"
    >
      <div className="space-y-1">
        <label htmlFor="lesson-title" className="text-xs font-medium text-slate-300">
          Lesson title
        </label>
        <input
          id="lesson-title"
          type="text"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          autoFocus
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? 'lesson-title-error' : undefined}
          className={`${FIELD} ${border(errors.title)}`}
          placeholder="For example: Your first component"
        />
        <FieldError id="lesson-title-error" error={errors.title} />
      </div>

      <div className="space-y-1">
        <label htmlFor="lesson-video" className="text-xs font-medium text-slate-300">
          Video link
        </label>
        <input
          id="lesson-video"
          type="url"
          inputMode="url"
          value={values.videoUrl}
          onChange={(e) => update('videoUrl', e.target.value)}
          aria-invalid={errors.videoUrl ? true : undefined}
          aria-describedby={errors.videoUrl ? 'lesson-video-error lesson-video-help' : 'lesson-video-help'}
          className={`${FIELD} ${border(errors.videoUrl)}`}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p id="lesson-video-help" className="text-xs text-slate-400">
          {videoHelp}
        </p>
        <FieldError id="lesson-video-error" error={errors.videoUrl} />
      </div>

      <div className="space-y-1 max-w-[200px]">
        <label htmlFor="lesson-duration" className="text-xs font-medium text-slate-300">
          Length in minutes
        </label>
        <input
          id="lesson-duration"
          type="text"
          inputMode="numeric"
          value={values.duration}
          onChange={(e) => update('duration', e.target.value)}
          aria-invalid={errors.duration ? true : undefined}
          aria-describedby={errors.duration ? 'lesson-duration-error' : undefined}
          className={`${FIELD} ${border(errors.duration)}`}
          placeholder="12"
        />
        <FieldError id="lesson-duration-error" error={errors.duration} />
      </div>

      <div className="space-y-1">
        <label htmlFor="lesson-description" className="text-xs font-medium text-slate-300">
          Notes for students
        </label>
        <textarea
          id="lesson-description"
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className={`${FIELD} border-slate-700 resize-y`}
          placeholder="Optional: what the lesson covers, links to the slides or the exercise."
        />
      </div>

      <NoticeLine notice={notice} />
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={PRIMARY}>
          <Save aria-hidden="true" className="w-4 h-4" />
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={SECONDARY}>
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}

function ConfirmDelete({
  question,
  warning,
  deleting,
  notice,
  onConfirm,
  onCancel,
}: {
  question: string;
  warning: string;
  deleting: boolean;
  notice: Notice | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="m-3 p-3 space-y-2 rounded-xl border border-red-500/30 bg-red-500/10">
      <p className="text-sm text-slate-200">{question}</p>
      {warning && <p className="text-xs text-amber-300">{warning}</p>}
      <NoticeLine notice={notice} />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className="py-2 px-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-60"
        >
          {deleting ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button type="button" onClick={onCancel} disabled={deleting} className={SECONDARY}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// The program of a course in its editor: add, rename, move and delete modules;
// add, edit, move and delete lessons. One form or confirmation is open at a
// time (`openKey`, for example "edit-lesson:<id>"). After each change the
// program is read again from the API, which numbers modules and lessons.
export default function ProgramEditor({
  courseId,
  modules,
  soldCount,
  onChange,
}: {
  courseId: string;
  modules: ProgramModule[];
  soldCount: number;
  onChange: (modules: ProgramModule[]) => void;
}) {
  const [openKey, setOpenKey] = useState('');
  // Changes for every saved form, so that "Add the lesson" starts empty again
  const [round, setRound] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  // Buttons work when nothing is saving and no form is open
  const idle = busy === null && openKey === '';

  const open = (key: string) => {
    setOpenKey(key);
    setNotice(null);
  };
  const close = () => {
    setOpenKey('');
    setNotice(null);
  };

  // `next` says which form stays open after the change (none by default).
  const run = async (
    key: string,
    change: () => Promise<void>,
    done: string,
    next: (fresh: ProgramModule[]) => string = () => '',
  ) => {
    setBusy(key);
    setNotice(null);
    try {
      await change();
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not save this change. Please try again.') });
      setBusy(null);
      return;
    }
    try {
      const course = await courseAdminService.get(courseId);
      onChange(course.modules);
      setOpenKey(next(course.modules));
      setRound((value) => value + 1);
      setNotice({ tone: 'success', text: done });
    } catch {
      setOpenKey('');
      setNotice({ tone: 'error', text: `${done} Reload the page to see the change.` });
    } finally {
      setBusy(null);
    }
  };

  const panelNotice = openKey === '' ? null : notice;
  const lostProgress = (what: string) =>
    soldCount > 0
      ? `${plural(soldCount, 'student')} bought this course: their progress and questions on ${what} are deleted too.`
      : '';

  return (
    <section
      aria-labelledby="program-title"
      className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4"
    >
      <div>
        <h2 id="program-title" className="text-lg font-semibold text-white">
          Program
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {programSummary(modules)}. Students follow the modules and lessons in this order.
        </p>
      </div>

      {openKey === '' && <NoticeLine notice={notice} />}

      {modules.length === 0 && (
        <p className="p-4 text-sm text-slate-400 rounded-2xl border border-dashed border-slate-700">
          No modules yet. A module groups lessons: for example Getting started, then The basics.
        </p>
      )}

      {modules.length > 0 && (
        <ol className="space-y-3">
          {modules.map((courseModule, moduleIndex) => {
            const moduleKey = courseModule.id;
            const lessonTotal = courseModule.lessons.length;
            return (
              <li key={moduleKey} className="rounded-2xl border border-slate-800 overflow-hidden">
                {openKey === `rename-module:${moduleKey}` ? (
                  <div className="px-4 py-3 bg-slate-800/40">
                    <ModuleTitleForm
                      initial={courseModule.title}
                      submitLabel="Rename"
                      saving={busy !== null}
                      notice={panelNotice}
                      onSubmit={(title) =>
                        run(`rename-module:${moduleKey}`, () => programService.renameModule(moduleKey, title), 'Module renamed.')
                      }
                      onCancel={close}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/40">
                    <h3 className="flex-1 min-w-0 text-sm font-semibold text-white">
                      <span className="text-slate-400 font-normal">Module {moduleIndex + 1}: </span>
                      {courseModule.title}
                    </h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <IconButton
                        label={`Move ${courseModule.title} up`}
                        disabled={idle === false || canMove(moduleIndex, modules.length, 'up') === false}
                        onClick={() =>
                          run(`move-module:${moduleKey}`, () => programService.moveModule(moduleKey, 'up'), 'Module moved up.')
                        }
                      >
                        <ArrowUp aria-hidden="true" className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        label={`Move ${courseModule.title} down`}
                        disabled={idle === false || canMove(moduleIndex, modules.length, 'down') === false}
                        onClick={() =>
                          run(`move-module:${moduleKey}`, () => programService.moveModule(moduleKey, 'down'), 'Module moved down.')
                        }
                      >
                        <ArrowDown aria-hidden="true" className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        label={`Rename ${courseModule.title}`}
                        disabled={idle === false}
                        onClick={() => open(`rename-module:${moduleKey}`)}
                      >
                        <Pencil aria-hidden="true" className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        label={`Delete ${courseModule.title}`}
                        disabled={idle === false}
                        danger
                        onClick={() => open(`delete-module:${moduleKey}`)}
                      >
                        <Trash2 aria-hidden="true" className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                )}

                {openKey === `delete-module:${moduleKey}` && (
                  <ConfirmDelete
                    question={`Delete the module "${courseModule.title}" and its ${plural(lessonTotal, 'lesson')}?`}
                    warning={lessonTotal > 0 ? lostProgress('these lessons') : ''}
                    deleting={busy !== null}
                    notice={panelNotice}
                    onConfirm={() =>
                      run(`delete-module:${moduleKey}`, () => programService.removeModule(moduleKey), 'Module deleted.')
                    }
                    onCancel={close}
                  />
                )}

                <ul className="divide-y divide-slate-800">
                  {courseModule.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id}>
                      {openKey === `edit-lesson:${lesson.id}` ? (
                        <LessonForm
                          initial={lessonFormFrom(lesson)}
                          submitLabel="Save the lesson"
                          cancelLabel="Cancel"
                          saving={busy !== null}
                          notice={panelNotice}
                          onSubmit={(payload) =>
                            run(`edit-lesson:${lesson.id}`, () => programService.updateLesson(lesson.id, payload), 'Lesson saved.')
                          }
                          onCancel={close}
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-2.5">
                          <PlayCircle aria-hidden="true" className="w-4 h-4 text-slate-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 truncate">{lesson.title}</p>
                            <p className="text-xs">
                              <span className={lesson.videoUrl ? 'text-slate-500' : 'text-amber-300'}>
                                {lessonVideoName(lesson)}
                              </span>
                              {lesson.duration !== null && (
                                <span className="text-slate-500"> - {lesson.duration} min</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <IconButton
                              label={`Move ${lesson.title} up`}
                              disabled={idle === false || canMove(lessonIndex, lessonTotal, 'up') === false}
                              onClick={() =>
                                run(`move-lesson:${lesson.id}`, () => programService.moveLesson(lesson.id, 'up'), 'Lesson moved up.')
                              }
                            >
                              <ArrowUp aria-hidden="true" className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                              label={`Move ${lesson.title} down`}
                              disabled={idle === false || canMove(lessonIndex, lessonTotal, 'down') === false}
                              onClick={() =>
                                run(`move-lesson:${lesson.id}`, () => programService.moveLesson(lesson.id, 'down'), 'Lesson moved down.')
                              }
                            >
                              <ArrowDown aria-hidden="true" className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                              label={`Edit ${lesson.title}`}
                              disabled={idle === false}
                              onClick={() => open(`edit-lesson:${lesson.id}`)}
                            >
                              <Pencil aria-hidden="true" className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                              label={`Delete ${lesson.title}`}
                              disabled={idle === false}
                              danger
                              onClick={() => open(`delete-lesson:${lesson.id}`)}
                            >
                              <Trash2 aria-hidden="true" className="w-4 h-4" />
                            </IconButton>
                          </div>
                        </div>
                      )}
                      {openKey === `delete-lesson:${lesson.id}` && (
                        <ConfirmDelete
                          question={`Delete the lesson "${lesson.title}"?`}
                          warning={lostProgress('this lesson')}
                          deleting={busy !== null}
                          notice={panelNotice}
                          onConfirm={() =>
                            run(`delete-lesson:${lesson.id}`, () => programService.removeLesson(lesson.id), 'Lesson deleted.')
                          }
                          onCancel={close}
                        />
                      )}
                    </li>
                  ))}
                  {lessonTotal === 0 && <li className="px-4 py-2.5 text-sm text-slate-500">No lessons yet.</li>}
                </ul>

                {openKey === `add-lesson:${moduleKey}` ? (
                  <div className="border-t border-slate-800">
                    <LessonForm
                      key={round}
                      initial={emptyLessonForm()}
                      submitLabel="Add the lesson"
                      cancelLabel="Done"
                      saving={busy !== null}
                      notice={panelNotice}
                      onSubmit={(payload) =>
                        run(
                          `add-lesson:${moduleKey}`,
                          () => programService.addLesson(moduleKey, payload),
                          `Lesson added to ${courseModule.title}. Add the next one, or choose Done.`,
                          () => `add-lesson:${moduleKey}`,
                        )
                      }
                      onCancel={close}
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => open(`add-lesson:${moduleKey}`)}
                      disabled={idle === false}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus aria-hidden="true" className="w-4 h-4" />
                      Add a lesson
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {openKey === 'add-module' ? (
        <div className="p-4 rounded-2xl border border-slate-800">
          <ModuleTitleForm
            initial=""
            submitLabel="Add the module"
            saving={busy !== null}
            notice={panelNotice}
            onSubmit={(title) =>
              run(
                'add-module',
                () => programService.addModule(courseId, title),
                'Module added. Add its first lesson.',
                // The new module is the last one: open its "Add a lesson" form
                (fresh) => (fresh.length > 0 ? `add-lesson:${fresh[fresh.length - 1].id}` : ''),
              )
            }
            onCancel={close}
          />
        </div>
      ) : (
        <button type="button" onClick={() => open('add-module')} disabled={idle === false} className={SECONDARY}>
          <Plus aria-hidden="true" className="w-4 h-4" />
          Add a module
        </button>
      )}
    </section>
  );
}
