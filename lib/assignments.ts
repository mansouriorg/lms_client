// The student's Assignments page (/student/project-submissions): the final
// projects of the courses they bought (GET /project-submissions/mine), what
// is left to do with each, and the checks of the sending form (the same as
// the API's CreateSubmissionDto).
// The file has no imports, so `pnpm test` can run it with Node directly.

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'NEEDS_WORK';

export type Submission = {
  id: string;
  stageId: string;
  repoUrl: string;
  liveUrl: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

// One course with a project. brief is null when the academy removed the
// project after the student sent it.
export type MyProject = {
  course: { id: string; title: string; center: { name: string } | null };
  brief: string | null;
  submission: Submission | null;
};

export type ProjectState = 'needs-work' | 'to-send' | 'waiting' | 'approved';

export const LINK_MAX = 500;

export function projectState(project: Pick<MyProject, 'submission'>): ProjectState {
  const status = project.submission?.status;
  if (status === undefined) return 'to-send';
  if (status === 'NEEDS_WORK') return 'needs-work';
  if (status === 'APPROVED') return 'approved';
  return 'waiting';
}

export function stateLabel(state: ProjectState): string {
  if (state === 'needs-work') return 'Needs work';
  if (state === 'to-send') return 'To send';
  if (state === 'waiting') return 'Waiting for review';
  return 'Approved';
}

const ORDER: ProjectState[] = ['needs-work', 'to-send', 'waiting', 'approved'];

// What needs the student first: changes asked, then projects not sent yet,
// then the ones waiting for a review, then the approved ones (each group in
// the order given)
export function sortProjects(projects: MyProject[]): MyProject[] {
  return ORDER.flatMap((state) => projects.filter((project) => projectState(project) === state));
}

export function projectCounts(projects: MyProject[]): Record<ProjectState, number> {
  const counts: Record<ProjectState, number> = { 'needs-work': 0, 'to-send': 0, waiting: 0, approved: 0 };
  for (const project of projects) counts[projectState(project)] += 1;
  return counts;
}

// A project can be sent (or sent again) while it is not approved and its
// course still has a project
export function canSend(project: MyProject): boolean {
  return project.brief !== null && projectState(project) !== 'approved';
}

// The Assignments card of the student Dashboard: the projects to change and
// to send (only the ones the student can send, what to change first), at
// most `limit`, and how many there are of each
export function assignmentsToDo(
  projects: MyProject[],
  limit: number,
): { shown: MyProject[]; toChange: number; toSend: number; waiting: number; approved: number } {
  const todo = sortProjects(projects).filter((project) => {
    const state = projectState(project);
    return canSend(project) && (state === 'needs-work' || state === 'to-send');
  });
  const counts = projectCounts(projects);
  return {
    shown: todo.slice(0, limit),
    toChange: todo.filter((project) => projectState(project) === 'needs-work').length,
    toSend: todo.filter((project) => projectState(project) === 'to-send').length,
    waiting: counts.waiting,
    approved: counts.approved,
  };
}

// The line under "Assignments" on the student Dashboard
export function assignmentsNote(todo: { toChange: number; toSend: number; waiting: number; approved: number }): string {
  const projects = (count: number) => (count === 1 ? '1 project' : `${count} projects`);
  if (todo.toChange > 0 && todo.toSend > 0) return `${projects(todo.toChange)} to change and ${todo.toSend} to send.`;
  if (todo.toChange > 0) return `${projects(todo.toChange)} to change: read the academy's feedback.`;
  if (todo.toSend > 0) return `${projects(todo.toSend)} to send.`;
  if (todo.waiting > 0) {
    return `Nothing to do: ${projects(todo.waiting)} ${todo.waiting === 1 ? 'waits' : 'wait'} for the academy's review.`;
  }
  if (todo.approved > 0) return 'Nothing to do: your projects are approved. Well done.';
  return 'Nothing to send for now.';
}

// A full https:// address with a domain name (like the API's IsUrl check)
export function isHttpsLink(text: string): boolean {
  if (/^https:\/\/[^\s/?#]+\.[a-z]{2,}([/?#:][^\s]*)?$/i.test(text) === false) return false;
  try {
    return new URL(text).protocol === 'https:';
  } catch {
    return false;
  }
}

// A link of the API to show as a link: only https:// addresses (an older
// project could hold anything)
export function safeLink(url: string | null): string | null {
  if (url === null) return null;
  return url.startsWith('https://') ? url : null;
}

export type LinkValues = { repoUrl: string; liveUrl: string };
export type LinkErrors = Partial<Record<keyof LinkValues, string>>;

// The links to send, or the errors to show
export function readProjectLinks(values: LinkValues): {
  errors: LinkErrors;
  links: { repoUrl: string; liveUrl?: string } | null;
} {
  const errors: LinkErrors = {};
  const repoUrl = values.repoUrl.trim();
  const liveUrl = values.liveUrl.trim();
  if (repoUrl === '') errors.repoUrl = 'Paste the link to your code.';
  else if (repoUrl.length > LINK_MAX) errors.repoUrl = `A link can have at most ${LINK_MAX} characters.`;
  else if (isHttpsLink(repoUrl) === false) {
    errors.repoUrl = 'Enter the full link to your code, starting with https:// (for example https://github.com/you/project).';
  }
  if (liveUrl.length > LINK_MAX) errors.liveUrl = `A link can have at most ${LINK_MAX} characters.`;
  else if (liveUrl !== '' && isHttpsLink(liveUrl) === false) {
    errors.liveUrl = 'Enter the full link to your site, starting with https://, or leave it empty.';
  }
  if (Object.keys(errors).length > 0) return { errors, links: null };
  return { errors, links: liveUrl === '' ? { repoUrl } : { repoUrl, liveUrl } };
}

// The project of a course, with the submission the API answered after sending
export function withSubmission(projects: MyProject[], submission: Submission): MyProject[] {
  return projects.map((project) =>
    project.course.id === submission.stageId ? { ...project, submission } : project,
  );
}

// "Sent on 2 November 2026" or "Sent again on ..." (in the time zone of the
// browser, or the one given)
export function sentLabel(submission: Pick<Submission, 'createdAt' | 'updatedAt' | 'status'>, timeZone?: string): string {
  const created = new Date(submission.createdAt);
  const updated = new Date(submission.updatedAt);
  if (Number.isNaN(updated.getTime())) return '';
  const day = (when: Date) =>
    when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone });
  if (submission.status === 'PENDING' && updated.getTime() - created.getTime() > 60000) {
    return `Sent again on ${day(updated)}`;
  }
  return `Sent on ${day(Number.isNaN(created.getTime()) ? updated : created)}`;
}
