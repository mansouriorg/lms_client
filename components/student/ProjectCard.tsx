'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, MessageSquare, Send } from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type LinkErrors,
  type MyProject,
  type ProjectState,
  type Submission,
  LINK_MAX,
  canSend,
  projectState,
  readProjectLinks,
  safeLink,
  sentLabel,
  stateLabel,
} from '@/lib/assignments';
import { assignmentsService } from '@/services/assignments.service';

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const BADGES: Record<ProjectState, string> = {
  'needs-work': 'text-red-300 bg-red-500/10 border-red-500/20',
  'to-send': 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  waiting: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  approved: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};
const LINK = 'inline-flex items-center gap-1.5 font-medium text-indigo-300 hover:text-indigo-200 break-all';

// One project of the Assignments page: what to build, what was sent, the
// academy's feedback, and the form to send (again). `onSent` gets the saved
// submission.
export default function ProjectCard({ project, onSent }: { project: MyProject; onSent: (submission: Submission) => void }) {
  const state = projectState(project);
  const submission = project.submission;
  const id = project.course.id;
  // The form is open for a project to send or to change; closed otherwise
  const [open, setOpen] = useState(state === 'to-send' || state === 'needs-work');
  const [repoUrl, setRepoUrl] = useState(submission?.repoUrl ?? '');
  const [liveUrl, setLiveUrl] = useState(submission?.liveUrl ?? '');
  const [errors, setErrors] = useState<LinkErrors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState('');

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const read = readProjectLinks({ repoUrl, liveUrl });
    setErrors(read.errors);
    setSendError('');
    setDone('');
    if (read.links === null) return;
    setSending(true);
    try {
      const answer = await assignmentsService.send(id, read.links);
      setDone(answer.message);
      setOpen(false);
      onSent(answer.submission);
    } catch (error) {
      setSendError(apiErrorMessage(error, 'Could not send your project. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const code = safeLink(submission?.repoUrl ?? null);
  const site = safeLink(submission?.liveUrl ?? null);

  return (
    <li className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white break-words">{project.course.title}</h2>
          {project.course.center && <p className="text-sm text-slate-400">{project.course.center.name}</p>}
        </div>
        <span className={`self-start shrink-0 px-2.5 py-1 rounded-lg border text-xs font-medium ${BADGES[state]}`}>
          {stateLabel(state)}
        </span>
      </div>

      {project.brief === null ? (
        <p className="text-sm text-slate-400">The academy removed this project. What you sent stays here.</p>
      ) : (
        <div>
          <h3 className="text-sm font-medium text-slate-200">What to build</h3>
          <p className="mt-1 text-sm text-slate-300 whitespace-pre-line break-words">{project.brief}</p>
        </div>
      )}

      {submission && (
        <div className="space-y-1.5 text-sm">
          <p className="flex items-center gap-1.5 text-slate-400">
            <Clock aria-hidden="true" className="w-4 h-4 shrink-0" />
            {sentLabel(submission)}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {code ? (
              <a href={code} target="_blank" rel="noopener noreferrer nofollow" className={LINK}>
                <ExternalLink aria-hidden="true" className="w-4 h-4 shrink-0" />
                Your code<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-slate-500 break-all">Code: {submission.repoUrl}</span>
            )}
            {site && (
              <a href={site} target="_blank" rel="noopener noreferrer nofollow" className={LINK}>
                <ExternalLink aria-hidden="true" className="w-4 h-4 shrink-0" />
                Your site<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      )}

      {submission?.feedback && (
        <div
          className={`p-3 rounded-xl border text-sm ${
            state === 'needs-work' ? 'border-red-500/20 bg-red-500/5' : 'border-slate-700 bg-slate-800/40'
          }`}
        >
          <h3 className="flex items-center gap-1.5 font-medium text-slate-200">
            <MessageSquare aria-hidden="true" className="w-4 h-4 shrink-0" />
            Feedback from the academy
          </h3>
          <p className="mt-1 text-slate-300 whitespace-pre-line break-words">{submission.feedback}</p>
        </div>
      )}

      {state === 'approved' && (
        <p className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 aria-hidden="true" className="w-4 h-4 shrink-0" />
          Your project is approved. Well done.
        </p>
      )}

      {done && (
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 aria-hidden="true" className="w-4 h-4 shrink-0" />
          {done}
        </p>
      )}

      {canSend(project) && open === false && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDone('');
          }}
          className="inline-flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          {state === 'needs-work' ? 'Send a new version' : 'Change the links'}
        </button>
      )}

      {canSend(project) && open && (
        <form noValidate onSubmit={send} aria-label={`Send the project of ${project.course.title}`} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label htmlFor={`repo-${id}`} className="text-sm font-medium text-slate-300">
              Link to your code
            </label>
            <input
              id={`repo-${id}`}
              type="url"
              inputMode="url"
              value={repoUrl}
              maxLength={LINK_MAX}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setErrors({});
              }}
              placeholder="https://github.com/you/project"
              aria-invalid={errors.repoUrl !== undefined}
              aria-describedby={errors.repoUrl ? `repo-${id}-error` : undefined}
              className={`${FIELD} ${errors.repoUrl ? 'border-red-500/60' : 'border-slate-700'}`}
            />
            <FieldError id={`repo-${id}-error`} text={errors.repoUrl} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`site-${id}`} className="text-sm font-medium text-slate-300">
              Link to the running site <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id={`site-${id}`}
              type="url"
              inputMode="url"
              value={liveUrl}
              maxLength={LINK_MAX}
              onChange={(e) => {
                setLiveUrl(e.target.value);
                setErrors({});
              }}
              placeholder="https://your-project.example.com"
              aria-invalid={errors.liveUrl !== undefined}
              aria-describedby={errors.liveUrl ? `site-${id}-error` : undefined}
              className={`${FIELD} ${errors.liveUrl ? 'border-red-500/60' : 'border-slate-700'}`}
            />
            <FieldError id={`site-${id}-error`} text={errors.liveUrl} />
          </div>
          {sendError && (
            <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              {sendError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-60"
            >
              <Send aria-hidden="true" className="w-4 h-4" />
              {sending ? 'Sending...' : submission ? 'Send again' : 'Send the project'}
            </button>
            {submission && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setErrors({});
                  setSendError('');
                }}
                className="py-2.5 px-4 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </li>
  );
}
