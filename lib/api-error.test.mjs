// Unit tests for lib/api-error.ts. Run with `pnpm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiErrorMessage, apiStatus } from './api-error.ts';

test('shows the message the server sent', () => {
  const error = {
    response: { data: { statusCode: 401, message: 'Incorrect email or password.' } },
  };
  assert.equal(apiErrorMessage(error, 'Could not sign in.'), 'Incorrect email or password.');
});

test('falls back when there is no server message (network error, server down)', () => {
  assert.equal(apiErrorMessage(new Error('Network Error'), 'Could not sign in.'), 'Could not sign in.');
  assert.equal(apiErrorMessage(undefined, 'Could not sign in.'), 'Could not sign in.');
  assert.equal(apiErrorMessage({ response: { data: {} } }, 'Could not sign in.'), 'Could not sign in.');
});

test('ignores an empty or non-text message', () => {
  assert.equal(apiErrorMessage({ response: { data: { message: '   ' } } }, 'Fallback.'), 'Fallback.');
  assert.equal(apiErrorMessage({ response: { data: { message: [1, '  '] } } }, 'Fallback.'), 'Fallback.');
  assert.equal(apiErrorMessage({ response: { data: { message: { text: 'x' } } } }, 'Fallback.'), 'Fallback.');
});

test('a refused form (400): the list of what is wrong, in one line, without repeats', () => {
  const error = {
    response: {
      data: {
        statusCode: 400,
        message: ['Please enter your last name.', 'Please enter a valid phone number.', 'Please enter your last name.'],
      },
    },
  };
  assert.equal(
    apiErrorMessage(error, 'Fallback.'),
    'Please enter your last name. Please enter a valid phone number.',
  );
});

test('the status of an API error, or null when the server did not answer', () => {
  assert.equal(apiStatus({ response: { status: 401, data: { message: 'Unauthorized' } } }), 401);
  assert.equal(apiStatus(new Error('Network Error')), null);
  assert.equal(apiStatus(undefined), null);
  assert.equal(apiStatus({ response: { status: '401' } }), null);
});
