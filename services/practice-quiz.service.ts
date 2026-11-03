// Calls used by the module quizzes in the course player. lib/api.ts adds the
// sign-in token; the API checks that the student may open the course.
import { api } from '../lib/api';
import type { AnswerCheck, ModuleResult, PracticeQuiz, SavedAttempt } from '../lib/practice-quiz';

export const practiceQuizService = {
  // The questions of the module's quiz, without the right answers, and the
  // student's best score
  get: async (moduleId: string): Promise<PracticeQuiz> => {
    const response = await api.get<PracticeQuiz>(`/quizzes/module/${encodeURIComponent(moduleId)}`);
    return response.data;
  },

  // Is `answer` (the place of the answer chosen, from 0) the right one?
  check: async (questionId: string, answer: number): Promise<AnswerCheck> => {
    const response = await api.post<AnswerCheck>(`/quizzes/questions/${encodeURIComponent(questionId)}/check`, {
      answer,
    });
    return response.data;
  },

  // A finished quiz: the server grades the answers and saves the score
  saveAttempt: async (moduleId: string, answers: { questionId: string; answer: number }[]): Promise<SavedAttempt> => {
    const response = await api.post<SavedAttempt>(`/quizzes/module/${encodeURIComponent(moduleId)}/attempts`, {
      answers,
    });
    return response.data;
  },

  // The student's best score at each module quiz of a course they finished
  courseResults: async (courseId: string): Promise<ModuleResult[]> => {
    const response = await api.get<ModuleResult[]>(`/quizzes/course/${encodeURIComponent(courseId)}/results`);
    return response.data;
  },
};
