// The academy's quiz results page (/center/questions/results): the students
// of a course with their best score at the quiz of each module
// (GET /quiz-questions/course/:stageId/results), the columns, the search and
// the average of each quiz.
// The file has no imports, so `pnpm test` can run it with Node directly.

// A module of the course, with its number of quiz questions
export type ResultModule = { id: string; title: string; questions: number };

// The best finished attempt of a student at a quiz (createdAt: ISO date)
export type BestResult = { correct: number; total: number; percentage: number; createdAt: string };

// A module quiz the student finished: their best score and how many times
export type ModuleScore = { moduleId: string; best: BestResult | null; attempts: number };

export type StudentResults = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  results: ModuleScore[];
};

export type CourseResults = { modules: ResultModule[]; students: StudentResults[] };

export type ScoreTone = 'high' | 'mid' | 'low';

// The columns of the table: the modules that have a quiz, and those whose
// questions were deleted after students finished it (their scores stay)
export function resultColumns(data: CourseResults): ResultModule[] {
  const taken = new Set(data.students.flatMap((student) => student.results.map((result) => result.moduleId)));
  return data.modules.filter((courseModule) => courseModule.questions > 0 || taken.has(courseModule.id));
}

// "Module 2", as on the Quizzes page (every module of the course counts)
export function moduleNumber(data: CourseResults, moduleId: string): number {
  return data.modules.findIndex((courseModule) => courseModule.id === moduleId) + 1;
}

// "Amira Ben Ali", or the email when the name is empty
export function personName(student: Pick<StudentResults, 'firstName' | 'lastName' | 'email'>): string {
  const name = `${student.firstName} ${student.lastName}`.trim();
  return name === '' ? student.email : name;
}

// The students whose name or email holds every word typed (any letter case),
// by name
export function visibleStudents(students: StudentResults[], query: string): StudentResults[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  return students
    .filter((student) => {
      const searchable = `${personName(student)} ${student.email}`.toLowerCase();
      return words.every((word) => searchable.includes(word));
    })
    .sort((a, b) => personName(a).localeCompare(personName(b)) || a.email.localeCompare(b.email));
}

// The score of a student at a module quiz, or null when they did not finish it
export function scoreOf(student: StudentResults, moduleId: string): ModuleScore | null {
  const score = student.results.find((result) => result.moduleId === moduleId);
  return score === undefined || score.best === null ? null : score;
}

// "2 of 3 right, 2 attempts"
export function scoreDetail(score: ModuleScore): string {
  const best = score.best ?? { correct: 0, total: 0 };
  return `${best.correct} of ${best.total} right, ${score.attempts} ${score.attempts === 1 ? 'attempt' : 'attempts'}`;
}

// The colors of a score, with the thresholds of the student's messages
export function scoreTone(percentage: number): ScoreTone {
  if (percentage >= 70) return 'high';
  if (percentage >= 40) return 'mid';
  return 'low';
}

// How many of the students finished the quiz of a module, and the average of
// their best scores (a whole percentage; null when nobody finished it)
export function columnSummary(students: StudentResults[], moduleId: string): { taken: number; average: number | null } {
  const shares = students
    .map((student) => scoreOf(student, moduleId))
    .filter((score) => score !== null)
    .map((score) => (score.best === null || score.best.total === 0 ? 0 : score.best.correct / score.best.total));
  if (shares.length === 0) return { taken: 0, average: null };
  const sum = shares.reduce((total, share) => total + share, 0);
  return { taken: shares.length, average: Math.round((sum / shares.length) * 100) };
}

// "3 of 5 students took it", "Nobody took it yet"
export function takenLabel(taken: number, students: number): string {
  if (taken === 0) return 'Nobody took it yet';
  return `${taken} of ${students} ${students === 1 ? 'student' : 'students'} took it`;
}

// One CSV cell: quoted when needed, and a text that a spreadsheet would run
// as a formula (=, +, -, @) starts with an apostrophe (as in lib/students.ts)
function csvCell(value: string): string {
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// The results as a CSV file for a spreadsheet: one line per student given
// (in that order), with the best score (%) and the attempts at each module
// quiz of the table; empty cells for a quiz not taken. It starts with a byte
// order mark, so spreadsheets read the accents right.
export function resultsCsv(data: CourseResults, students: StudentResults[]): string {
  const columns = resultColumns(data);
  const header = ['Student', 'Email'];
  for (const courseModule of columns) {
    const name = `Module ${moduleNumber(data, courseModule.id)}: ${courseModule.title}`;
    header.push(`${name} - best (%)`, `${name} - attempts`);
  }
  const lines = [header];
  for (const student of students) {
    const line = [personName(student), student.email];
    for (const courseModule of columns) {
      const score = scoreOf(student, courseModule.id);
      line.push(score === null || score.best === null ? '' : String(score.best.percentage));
      line.push(score === null ? '' : String(score.attempts));
    }
    lines.push(line);
  }
  return '\ufeff' + lines.map((line) => line.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

// The name of the downloaded file: "quiz-results-react-from-zero-2026-11-01.csv"
// (letters and digits of the title, accents dropped)
export function resultsFileName(courseTitle: string, today: string): string {
  const slug = courseTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
  return `quiz-results-${slug === '' ? 'course' : slug}-${today}.csv`;
}
