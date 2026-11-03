// Unit tests for lib/quizzes.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  answerLetter,
  emptyQuizForm,
  levelLabel,
  questionCount,
  quizFormFrom,
  readQuizForm,
  typeLabel,
  withoutAnswer,
} from './quizzes.ts';

const form = (extra = {}) => ({ ...emptyQuizForm(), text: ' Which method creates a resource? ', ...extra });

test('labels: the kind, the difficulty, the number of questions, the letters', () => {
  assert.equal(typeLabel('MULTIPLE_CHOICE'), 'Multiple choice');
  assert.equal(typeLabel('TRUE_FALSE'), 'True or false');
  assert.deepEqual(['EASY', 'MEDIUM', 'HARD'].map(levelLabel), ['Easy', 'Medium', 'Hard']);
  assert.deepEqual([0, 1, 7].map(questionCount), ['No questions yet', '1 question', '7 questions']);
  assert.deepEqual([0, 1, 5].map(answerLetter), ['A', 'B', 'F']);
});

test('the form: empty answer fields are left out, the right answer follows', () => {
  const sent = readQuizForm(form({ answers: [' GET ', '', 'POST', ''], correct: 2, explanation: '  ' }));
  assert.deepEqual(sent, {
    errors: {},
    payload: {
      text: 'Which method creates a resource?',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      options: ['GET', 'POST'],
      correctAnswer: 1,
      explanation: null,
    },
  });
  const tf = readQuizForm(form({ type: 'TRUE_FALSE', difficulty: 'HARD', correct: 1, explanation: 'It keeps no state.' }));
  assert.deepEqual(tf.payload, {
    text: 'Which method creates a resource?',
    type: 'TRUE_FALSE',
    difficulty: 'HARD',
    correctAnswer: 1,
    explanation: 'It keeps no state.',
  });
  assert.deepEqual(readQuizForm(form({ text: ' ', answers: ['Only one', '', '', ''], correct: 1 })).errors, {
    text: 'Write the question.',
    answers: 'Write at least 2 possible answers.',
    correct: 'Choose the right answer.',
  });
  assert.equal(readQuizForm(form({ answers: ['GET', 'get ', 'PUT'], correct: 0 })).errors.answers, 'Two answers are the same.');
  assert.equal(readQuizForm(form({ answers: ['GET', 'x'.repeat(201)], correct: 0 })).errors.answers, 'An answer can have at most 200 characters.');
  assert.equal(readQuizForm(form({ type: 'TRUE_FALSE' })).errors.correct, 'Choose whether the statement is true or false.');
  assert.equal(readQuizForm(form({ answers: ['a', 'b'], correct: 0, explanation: 'x'.repeat(1001) })).errors.explanation, 'The explanation can have at most 1000 characters.');
  assert.equal(readQuizForm(form({ answers: ['a', 'b'], correct: 0, text: 'x'.repeat(501) })).errors.text, 'The question can have at most 500 characters.');
});

test('editing: the form from a question, and removing an answer field', () => {
  const question = {
    id: 'q1',
    moduleId: 'm1',
    text: 'HTTP is stateless.',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    options: ['True', 'False'],
    correctAnswer: 0,
    explanation: null,
    createdAt: '2026-11-01T10:00:00.000Z',
  };
  assert.deepEqual(quizFormFrom(question), {
    text: 'HTTP is stateless.',
    type: 'TRUE_FALSE',
    difficulty: 'EASY',
    answers: ['', '', '', ''],
    correct: 0,
    explanation: '',
  });
  const multiple = quizFormFrom({ ...question, type: 'MULTIPLE_CHOICE', options: ['A1', 'B1', 'C1'], correctAnswer: 2, explanation: 'Why' });
  assert.deepEqual([multiple.answers, multiple.correct, multiple.explanation], [['A1', 'B1', 'C1'], 2, 'Why']);
  assert.deepEqual(withoutAnswer(multiple, 0), { ...multiple, answers: ['B1', 'C1'], correct: 1 });
  assert.deepEqual(withoutAnswer(multiple, 2), { ...multiple, answers: ['A1', 'B1'], correct: null });
  assert.deepEqual(withoutAnswer(multiple, 1).correct, 1);
});
