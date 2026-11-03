// Live sessions (/student/bookings): mentoring calls and webinars with an
// academy. The shapes the API sends (the /bookings routes), and the checks of
// the request form (the same as the API's, so most mistakes are shown before
// anything is sent).
// The file has no imports, so `pnpm test` can run it with Node directly.

export type SessionType = 'MENTORSHIP' | 'WEBINAR';
// PAID means the academy confirmed the session.
export type SessionStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

// GET /bookings/instructors: who the student can book.
export type Instructor = {
  id: string;
  firstName: string;
  lastName: string;
  center: { id: string; name: string } | null;
};

// GET /bookings/my-bookings
export type StudentSession = {
  id: string;
  title: string;
  type: SessionType;
  status: SessionStatus;
  // The day, at 00:00 UTC
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  instructor: Instructor | null;
};

export type SessionValues = {
  instructorId: string;
  type: SessionType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};
export type SessionErrors = Partial<Record<keyof SessionValues, string>>;

export const TITLE_MAX = 120;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function sessionTypeLabel(type: SessionType): string {
  return type === 'WEBINAR' ? 'Webinar' : 'Mentoring call';
}

export function sessionStatusLabel(status: SessionStatus): string {
  if (status === 'PAID') return 'Confirmed';
  if (status === 'PENDING') return 'Waiting for the academy';
  if (status === 'REFUNDED') return 'Cancelled and refunded';
  return 'Cancelled';
}

// "Sami Trabelsi - Code Academy"
export function instructorLabel(instructor: Instructor | null): string {
  if (instructor === null) return 'Academy';
  const name = `${instructor.firstName} ${instructor.lastName}`.trim();
  return instructor.center ? `${name} - ${instructor.center.name}` : name;
}

// "2026-11-05T00:00:00.000Z" -> "2026-11-05"
export function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

// "2026-11-05T00:00:00.000Z" -> "Thursday 5 November 2026"
export function formatDay(iso: string): string {
  const when = new Date(`${dayOf(iso)}T00:00:00.000Z`);
  if (Number.isNaN(when.getTime())) return '';
  // Built from parts: browsers do not all put the same commas in a full date
  const name = (options: Intl.DateTimeFormatOptions) =>
    when.toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
  return `${name({ weekday: 'long' })} ${when.getUTCDate()} ${name({ month: 'long' })} ${when.getUTCFullYear()}`;
}

// What sorting needs: the status, the day and the start time (used for the
// student's list and for the academy's).
type SessionTime = Pick<StudentSession, 'status' | 'date' | 'startTime'>;

// Still to come (asked or confirmed, today or later), the soonest first;
// the others (past or cancelled), the most recent first.
export function splitSessions<T extends SessionTime>(
  sessions: T[],
  today: string,
): { upcoming: T[]; others: T[] } {
  const key = (session: T) => `${dayOf(session.date)} ${session.startTime}`;
  const isUpcoming = (session: T) =>
    (session.status === 'PENDING' || session.status === 'PAID') && dayOf(session.date) >= today;
  return {
    upcoming: sessions.filter(isUpcoming).sort((a, b) => key(a).localeCompare(key(b))),
    others: sessions
      .filter((session) => isUpcoming(session) === false)
      .sort((a, b) => key(b).localeCompare(key(a))),
  };
}

// A link to open the meeting: http(s) only; a link saved without
// "https://" gets it. null for anything else.
export function meetingHref(link: string | null | undefined): string | null {
  const value = (link ?? '').trim();
  if (value === '') return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  return `https://${value.replace(/^\/+/, '')}`;
}

// The values to send (POST /bookings), or the errors to show.
export function readSessionForm(
  values: SessionValues,
  today: string,
): { errors: SessionErrors; payload: SessionValues | null } {
  const payload = { ...values, title: values.title.trim() };
  const errors: SessionErrors = {};
  if (payload.instructorId === '') errors.instructorId = 'Please choose who you want to meet.';
  if (payload.title === '') errors.title = 'Please give the session a title.';
  else if (payload.title.length > TITLE_MAX)
    errors.title = `The title can have at most ${TITLE_MAX} characters.`;
  if (DAY.test(payload.date) === false) errors.date = 'Please choose a day.';
  else if (payload.date < today) errors.date = 'Please choose a day that is not past.';
  if (TIME.test(payload.startTime) === false) errors.startTime = 'Please choose a start time.';
  if (TIME.test(payload.endTime) === false) errors.endTime = 'Please choose an end time.';
  else if (errors.startTime === undefined && payload.endTime <= payload.startTime)
    errors.endTime = 'The session must end after it starts.';
  return { errors, payload: Object.keys(errors).length === 0 ? payload : null };
}

// A session the student can still cancel: asked or confirmed, not past.
export function canCancel(session: SessionTime, today: string): boolean {
  return (session.status === 'PENDING' || session.status === 'PAID') && dayOf(session.date) >= today;
}

// Today in the student's time zone, as "2026-11-05".
export function todayIn(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- The academy side (/center/bookings) ---

// GET /bookings/instructor/my-sessions: a session a student asked this admin
// for, with how to reach the student.
export type SessionStudent = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};
export type HostedSession = Omit<StudentSession, 'instructor'> & {
  user: SessionStudent | null;
};

// What the academy does with a session (PATCH /bookings/:id/status):
// confirm it (PAID) or cancel it.
export type SessionAnswer = 'PAID' | 'CANCELLED';

export const MEETING_LINK_MAX = 500;

// "Amira Ben Ali", or the email when the name is empty
export function studentLabel(student: SessionStudent | null): string {
  if (student === null) return 'A student';
  const name = `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim();
  return name === '' ? student.email : name;
}

// Requests to answer and confirmed sessions to come (the soonest first);
// the others (past or cancelled), the most recent first.
export function groupHostedSessions(
  sessions: HostedSession[],
  today: string,
): { requests: HostedSession[]; confirmed: HostedSession[]; others: HostedSession[] } {
  const { upcoming, others } = splitSessions(sessions, today);
  return {
    requests: upcoming.filter((session) => session.status === 'PENDING'),
    confirmed: upcoming.filter((session) => session.status === 'PAID'),
    others,
  };
}

// The status of a past or cancelled session, for the academy
export function pastStatusLabel(status: SessionStatus): string {
  if (status === 'PAID') return 'Past';
  if (status === 'PENDING') return 'Not answered';
  return sessionStatusLabel(status);
}

// The meeting link typed by the academy: a web address ("meet.google.com/x"
// gets "https://"), or nothing when it can come later (`required` false).
export function readMeetingLink(
  value: string,
  required: boolean,
): { link: string | null; error: string } {
  const text = value.trim();
  if (text === '') return { link: null, error: required ? 'Please enter the meeting link.' : '' };
  const link = meetingHref(text);
  if (link === null || /\s/.test(text) || /^https?:\/\/[^/?#]+\.[^/?#]+/i.test(link) === false) {
    return {
      link: null,
      error: 'Please enter a web address, for example https://meet.google.com/abc-defg-hij.',
    };
  }
  if (link.length > MEETING_LINK_MAX) {
    return { link: null, error: `The link can have at most ${MEETING_LINK_MAX} characters.` };
  }
  return { link, error: '' };
}
