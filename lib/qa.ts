// Questions and answers under a lesson, in the course player
// (/student/courses/[id]): what GET /questions/lesson/:lessonId sends, the
// forms (the same limits as the API) and small helpers. The file has no
// imports, so `pnpm test` can run it with Node directly.

export type QaAuthor = { firstName: string | null; lastName: string | null; role?: string };

export type QaReply = {
  id: string;
  body: string;
  isAcceptedAnswer: boolean;
  userId: string;
  createdAt: string;
  user: QaAuthor | null;
};

export type QaQuestion = {
  id: string;
  title: string;
  body: string;
  resolved: boolean;
  userId: string;
  createdAt: string;
  user: QaAuthor | null;
  replies: QaReply[];
};

export const TITLE_MIN = 5;
export const TITLE_MAX = 150;
export const TEXT_MAX = 5000;

// "Amira B.": the first name and the first letter of the last name.
export function authorName(user: QaAuthor | null): string {
  const first = (user?.firstName ?? '').trim();
  const last = (user?.lastName ?? '').trim();
  if (first === '') return last === '' ? 'A student' : last;
  return last === '' ? first : `${first} ${last.charAt(0).toUpperCase()}.`;
}

// Answers from the academy (its admins) get a label.
export function isAcademyStaff(user: QaAuthor | null): boolean {
  return user?.role === 'CENTER_ADMIN' || user?.role === 'SUPER_ADMIN';
}

// "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago", then the date.
export function timeAgo(iso: string, now: Date): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function questionCount(count: number): string {
  if (count === 0) return 'No questions yet';
  return count === 1 ? '1 question' : `${count} questions`;
}

export type QuestionFormValues = { title: string; body: string };
export type QuestionFormErrors = Partial<Record<'title' | 'body', string>>;

export function readQuestionForm(values: QuestionFormValues): {
  errors: QuestionFormErrors;
  payload: QuestionFormValues | null;
} {
  const errors: QuestionFormErrors = {};
  const title = values.title.trim();
  const body = values.body.trim();
  if (title === '') errors.title = 'Give your question a short title.';
  else if (title.length < TITLE_MIN) errors.title = `The title needs at least ${TITLE_MIN} characters.`;
  else if (title.length > TITLE_MAX) errors.title = `The title can have at most ${TITLE_MAX} characters.`;
  if (body === '') errors.body = 'Describe your question: what you tried, and what happened.';
  else if (body.length > TEXT_MAX) errors.body = `Your question can have at most ${TEXT_MAX} characters.`;
  return Object.keys(errors).length > 0 ? { errors, payload: null } : { errors, payload: { title, body } };
}

export function readAnswer(text: string): { error: string | null; body: string } {
  const body = text.trim();
  if (body === '') return { error: 'Write your answer first.', body };
  if (body.length > TEXT_MAX) return { error: `Your answer can have at most ${TEXT_MAX} characters.`, body };
  return { error: null, body };
}

// Like the API: the author of the question (or an admin) accepts an answer
// that is not accepted yet.
export function canAccept(
  question: Pick<QaQuestion, 'userId'>,
  reply: Pick<QaReply, 'isAcceptedAnswer'>,
  viewer: { id: string; role: string } | null,
): boolean {
  if (viewer === null || reply.isAcceptedAnswer) return false;
  return question.userId === viewer.id || viewer.role === 'CENTER_ADMIN' || viewer.role === 'SUPER_ADMIN';
}

// GET /questions/inbox (academy admins): a question with its lesson and course.
export type InboxQuestion = QaQuestion & {
  lesson: { id: string; title: string; module: { stage: { id: string; title: string } } } | null;
};

export type InboxFilter = 'waiting' | 'open' | 'all';

// Waiting for the academy: not resolved, and no answer from the academy yet.
export function waitsForAcademy(question: Pick<QaQuestion, 'resolved' | 'replies'>): boolean {
  return question.resolved === false && question.replies.some((reply) => isAcademyStaff(reply.user)) === false;
}

// The inbox list: 'waiting' for the academy, 'open' (not resolved) or 'all';
// the search looks in the course, the lesson, the question and the student.
export function filterInbox(questions: InboxQuestion[], filter: InboxFilter, query: string): InboxQuestion[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  return questions.filter((question) => {
    if (filter === 'waiting' && waitsForAcademy(question) === false) return false;
    if (filter === 'open' && question.resolved) return false;
    const searchable = [
      question.title,
      question.body,
      question.lesson?.title ?? '',
      question.lesson?.module.stage.title ?? '',
      authorName(question.user),
    ]
      .join(' ')
      .toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
}

export function inboxCounts(questions: InboxQuestion[]): Record<InboxFilter, number> {
  return {
    waiting: questions.filter((question) => waitsForAcademy(question)).length,
    open: questions.filter((question) => question.resolved === false).length,
    all: questions.length,
  };
}
