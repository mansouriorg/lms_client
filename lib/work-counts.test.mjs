// Unit tests for lib/work-counts.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  RECOUNT_AFTER_MS,
  WORK_CHANGED,
  announceWorkChanged,
  badgeHint,
  badgeText,
  recountDue,
  totalOf,
} from './work-counts.ts';

test('the number in the menu: nothing for none or unknown, 99+ above 99', () => {
  assert.equal(badgeText(null), '');
  assert.equal(badgeText(0), '');
  assert.equal(badgeText(-1), '');
  assert.equal(badgeText(1), '1');
  assert.equal(badgeText(99), '99');
  assert.equal(badgeText(100), '99+');
});

test('what a screen reader hears', () => {
  assert.equal(badgeHint(1, 'to-review'), '1 project waiting for a review');
  assert.equal(badgeHint(3, 'to-review'), '3 projects waiting for a review');
  assert.equal(badgeHint(1, 'to-do'), '1 project to change or send');
  assert.equal(badgeHint(2, 'to-do'), '2 projects to change or send');
  assert.equal(badgeHint(1, 'questions'), '1 question waiting for an answer');
  assert.equal(badgeHint(4, 'questions'), '4 questions waiting for an answer');
  assert.equal(badgeHint(1, 'requests'), '1 session request to answer');
  assert.equal(badgeHint(2, 'requests'), '2 session requests to answer');
});

test('when a page change counts again: never asked, or asked 30 seconds ago or more', () => {
  assert.equal(RECOUNT_AFTER_MS, 30000);
  assert.equal(recountDue(null, 1000), true);
  assert.equal(recountDue(1000, 1000 + 29999), false);
  assert.equal(recountDue(1000, 1000 + 30000), true);
});

test('the dot on the phone menu button: the numbers known so far', () => {
  assert.equal(totalOf([null, null]), null);
  assert.equal(totalOf([null, 0]), 0);
  assert.equal(totalOf([2, null, 3]), 5);
  assert.equal(totalOf([]), null);
});

test('a page tells the menu to count again', () => {
  // Without a browser (server rendering): nothing happens
  assert.doesNotThrow(() => announceWorkChanged());
  const heard = [];
  globalThis.window = new EventTarget();
  try {
    window.addEventListener(WORK_CHANGED, (event) => heard.push(event.type));
    announceWorkChanged();
    announceWorkChanged();
  } finally {
    delete globalThis.window;
  }
  assert.deepEqual(heard, ['lms:work-changed', 'lms:work-changed']);
});
