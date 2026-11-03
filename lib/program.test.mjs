// Unit tests for lib/program.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canMove,
  emptyLessonForm,
  isWebAddress,
  lessonFormFrom,
  programSummary,
  readLessonForm,
  titleError,
  videoKindName,
} from './program.ts';

const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

function lesson(id, videoUrl = null, extra = {}) {
  return { id, title: `Lesson ${id}`, description: null, videoUrl, duration: null, order: 1, ...extra };
}

test('the summary counts modules, lessons and lessons without a video', () => {
  assert.equal(programSummary([]), '0 modules, 0 lessons');
  const modules = [
    { id: 'm1', title: 'Start', order: 1, lessons: [lesson('l1', YOUTUBE)] },
    { id: 'm2', title: 'Hooks', order: 2, lessons: [lesson('l2'), lesson('l3', '')] },
  ];
  assert.equal(programSummary(modules), '2 modules, 3 lessons (2 without a video)');
  assert.equal(programSummary(modules.slice(0, 1)), '1 module, 1 lesson');
});

test('moving: not up for the first one, not down for the last one', () => {
  assert.equal(canMove(0, 3, 'up'), false);
  assert.equal(canMove(0, 3, 'down'), true);
  assert.equal(canMove(2, 3, 'down'), false);
  assert.equal(canMove(1, 3, 'up'), true);
  assert.equal(canMove(0, 1, 'down'), false);
});

test('titles: required, at most 200 characters', () => {
  assert.equal(titleError('  ', 'module'), 'Give the module a title.');
  assert.equal(titleError('Hooks', 'lesson'), null);
  assert.equal(titleError('x'.repeat(201), 'lesson'), 'The title can have at most 200 characters.');
});

test('video links: a full https:// (or http://) address', () => {
  assert.equal(isWebAddress(YOUTUBE), true);
  assert.equal(isWebAddress('http://localhost:3001/uploads/intro.mp4'), true);
  assert.equal(isWebAddress('youtube.com/watch?v=dQw4w9WgXcQ'), false);
  assert.equal(isWebAddress('javascript:alert(1)'), false);
  assert.equal(isWebAddress('https://exa mple.com/video'), false);
  assert.equal(videoKindName('youtube'), 'YouTube video');
  assert.equal(videoKindName(null), 'No video');
});

test('the lesson form: what is sent, with null for empty fields', () => {
  const values = { ...emptyLessonForm(), title: '  Hooks ', videoUrl: ` ${YOUTUBE} `, duration: '12' };
  assert.deepEqual(readLessonForm(values), {
    errors: {},
    payload: { title: 'Hooks', videoUrl: YOUTUBE, duration: 12, description: null },
  });
  const cleared = readLessonForm({ ...emptyLessonForm(), title: 'Intro', description: ' Read first. ' });
  assert.deepEqual(cleared.payload, { title: 'Intro', videoUrl: null, duration: null, description: 'Read first.' });
});

test('the lesson form: errors, and nothing to send', () => {
  const result = readLessonForm({ title: '', videoUrl: 'youtube.com/x', duration: '2.5', description: '' });
  assert.equal(result.payload, null);
  assert.deepEqual(Object.keys(result.errors).sort(), ['duration', 'title', 'videoUrl']);
  assert.equal(readLessonForm({ ...emptyLessonForm(), title: 'A', duration: '0' }).errors.duration !== undefined, true);
  assert.equal(readLessonForm({ ...emptyLessonForm(), title: 'A', duration: '1441' }).payload, null);
});

test('editing a lesson starts from its saved values', () => {
  assert.deepEqual(lessonFormFrom(lesson('l1', YOUTUBE, { duration: 12, description: 'Notes' })), {
    title: 'Lesson l1',
    videoUrl: YOUTUBE,
    duration: '12',
    description: 'Notes',
  });
  assert.deepEqual(lessonFormFrom(lesson('l2')), { title: 'Lesson l2', videoUrl: '', duration: '', description: '' });
});
