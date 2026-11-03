// Unit tests for the academy side of lib/sessions.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canCancel,
  groupHostedSessions,
  pastStatusLabel,
  readMeetingLink,
  studentLabel,
} from './sessions.ts';

const amira = { firstName: 'Amira', lastName: 'Ben Ali', email: 'amira@example.com', phone: '+216 55 123 456' };
const session = (id, day, startTime, status) => ({
  id,
  title: `Session ${id}`,
  type: 'MENTORSHIP',
  status,
  date: `${day}T00:00:00.000Z`,
  startTime,
  endTime: '23:00',
  meetingLink: null,
  user: amira,
});

test('requests to answer, confirmed sessions (soonest first), and the others', () => {
  const list = [
    session('confirmed-later', '2026-11-20', '10:00', 'PAID'),
    session('request-later', '2026-11-09', '10:00', 'PENDING'),
    session('request-soon', '2026-11-05', '09:00', 'PENDING'),
    session('confirmed-soon', '2026-11-06', '18:00', 'PAID'),
    session('cancelled', '2026-11-30', '10:00', 'CANCELLED'),
    session('never-answered', '2026-11-01', '10:00', 'PENDING'),
    session('done', '2026-10-01', '10:00', 'PAID'),
  ];
  const { requests, confirmed, others } = groupHostedSessions(list, '2026-11-05');
  assert.deepEqual(requests.map((item) => item.id), ['request-soon', 'request-later']);
  assert.deepEqual(confirmed.map((item) => item.id), ['confirmed-soon', 'confirmed-later']);
  assert.deepEqual(others.map((item) => item.id), ['cancelled', 'never-answered', 'done']);
  assert.deepEqual(others.map((item) => pastStatusLabel(item.status)), ['Cancelled', 'Not answered', 'Past']);
  assert.equal(canCancel(list[0], '2026-11-05'), true);
  assert.equal(canCancel(list[6], '2026-11-05'), false);
});

test('the student: their name, or their email', () => {
  assert.equal(studentLabel(amira), 'Amira Ben Ali');
  assert.equal(studentLabel({ ...amira, firstName: '', lastName: ' ' }), 'amira@example.com');
  assert.equal(studentLabel(null), 'A student');
});

test('the meeting link: a web address, or nothing when it can come later', () => {
  assert.deepEqual(readMeetingLink(' https://meet.example.com/abc ', true), { link: 'https://meet.example.com/abc', error: '' });
  assert.deepEqual(readMeetingLink('meet.example.com/abc', true), { link: 'https://meet.example.com/abc', error: '' });
  assert.deepEqual(readMeetingLink('  ', false), { link: null, error: '' });
  assert.equal(readMeetingLink('', true).error, 'Please enter the meeting link.');
  for (const value of ['javascript:alert(1)', 'meet example', 'localhost/abc', `https://meet.example.com/${'a'.repeat(500)}`]) {
    assert.notEqual(readMeetingLink(value, true).error, '', value);
    assert.equal(readMeetingLink(value, true).link, null, value);
  }
});
