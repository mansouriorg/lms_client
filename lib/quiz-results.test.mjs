// Unit tests for lib/quiz-results.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  columnSummary,
  moduleNumber,
  personName,
  resultColumns,
  resultsCsv,
  resultsFileName,
  scoreDetail,
  scoreOf,
  scoreTone,
  takenLabel,
  visibleStudents,
} from './quiz-results.ts';

const best = (correct, total, percentage) => ({ correct, total, percentage, createdAt: '2026-11-01T10:00:00.000Z' });
const student = (id, firstName, lastName, email, results = []) => ({ id, firstName, lastName, email, results });

const DATA = {
  modules: [
    { id: 'm1', title: 'Getting started', questions: 3 },
    { id: 'm2', title: 'State', questions: 0 },
    { id: 'm3', title: 'Effects', questions: 2 },
    { id: 'm4', title: 'Routing', questions: 0 },
  ],
  students: [
    student('u2', 'Youssef', 'Trabelsi', 'youssef@example.com'),
    student('u1', 'Amira', 'Ben Ali', 'amira@example.com', [
      { moduleId: 'm1', best: best(2, 3, 67), attempts: 2 },
      { moduleId: 'm4', best: best(1, 2, 50), attempts: 1 },
    ]),
    student('u3', '', '', 'sara@example.com', [{ moduleId: 'm1', best: best(1, 2, 50), attempts: 4 }]),
  ],
};

test('the columns: the modules with a quiz, and those with scores', () => {
  // m2 has no question and no score; m4 lost its questions but keeps a score
  assert.deepEqual(
    resultColumns(DATA).map((courseModule) => courseModule.id),
    ['m1', 'm3', 'm4'],
  );
  assert.deepEqual(resultColumns({ modules: DATA.modules, students: [] }).map((courseModule) => courseModule.id), ['m1', 'm3']);
  assert.equal(moduleNumber(DATA, 'm3'), 3);
  assert.equal(moduleNumber(DATA, 'm404'), 0);
});

test('the students: by name, found by name or email', () => {
  assert.equal(personName(DATA.students[1]), 'Amira Ben Ali');
  assert.equal(personName(DATA.students[2]), 'sara@example.com');
  assert.deepEqual(
    visibleStudents(DATA.students, '').map((item) => item.id),
    ['u1', 'u3', 'u2'],
  );
  assert.deepEqual(
    visibleStudents(DATA.students, '  BEN  amira ').map((item) => item.id),
    ['u1'],
  );
  assert.deepEqual(
    visibleStudents(DATA.students, 'example.com').map((item) => item.id),
    ['u1', 'u3', 'u2'],
  );
  assert.deepEqual(visibleStudents(DATA.students, 'nobody'), []);
  assert.equal(DATA.students[0].id, 'u2', 'the list given is not reordered');
});

test('the score of a student at a quiz', () => {
  const amira = DATA.students[1];
  assert.equal(scoreOf(amira, 'm3'), null);
  assert.equal(scoreOf(student('u9', 'A', 'B', 'a@b.c', [{ moduleId: 'm1', best: null, attempts: 0 }]), 'm1'), null);
  assert.equal(scoreDetail(scoreOf(amira, 'm1')), '2 of 3 right, 2 attempts');
  assert.equal(scoreDetail(scoreOf(amira, 'm4')), '1 of 2 right, 1 attempt');
  assert.deepEqual([100, 70, 69, 40, 39, 0].map(scoreTone), ['high', 'high', 'mid', 'mid', 'low', 'low']);
});

test('the average of each quiz', () => {
  // m1: 2 of 3 and 1 of 2 right, 58.3% on average (the shown 67% and 50%
  // would give 58.5%, so 59%)
  assert.deepEqual(columnSummary(DATA.students, 'm1'), { taken: 2, average: 58 });
  assert.deepEqual(columnSummary(DATA.students, 'm3'), { taken: 0, average: null });
  assert.deepEqual(columnSummary([], 'm1'), { taken: 0, average: null });
  assert.equal(takenLabel(2, 3), '2 of 3 students took it');
  assert.equal(takenLabel(1, 1), '1 of 1 student took it');
  assert.equal(takenLabel(0, 3), 'Nobody took it yet');
});

test('the CSV file: one line per student, the best score and attempts of each quiz', () => {
  const csv = resultsCsv(DATA, visibleStudents(DATA.students, ''));
  assert.ok(csv.startsWith('\ufeff'), 'starts with a byte order mark');
  assert.deepEqual(csv.slice(1).split('\r\n'), [
    'Student,Email,Module 1: Getting started - best (%),Module 1: Getting started - attempts,Module 3: Effects - best (%),Module 3: Effects - attempts,Module 4: Routing - best (%),Module 4: Routing - attempts',
    'Amira Ben Ali,amira@example.com,67,2,,,50,1',
    'sara@example.com,sara@example.com,50,4,,,,',
    'Youssef Trabelsi,youssef@example.com,,,,,,',
    '',
  ]);
  // Quoted when needed; a text that a spreadsheet would run starts with '
  const tricky = {
    modules: [{ id: 'm1', title: 'Forms, "inputs"', questions: 2 }],
    students: [student('u1', '=HYPERLINK("x")', '', 'a@b.c', [{ moduleId: 'm1', best: best(1, 2, 50), attempts: 1 }])],
  };
  assert.deepEqual(resultsCsv(tricky, tricky.students).slice(1).split('\r\n'), [
    'Student,Email,"Module 1: Forms, ""inputs"" - best (%)","Module 1: Forms, ""inputs"" - attempts"',
    `"'=HYPERLINK(""x"")",a@b.c,50,1`,
    '',
  ]);
  // Only the students given: none
  assert.equal(resultsCsv(DATA, []).slice(1).split('\r\n').length, 2);
});

test('the name of the CSV file', () => {
  assert.equal(resultsFileName('React from zero', '2026-11-01'), 'quiz-results-react-from-zero-2026-11-01.csv');
  assert.equal(resultsFileName('D\u00e9veloppement Web: les bases ?', '2026-11-01'), 'quiz-results-developpement-web-les-bases-2026-11-01.csv');
  assert.equal(resultsFileName('***', '2026-11-01'), 'quiz-results-course-2026-11-01.csv');
  assert.equal(resultsFileName('a'.repeat(39) + ' b c', '2026-11-01'), `quiz-results-${'a'.repeat(39)}-2026-11-01.csv`);
});
