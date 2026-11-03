// Calls used by the questions and answers under a lesson (the course player).
// lib/api.ts adds the sign-in token; the API checks that the student may open
// the course.
import { api } from '../lib/api';
import type { InboxQuestion, QaQuestion } from '../lib/qa';

export const qaService = {
  // Academy admins: the questions on the courses of their academy, the ones
  // not resolved first (GET /questions/inbox)
  inbox: async (): Promise<InboxQuestion[]> => {
    const response = await api.get<InboxQuestion[]>('/questions/inbox');
    return response.data;
  },

  // Newest question first, each with its answers (oldest first)
  list: async (lessonId: string): Promise<QaQuestion[]> => {
    const response = await api.get<QaQuestion[]>(`/questions/lesson/${encodeURIComponent(lessonId)}`);
    return response.data;
  },

  ask: async (lessonId: string, title: string, body: string): Promise<void> => {
    await api.post('/questions', { lessonId, title, body });
  },

  answer: async (questionId: string, body: string): Promise<void> => {
    await api.post('/questions/reply', { questionId, body });
  },

  // The author of the question accepts the answer that helped; the question
  // is then resolved.
  accept: async (questionId: string, replyId: string): Promise<void> => {
    await api.patch(
      `/questions/${encodeURIComponent(questionId)}/replies/${encodeURIComponent(replyId)}/accept`,
    );
  },
};
