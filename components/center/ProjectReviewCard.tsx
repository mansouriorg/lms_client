'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Mail, MessageSquare, RotateCcw } from 'lucide-react';
import { mailHref } from '@/lib/academies';
import { apiErrorMessage } from '@/lib/api-error';
import { safeLink } from '@/lib/assignments';
import {
  type ReviewAnswer,
  type ReviewItem,
  FEEDBACK_MAX,
  readReview,
  reviewStatusLabel,
  sentAgain,
  studentName,
} from '@/lib/project-reviews';
import { timeAgo } from '@/lib/qa';
import { projectReviewsService } from '@/services/project-reviews.service';

const LINK = 'inline-flex items-center gap-1.5 font-medium text-indigo-300 hover:text-indigo-200 break-all';
const BADGES: Record<ReviewItem['status'], string> = {
  PENDING: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  APPROVED: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  NEEDS_WORK: 'text-red-300 bg-red-500/10 border-red-500/20',
};

// One project on the Projects page: who sent it for which course, the links,
// the brief, the last feedback, and the review (Approve, or Ask for changes
// with feedback). `now` is when the lists were loaded; `onReviewed` gets the
// saved project.
export default function ProjectReviewCard({
  item,
  now,
  onReviewed,
}: {
  item: ReviewItem;
  now: Date | null;
  onReviewed: (item: ReviewItem) => void;
}) {
  const waiting = item.status === 'PENDING';
  const [open, setOpen] = useState(waiting);
  const [feedback, setFeedback] = useState(waiting ? '' : (item.feedback ?? ''));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<ReviewAnswer | null>(null);

  const review = async (answer: ReviewAnswer) => {
    const read = readReview(answer, feedback);
    setError(read.error);
    if (read.payload === null) return;
    setSaving(answer);
    try {
      const saved = await projectReviewsService.review(item.id, read.payload);
      onReviewed(saved.submission);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save the review. Please try again.'));
    } finally {
      setSaving(null);
    }
  };

  const name = studentName(item.user);
  const mail = mailHref(item.user.email);
  const code = safeLink(item.repoUrl);
  const site = safeLink(item.liveUrl);
  const when = now === null ? '' : timeAgo(item.updatedAt, now);
  const fieldId = `feedback-${item.id}`;
  const length = feedback.trim().length;

  return (
    <li className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-base font-semibold text-white break-words">{name}</h3>
          <p className="text-sm text-slate-300 break-words">{item.stage.title}</p>
          {mail && (
            <a href={mail} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 break-all">
              <Mail aria-hidden="true" className="w-4 h-4 shrink-0" />
              {item.user.email}
            </a>
          )}
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${BADGES[item.status]}`}>
            {reviewStatusLabel(item.status)}
          </span>
          <span className="text-xs text-slate-500">
            {waiting ? (sentAgain(item) ? 'Sent again' : 'Sent') : 'Reviewed'} {when}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {code ? (
          <a href={code} target="_blank" rel="noopener noreferrer nofollow" className={LINK}>
            <ExternalLink aria-hidden="true" className="w-4 h-4 shrink-0" />
            Code<span className="sr-only"> of {name} (opens in a new tab)</span>
          </a>
        ) : (
          <span className="text-slate-400 break-all">Code: {item.repoUrl}</span>
        )}
        {site && (
          <a href={site} target="_blank" rel="noopener noreferrer nofollow" className={LINK}>
            <ExternalLink aria-hidden="true" className="w-4 h-4 shrink-0" />
            Site<span className="sr-only"> of {name} (opens in a new tab)</span>
          </a>
        )}
      </div>

      {item.stage.projectBrief === null ? (
        <p className="text-xs text-slate-500">This course has no project any more.</p>
      ) : (
        <details className="text-sm">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">What the student had to build</summary>
          <p className="mt-2 text-slate-300 whitespace-pre-line break-words">{item.stage.projectBrief}</p>
        </details>
      )}

      {item.feedback && waiting === false && open === false && (
        <div className="p-3 rounded-xl border border-slate-700 bg-slate-800/40 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-slate-200">
            <MessageSquare aria-hidden="true" className="w-4 h-4 shrink-0" />
            Feedback
          </p>
          <p className="mt-1 text-slate-300 whitespace-pre-line break-words">{item.feedback}</p>
        </div>
      )}

      {waiting && item.feedback && (
        <p className="text-xs text-slate-400 whitespace-pre-line break-words">
          <span className="font-medium text-slate-300">Your last feedback:</span> {item.feedback}
        </p>
      )}

      {open ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor={fieldId} className="text-sm font-medium text-slate-300">
              Feedback for {name}{' '}
              <span className="font-normal text-slate-500">(needed to ask for changes)</span>
            </label>
            <textarea
              id={fieldId}
              rows={3}
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setError('');
              }}
              aria-invalid={error !== '' ? true : undefined}
              aria-describedby={error !== '' ? `${fieldId}-error` : undefined}
              placeholder="What is good, what to change, how to test it."
              className={`block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-y ${
                error !== '' ? 'border-red-500/60' : 'border-slate-700'
              }`}
            />
            <p className={`text-right text-xs ${length > FEEDBACK_MAX ? 'text-red-400' : 'text-slate-500'}`}>
              {length} / {FEEDBACK_MAX}
            </p>
            {error && (
              <p id={`${fieldId}-error`} role="alert" className="flex items-start gap-1.5 text-sm text-red-400">
                <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => review('APPROVED')}
              disabled={saving !== null}
              aria-label={`Approve the project of ${name}`}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-60"
            >
              <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
              {saving === 'APPROVED' ? 'Saving...' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={() => review('NEEDS_WORK')}
              disabled={saving !== null}
              aria-label={`Ask ${name} for changes`}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-amber-200 border border-amber-500/40 hover:bg-amber-500/10 transition-colors disabled:opacity-60"
            >
              <RotateCcw aria-hidden="true" className="w-4 h-4" />
              {saving === 'NEEDS_WORK' ? 'Saving...' : 'Ask for changes'}
            </button>
            {waiting === false && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError('');
                  setFeedback(item.feedback ?? '');
                }}
                className="py-2 px-4 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="py-2 px-3 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          Change the review
        </button>
      )}
    </li>
  );
}
