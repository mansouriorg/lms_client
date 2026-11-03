// Calls to the /stages routes (courses are called "stages" in the API).
// Anyone can call them; when someone is signed in, lib/api.ts adds the token
// and the API answers for that account (admins see drafts, buyers get access).
import { api } from '../lib/api';
import type { CatalogCourse, CourseDetail } from '../lib/catalog';

export const coursesService = {
  // The catalog, newest first. Students and visitors never get drafts.
  getAll: async (): Promise<CatalogCourse[]> => {
    const response = await api.get<CatalogCourse[]>('/stages');
    return response.data;
  },

  // One course: the outline for everyone, and `hasAccess` true when the
  // signed-in user may open the lessons. Draft and cancelled courses answer
  // 404 to students and visitors.
  getOne: async (courseId: string): Promise<CourseDetail> => {
    const response = await api.get<CourseDetail>(`/stages/${encodeURIComponent(courseId)}`);
    return response.data;
  },
};
