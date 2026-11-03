// The academy Dashboard (/center/dashboard): numbers made from the lists the
// other admin pages load (orders, courses, live sessions, student questions,
// projects to review), so the Dashboard always agrees with those pages.
// Only type imports (Node removes them), so `pnpm test` can run it directly.
import type { ManagedCourse } from './course-admin';
import type { AdminOrder } from './orders';

// GET /orders/admin/all also sends the account of the buyer
export type DashboardOrder = AdminOrder & { userId?: string };

// "Recent" on the Dashboard: the last 30 days
export const RECENT_DAYS = 30;

export function daysBefore(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// Amounts in dinars, rounded to the millime (like lib/orders.ts)
function roundMillimes(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

function placedAt(order: Pick<AdminOrder, 'createdAt'>): number {
  return new Date(order.createdAt).getTime();
}

// The paid orders placed since `since`: how many, and their total
export function paidSince(orders: DashboardOrder[], since: Date): { total: number; count: number } {
  const matching = orders.filter((order) => order.status === 'PAID' && placedAt(order) >= since.getTime());
  const total = matching.reduce((sum, order) => sum + order.totalAmount, 0);
  return { total: roundMillimes(total), count: matching.length };
}

// The students with at least one paid order (each counted once), and the
// ones whose first paid order was placed since `since`
export function payingStudents(orders: DashboardOrder[], since: Date): { total: number; recent: number } {
  const firstOrder = new Map<string, number>();
  for (const order of orders) {
    if (order.status !== 'PAID') continue;
    const buyer = order.userId ?? order.user?.email ?? order.id;
    const known = firstOrder.get(buyer);
    if (known === undefined || placedAt(order) < known) firstOrder.set(buyer, placedAt(order));
  }
  const recent = [...firstOrder.values()].filter((time) => time >= since.getTime()).length;
  return { total: firstOrder.size, recent };
}

// Courses in the catalog (published, full or finished) and drafts.
// Cancelled courses are in neither.
export function catalogCounts(courses: Pick<ManagedCourse, 'status'>[]): { inCatalog: number; drafts: number } {
  return {
    inCatalog: courses.filter((course) => ['ACTIVE', 'FULL', 'COMPLETED'].includes(course.status)).length,
    drafts: courses.filter((course) => course.status === 'DRAFT').length,
  };
}

// The courses with the most students first (then by title), at most `limit`.
// `students` gives the paid enrollments of a course (see lib/course-admin.ts).
export function topCourses<T extends Pick<ManagedCourse, 'title'>>(
  courses: T[],
  students: (course: T) => number,
  limit: number,
): T[] {
  return [...courses]
    .sort((a, b) => students(b) - students(a) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

// The newest orders first, at most `limit`
export function latestOrders<T extends Pick<AdminOrder, 'createdAt'>>(orders: T[], limit: number): T[] {
  return [...orders].sort((a, b) => placedAt(b) - placedAt(a)).slice(0, limit);
}

// The notes under the numbers. `money` formats an amount (lib/format.ts).
export function salesNote(recent: { total: number; count: number }, money: (amount: number) => string): string {
  if (recent.count === 0) return `No paid order placed in the last ${RECENT_DAYS} days`;
  return `${money(recent.total)} from orders of the last ${RECENT_DAYS} days`;
}

export function studentsNote(recent: number): string {
  if (recent === 0) return `No new student in the last ${RECENT_DAYS} days`;
  return `${recent} new in the last ${RECENT_DAYS} days`;
}

export function coursesNote(drafts: number): string {
  if (drafts === 0) return 'No draft in preparation';
  return `${drafts} ${drafts === 1 ? 'draft' : 'drafts'} in preparation`;
}

// What waits for the academy (null: that list could not be loaded)
export type Waiting = {
  orders: number | null;
  sessions: number | null;
  questions: number | null;
  projects: number | null;
};

// The line under "Needs your attention" ('' when nothing waits in the lists
// that loaded, but one of them could not be loaded)
export function waitingSummary(waiting: Waiting): string {
  const counts = [waiting.orders, waiting.sessions, waiting.questions, waiting.projects];
  const total = counts.reduce<number>((sum, count) => sum + (count ?? 0), 0);
  if (total === 1) return '1 thing needs your attention.';
  if (total > 1) return `${total} things need your attention.`;
  if (counts.includes(null)) return '';
  return 'You are all caught up: nothing waits for you.';
}

// The note of "Projects to review" (`sentAt`: when each project waiting for
// a review was sent, or sent again): how long the oldest one has waited
export function reviewsNote(sentAt: string[], now: Date): string {
  if (sentAt.length === 0) return 'No final project waits for your review.';
  const times = sentAt.map((iso) => new Date(iso).getTime()).filter((time) => Number.isNaN(time) === false);
  const days = times.length === 0 ? null : Math.floor((now.getTime() - Math.min(...times)) / (24 * 60 * 60 * 1000));
  const ago = days === null ? '' : days < 1 ? 'less than a day ago' : days === 1 ? '1 day ago' : `${days} days ago`;
  if (sentAt.length === 1) {
    return ago === '' ? 'A student waits for your review.' : `A student waits for your review: sent ${ago}.`;
  }
  return ago === '' ? 'Students wait for your review.' : `Students wait for your review: the oldest was sent ${ago}.`;
}
