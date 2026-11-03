// The module quizzes in the course player (/student/courses/[id]): what the
// API sends (GET /quizzes/module/:moduleId, POST /quizzes/questions/:id/check,
// POST /quizzes/module/:moduleId/attempts, GET /quizzes/course/:stageId/results)
// and the scores. The score of every finished quiz is saved; the course player
// shows the best one.
// The file has no imports, so `pnpm test` can run it with Node directly.

// A question without its right answer (the API only sends it once answered)
export type PracticeQuestion = {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  options: string[];
};

// The best finished attempt of the student at a quiz (createdAt: ISO date)
export type BestScore = { correct: number; total: number; percentage: number; createdAt: string };

// The quiz of a module, with the student's best score (null before their
// first finished attempt) and how many attempts they finished
export type PracticeQuiz = {
  module: { id: string; title: string };
  questions: PracticeQuestion[];
  best: BestScore | null;
  attempts: number;
};

// The reply to an answer
export type AnswerCheck = { right: boolean; correctAnswer: number; explanation: string | null };

// One question answered: the answer chosen (its place, from 0) and the reply
export type QuizAnswer = { questionId: string; chosen: number; check: AnswerCheck };

// The reply to a finished quiz: its score (graded by the server) and the best
export type SavedAttempt = {
  message: string;
  correct: number;
  total: number;
  percentage: number;
  best: BestScore | null;
  attempts: number;
};

// The best score at the quiz of a module (GET /quizzes/course/:stageId/results)
export type ModuleResult = { moduleId: string; best: BestScore | null; attempts: number };

export function quizScore(answers: QuizAnswer[]): { right: number; total: number; percentage: number } {
  const right = answers.filter((answer) => answer.check.right).length;
  const total = answers.length;
  return { right, total, percentage: total === 0 ? 0 : Math.round((right / total) * 100) };
}

export function scoreMessage(percentage: number): string {
  if (percentage === 100) return 'Perfect: every answer is right.';
  if (percentage >= 70) return 'Well done. Read the explanations of the answers you missed.';
  if (percentage >= 40) return 'A good start. Read the explanations, then try again.';
  return 'Review the lessons of this module, then try again.';
}

// The body of POST /quizzes/module/:moduleId/attempts: the answer chosen for
// each question (the server grades them again)
export function attemptAnswers(answers: QuizAnswer[]): { questionId: string; answer: number }[] {
  return answers.map((item) => ({ questionId: item.questionId, answer: item.chosen }));
}

// "Best score: 2 of 3 right (67%) after 2 attempts"
export function bestScoreText(best: BestScore, attempts: number): string {
  return `Best score: ${best.correct} of ${best.total} right (${best.percentage}%) after ${attempts} ${
    attempts === 1 ? 'attempt' : 'attempts'
  }`;
}

// What the quiz says once the score is saved: `previous` is the best score
// before this attempt (null for the first one).
export function savedMessage(previous: BestScore | null, saved: SavedAttempt): string {
  if (previous === null || saved.best === null) return 'Your score is saved.';
  // a/b against c/d without rounding: a*d against c*b
  if (saved.correct * previous.total > previous.correct * saved.total) {
    return 'Your score is saved: a new best score.';
  }
  const best = saved.best;
  return `Your score is saved. Your best score is still ${best.correct} of ${best.total} right (${best.percentage}%).`;
}

// "Best: 67%", shown next to the quiz of a module in the program
export function bestBadge(best: BestScore): string {
  return `Best: ${best.percentage}%`;
}

// The result of a module's quiz in the list, or null
export function resultFor(results: ModuleResult[], moduleId: string): ModuleResult | null {
  return results.find((result) => result.moduleId === moduleId) ?? null;
}

// The list with the result of one module replaced (or added)
export function withResult(results: ModuleResult[], result: ModuleResult): ModuleResult[] {
  const others = results.filter((item) => item.moduleId !== result.moduleId);
  return [...others, result];
}

// "Quiz: 1 question", "Quiz: 5 questions"
export function quizLabel(count: number): string {
  return `Quiz: ${count} ${count === 1 ? 'question' : 'questions'}`;
}

// The number of quiz questions of a module, as GET /stages/:id sends it
export function moduleQuizCount(courseModule: { _count?: { quizBank?: number } }): number {
  return courseModule._count?.quizBank ?? 0;
}

type QuizModuleRef = { id: string; lessons: { id: string }[]; _count?: { quizBank?: number } };

// The module whose quiz to offer after a lesson: the lesson's module, when
// the lesson is its last one and the module has a quiz. null otherwise.
export function quizAfterLesson(course: { modules: QuizModuleRef[] }, lessonId: string): string | null {
  const courseModule = course.modules.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
  if (courseModule === undefined || moduleQuizCount(courseModule) === 0) return null;
  const last = courseModule.lessons[courseModule.lessons.length - 1];
  return last.id === lessonId ? courseModule.id : null;
}
