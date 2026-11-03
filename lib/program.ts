// The program of a course in its editor (/center/stages/[id]): modules, their
// lessons, and the module and lesson forms. The file has no imports, so
// `pnpm test` can run it with Node directly.

export type ProgramLesson = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number | null; // minutes
  order: number;
};

export type ProgramModule = {
  id: string;
  title: string;
  order: number;
  lessons: ProgramLesson[];
};

export type Direction = 'up' | 'down';

// Moving is offered when there is a place to move to.
export function canMove(index: number, count: number, direction: Direction): boolean {
  return direction === 'up' ? index > 0 : index < count - 1;
}

export function lessonCount(modules: ProgramModule[]): number {
  return modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0);
}

export function lessonsWithoutVideo(modules: ProgramModule[]): number {
  return modules.reduce(
    (sum, courseModule) => sum + courseModule.lessons.filter((lesson) => (lesson.videoUrl ?? '') === '').length,
    0,
  );
}

// "2 modules, 5 lessons (1 without a video)"
export function programSummary(modules: ProgramModule[]): string {
  const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
  const lessons = lessonCount(modules);
  const missing = lessonsWithoutVideo(modules);
  const summary = `${plural(modules.length, 'module')}, ${plural(lessons, 'lesson')}`;
  return missing > 0 ? `${summary} (${missing} without a video)` : summary;
}

// The kind of video the player shows (videoSource in lib/learning.ts).
export function videoKindName(kind: string | null): string {
  if (kind === 'youtube') return 'YouTube video';
  if (kind === 'vimeo') return 'Vimeo video';
  if (kind === 'file') return 'Video file';
  if (kind === 'link') return 'Link (opens in a new tab)';
  return 'No video';
}

export const TITLE_MAX = 200;

// Like the API: a module or lesson title is required, at most 200 characters.
export function titleError(title: string, what: 'module' | 'lesson'): string | null {
  const clean = title.trim();
  if (clean === '') return `Give the ${what} a title.`;
  if (clean.length > TITLE_MAX) return `The title can have at most ${TITLE_MAX} characters.`;
  return null;
}

// Like the API: a full web address, starting with https:// (or http://).
export function isWebAddress(text: string): boolean {
  if (/^https?:\/\/\S+$/i.test(text) === false) return false;
  try {
    return new URL(text).hostname !== '';
  } catch {
    return false;
  }
}

// The lesson form, as the inputs hold it (text).
export type LessonFormValues = {
  title: string;
  videoUrl: string;
  duration: string;
  description: string;
};

export type LessonFormErrors = Partial<Record<'title' | 'videoUrl' | 'duration', string>>;

// What POST /lessons (with the moduleId) and PATCH /lessons/:id receive; null
// removes a video link, a duration or a description.
export type LessonPayload = {
  title: string;
  videoUrl: string | null;
  duration: number | null;
  description: string | null;
};

export function emptyLessonForm(): LessonFormValues {
  return { title: '', videoUrl: '', duration: '', description: '' };
}

export function lessonFormFrom(lesson: ProgramLesson): LessonFormValues {
  return {
    title: lesson.title,
    videoUrl: lesson.videoUrl ?? '',
    duration: lesson.duration === null ? '' : String(lesson.duration),
    description: lesson.description ?? '',
  };
}

export function readLessonForm(values: LessonFormValues): {
  errors: LessonFormErrors;
  payload: LessonPayload | null;
} {
  const errors: LessonFormErrors = {};
  const title = values.title.trim();
  const titleProblem = titleError(title, 'lesson');
  if (titleProblem !== null) errors.title = titleProblem;

  const videoUrl = values.videoUrl.trim();
  if (videoUrl !== '' && isWebAddress(videoUrl) === false) {
    errors.videoUrl = 'Paste the full link, starting with https:// (for example https://www.youtube.com/watch?v=...).';
  }

  const durationText = values.duration.trim();
  const duration = durationText === '' ? null : Number(durationText);
  if (duration !== null && (/^\d+$/.test(durationText) === false || duration < 1 || duration > 1440)) {
    errors.duration = 'Enter whole minutes, from 1 to 1440, or leave it empty.';
  }

  if (Object.keys(errors).length > 0) return { errors, payload: null };
  const description = values.description.trim();
  return {
    errors,
    payload: {
      title,
      videoUrl: videoUrl === '' ? null : videoUrl,
      duration,
      description: description === '' ? null : description,
    },
  };
}
