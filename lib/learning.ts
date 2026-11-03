// "My courses" (/student/lessons) and the course player
// (/student/courses/[id]): the shape of what the API sends, and helpers.
// The file has no imports, so `pnpm test` can run it with Node directly.

// GET /stages/mine: a course the student bought, with their progress.
export type MyCourse = {
  id: string;
  title: string;
  // DRAFT or CANCELLED: no longer offered, but the buyer keeps access
  status?: string;
  category: string | null;
  level: string | null;
  center: { name: string } | null;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
};

export type PlayerLesson = {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  // Only sent to viewers who may open the course
  videoUrl: string | null;
};

// GET /stages/:id, as the course player uses it.
export type PlayerCourse = {
  id: string;
  title: string;
  price: number;
  hasAccess: boolean;
  center: { name: string } | null;
  // `_count.quizBank`: how many quiz questions the module has
  modules: { id: string; title: string; lessons: PlayerLesson[]; _count?: { quizBank: number } }[];
};

// GET /lessons/stage/:stageId/progress
export type CourseProgress = {
  total: number;
  completed: number;
  percentage: number;
  completedLessonIds?: string[];
};

// Every lesson of the course, in the order of the program.
export function allLessons(course: PlayerCourse): PlayerLesson[] {
  return course.modules.flatMap((courseModule) => courseModule.lessons);
}

// Where the player starts: the first lesson not completed yet, or the first
// lesson when everything is done. null when the course has no lessons.
export function firstLessonToWatch(course: PlayerCourse, completedIds: string[]): string | null {
  const lessons = allLessons(course);
  const notDone = lessons.find((lesson) => completedIds.includes(lesson.id) === false);
  return (notDone ?? lessons[0])?.id ?? null;
}

// The lesson after `lessonId` in the program, or null for the last one.
export function nextLessonId(course: PlayerCourse, lessonId: string): string | null {
  const lessons = allLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 && index + 1 < lessons.length ? lessons[index + 1].id : null;
}

export function percentDone(completed: number, total: number): number {
  return total <= 0 ? 0 : Math.round((completed / total) * 100);
}

// A course with lessons, all of them completed.
export function isFinished(course: Pick<MyCourse, 'totalLessons' | 'completedLessons'>): boolean {
  return course.totalLessons > 0 && course.completedLessons >= course.totalLessons;
}

// The button of a course in "My courses" and on the dashboard.
export function courseButtonLabel(
  course: Pick<MyCourse, 'totalLessons' | 'completedLessons'>,
): 'Review the course' | 'Continue' | 'Start' {
  if (isFinished(course)) return 'Review the course';
  return course.completedLessons > 0 ? 'Continue' : 'Start';
}

// The course the dashboard suggests (GET /stages/mine sends the newest
// purchase first): the first one in progress, else the first one not started
// that has lessons. null when every course is finished or has no lessons yet.
export function courseToContinue(courses: MyCourse[]): MyCourse | null {
  const started = courses.find(
    (course) => course.completedLessons > 0 && isFinished(course) === false,
  );
  if (started) return started;
  return courses.find((course) => course.totalLessons > 0 && course.completedLessons === 0) ?? null;
}

// The numbers at the top of the dashboard.
export function learningStats(courses: MyCourse[]): {
  courses: number;
  finished: number;
  lessonsCompleted: number;
} {
  return {
    courses: courses.length,
    finished: courses.filter((course) => isFinished(course)).length,
    lessonsCompleted: courses.reduce((sum, course) => sum + course.completedLessons, 0),
  };
}

export type VideoSource =
  | { kind: 'file'; src: string }
  | { kind: 'youtube'; src: string }
  | { kind: 'vimeo'; src: string }
  | { kind: 'link'; src: string };

// How to show a lesson video. Only http(s) links are used:
// - YouTube and Vimeo links become their embedded player;
// - .mp4, .webm, .ogg and .mov files play in the page;
// - any other web link opens in a new tab.
export function videoSource(url: string | null | undefined): VideoSource | null {
  const link = (url ?? '').trim();
  if (/^https?:\/\//i.test(link) === false) return null;
  let parsed: URL;
  try {
    parsed = new URL(link);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
  const path = parsed.pathname;

  let youtubeId: string | null = null;
  if (host === 'youtu.be') youtubeId = path.slice(1);
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    youtubeId = parsed.searchParams.get('v') ?? path.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null;
  }
  if (youtubeId !== null && /^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${youtubeId}` };
  }

  const vimeoId =
    host === 'vimeo.com'
      ? path.match(/^\/(\d+)/)?.[1]
      : host === 'player.vimeo.com'
        ? path.match(/^\/video\/(\d+)/)?.[1]
        : undefined;
  if (vimeoId) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vimeoId}` };

  if (/\.(mp4|webm|ogg|mov)$/i.test(path)) return { kind: 'file', src: link };
  return { kind: 'link', src: link };
}
