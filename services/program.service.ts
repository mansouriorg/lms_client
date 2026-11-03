// Calls used by the program editor of a course (/center/stages/[id]).
// lib/api.ts adds the sign-in token; the API checks the admin role and the
// academy of the course.
import { api } from '../lib/api';
import type { Direction, LessonPayload } from '../lib/program';

const path = (kind: 'modules' | 'lessons', id: string, action = '') =>
  `/${kind}/${encodeURIComponent(id)}${action}`;

export const programService = {
  // At the end of the course
  addModule: async (courseId: string, title: string): Promise<void> => {
    await api.post('/modules', { stageId: courseId, title });
  },

  renameModule: async (moduleId: string, title: string): Promise<void> => {
    await api.patch(path('modules', moduleId), { title });
  },

  // Also deletes its lessons (and the students' progress on them)
  removeModule: async (moduleId: string): Promise<void> => {
    await api.delete(path('modules', moduleId));
  },

  moveModule: async (moduleId: string, direction: Direction): Promise<void> => {
    await api.post(path('modules', moduleId, '/move'), { direction });
  },

  // At the end of the module
  addLesson: async (moduleId: string, lesson: LessonPayload): Promise<void> => {
    await api.post('/lessons', { ...lesson, moduleId });
  },

  updateLesson: async (lessonId: string, lesson: LessonPayload): Promise<void> => {
    await api.patch(path('lessons', lessonId), lesson);
  },

  removeLesson: async (lessonId: string): Promise<void> => {
    await api.delete(path('lessons', lessonId));
  },

  moveLesson: async (lessonId: string, direction: Direction): Promise<void> => {
    await api.post(path('lessons', lessonId, '/move'), { direction });
  },
};
