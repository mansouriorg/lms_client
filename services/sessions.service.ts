// Calls to the /bookings routes, for students: live sessions (mentoring
// calls and webinars) with the academies of their courses. lib/api.ts adds
// the sign-in token; the API only uses the user of the token.
import { api } from '../lib/api';
import type { Instructor, SessionValues, StudentSession } from '../lib/sessions';

export const sessionsService = {
  // Who the student can book: the admins of the academies of their courses
  instructors: async (): Promise<Instructor[]> => {
    const response = await api.get<Instructor[]>('/bookings/instructors');
    return response.data;
  },

  // The student's sessions, the soonest first
  mine: async (): Promise<StudentSession[]> => {
    const response = await api.get<StudentSession[]>('/bookings/my-bookings');
    return response.data;
  },

  // A new request, waiting for the academy (status PENDING)
  request: async (values: SessionValues): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/bookings', values);
    return response.data;
  },

  cancel: async (sessionId: string): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/bookings/${encodeURIComponent(sessionId)}/cancel`,
    );
    return response.data;
  },
};
