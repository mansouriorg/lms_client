// The academy's Lessons page (/center/lessons): how many of the students of a
// course completed each of its lessons (GET /stages/:id/lesson-progress), and
// where they stop.
// The file has no imports, so `pnpm test` can run it with Node directly.

export type LessonStat = { id: string; title: string; duration: number | null; completed: number };
export type ModuleStat = { id: string; title: string; lessons: LessonStat[] };
// `students`: the buyers of the course and the student accounts that
// completed one of its lessons; `finished`: those who completed every lesson
export type LessonProgress = { students: number; finished: number; modules: ModuleStat[] };

// The biggest fall from one lesson to the next, in the order of the program
export type LessonDrop = { after: LessonStat; next: LessonStat; lost: number };

// A share of the students, as a whole percentage (0 without students)
export function shareOf(count: number, students: number): number {
  return students === 0 ? 0 : Math.round((count / students) * 100);
}

// "12 of 20 students (60%)", "1 of 1 student (100%)"
export function completedLabel(completed: number, students: number): string {
  return `${completed} of ${students} ${students === 1 ? 'student' : 'students'} (${shareOf(completed, students)}%)`;
}

export function lessonTotal(report: LessonProgress): number {
  return report.modules.reduce((total, courseModule) => total + courseModule.lessons.length, 0);
}

// "1 lesson", "3 lessons", "No lessons yet"
export function lessonCountLabel(count: number): string {
  if (count === 0) return 'No lessons yet';
  return count === 1 ? '1 lesson' : `${count} lessons`;
}

// Where most students stop: in the order of the program, the two lessons in
// a row with the biggest fall in completions (the first of equal falls).
// null when no lesson has fewer completions than the one before it.
export function biggestDrop(report: LessonProgress): LessonDrop | null {
  const lessons = report.modules.flatMap((courseModule) => courseModule.lessons);
  let drop: LessonDrop | null = null;
  for (let index = 1; index < lessons.length; index += 1) {
    const lost = lessons[index - 1].completed - lessons[index].completed;
    if (lost > 0 && (drop === null || lost > drop.lost)) {
      drop = { after: lessons[index - 1], next: lessons[index], lost };
    }
  }
  return drop;
}

// 'The biggest drop is after "Props": 8 fewer students completed the next
// lesson, "useState".'
export function dropLabel(drop: LessonDrop): string {
  const who = drop.lost === 1 ? 'student' : 'students';
  return `The biggest drop is after "${drop.after.title}": ${drop.lost} fewer ${who} completed the next lesson, "${drop.next.title}".`;
}
