// Calls used by the admin course pages (/center/stages...). lib/api.ts adds
// the sign-in token; the API checks the admin role and the academy.
import { api } from '../lib/api';
import type { CoursePayload, EditableCourse, ManagedCourse } from '../lib/course-admin';
import type { LessonProgress } from '../lib/lesson-progress';

export type Academy = { id: string; name: string };

export const courseAdminService = {
  // The courses of your academy (every course for a super admin), any status.
  list: async (): Promise<ManagedCourse[]> => {
    const response = await api.get<ManagedCourse[]>('/stages/manage');
    return response.data;
  },

  // One course with its program and video links (403 for another academy).
  get: async (courseId: string): Promise<EditableCourse> => {
    const response = await api.get<EditableCourse>(`/stages/${encodeURIComponent(courseId)}/manage`);
    return response.data;
  },

  // How many of the students of the course completed each lesson (403 for
  // another academy).
  lessonProgress: async (courseId: string): Promise<LessonProgress> => {
    const response = await api.get<LessonProgress>(`/stages/${encodeURIComponent(courseId)}/lesson-progress`);
    return response.data;
  },

  // A new course is a draft. Center admins: it belongs to their academy.
  create: async (payload: CoursePayload): Promise<{ message: string; stage: ManagedCourse }> => {
    const response = await api.post<{ message: string; stage: ManagedCourse }>('/stages', payload);
    return response.data;
  },

  update: async (
    courseId: string,
    payload: Partial<CoursePayload>,
  ): Promise<{ message: string; stage: ManagedCourse }> => {
    const response = await api.patch<{ message: string; stage: ManagedCourse }>(
      `/stages/${encodeURIComponent(courseId)}`,
      payload,
    );
    return response.data;
  },

  // Refused (409) for a course that was ordered: cancel it instead.
  remove: async (courseId: string): Promise<void> => {
    await api.delete(`/stages/${encodeURIComponent(courseId)}`);
  },

  // The academies, for the academy choice of a super admin.
  academies: async (): Promise<Academy[]> => {
    const response = await api.get<Academy[]>('/centers');
    return response.data;
  },
};
