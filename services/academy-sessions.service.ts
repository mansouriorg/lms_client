// Calls to the /bookings routes, for academy admins: the live sessions
// (mentoring calls and webinars) students asked them for. lib/api.ts adds
// the sign-in token; the API only shows and changes the sessions of the user
// of the token (a super admin can change every session).
import { api } from '../lib/api';
import type { HostedSession, SessionAnswer } from '../lib/sessions';

export const academySessionsService = {
  // The sessions students asked this admin for, the soonest first
  hosted: async (): Promise<HostedSession[]> => {
    const response = await api.get<HostedSession[]>('/bookings/instructor/my-sessions');
    return response.data;
  },

  // Confirm (PAID, with the meeting link when there is one) or cancel
  answer: async (
    sessionId: string,
    status: SessionAnswer,
    meetingLink: string | null,
  ): Promise<{ message: string }> => {
    const body = meetingLink === null ? { status } : { status, meetingLink };
    const response = await api.patch<{ message: string }>(
      `/bookings/${encodeURIComponent(sessionId)}/status`,
      body,
    );
    return response.data;
  },
};
