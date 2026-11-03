// Calls to the /quiz-questions routes, for academy admins: the quiz of each
// module of their courses. lib/api.ts adds the sign-in token; the API only
// shows and changes the quizzes of the admin's academy.
import { api } from '../lib/api';
import type { QuizModule, QuizPayload, QuizQuestion } from '../lib/quizzes';
import type { CourseResults } from '../lib/quiz-results';

export const quizzesService = {
  // The modules of the course in their order, each with its questions
  forCourse: async (courseId: string): Promise<QuizModule[]> => {
    const response = await api.get<QuizModule[]>(`/quiz-questions/course/${encodeURIComponent(courseId)}`);
    return response.data;
  },

  // At the end of the module's quiz
  create: async (moduleId: string, payload: QuizPayload): Promise<QuizQuestion> => {
    const response = await api.post<{ message: string; question: QuizQuestion }>('/quiz-questions', {
      moduleId,
      ...payload,
    });
    return response.data.question;
  },

  update: async (questionId: string, payload: QuizPayload): Promise<QuizQuestion> => {
    const response = await api.patch<{ message: string; question: QuizQuestion }>(
      `/quiz-questions/${encodeURIComponent(questionId)}`,
      payload,
    );
    return response.data.question;
  },

  remove: async (questionId: string): Promise<void> => {
    await api.delete(`/quiz-questions/${encodeURIComponent(questionId)}`);
  },

  // The students of the course with their best score at each module quiz
  results: async (courseId: string): Promise<CourseResults> => {
    const response = await api.get<CourseResults>(`/quiz-questions/course/${encodeURIComponent(courseId)}/results`);
    return response.data;
  },
};
