// The admin course pages (/center/stages, /center/stages/create and
// /center/stages/[id]): what the API sends, the course form and small helpers.
// Only type imports (Node removes them), so `pnpm test` can run it directly.
import type { ProgramModule } from './program';

// The StageStatus enum of the API (server/prisma/schema.prisma).
export type CourseStatus = 'DRAFT' | 'ACTIVE' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export const COURSE_STATUSES: { value: CourseStatus; label: string; help: string }[] = [
  { value: 'DRAFT', label: 'Draft', help: 'Out of the catalog: use it while you prepare the course.' },
  { value: 'ACTIVE', label: 'Published', help: 'In the catalog: students can buy it, and open it once paid.' },
  {
    value: 'FULL',
    label: 'Full',
    help: 'In the catalog with a "Full" label, closed to new orders. Students who bought it keep access.',
  },
  {
    value: 'COMPLETED',
    label: 'Finished',
    help: 'In the catalog with a "Finished" label, closed to new orders. Students who bought it keep access.',
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    help: 'Out of the catalog, closed to new orders. Students who bought it keep access. Use it instead of deleting a course that was sold.',
  },
];

export function courseStatusName(status: string): string {
  return COURSE_STATUSES.find((option) => option.value === status)?.label ?? status;
}

// Draft and cancelled courses are out of the catalog (buyers keep access).
export function isHiddenStatus(status: string): boolean {
  return status === 'DRAFT' || status === 'CANCELLED';
}

// GET /stages/manage: one course of the admin's list.
export type ManagedCourse = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: CourseStatus;
  category: string | null;
  level: string | null;
  // The final project of the course (null: none); sent with the course
  projectBrief?: string | null;
  centerId: string;
  center: { name: string } | null;
  // modules, and order lines of PAID orders (= paid enrollments)
  _count?: { modules: number; orderItems: number };
};

// GET /stages/:id/manage: the course with its program and video links.
export type EditableCourse = ManagedCourse & { modules: ProgramModule[] };

export function paidEnrollments(course: ManagedCourse): number {
  return course._count?.orderItems ?? 0;
}

// Search in the title, category, level and academy; '' = every status.
export function filterManaged(
  courses: ManagedCourse[],
  query: string,
  status: CourseStatus | '',
): ManagedCourse[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  return courses.filter((course) => {
    if (status !== '' && course.status !== status) return false;
    const searchable = [course.title, course.category ?? '', course.level ?? '', course.center?.name ?? '']
      .join(' ')
      .toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
}

// The quick button of the course list: publish a draft, or take a published
// course back to draft while nobody has bought it yet (for a sold course,
// choose Full, Finished or Cancelled in the editor).
export function quickStatusChange(course: ManagedCourse): { label: string; status: CourseStatus } | null {
  if (course.status === 'DRAFT') return { label: 'Publish', status: 'ACTIVE' };
  if (course.status === 'ACTIVE' && paidEnrollments(course) === 0) {
    return { label: 'Unpublish', status: 'DRAFT' };
  }
  return null;
}

// The course form, as the inputs hold it (text).
export type CourseFormValues = {
  title: string;
  description: string;
  price: string;
  category: string;
  level: string;
  projectBrief: string;
  status: CourseStatus;
  centerId: string;
};

export type CourseFormErrors = Partial<Record<'title' | 'price' | 'centerId' | 'projectBrief', string>>;

// The longest project brief the API accepts
export const PROJECT_BRIEF_MAX = 4000;

// What POST /stages and PATCH /stages/:id receive.
export type CoursePayload = {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  // An empty brief removes the project of the course
  projectBrief: string;
  status?: CourseStatus;
  centerId?: string;
};

export function emptyCourseForm(): CourseFormValues {
  return {
    title: '',
    description: '',
    price: '',
    category: '',
    level: '',
    projectBrief: '',
    status: 'DRAFT',
    centerId: '',
  };
}

export function courseFormFrom(course: ManagedCourse): CourseFormValues {
  return {
    title: course.title,
    description: course.description ?? '',
    price: String(course.price),
    category: course.category ?? '',
    level: course.level ?? '',
    projectBrief: course.projectBrief ?? '',
    status: course.status,
    centerId: course.centerId,
  };
}

// A price in dinars: "120", "99.5", "99,500" (at most 3 decimals, the millimes).
export function parsePrice(text: string): number | null {
  const value = text.trim();
  if (/^\d+([.,]\d{1,3})?$/.test(value) === false) return null;
  return Number(value.replace(',', '.'));
}

// Checks the form. `forCreate`: the status is not sent (a new course is a
// draft); `needsAcademy`: a super admin must choose the academy.
export function readCourseForm(
  values: CourseFormValues,
  options: { forCreate: boolean; needsAcademy: boolean },
): { errors: CourseFormErrors; payload: CoursePayload | null } {
  const errors: CourseFormErrors = {};
  const title = values.title.trim();
  if (title === '') errors.title = 'Give the course a title.';
  const price = parsePrice(values.price);
  if (price === null) errors.price = 'Enter a price in TND, for example 120 or 99.500 (0 for a free course).';
  if (options.needsAcademy && values.centerId === '') errors.centerId = 'Choose the academy of the course.';
  const projectBrief = values.projectBrief.trim();
  if (projectBrief.length > PROJECT_BRIEF_MAX) {
    errors.projectBrief = `The project brief can have at most ${PROJECT_BRIEF_MAX} characters (now ${projectBrief.length}).`;
  }
  if (Object.keys(errors).length > 0 || price === null) return { errors, payload: null };

  const payload: CoursePayload = {
    title,
    description: values.description.trim(),
    price,
    category: values.category.trim(),
    level: values.level.trim(),
    projectBrief,
  };
  if (options.forCreate === false) payload.status = values.status;
  if (options.needsAcademy) payload.centerId = values.centerId;
  return { errors, payload };
}
