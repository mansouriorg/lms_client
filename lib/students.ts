// The academy's Students page (/center/students): who bought which course
// and how far they are (GET /stages/students), the search and filters, and
// the CSV download.
// The file has no imports, so `pnpm test` can run it with Node directly.

// One course a student bought, with their progress in it
export type EnrolledCourse = {
  id: string;
  title: string;
  status: string;
  // The academy of the course (a platform admin sees every academy)
  academy: string | null;
  // When the student ordered it
  since: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  // When they last completed a lesson of this course
  lastActivityAt: string | null;
};

// A student with at least one paid course of the academy
export type AcademyStudent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  since: string;
  lastActivityAt: string | null;
  courses: EnrolledCourse[];
};

export type ProgressState = 'no-lessons' | 'not-started' | 'in-progress' | 'finished';
// '' means any progress
export type ProgressFilter = ProgressState | '';

export function progressState(course: Pick<EnrolledCourse, 'totalLessons' | 'completedLessons'>): ProgressState {
  if (course.totalLessons === 0) return 'no-lessons';
  if (course.completedLessons === 0) return 'not-started';
  if (course.completedLessons >= course.totalLessons) return 'finished';
  return 'in-progress';
}

export function progressLabel(state: ProgressState): string {
  if (state === 'no-lessons') return 'No lessons yet';
  if (state === 'not-started') return 'Not started';
  if (state === 'finished') return 'Finished';
  return 'In progress';
}

// "7 of 10 lessons - 70%", "1 of 1 lesson - 100%", "No lessons yet"
export function lessonsLabel(course: Pick<EnrolledCourse, 'totalLessons' | 'completedLessons' | 'percentage'>): string {
  if (course.totalLessons === 0) return 'No lessons yet';
  const word = course.totalLessons === 1 ? 'lesson' : 'lessons';
  return `${course.completedLessons} of ${course.totalLessons} ${word} - ${course.percentage}%`;
}

// "Amira Ben Ali", or the email when the name is empty
export function studentName(student: Pick<AcademyStudent, 'firstName' | 'lastName' | 'email'>): string {
  const name = `${student.firstName} ${student.lastName}`.trim();
  return name === '' ? student.email : name;
}

// "AB" for Amira Ben Ali
export function studentInitials(student: Pick<AcademyStudent, 'firstName' | 'lastName' | 'email'>): string {
  const letters = [student.firstName, student.lastName]
    .map((part) => part.trim().charAt(0))
    .join('')
    .toUpperCase();
  return letters === '' ? student.email.charAt(0).toUpperCase() : letters;
}

// "Last lesson completed 3 days ago", or "No lesson completed yet".
// `ago` writes how long ago a moment was (timeAgo in lib/qa.ts).
export function activityLabel(
  student: Pick<AcademyStudent, 'lastActivityAt'>,
  now: Date,
  ago: (iso: string, now: Date) => string,
): string {
  if (student.lastActivityAt === null) return 'No lesson completed yet';
  return `Last lesson completed ${ago(student.lastActivityAt, now)}`;
}

// The courses of the filter list: each course once, by title
export function courseOptions(students: AcademyStudent[]): { id: string; title: string }[] {
  const byId = new Map<string, string>();
  for (const student of students) {
    for (const course of student.courses) byId.set(course.id, course.title);
  }
  return [...byId.entries()]
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

// "12 students", "15 courses bought", "4 finished"
export function studentTotals(students: AcademyStudent[]): { students: number; enrollments: number; finished: number } {
  const courses = students.flatMap((student) => student.courses);
  return {
    students: students.length,
    enrollments: courses.length,
    finished: courses.filter((course) => progressState(course) === 'finished').length,
  };
}

// A student and the courses of theirs that match the filters
export type StudentRow = { student: AcademyStudent; courses: EnrolledCourse[] };

// The course (''= every course) and the progress filters choose the courses
// shown under each student; a student without such a course is left out.
// Every word typed must appear in the student's name, email or phone, or in
// the title of one of those courses (any letter case).
export function filterStudents(
  students: AcademyStudent[],
  query: string,
  courseId: string,
  progress: ProgressFilter,
): StudentRow[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  const rows: StudentRow[] = [];
  for (const student of students) {
    const courses = student.courses.filter(
      (course) =>
        (courseId === '' || course.id === courseId) && (progress === '' || progressState(course) === progress),
    );
    if (courses.length === 0) continue;
    const searchable = [studentName(student), student.email, student.phone ?? '', ...courses.map((course) => course.title)]
      .join(' ')
      .toLowerCase();
    if (words.every((word) => searchable.includes(word))) rows.push({ student, courses });
  }
  return rows;
}

// One CSV cell: quoted when needed, and a text that a spreadsheet would run
// as a formula (=, +, -, @) starts with an apostrophe.
function csvCell(value: string): string {
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// The rows as a CSV file (one line per course bought), for a spreadsheet.
// It starts with a byte order mark, so spreadsheets read the accents right.
export function studentsCsv(rows: StudentRow[]): string {
  const day = (iso: string | null) => (iso === null ? '' : iso.slice(0, 10));
  const lines = [
    ['Student', 'Email', 'Phone', 'Course', 'Since', 'Lessons completed', 'Lessons', 'Progress (%)', 'Last lesson completed'],
  ];
  for (const { student, courses } of rows) {
    for (const course of courses) {
      lines.push([
        studentName(student),
        student.email,
        student.phone ?? '',
        course.title,
        day(course.since),
        String(course.completedLessons),
        String(course.totalLessons),
        String(course.percentage),
        day(course.lastActivityAt),
      ]);
    }
  }
  return '\ufeff' + lines.map((line) => line.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
