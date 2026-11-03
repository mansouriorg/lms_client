// Unit tests for lib/learning.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  allLessons,
  courseButtonLabel,
  courseToContinue,
  firstLessonToWatch,
  isFinished,
  learningStats,
  nextLessonId,
  percentDone,
  videoSource,
} from './learning.ts';

const lesson = (id) => ({ id, title: `Lesson ${id}`, description: null, duration: 10, videoUrl: null });
const course = {
  id: 'c1',
  title: 'React from zero',
  price: 160,
  hasAccess: true,
  center: { name: 'Code Academy' },
  modules: [
    { id: 'm1', title: 'Start', lessons: [lesson('l1'), lesson('l2')] },
    { id: 'm2', title: 'Next', lessons: [lesson('l3')] },
  ],
};
const empty = { ...course, modules: [] };

test('lessons in the order of the program, and the next one', () => {
  assert.deepEqual(allLessons(course).map((l) => l.id), ['l1', 'l2', 'l3']);
  assert.equal(nextLessonId(course, 'l1'), 'l2');
  assert.equal(nextLessonId(course, 'l2'), 'l3');
  assert.equal(nextLessonId(course, 'l3'), null);
  assert.equal(nextLessonId(course, 'unknown'), null);
});

test('the player starts at the first lesson not completed yet', () => {
  assert.equal(firstLessonToWatch(course, []), 'l1');
  assert.equal(firstLessonToWatch(course, ['l1']), 'l2');
  assert.equal(firstLessonToWatch(course, ['l1', 'l3']), 'l2');
  assert.equal(firstLessonToWatch(course, ['l1', 'l2', 'l3']), 'l1');
  assert.equal(firstLessonToWatch(empty, []), null);
});

test('percentage of the course completed', () => {
  assert.equal(percentDone(0, 3), 0);
  assert.equal(percentDone(1, 3), 33);
  assert.equal(percentDone(3, 3), 100);
  assert.equal(percentDone(0, 0), 0);
});

test('YouTube and Vimeo links become their embedded players', () => {
  const youtube = { kind: 'youtube', src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' };
  assert.deepEqual(videoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10'), youtube);
  assert.deepEqual(videoSource('https://youtu.be/dQw4w9WgXcQ'), youtube);
  assert.deepEqual(videoSource('https://m.youtube.com/watch?v=dQw4w9WgXcQ'), youtube);
  assert.deepEqual(videoSource('https://www.youtube.com/embed/dQw4w9WgXcQ'), youtube);
  assert.deepEqual(videoSource('https://vimeo.com/76979871'), {
    kind: 'vimeo',
    src: 'https://player.vimeo.com/video/76979871',
  });
  assert.deepEqual(videoSource('https://player.vimeo.com/video/76979871?h=abc'), {
    kind: 'vimeo',
    src: 'https://player.vimeo.com/video/76979871',
  });
});

test('video files play in the page; other web links open in a new tab', () => {
  assert.deepEqual(videoSource(' https://cdn.example.com/react/lesson-1.MP4 '), {
    kind: 'file',
    src: 'https://cdn.example.com/react/lesson-1.MP4',
  });
  assert.deepEqual(videoSource('https://drive.example.com/view/abc'), {
    kind: 'link',
    src: 'https://drive.example.com/view/abc',
  });
  assert.deepEqual(videoSource('https://www.youtube.com/watch?v=bad'), {
    kind: 'link',
    src: 'https://www.youtube.com/watch?v=bad',
  });
});

test('no video, or an unsafe link: nothing is shown', () => {
  assert.equal(videoSource(null), null);
  assert.equal(videoSource(''), null);
  assert.equal(videoSource('javascript:alert(1)'), null);
  assert.equal(videoSource('ftp://files.example.com/a.mp4'), null);
  assert.equal(videoSource('cdn.example.com/a.mp4'), null);
});

test('the dashboard: the course to continue, its button, the numbers', () => {
  const mine = (id, completed, total) => ({
    id,
    title: id,
    category: null,
    level: null,
    center: null,
    totalLessons: total,
    completedLessons: completed,
    percentage: percentDone(completed, total),
  });
  const fresh = mine('fresh', 0, 4);
  const halfway = mine('halfway', 2, 4);
  const done = mine('done', 3, 3);
  const noLessons = mine('no-lessons', 0, 0);
  // GET /stages/mine sends the newest purchase first
  assert.equal(courseToContinue([fresh, halfway, done])?.id, 'halfway');
  assert.equal(courseToContinue([done, noLessons, fresh])?.id, 'fresh');
  assert.equal(courseToContinue([done, noLessons]), null);
  assert.equal(courseToContinue([]), null);
  assert.equal(isFinished(done), true);
  assert.equal(isFinished(noLessons), false);
  assert.equal(courseButtonLabel(fresh), 'Start');
  assert.equal(courseButtonLabel(halfway), 'Continue');
  assert.equal(courseButtonLabel(done), 'Review the course');
  assert.deepEqual(learningStats([fresh, halfway, done, noLessons]), {
    courses: 4,
    finished: 1,
    lessonsCompleted: 5,
  });
});
