// Unit tests for lib/sessions.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canCancel,
  formatDay,
  instructorLabel,
  meetingHref,
  readSessionForm,
  sessionStatusLabel,
  sessionTypeLabel,
  splitSessions,
  todayIn,
} from './sessions.ts';

const sami = { id: 'a1', firstName: 'Sami', lastName: 'Trabelsi', center: { id: 'c1', name: 'Code Academy' } };
const session = (id, day, startTime, status) => ({
  id,
  title: `Session ${id}`,
  type: 'MENTORSHIP',
  status,
  date: `${day}T00:00:00.000Z`,
  startTime,
  endTime: '23:00',
  meetingLink: null,
  instructor: sami,
});

test('labels: type, status (PAID means confirmed), who, and the day', () => {
  assert.equal(sessionTypeLabel('MENTORSHIP'), 'Mentoring call');
  assert.equal(sessionTypeLabel('WEBINAR'), 'Webinar');
  assert.equal(sessionStatusLabel('PAID'), 'Confirmed');
  assert.equal(sessionStatusLabel('PENDING'), 'Waiting for the academy');
  assert.equal(sessionStatusLabel('CANCELLED'), 'Cancelled');
  assert.equal(instructorLabel(sami), 'Sami Trabelsi - Code Academy');
  assert.equal(instructorLabel(null), 'Academy');
  assert.equal(formatDay('2026-11-05T00:00:00.000Z'), 'Thursday 5 November 2026');
  assert.equal(todayIn(new Date(2026, 10, 5, 23, 30)), '2026-11-05');
});

test('upcoming (soonest first) and the others (most recent first)', () => {
  const list = [
    session('later', '2026-11-20', '10:00', 'PENDING'),
    session('past', '2026-10-01', '10:00', 'PAID'),
    session('soon', '2026-11-05', '09:00', 'PAID'),
    session('cancelled', '2026-11-30', '10:00', 'CANCELLED'),
    session('old', '2026-09-01', '10:00', 'PENDING'),
  ];
  const { upcoming, others } = splitSessions(list, '2026-11-05');
  assert.deepEqual(upcoming.map((item) => item.id), ['soon', 'later']);
  assert.deepEqual(others.map((item) => item.id), ['cancelled', 'past', 'old']);
  assert.equal(canCancel(list[0], '2026-11-05'), true);
  assert.equal(canCancel(list[1], '2026-11-05'), false);
  assert.equal(canCancel(list[3], '2026-11-05'), false);
});

test('meeting links: web links only', () => {
  assert.equal(meetingHref('https://meet.example.com/abc'), 'https://meet.example.com/abc');
  assert.equal(meetingHref('zoom.us/j/123'), 'https://zoom.us/j/123');
  assert.equal(meetingHref('javascript:alert(1)'), null);
  assert.equal(meetingHref(null), null);
});

test('the request form: like the API (who, a title, a day not past, the end after the start)', () => {
  const ok = { instructorId: 'a1', type: 'MENTORSHIP', title: ' Review my project ', date: '2026-11-05', startTime: '14:00', endTime: '15:00' };
  assert.deepEqual(readSessionForm(ok, '2026-11-05'), { errors: {}, payload: { ...ok, title: 'Review my project' } });
  assert.deepEqual(
    readSessionForm({ ...ok, instructorId: '', title: '  ', date: '2026-11-04', endTime: '13:00' }, '2026-11-05').errors,
    {
      instructorId: 'Please choose who you want to meet.',
      title: 'Please give the session a title.',
      date: 'Please choose a day that is not past.',
      endTime: 'The session must end after it starts.',
    },
  );
  assert.deepEqual(readSessionForm({ ...ok, date: '', startTime: '' }, '2026-11-05').errors, {
    date: 'Please choose a day.',
    startTime: 'Please choose a start time.',
  });
});
