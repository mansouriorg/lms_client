// The server sends a readable message with every error response
// ({ statusCode, message }). For a refused form (400), `message` is the list
// of what is wrong, like ["Please enter your last name."]. This returns the
// message (a list in one line, without repeats), or `fallback` when there is
// none (no connection, server down, unexpected response).
type ErrorWithResponse = { response?: { data?: { message?: unknown } } };

// The HTTP status of an API error (401, 404...), or null when the server
// did not answer (no connection, server down).
export function apiStatus(error: unknown): number | null {
  const status = (error as { response?: { status?: unknown } } | null | undefined)?.response?.status;
  return typeof status === 'number' ? status : null;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as ErrorWithResponse | null | undefined)?.response
    ?.data?.message;
  if (typeof message === 'string') return message.trim() ? message : fallback;
  if (Array.isArray(message)) {
    const texts = message.filter(
      (item): item is string => typeof item === 'string' && item.trim() !== '',
    );
    return texts.length > 0 ? [...new Set(texts)].join(' ') : fallback;
  }
  return fallback;
}
