// Unit tests for lib/practice-quiz.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  attemptAnswers,
  bestBadge,
  bestScoreText,
  moduleQuizCount,
  quizAfterLesson,
  quizLabel,
  quizScore,
  resultFor,
  savedMessage,
  scoreMessage,
  withResult,
} from './practice-quiz.ts';

const answer = (questionId, right) => ({ questionId, chosen: 0, check: { right, correctAnswer: right ? 0 : 1, explanation: null } });
const best = (correct, total, percentage) => ({ correct, total, percentage, createdAt: '2026-11-01T10:00:00.000Z' });
const saved = (correct, total, percentage, bestScore) => ({
  message: 'Your score is saved.',
  correct,
  total,
  percentage,
  best: bestScore,
  attempts: 2,
});

test('the score and its message', () => {
  assert.deepEqual(quizScore([]), { right: 0, total: 0, percentage: 0 });
  assert.deepEqual(quizScore([answer('q1', true), answer('q2', false), answer('q3', true)]), { right: 2, total: 3, percentage: 67 });
  assert.equal(scoreMessage(100), 'Perfect: every answer is right.');
  assert.equal(scoreMessage(70), 'Well done. Read the explanations of the answers you missed.');
  assert.equal(scoreMessage(40), 'A good start. Read the explanations, then try again.');
  assert.equal(scoreMessage(39), 'Review the lessons of this module, then try again.');
});

test('the quiz of a module in the course player', () => {
  const course = {
    modules: [
      { id: 'm1', lessons: [{ id: 'l1' }, { id: 'l2' }], _count: { quizBank: 3 } },
      { id: 'm2', lessons: [{ id: 'l3' }], _count: { quizBank: 0 } },
      { id: 'm3', lessons: [{ id: 'l4' }] },
    ],
  };
  assert.deepEqual(course.modules.map(moduleQuizCount), [3, 0, 0]);
  assert.equal(quizLabel(1), 'Quiz: 1 question');
  assert.equal(quizLabel(3), 'Quiz: 3 questions');
  assert.equal(quizAfterLesson(course, 'l2'), 'm1');
  assert.equal(quizAfterLesson(course, 'l1'), null);
  assert.equal(quizAfterLesson(course, 'l3'), null);
  assert.equal(quizAfterLesson(course, 'l4'), null);
  assert.equal(quizAfterLesson(course, 'l404'), null);
});

test('the answers sent at the end of the quiz', () => {
  assert.deepEqual(attemptAnswers([]), []);
  assert.deepEqual(
    attemptAnswers([
      { questionId: 'q1', chosen: 2, check: { right: true, correctAnswer: 2, explanation: null } },
      { questionId: 'q2', chosen: 0, check: { right: false, correctAnswer: 1, explanation: 'Because.' } },
    ]),
    [
      { questionId: 'q1', answer: 2 },
      { questionId: 'q2', answer: 0 },
    ],
  );
});

test('the saved score and the best one', () => {
  assert.equal(bestScoreText(best(2, 3, 67), 2), 'Best score: 2 of 3 right (67%) after 2 attempts');
  assert.equal(bestScoreText(best(3, 3, 100), 1), 'Best score: 3 of 3 right (100%) after 1 attempt');
  assert.equal(bestBadge(best(2, 3, 67)), 'Best: 67%');
  // The first score, a better one, an equal one, a lower one
  assert.equal(savedMessage(null, saved(1, 3, 33, best(1, 3, 33))), 'Your score is saved.');
  assert.equal(savedMessage(best(1, 3, 33), saved(2, 3, 67, best(2, 3, 67))), 'Your score is saved: a new best score.');
  assert.equal(
    savedMessage(best(2, 3, 67), saved(2, 3, 67, best(2, 3, 67))),
    'Your score is saved. Your best score is still 2 of 3 right (67%).',
  );
  assert.equal(
    savedMessage(best(3, 4, 75), saved(2, 3, 67, best(3, 4, 75))),
    'Your score is saved. Your best score is still 3 of 4 right (75%).',
  );
  // Compared without rounding, like the server: 67 of 100 beats 2 of 3 (66.7%)
  assert.equal(savedMessage(best(2, 3, 67), saved(67, 100, 67, best(67, 100, 67))), 'Your score is saved: a new best score.');
  assert.equal(
    savedMessage(best(67, 100, 67), saved(2, 3, 67, best(67, 100, 67))),
    'Your score is saved. Your best score is still 67 of 100 right (67%).',
  );
});

test('the best score of each module quiz in the program', () => {
  const results = [
    { moduleId: 'm1', best: best(1, 3, 33), attempts: 1 },
    { moduleId: 'm3', best: best(1, 1, 100), attempts: 4 },
  ];
  assert.deepEqual(resultFor(results, 'm3'), results[1]);
  assert.equal(resultFor(results, 'm2'), null);
  const updated = withResult(results, { moduleId: 'm1', best: best(3, 3, 100), attempts: 2 });
  assert.deepEqual(
    updated.map((result) => [result.moduleId, result.best.correct, result.attempts]),
    [
      ['m3', 1, 4],
      ['m1', 3, 2],
    ],
  );
  assert.equal(withResult(updated, { moduleId: 'm2', best: best(0, 2, 0), attempts: 1 }).length, 3);
  assert.equal(results.length, 2, 'the list given is not changed');
});
