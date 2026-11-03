// Calls used by "My courses" (/student/lessons) and the course player
// (/student/courses/[id]). lib/api.ts adds the sign-in token.
import { api } from '../lib/api';
import type { CourseProgress, MyCourse, PlayerCourse } from '../lib/learning';

export const learningService = {
  // The courses the student bought (paid orders), with their progress.
  myCourses: async (): Promise<MyCourse[]> => {
    const response = await api.get<MyCourse[]>('/stages/mine');
    return response.data;
  },

  // The course with its lessons. The video links are only sent when the
  // student may open the course (`hasAccess`).
  getCourse: async (courseId: string): Promise<PlayerCourse> => {
    const response = await api.get<PlayerCourse>(`/stages/${encodeURIComponent(courseId)}`);
    return response.data;
  },

  // How many lessons are completed, and which ones.
  getProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await api.get<CourseProgress>(
      `/lessons/stage/${encodeURIComponent(courseId)}/progress`,
    );
    return response.data;
  },

  // Marks a lesson as completed. The API answers 409 when it already was.
  completeLesson: async (lessonId: string): Promise<void> => {
    await api.post(`/lessons/${encodeURIComponent(lessonId)}/complete`);
  },
};
