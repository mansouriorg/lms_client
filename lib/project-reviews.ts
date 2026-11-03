// The academy's Projects page (/center/projects): the projects students sent
// for the courses of the academy (every academy for a platform admin), the
// ones to review and the ones reviewed recently, and the checks of a review
// (the same as the API's GradeSubmissionDto).
// The file has no imports, so `pnpm test` can run it with Node directly.

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'NEEDS_WORK';

// GET /project-submissions/admin/pending and /admin/reviewed
export type ReviewItem = {
  id: string;
  stageId: string;
  repoUrl: string;
  liveUrl: string | null;
  status: ReviewStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  stage: { id: string; title: string; projectBrief: string | null };
};

export type ReviewAnswer = 'APPROVED' | 'NEEDS_WORK';
export type ReviewPayload = { status: ReviewAnswer; feedback?: string };

export const FEEDBACK_MAX = 2000;

export function studentName(user: Pick<ReviewItem['user'], 'firstName' | 'lastName' | 'email'>): string {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name === '' ? user.email : name;
}

export function reviewStatusLabel(status: ReviewStatus): string {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'NEEDS_WORK') return 'Needs work';
  return 'Waiting for review';
}

// Sent again after "Needs work": the project was changed after it was first
// sent (more than a minute later)
export function sentAgain(item: Pick<ReviewItem, 'createdAt' | 'updatedAt' | 'status'>): boolean {
  const created = new Date(item.createdAt).getTime();
  const updated = new Date(item.updatedAt).getTime();
  return item.status === 'PENDING' && updated - created > 60000;
}

// The review to send, or why it cannot be sent: asking for changes needs
// feedback, and feedback has at most 2000 characters
export function readReview(answer: ReviewAnswer, text: string): { error: string; payload: ReviewPayload | null } {
  const feedback = text.trim();
  if (feedback.length > FEEDBACK_MAX) {
    return { error: `The feedback can have at most ${FEEDBACK_MAX} characters (now ${feedback.length}).`, payload: null };
  }
  if (answer === 'NEEDS_WORK' && feedback === '') {
    return { error: 'Say what to change: feedback is needed when you ask for changes.', payload: null };
  }
  return { error: '', payload: feedback === '' ? { status: answer } : { status: answer, feedback } };
}

// The two lists after a review: the project leaves "To review" (and its old
// place in "Reviewed") and goes first in "Reviewed"
export function afterReview(
  lists: { pending: ReviewItem[]; reviewed: ReviewItem[] },
  item: ReviewItem,
): { pending: ReviewItem[]; reviewed: ReviewItem[] } {
  return {
    pending: lists.pending.filter((other) => other.id !== item.id),
    reviewed: [item, ...lists.reviewed.filter((other) => other.id !== item.id)],
  };
}

// Search by student (name or email) or course, every word must match
export function filterReviews(items: ReviewItem[], query: string): ReviewItem[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter((word) => word !== '');
  if (words.length === 0) return items;
  return items.filter((item) => {
    const text = `${studentName(item.user)} ${item.user.email} ${item.stage.title}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}
