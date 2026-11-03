// Calls to the /centers routes (academies are called "centers" in the API).
// Anyone can call them; when someone is signed in, lib/api.ts adds the token
// and the API answers for that account (an academy's admins see its drafts).
// The last six are for platform admins only (the API refuses the others).
import { api } from '../lib/api';
import type { Academy, AcademyPage } from '../lib/academies';
import type { AcademyOverview, AddedAdmin, CreatedAcademy, NewAcademyValues } from '../lib/academy-admins';

export const academyService = {
  // Every academy, sorted by name, with its number of published courses
  list: async (): Promise<Academy[]> => {
    const response = await api.get<Academy[]>('/centers');
    return response.data;
  },

  // One academy and its courses, newest first (404 for an unknown academy)
  get: async (academyId: string): Promise<AcademyPage> => {
    const response = await api.get<AcademyPage>(`/centers/${encodeURIComponent(academyId)}`);
    return response.data;
  },

  // Platform admins: every academy with its admins, sorted by name
  overview: async (): Promise<AcademyOverview[]> => {
    const response = await api.get<AcademyOverview[]>('/centers/admin/overview');
    return response.data;
  },

  // Platform admins: a new academy (no admin yet)
  create: async (values: NewAcademyValues): Promise<CreatedAcademy> => {
    const response = await api.post<CreatedAcademy>('/centers', values);
    return response.data;
  },

  // Platform admins: the new details of an academy
  update: async (academyId: string, values: NewAcademyValues): Promise<CreatedAcademy> => {
    const response = await api.patch<CreatedAcademy>(`/centers/${encodeURIComponent(academyId)}`, values);
    return response.data;
  },

  // Platform admins: deletes an academy without courses, digital products,
  // coupons or admins (409 with what is left otherwise)
  remove: async (academyId: string): Promise<string> => {
    const response = await api.delete<{ message: string }>(`/centers/${encodeURIComponent(academyId)}`);
    return response.data.message;
  },

  // Platform admins: an existing account (by email) becomes an admin of the
  // academy. 404 when nobody signed up with that email, 409 when it is a
  // platform admin or already the admin of an academy.
  addAdmin: async (academyId: string, email: string): Promise<AddedAdmin> => {
    const response = await api.post<AddedAdmin>(`/centers/${encodeURIComponent(academyId)}/admins`, { email });
    return response.data;
  },

  // Platform admins: the account stops being an admin of the academy (it is a
  // student account again)
  removeAdmin: async (academyId: string, userId: string): Promise<string> => {
    const response = await api.delete<{ message: string }>(
      `/centers/${encodeURIComponent(academyId)}/admins/${encodeURIComponent(userId)}`,
    );
    return response.data.message;
  },
};
