// The numbers of the menus: what waits for the academy (student questions,
// session requests, projects to review) and the projects a student has to
// change or send. What they show, what a screen reader hears, when they are
// counted again, and how a page tells the menu that the work changed.
// The file has no imports, so `pnpm test` can run it with Node directly.

// The browser event a page sends when the work to do changed
export const WORK_CHANGED = 'lms:work-changed';

// Tells the menu to count again (after an answer, a review, or a project sent)
export function announceWorkChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(WORK_CHANGED));
}

// 'questions': student questions with no answer from the academy;
// 'requests': live session requests to answer; 'to-review': projects
// students sent (academies); 'to-do': projects to change or send (students)
export type WorkKind = 'questions' | 'requests' | 'to-review' | 'to-do';

// A page change counts again only when the last count is older than this
// (an announced change always counts again)
export const RECOUNT_AFTER_MS = 30000;

// `askedAt`: when the number was last asked for (null: never, or the request
// was cancelled before its answer)
export function recountDue(askedAt: number | null, now: number): boolean {
  return askedAt === null || now - askedAt >= RECOUNT_AFTER_MS;
}

// The number shown: nothing for none (or while unknown), 99+ above 99
export function badgeText(count: number | null): string {
  if (count === null || count <= 0) return '';
  return count > 99 ? '99+' : String(count);
}

// What a screen reader hears after the name of the menu item
export function badgeHint(count: number, kind: WorkKind): string {
  const many = (one: string, several: string) => (count === 1 ? `1 ${one}` : `${count} ${several}`);
  if (kind === 'questions') return `${many('question', 'questions')} waiting for an answer`;
  if (kind === 'requests') return `${many('session request', 'session requests')} to answer`;
  if (kind === 'to-review') return `${many('project', 'projects')} waiting for a review`;
  return `${many('project', 'projects')} to change or send`;
}

// What the dot on the phone menu button counts: the numbers known so far
// (null while none is known)
export function totalOf(counts: (number | null)[]): number | null {
  const known = counts.filter((count): count is number => count !== null);
  return known.length === 0 ? null : known.reduce((sum, count) => sum + count, 0);
}
