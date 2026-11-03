// Calls of the student's Assignments page (/project-submissions routes).
// lib/api.ts adds the sign-in token; the API only uses the user of the token.
import { api } from '../lib/api';
import type { MyProject, Submission } from '../lib/assignments';

export const assignmentsService = {
  // The projects of the courses the student bought, with their submission
  mine: async (): Promise<MyProject[]> => {
    const response = await api.get<MyProject[]>('/project-submissions/mine');
    return response.data;
  },

  // Sends the project of a course (again after "Needs work"); the answer has
  // a readable message and the saved submission
  send: async (
    stageId: string,
    links: { repoUrl: string; liveUrl?: string },
  ): Promise<{ message: string; submission: Submission }> => {
    const response = await api.post<{ message: string; submission: Submission }>('/project-submissions', {
      stageId,
      ...links,
    });
    return response.data;
  },
};
