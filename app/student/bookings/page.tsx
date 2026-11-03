'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RotateCcw,
  Video,
} from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type Instructor,
  type SessionErrors,
  type SessionValues,
  type StudentSession,
  TITLE_MAX,
  canCancel,
  formatDay,
  instructorLabel,
  meetingHref,
  readSessionForm,
  sessionStatusLabel,
  sessionTypeLabel,
  splitSessions,
  todayIn,
} from '@/lib/sessions';
import { sessionsService } from '@/services/sessions.service';

type Notice = { tone: 'success' | 'error'; text: string };

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';

const STATUS_STYLE: Record<string, string> = {
  PAID: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  CANCELLED: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  REFUNDED: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

function emptyForm(instructors: Instructor[]): SessionValues {
  return {
    instructorId: instructors.length === 1 ? instructors[0].id : '',
    type: 'MENTORSHIP',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
  };
}

// Live sessions: the student asks an admin of the academy of one of their
// courses for a mentoring call or a webinar, follows their requests, joins
// the meeting once it is confirmed, and can cancel (the /bookings routes).
export default function StudentBookingsPage() {
  const [sessions, setSessions] = useState<StudentSession[] | null>(null);
  const [instructors, setInstructors] = useState<Instructor[] | null>(null);
  const [today, setToday] = useState('');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<SessionValues>(emptyForm([]));
  const [errors, setErrors] = useState<SessionErrors>({});
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([sessionsService.mine(), sessionsService.instructors()]).then(
      ([mine, people]) => {
        if (active) {
          setSessions(mine);
          setInstructors(people);
          setToday(todayIn(new Date()));
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load your live sessions. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const change = (field: keyof SessionValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const openForm = () => {
    setValues(emptyForm(instructors ?? []));
    setErrors({});
    setNotice(null);
    setFormOpen(true);
  };

  const send = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { errors: found, payload } = readSessionForm(values, today);
    setErrors(found);
    if (payload === null) return;
    setSending(true);
    setNotice(null);
    try {
      await sessionsService.request(payload);
      const who = instructors?.find((person) => person.id === payload.instructorId) ?? null;
      setFormOpen(false);
      setNotice({
        tone: 'success',
        text: `Request sent to ${instructorLabel(who)}. You will see here when the academy confirms it.`,
      });
      setReloadKey((key) => key + 1);
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not send your request. Please try again.') });
    } finally {
      setSending(false);
    }
  };

  const cancel = async (sessionId: string) => {
    setBusyId(sessionId);
    setNotice(null);
    try {
      await sessionsService.cancel(sessionId);
      setConfirmingId(null);
      setNotice({ tone: 'success', text: 'The session is cancelled.' });
      setReloadKey((key) => key + 1);
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not cancel this session. Please try again.') });
    } finally {
      setBusyId(null);
    }
  };

  const loaded = sessions !== null && instructors !== null;
  const { upcoming, others } = splitSessions(sessions ?? [], today);
  const fieldClass = (field: keyof SessionValues) =>
    `${FIELD} ${errors[field] ? 'border-red-500/60' : 'border-slate-700'}`;
  const describedBy = (field: keyof SessionValues, id: string) => (errors[field] ? `${id}-error` : undefined);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Live sessions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Ask the academy of your courses for a mentoring call or a webinar.
          </p>
        </div>
        {loaded && instructors.length > 0 && formOpen === false && (
          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            Request a session
          </button>
        )}
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
          Loading your live sessions...
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

      {loaded && instructors.length === 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-1">Sessions are with your academies</h2>
          <p className="text-sm text-slate-400 mb-4">
            Once an academy confirms your payment for one of its courses, you can ask its team for a
            mentoring call or a webinar here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Browse courses
          </Link>
        </div>
      )}

      {/* The request form */}
      {loaded && formOpen && (
        <form
          onSubmit={send}
          noValidate
          aria-labelledby="request-title"
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5"
        >
          <h2 id="request-title" className="text-lg font-semibold text-white">
            Request a session
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="session-instructor" className="text-sm font-medium text-slate-300">
                With
              </label>
              <select
                id="session-instructor"
                value={values.instructorId}
                onChange={(e) => change('instructorId', e.target.value)}
                aria-invalid={errors.instructorId !== undefined}
                aria-describedby={describedBy('instructorId', 'session-instructor')}
                className={fieldClass('instructorId')}
              >
                <option value="">Choose who you want to meet</option>
                {instructors.map((person) => (
                  <option key={person.id} value={person.id}>
                    {instructorLabel(person)}
                  </option>
                ))}
              </select>
              <FieldError id="session-instructor-error" text={errors.instructorId} />
            </div>
            <div className="space-y-2">
              <label htmlFor="session-type" className="text-sm font-medium text-slate-300">
                Kind of session
              </label>
              <select
                id="session-type"
                value={values.type}
                onChange={(e) => change('type', e.target.value)}
                className={fieldClass('type')}
              >
                <option value="MENTORSHIP">{sessionTypeLabel('MENTORSHIP')}</option>
                <option value="WEBINAR">{sessionTypeLabel('WEBINAR')}</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="session-title" className="text-sm font-medium text-slate-300">
                What do you want to talk about?
              </label>
              <input
                id="session-title"
                value={values.title}
                onChange={(e) => change('title', e.target.value)}
                maxLength={TITLE_MAX}
                placeholder="For example: a review of my final project"
                aria-invalid={errors.title !== undefined}
                aria-describedby={describedBy('title', 'session-title')}
                className={fieldClass('title')}
              />
              <FieldError id="session-title-error" text={errors.title} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="session-date" className="text-sm font-medium text-slate-300">
                Day
              </label>
              <input
                id="session-date"
                type="date"
                min={today}
                value={values.date}
                onChange={(e) => change('date', e.target.value)}
                aria-invalid={errors.date !== undefined}
                aria-describedby={describedBy('date', 'session-date')}
                className={fieldClass('date')}
              />
              <FieldError id="session-date-error" text={errors.date} />
            </div>
            <div className="space-y-2">
              <label htmlFor="session-start" className="text-sm font-medium text-slate-300">
                From
              </label>
              <input
                id="session-start"
                type="time"
                value={values.startTime}
                onChange={(e) => change('startTime', e.target.value)}
                aria-invalid={errors.startTime !== undefined}
                aria-describedby={describedBy('startTime', 'session-start')}
                className={fieldClass('startTime')}
              />
              <FieldError id="session-start-error" text={errors.startTime} />
            </div>
            <div className="space-y-2">
              <label htmlFor="session-end" className="text-sm font-medium text-slate-300">
                To
              </label>
              <input
                id="session-end"
                type="time"
                value={values.endTime}
                onChange={(e) => change('endTime', e.target.value)}
                aria-invalid={errors.endTime !== undefined}
                aria-describedby={describedBy('endTime', 'session-end')}
                className={fieldClass('endTime')}
              />
              <FieldError id="session-end-error" text={errors.endTime} />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            The academy confirms the session and adds the meeting link, or cancels it.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              <CalendarCheck aria-hidden="true" className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send the request'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={sending}
              className="py-2.5 px-4 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Upcoming sessions */}
      {loaded && (instructors.length > 0 || sessions.length > 0) && (
        <section aria-labelledby="upcoming-title" className="space-y-3">
          <h2 id="upcoming-title" className="text-lg font-semibold text-white">
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <p className="p-6 text-sm text-slate-400 rounded-2xl bg-slate-900/50 border border-slate-800">
              No session planned. Request one to talk with your academy.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((session) => {
                const link = session.status === 'PAID' ? meetingHref(session.meetingLink) : null;
                return (
                  <li key={session.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-indigo-300">
                          {formatDay(session.date)}, {session.startTime} - {session.endTime}
                        </p>
                        <h3 className="font-semibold text-white mt-1">{session.title}</h3>
                        <p className="text-sm text-slate-400">
                          {sessionTypeLabel(session.type)} with {instructorLabel(session.instructor)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border ${STATUS_STYLE[session.status] ?? ''}`}
                      >
                        {session.status === 'PENDING' && <Clock aria-hidden="true" className="w-3.5 h-3.5" />}
                        {sessionStatusLabel(session.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                        >
                          <Video aria-hidden="true" className="w-4 h-4" />
                          Join the meeting
                          <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {session.status === 'PAID' && link === null && (
                        <p className="text-xs text-slate-400">The academy will add the meeting link.</p>
                      )}
                      {canCancel(session, today) &&
                        (confirmingId === session.id ? (
                          <span className="inline-flex flex-wrap items-center gap-2 text-sm text-slate-300">
                            Cancel this session?
                            <button
                              type="button"
                              onClick={() => cancel(session.id)}
                              disabled={busyId !== null}
                              className="py-1.5 px-3 rounded-lg text-sm font-medium text-red-300 border border-red-400/30 hover:bg-red-400/10 disabled:opacity-50"
                            >
                              {busyId === session.id ? 'Cancelling...' : 'Yes, cancel it'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              disabled={busyId !== null}
                              className="py-1.5 px-3 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-800"
                            >
                              Keep it
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(session.id)}
                            className="text-sm text-slate-400 hover:text-red-300 transition-colors"
                          >
                            Cancel
                          </button>
                        ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Past and cancelled sessions */}
      {loaded && others.length > 0 && (
        <section aria-labelledby="past-title" className="space-y-3">
          <h2 id="past-title" className="text-lg font-semibold text-white">
            Past and cancelled
          </h2>
          <ul className="divide-y divide-slate-800 rounded-2xl bg-slate-900/50 border border-slate-800">
            {others.map((session) => (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{session.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDay(session.date)}, {session.startTime} - {session.endTime} -{' '}
                    {instructorLabel(session.instructor)}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {session.status === 'PAID' || session.status === 'PENDING'
                    ? 'Past'
                    : sessionStatusLabel(session.status)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
