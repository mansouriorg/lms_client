// The academy's Quizzes page (/center/questions): the quiz questions of each
// module of a course (GET /quiz-questions/course/:stageId), and the question
// form (the same checks as the API).
// The file has no imports, so `pnpm test` can run it with Node directly.

export type QuizType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
export type QuizLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type QuizQuestion = {
  id: string;
  moduleId: string;
  text: string;
  type: QuizType;
  difficulty: QuizLevel;
  // The possible answers ("True" and "False" for a true or false question)
  options: string[];
  // The place of the right answer in `options`, from 0
  correctAnswer: number;
  explanation: string | null;
  createdAt: string;
};

// A module of the course, with its quiz (the oldest question first)
export type QuizModule = { id: string; title: string; order: number; quizBank: QuizQuestion[] };

export const QUESTION_MAX = 500;
export const ANSWER_MAX = 200;
export const EXPLANATION_MAX = 1000;
export const ANSWERS_MIN = 2;
export const ANSWERS_MAX = 6;
export const QUESTIONS_PER_MODULE = 50;
export const TRUE_FALSE_OPTIONS = ['True', 'False'];

export function typeLabel(type: string): string {
  return type === 'TRUE_FALSE' ? 'True or false' : 'Multiple choice';
}

export function levelLabel(level: string): string {
  if (level === 'EASY') return 'Easy';
  if (level === 'HARD') return 'Hard';
  return 'Medium';
}

export function questionCount(count: number): string {
  if (count === 0) return 'No questions yet';
  return count === 1 ? '1 question' : `${count} questions`;
}

// 0 -> "A", 1 -> "B"...
export function answerLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

// The form, as the inputs hold it. `answers` are the answer fields of a
// multiple choice question (empty ones are left out); `correct` is the field
// of the right answer (for true or false: 0 is True, 1 is False), null while
// not chosen.
export type QuizValues = {
  text: string;
  type: QuizType;
  difficulty: QuizLevel;
  answers: string[];
  correct: number | null;
  explanation: string;
};
export type QuizErrors = Partial<Record<'text' | 'answers' | 'correct' | 'explanation', string>>;
export type QuizPayload = {
  text: string;
  type: QuizType;
  difficulty: QuizLevel;
  options?: string[];
  correctAnswer: number;
  explanation: string | null;
};

export function emptyQuizForm(): QuizValues {
  return { text: '', type: 'MULTIPLE_CHOICE', difficulty: 'MEDIUM', answers: ['', '', '', ''], correct: null, explanation: '' };
}

export function quizFormFrom(question: QuizQuestion): QuizValues {
  const multiple = question.type === 'MULTIPLE_CHOICE';
  return {
    text: question.text,
    type: question.type,
    difficulty: question.difficulty,
    answers: multiple ? [...question.options] : ['', '', '', ''],
    correct: question.correctAnswer,
    explanation: question.explanation ?? '',
  };
}

// The form after removing the answer field `index`: the right answer stays
// the same answer (none when it was that one).
export function withoutAnswer(values: QuizValues, index: number): QuizValues {
  let correct = values.correct;
  if (correct === index) correct = null;
  else if (correct !== null && correct > index) correct -= 1;
  return { ...values, answers: values.answers.filter((_answer, place) => place !== index), correct };
}

// The values to send (POST or PATCH /quiz-questions), or the errors to show
export function readQuizForm(values: QuizValues): { errors: QuizErrors; payload: QuizPayload | null } {
  const errors: QuizErrors = {};
  const text = values.text.trim();
  if (text === '') errors.text = 'Write the question.';
  else if (text.length > QUESTION_MAX) errors.text = `The question can have at most ${QUESTION_MAX} characters.`;

  let options: string[] | undefined;
  let correctAnswer = -1;
  if (values.type === 'TRUE_FALSE') {
    if (values.correct === 0 || values.correct === 1) correctAnswer = values.correct;
    else errors.correct = 'Choose whether the statement is true or false.';
  } else {
    const filled = values.answers
      .map((answer, index) => ({ text: answer.trim(), index }))
      .filter((answer) => answer.text !== '');
    const names = filled.map((answer) => answer.text.toLowerCase());
    if (filled.length < ANSWERS_MIN) errors.answers = `Write at least ${ANSWERS_MIN} possible answers.`;
    else if (filled.length > ANSWERS_MAX) errors.answers = `Write at most ${ANSWERS_MAX} possible answers.`;
    else if (filled.some((answer) => answer.text.length > ANSWER_MAX))
      errors.answers = `An answer can have at most ${ANSWER_MAX} characters.`;
    else if (new Set(names).size < names.length) errors.answers = 'Two answers are the same.';
    correctAnswer = filled.findIndex((answer) => answer.index === values.correct);
    if (correctAnswer < 0) errors.correct = 'Choose the right answer.';
    options = filled.map((answer) => answer.text);
  }

  const explanation = values.explanation.trim();
  if (explanation.length > EXPLANATION_MAX)
    errors.explanation = `The explanation can have at most ${EXPLANATION_MAX} characters.`;

  if (Object.keys(errors).length > 0) return { errors, payload: null };
  const payload: QuizPayload = {
    text,
    type: values.type,
    difficulty: values.difficulty,
    correctAnswer,
    explanation: explanation === '' ? null : explanation,
  };
  if (options !== undefined) payload.options = options;
  return { errors, payload };
}
