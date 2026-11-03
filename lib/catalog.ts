// The course catalog (/products) and the course page (/products/[id]): the
// shape of what GET /stages and GET /stages/:id send, and small helpers.
// The file has no imports, so `pnpm test` can run it with Node directly.

// GET /stages: one course of the catalog (anyone can open it).
export type CatalogCourse = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  category: string | null;
  level: string | null;
  centerId: string;
  center: { name: string } | null;
  _count?: { modules: number };
};

// GET /stages/:id: the course page. Video links are only sent to viewers who
// may open the course (`hasAccess`), so the page only shows the outline.
export type CourseDetail = Omit<CatalogCourse, 'center'> & {
  hasAccess: boolean;
  center: {
    name: string;
    location: string;
    contactEmail: string;
    contactPhone: string;
  } | null;
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      description: string | null;
      duration: number | null;
    }[];
  }[];
};

export type CatalogSort = 'newest' | 'price-asc' | 'price-desc';

// The categories used by the courses, sorted, without duplicates.
export function categoriesOf(courses: CatalogCourse[]): string[] {
  const names = new Set(
    courses.map((course) => (course.category ?? '').trim()).filter((name) => name !== ''),
  );
  return [...names].sort((a, b) => a.localeCompare(b));
}

// Search in the title, description, category, level and academy name, in any
// letter case (every word typed must match), keep one category ('' = all),
// then sort. The API sends the newest courses first.
export function filterCourses(
  courses: CatalogCourse[],
  query: string,
  category: string,
  sort: CatalogSort,
): CatalogCourse[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  const found = courses.filter((course) => {
    if (category !== '' && (course.category ?? '').trim() !== category) return false;
    const searchable = [
      course.title,
      course.description ?? '',
      course.category ?? '',
      course.level ?? '',
      course.center?.name ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
  if (sort === 'price-asc') return [...found].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return [...found].sort((a, b) => b.price - a.price);
  return found;
}

// Up to two letters for the course picture: "React from zero" -> "RF".
export function courseInitials(title: string): string {
  const letters = title
    .split(/\s+/)
    .filter((word) => /^[A-Za-z0-9]/.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
  return letters === '' ? '?' : letters;
}

// A label for courses that are not simply open for enrollment.
export function courseStatusLabel(status: string): string | null {
  if (status === 'FULL') return 'Full';
  if (status === 'COMPLETED') return 'Finished';
  if (status === 'DRAFT') return 'Draft';
  if (status === 'CANCELLED') return 'Cancelled';
  return null;
}

// Why a course takes no new orders (the API refuses them), or null when it
// can be ordered. Full and finished courses stay in the catalog.
export function closedForOrders(status: string): string | null {
  if (status === 'FULL') return 'This course is full: it takes no new students.';
  if (status === 'COMPLETED') return 'This course has finished: it takes no new students.';
  if (status === 'DRAFT' || status === 'CANCELLED') return 'This course is not offered anymore.';
  return null;
}

export function lessonTotal(course: CourseDetail): number {
  return course.modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0);
}

export function totalMinutes(course: CourseDetail): number {
  return course.modules.reduce(
    (sum, courseModule) =>
      sum + courseModule.lessons.reduce((total, lesson) => total + (lesson.duration ?? 0), 0),
    0,
  );
}

// 45 -> "45 min", 60 -> "1 h", 135 -> "2 h 15 min", 0 -> "".
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// What the main button of the course page does:
// - 'open': the viewer may open the course (bought, free and signed in, or admin);
// - 'sign-in-free': a free course, for a visitor who is not signed in;
// - 'buy': go to the checkout;
// - 'closed': a paid course that takes no new orders (closedForOrders).
export function courseAction(
  course: Pick<CourseDetail, 'hasAccess' | 'price'> & { status?: string },
  signedIn: boolean,
): 'open' | 'sign-in-free' | 'buy' | 'closed' {
  if (course.hasAccess) return 'open';
  if (course.price === 0) return signedIn ? 'open' : 'sign-in-free';
  return closedForOrders(course.status ?? '') === null ? 'buy' : 'closed';
}
