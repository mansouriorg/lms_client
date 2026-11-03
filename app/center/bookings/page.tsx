'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Link2,
  Mail,
  Phone,
  RotateCcw,
  Video,
} from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { mailHref, phoneHref } from '@/lib/academies';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type HostedSession,
  type SessionAnswer,
  MEETING_LINK_MAX,
  formatDay,
  groupHostedSessions,
  meetingHref,
  pastStatusLabel,
  readMeetingLink,
  sessionTypeLabel,
  studentLabel,
  todayIn,
} from '@/lib/sessions';
import { announceWorkChanged } from '@/lib/work-counts';
import { academySessionsService } from '@/services/academy-sessions.service';

type Notice = { tone: 'success' | 'error'; text: string };
// What the admin is doing with one session: confirming it (with an optional
// link), adding or changing its link, declining it, or cancelling it.
type Step = { id: string; kind: 'confirm' | 'link' | 'decline' | 'cancel' };

const FIELD =
  'block w-full min-w-0 px-3 py-2 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const PLAIN_BUTTON =
  'py-2 px-3 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50';

function Count({ value }: { value: number }) {
  return (
    <span className="min-w-6 px-2 py-0.5 rounded-full text-xs font-semibold text-center text-slate-300 bg-slate-800 border border-slate-700">
      {value}
    </span>
  );
}

// Live sessions, the academy side: the mentoring calls and webinars students
// asked this admin for. The admin confirms a request (with the meeting link,
// now or later) or declines it, and can cancel a confirmed session.
export default function CenterBookingsPage() {
  const [sessions, setSessions] = useState<HostedSession[] | null>(null);
  const [today, setToday] = useState('');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [step, setStep] = useState<Step | null>(null);
  const [link, setLink] = useState('');
  const [linkError, setLinkError] = useState<string | undefined>(undefined);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let active = true;
    academySessionsService.hosted().then(
      (list) => {
        if (active) {
          setSessions(list);
          setToday(todayIn(new Date()));
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the live sessions. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const begin = (session: HostedSession, kind: Step['kind']) => {
    setStep({ id: session.id, kind });
    setLink(session.meetingLink ?? '');
    setLinkError(undefined);
    setNotice(null);
  };

  // Send the answer, then load the list again either way: the student may
  // have cancelled the session in the meantime.
  const save = async (session: HostedSession, status: SessionAnswer, meetingLink: string | null, done: string) => {
    setBusyId(session.id);
    setNotice(null);
    try {
      await academySessionsService.answer(session.id, status, meetingLink);
      setStep(null);
      setNotice({ tone: 'success', text: done });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not save this change. Please try again.') });
    } finally {
      setBusyId(null);
      setReloadKey((key) => key + 1);
      // The number next to Live sessions in the menu counts again
      announceWorkChanged();
    }
  };

  // Confirm a request (the link can come later), or save the link of a
  // confirmed session (then it is needed).
  const submitLink = async (event: React.FormEvent<HTMLFormElement>, session: HostedSession) => {
    event.preventDefault();
    const confirming = session.status === 'PENDING';
    const read = readMeetingLink(link, confirming === false);
    if (read.error !== '') {
      setLinkError(read.error);
      return;
    }
    const who = studentLabel(session.user);
    let done = `Meeting link saved. ${who} can join from their Live sessions page.`;
    if (confirming) {
      done =
        read.link === null
          ? `Session confirmed. ${who} sees it in their Live sessions; add the meeting link before it starts.`
          : `Session confirmed. ${who} can join it from their Live sessions page.`;
    }
    await save(session, 'PAID', read.link, done);
  };

  const loaded = sessions !== null;
  const { requests, confirmed, others } = groupHostedSessions(sessions ?? [], today);

  const card = (session: HostedSession) => {
    const who = studentLabel(session.user);
    const email = session.user ? mailHref(session.user.email ?? '') : null;
    const phone = session.user?.phone ? phoneHref(session.user.phone) : null;
    const joinHref = session.status === 'PAID' ? meetingHref(session.meetingLink) : null;
    const mine = step !== null && step.id === session.id ? step.kind : null;
    const busy = busyId === session.id;
    const inputId = `meeting-link-${session.id}`;

    return (
      <li key={session.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-indigo-300">
              {formatDay(session.date)}, {session.startTime} - {session.endTime}
            </p>
            <h3 className="font-semibold text-white mt-1 break-words">{session.title}</h3>
            <p className="text-sm text-slate-400">
              {sessionTypeLabel(session.type)} with {who}
            </p>
          </div>
          {session.status === 'PENDING' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border text-amber-400 bg-amber-500/10 border-amber-500/20">
              <Clock aria-hidden="true" className="w-3.5 h-3.5" />
              To answer
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
              Confirmed
            </span>
          )}
        </div>

        {(email || phone) && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {email && (
              <a href={email} className="inline-flex items-center gap-1.5 min-w-0 text-slate-300 hover:text-white break-all">
                <Mail aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" />
                {session.user?.email}
              </a>
            )}
            {phone && (
              <a href={phone} className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white">
                <Phone aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" />
                {session.user?.phone}
              </a>
            )}
          </div>
        )}

        {(mine === 'confirm' || mine === 'link') && (
          <form onSubmit={(event) => submitLink(event, session)} noValidate className="space-y-2">
            <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
              {mine === 'confirm' ? 'Meeting link (you can also add it later)' : 'Meeting link'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id={inputId}
                type="url"
                inputMode="url"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setLinkError(undefined);
                }}
                maxLength={MEETING_LINK_MAX}
                placeholder="https://meet.google.com/abc-defg-hij"
                aria-invalid={linkError !== undefined}
                aria-describedby={linkError ? `${inputId}-error` : undefined}
                className={`${FIELD} sm:flex-1 ${linkError ? 'border-red-500/60' : 'border-slate-700'}`}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <Check aria-hidden="true" className="w-4 h-4" />
                  {busy ? 'Saving...' : mine === 'confirm' ? 'Confirm the session' : 'Save the link'}
                </button>
                <button type="button" onClick={() => setStep(null)} disabled={busy} className={PLAIN_BUTTON}>
                  Back
                </button>
              </div>
            </div>
            <FieldError id={`${inputId}-error`} text={linkError} />
          </form>
        )}

        {(mine === 'decline' || mine === 'cancel') && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span>
              {mine === 'decline' ? 'Decline this request?' : 'Cancel this session?'} {who} will see it as
              cancelled.
            </span>
            <button
              type="button"
              onClick={() =>
                save(
                  session,
                  'CANCELLED',
                  null,
                  mine === 'decline' ? `The request of ${who} is declined.` : `The session with ${who} is cancelled.`,
                )
              }
              disabled={busy}
              className="py-2 px-3 rounded-xl text-sm font-medium text-red-300 border border-red-400/30 hover:bg-red-400/10 disabled:opacity-50"
            >
              {busy ? 'Saving...' : mine === 'decline' ? 'Yes, decline it' : 'Yes, cancel it'}
            </button>
            <button type="button" onClick={() => setStep(null)} disabled={busy} className={PLAIN_BUTTON}>
              Keep it
            </button>
          </div>
        )}

        {mine === null && (
          <div className="flex flex-wrap items-center gap-3">
            {session.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  onClick={() => begin(session, 'confirm')}
                  disabled={busyId !== null}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  <CalendarCheck aria-hidden="true" className="w-4 h-4" />
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => begin(session, 'decline')}
                  disabled={busyId !== null}
                  className={PLAIN_BUTTON}
                >
                  Decline
                </button>
              </>
            )}
            {session.status === 'PAID' && (
              <>
                {joinHref ? (
                  <a
                    href={joinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                  >
                    <Video aria-hidden="true" className="w-4 h-4" />
                    Join the meeting
                    <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-amber-400">No meeting link yet.</span>
                )}
                <button
                  type="button"
                  onClick={() => begin(session, 'link')}
                  disabled={busyId !== null}
                  className={`inline-flex items-center gap-2 ${PLAIN_BUTTON}`}
                >
                  <Link2 aria-hidden="true" className="w-4 h-4" />
                  {joinHref ? 'Change the link' : 'Add the meeting link'}
                </button>
                <button
                  type="button"
                  onClick={() => begin(session, 'cancel')}
                  disabled={busyId !== null}
                  className="text-sm text-slate-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  Cancel the session
                </button>
              </>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Live sessions</h1>
        <p className="text-sm text-slate-400 mt-1">
          Mentoring calls and webinars your students asked you for. Confirm them with a meeting link, or
          decline them.
        </p>
      </div>

      {loadError && (
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

      {loaded === false && loadError === '' && (
        <p role="status" className="text-sm text-slate-400 py-8 text-center">
          Loading the live sessions...
        </p>
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

      {loaded && sessions.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-1">No session requests yet</h2>
          <p className="text-sm text-slate-400">
            Students who bought one of your courses can ask you for a mentoring call or a webinar from their
            Live sessions page. Their requests appear here.
          </p>
        </div>
      )}

      {loaded && sessions.length > 0 && (
        <>
          <section aria-labelledby="requests-title" className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 id="requests-title" className="text-lg font-semibold text-white">
                Requests to answer
              </h2>
              <Count value={requests.length} />
            </div>
            {requests.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 rounded-2xl bg-slate-900/50 border border-slate-800">
                No request is waiting for an answer.
              </p>
            ) : (
              <ul className="space-y-3">{requests.map(card)}</ul>
            )}
          </section>

          <section aria-labelledby="confirmed-title" className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 id="confirmed-title" className="text-lg font-semibold text-white">
                Confirmed
              </h2>
              <Count value={confirmed.length} />
            </div>
            {confirmed.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 rounded-2xl bg-slate-900/50 border border-slate-800">
                No confirmed session to come.
              </p>
            ) : (
              <ul className="space-y-3">{confirmed.map(card)}</ul>
            )}
          </section>

          {others.length > 0 && (
            <section aria-labelledby="past-title" className="space-y-3">
              <h2 id="past-title" className="text-lg font-semibold text-white">
                Past and cancelled
              </h2>
              <ul className="divide-y divide-slate-800 rounded-2xl bg-slate-900/50 border border-slate-800">
                {others.map((session) => (
                  <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 break-words">{session.title}</p>
                      <p className="text-xs text-slate-500">
                        {formatDay(session.date)}, {session.startTime} - {session.endTime} -{' '}
                        {studentLabel(session.user)}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{pastStatusLabel(session.status)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
