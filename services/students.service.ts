// Calls to GET /stages/students, for academy admins: the students of their
// academy (every academy for a platform admin). lib/api.ts adds the sign-in
// token; the API checks the role and the academy.
import { api } from '../lib/api';
import type { AcademyStudent } from '../lib/students';

export const studentsService = {
  // The newest student first, each with the courses they bought and their
  // progress
  list: async (): Promise<AcademyStudent[]> => {
    const response = await api.get<AcademyStudent[]>('/stages/students');
    return response.data;
  },
};
