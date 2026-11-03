'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, MessageCircle, RotateCcw, Send } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type QaQuestion,
  type QuestionFormErrors,
  TEXT_MAX,
  TITLE_MAX,
  authorName,
  canAccept,
  isAcademyStaff,
  questionCount,
  readAnswer,
  readQuestionForm,
  timeAgo,
} from '@/lib/qa';
import { useSession } from '@/lib/use-session';
import { qaService } from '@/services/qa.service';

type Notice = { tone: 'success' | 'error'; text: string };

const FIELD =
  'block w-full px-3 py-2 bg-slate-800/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const PRIMARY =
  'inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const SECONDARY =
  'inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50';

function border(error: string | undefined | null): string {
  return error ? 'border-red-500/60' : 'border-slate-700';
}

function ErrorLine({ id, text }: { id?: string; text: string | undefined | null }) {
  if (text === undefined || text === null || text === '') return null;
  return (
    <p id={id} role="alert" className="flex items-start gap-1.5 text-xs text-red-400">
      <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      {text}
    </p>
  );
}

// The questions and answers of one lesson, under its video. The parent gives
// it a `key` per lesson, so that changing lesson starts from an empty panel.
// After each post the list is read again from the API.
export default function LessonQuestions({ lessonId }: { lessonId: string }) {
  const { user } = useSession();
  const viewer = user === null ? null : { id: user.id, role: user.role };

  const [questions, setQuestions] = useState<QaQuestion[] | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [asking, setAsking] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '' });
  const [draftErrors, setDraftErrors] = useState<QuestionFormErrors>({});
  const [askError, setAskError] = useState('');

  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');

  useEffect(() => {
    let active = true;
    qaService.list(lessonId).then(
      (list) => {
        if (active) {
          setQuestions(list);
          setNow(new Date());
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the questions of this lesson.'));
      },
    );
    return () => {
      active = false;
    };
  }, [lessonId, reloadKey]);

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    const { errors, payload } = readQuestionForm(draft);
    setDraftErrors(errors);
    setAskError('');
    if (payload === null) return;
    setBusy('ask');
    try {
      await qaService.ask(lessonId, payload.title, payload.body);
      setAsking(false);
      setDraft({ title: '', body: '' });
      setNotice({ tone: 'success', text: 'Your question is posted. You will see the answers here.' });
      setReloadKey((key) => key + 1);
    } catch (error) {
      setAskError(apiErrorMessage(error, 'Could not post your question. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const postAnswer = async (questionId: string) => {
    const { error, body } = readAnswer(answer);
    setAnswerError(error ?? '');
    if (error !== null) return;
    setBusy(`answer:${questionId}`);
    try {
      await qaService.answer(questionId, body);
      setAnsweringId(null);
      setAnswer('');
      setNotice({ tone: 'success', text: 'Your answer is posted.' });
      setReloadKey((key) => key + 1);
    } catch (error) {
      setAnswerError(apiErrorMessage(error, 'Could not post your answer. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const accept = async (questionId: string, replyId: string) => {
    setBusy(`accept:${replyId}`);
    setNotice(null);
    try {
      await qaService.accept(questionId, replyId);
      setNotice({ tone: 'success', text: 'Answer accepted: the question is marked as resolved.' });
      setReloadKey((key) => key + 1);
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not accept this answer. Please try again.') });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-labelledby="qa-title" className="pt-6 mt-2 border-t border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="qa-title" className="flex items-center gap-2 text-lg font-semibold text-white">
            <MessageCircle aria-hidden="true" className="w-5 h-5 text-indigo-400" />
            Questions about this lesson
          </h3>
          {questions !== null && <p className="text-xs text-slate-500 mt-0.5">{questionCount(questions.length)}</p>}
        </div>
        {asking === false && (
          <button
            type="button"
            onClick={() => {
              setAsking(true);
              setNotice(null);
            }}
            className={SECONDARY}
          >
            Ask a question
          </button>
        )}
      </div>

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

      {asking && (
        <form
          onSubmit={ask}
          noValidate
          className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
        >
          <div className="space-y-1">
            <label htmlFor="qa-title-input" className="text-xs font-medium text-slate-300">
              Your question in one line
            </label>
            <input
              id="qa-title-input"
              type="text"
              value={draft.title}
              maxLength={TITLE_MAX}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              autoFocus
              aria-invalid={draftErrors.title ? true : undefined}
              aria-describedby={draftErrors.title ? 'qa-title-error' : undefined}
              className={`${FIELD} ${border(draftErrors.title)}`}
              placeholder="For example: Why does my counter skip a number?"
            />
            <ErrorLine id="qa-title-error" text={draftErrors.title} />
          </div>
          <div className="space-y-1">
            <label htmlFor="qa-body-input" className="text-xs font-medium text-slate-300">
              Details
            </label>
            <textarea
              id="qa-body-input"
              rows={4}
              value={draft.body}
              maxLength={TEXT_MAX}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              aria-invalid={draftErrors.body ? true : undefined}
              aria-describedby={draftErrors.body ? 'qa-body-error' : undefined}
              className={`${FIELD} ${border(draftErrors.body)} resize-y`}
              placeholder="What you tried, what you expected, and what happened."
            />
            <ErrorLine id="qa-body-error" text={draftErrors.body} />
          </div>
          <ErrorLine text={askError} />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy !== null} className={PRIMARY}>
              <Send aria-hidden="true" className="w-4 h-4" />
              {busy === 'ask' ? 'Posting...' : 'Post the question'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAsking(false);
                setDraftErrors({});
                setAskError('');
              }}
              disabled={busy !== null}
              className={SECONDARY}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-400">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => {
              setLoadError('');
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {questions === null && loadError === '' && (
        <p role="status" className="text-sm text-slate-500">
          Loading the questions...
        </p>
      )}

      {questions !== null && questions.length === 0 && asking === false && (
        <p className="text-sm text-slate-400">
          Stuck on something in this lesson? Ask the academy and the other students.
        </p>
      )}

      {questions !== null && questions.length > 0 && (
        <ul className="space-y-3">
          {questions.map((question) => (
            <li key={question.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-white leading-snug">{question.title}</h4>
                {question.resolved && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-line">{question.body}</p>
              <p className="text-xs text-slate-500">
                {authorName(question.user)}
                {viewer !== null && question.userId === viewer.id ? ' (you)' : ''}
                {now ? ` - ${timeAgo(question.createdAt, now)}` : ''}
              </p>

              {question.replies.length > 0 && (
                <ul className="space-y-2 pl-3 border-l-2 border-slate-800">
                  {question.replies.map((reply) => (
                    <li
                      key={reply.id}
                      className={`p-3 rounded-xl space-y-1.5 ${
                        reply.isAcceptedAnswer ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-slate-800/40'
                      }`}
                    >
                      {reply.isAcceptedAnswer && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
                          Accepted answer
                        </p>
                      )}
                      <p className="text-sm text-slate-200 whitespace-pre-line">{reply.body}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-slate-500">
                          {authorName(reply.user)}
                          {isAcademyStaff(reply.user) && (
                            <>
                              {' '}
                              <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">Academy</span>
                            </>
                          )}
                          {now ? ` - ${timeAgo(reply.createdAt, now)}` : ''}
                        </p>
                        {canAccept(question, reply, viewer) && (
                          <button
                            type="button"
                            onClick={() => accept(question.id, reply.id)}
                            disabled={busy !== null}
                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-60"
                          >
                            {busy === `accept:${reply.id}`
                              ? 'Saving...'
                              : question.resolved
                                ? 'Accept this answer instead'
                                : 'Accept this answer'}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {answeringId === question.id ? (
                <div className="space-y-2">
                  <label htmlFor={`qa-answer-${question.id}`} className="sr-only">
                    Your answer to {question.title}
                  </label>
                  <textarea
                    id={`qa-answer-${question.id}`}
                    rows={3}
                    value={answer}
                    maxLength={TEXT_MAX}
                    onChange={(e) => setAnswer(e.target.value)}
                    autoFocus
                    className={`${FIELD} ${border(answerError)} resize-y`}
                    placeholder="Share what worked for you."
                  />
                  <ErrorLine text={answerError} />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => postAnswer(question.id)}
                      disabled={busy !== null}
                      className={PRIMARY}
                    >
                      <Send aria-hidden="true" className="w-4 h-4" />
                      {busy === `answer:${question.id}` ? 'Posting...' : 'Post the answer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnsweringId(null);
                        setAnswerError('');
                      }}
                      disabled={busy !== null}
                      className={SECONDARY}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAnsweringId(question.id);
                    setAnswer('');
                    setAnswerError('');
                    setNotice(null);
                  }}
                  disabled={busy !== null}
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-60"
                >
                  Answer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
