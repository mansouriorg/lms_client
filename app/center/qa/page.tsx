'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, MessageCircle, RotateCcw, Search, Send } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type InboxFilter,
  type InboxQuestion,
  TEXT_MAX,
  authorName,
  canAccept,
  filterInbox,
  inboxCounts,
  isAcademyStaff,
  readAnswer,
  timeAgo,
  waitsForAcademy,
} from '@/lib/qa';
import { useSession } from '@/lib/use-session';
import { announceWorkChanged } from '@/lib/work-counts';
import { qaService } from '@/services/qa.service';

type Notice = { tone: 'success' | 'error'; text: string };

const FILTERS: { value: InboxFilter; label: string; empty: string }[] = [
  { value: 'waiting', label: 'Waiting for an answer', empty: 'Nothing is waiting for an answer from the academy.' },
  { value: 'open', label: 'Not resolved', empty: 'Every question is resolved.' },
  { value: 'all', label: 'All', empty: 'No question matches your search.' },
];

// The questions students ask under the lessons of the academy's courses
// (GET /questions/inbox), to answer them as the academy and, when it helps,
// mark the answer that solves the question.
export default function CenterQuestionsPage() {
  const { user } = useSession();
  const viewer = user === null ? null : { id: user.id, role: user.role };

  const [questions, setQuestions] = useState<InboxQuestion[] | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<InboxFilter>('waiting');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [answerError, setAnswerError] = useState('');

  useEffect(() => {
    let active = true;
    qaService.inbox().then(
      (list) => {
        if (active) {
          setQuestions(list);
          setNow(new Date());
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the questions. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const counts = useMemo(() => inboxCounts(questions ?? []), [questions]);
  const visible = useMemo(() => filterInbox(questions ?? [], filter, query), [questions, filter, query]);

  const postAnswer = async (questionId: string) => {
    const { error, body } = readAnswer(answer);
    setAnswerError(error ?? '');
    if (error !== null) return;
    setBusy(`answer:${questionId}`);
    try {
      await qaService.answer(questionId, body);
      setAnsweringId(null);
      setAnswer('');
      setNotice({ tone: 'success', text: 'Your answer is posted. The student sees it under the lesson.' });
      setReloadKey((key) => key + 1);
      // The number next to Student questions in the menu counts again
      announceWorkChanged();
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
      announceWorkChanged();
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not accept this answer. Please try again.') });
    } finally {
      setBusy(null);
    }
  };

  const emptyText = FILTERS.find((option) => option.value === filter)?.empty ?? '';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Student questions</h1>
        <p className="text-sm text-slate-400 mt-1">
          The questions students ask under the lessons of your courses. Answer them as the academy.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div role="group" aria-label="Which questions" className="flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                filter === option.value
                  ? 'text-white bg-indigo-600 border-indigo-500'
                  : 'text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {option.label} ({counts[option.value]})
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <label htmlFor="qa-search" className="sr-only">
            Search the questions
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search aria-hidden="true" className="h-4 w-4 text-slate-500" />
          </div>
          <input
            id="qa-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Course, lesson, student or words"
            className="block w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
          />
        </div>
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

      {questions === null && loadError === '' && (
        <p role="status" className="text-sm text-slate-400 py-8 text-center">
          Loading the questions...
        </p>
      )}

      {questions !== null && visible.length === 0 && (
        <div className="p-10 text-center rounded-3xl bg-slate-900/50 border border-slate-800">
          <MessageCircle aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">
            {questions.length === 0 ? 'No questions from your students yet.' : emptyText}
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <ul className="space-y-4">
          {visible.map((question) => {
            const waiting = waitsForAcademy(question);
            return (
              <li key={question.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs text-indigo-300">
                    {question.lesson?.module.stage.title ?? 'Course'} - {question.lesson?.title ?? 'Lesson'}
                  </p>
                  {question.resolved ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  ) : waiting ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      <Clock aria-hidden="true" className="w-3.5 h-3.5" />
                      Waiting for the academy
                    </span>
                  ) : null}
                </div>
                <h2 className="font-semibold text-white leading-snug">{question.title}</h2>
                <p className="text-sm text-slate-300 whitespace-pre-line">{question.body}</p>
                <p className="text-xs text-slate-500">
                  {authorName(question.user)}
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
                              {busy === `accept:${reply.id}` ? 'Saving...' : 'Mark as the accepted answer'}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {answeringId === question.id ? (
                  <div className="space-y-2">
                    <label htmlFor={`inbox-answer-${question.id}`} className="text-xs font-medium text-slate-300">
                      Answer as the academy
                    </label>
                    <textarea
                      id={`inbox-answer-${question.id}`}
                      rows={4}
                      value={answer}
                      maxLength={TEXT_MAX}
                      onChange={(e) => setAnswer(e.target.value)}
                      autoFocus
                      className={`block w-full px-3 py-2 bg-slate-800/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-y ${
                        answerError ? 'border-red-500/60' : 'border-slate-700'
                      }`}
                      placeholder="Explain the answer, or point to the part of the lesson that covers it."
                    />
                    {answerError && (
                      <p role="alert" className="flex items-start gap-1.5 text-xs text-red-400">
                        <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        {answerError}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => postAnswer(question.id)}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-60"
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
                        className="py-2 px-3 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
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
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-60"
                  >
                    <MessageCircle aria-hidden="true" className="w-4 h-4" />
                    Answer
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
