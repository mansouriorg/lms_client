// The platform admins' Academies page (/center/academies): every academy
// with its admins (GET /centers/admin/overview), the form of a new academy
// (POST /centers) or of its new details (PATCH /centers/:id), what keeps it
// from being deleted (DELETE /centers/:id) and the email of a new admin
// (POST /centers/:id/admins).
// The file has no imports, so `pnpm test` can run it with Node directly.

// What the platform admins see of an academy admin (never a password)
export type AcademyAdmin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

// One academy of GET /centers/admin/overview (sorted by name). The number of
// courses counts the drafts too; the admins come the oldest first.
export type AcademyOverview = {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  _count: { stages: number; products: number; coupons: number };
  admins: AcademyAdmin[];
};

// The answers of POST /centers, PATCH /centers/:id and POST /centers/:id/admins
export type CreatedAcademy = { message: string; center: { id: string; name: string } };
export type AddedAdmin = { message: string; admin: AcademyAdmin };

export type NewAcademyValues = {
  name: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
};
export type NewAcademyErrors = Partial<Record<keyof NewAcademyValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9 ().-]{6,25}$/;

export function emptyAcademyForm(): NewAcademyValues {
  return { name: '', location: '', contactEmail: '', contactPhone: '' };
}

// The Edit form, filled with the saved details of the academy
export function academyValues(academy: AcademyOverview): NewAcademyValues {
  return {
    name: academy.name,
    location: academy.location,
    contactEmail: academy.contactEmail,
    contactPhone: academy.contactPhone,
  };
}

// The values to send (trimmed, the email in lower case, like the API keeps
// them), or the errors to show. Every field is needed: the academy page
// shows them to visitors.
export function readAcademyForm(values: NewAcademyValues): {
  errors: NewAcademyErrors;
  payload: NewAcademyValues | null;
} {
  const payload = {
    name: values.name.trim(),
    location: values.location.trim(),
    contactEmail: values.contactEmail.trim().toLowerCase(),
    contactPhone: values.contactPhone.trim(),
  };
  const errors: NewAcademyErrors = {};
  if (payload.name === '') errors.name = 'Please enter the name of the academy.';
  if (payload.location === '') errors.location = 'Please enter the city of the academy.';
  if (payload.contactEmail === '') errors.contactEmail = 'Please enter the contact email of the academy.';
  else if (EMAIL.test(payload.contactEmail) === false) errors.contactEmail = 'Please enter a valid email address.';
  if (payload.contactPhone === '') errors.contactPhone = 'Please enter the contact phone of the academy.';
  else if (PHONE.test(payload.contactPhone) === false)
    errors.contactPhone = 'Please enter a valid phone number, like +216 71 000 000.';
  return { errors, payload: Object.keys(errors).length === 0 ? payload : null };
}

// The email of the account to add as an admin, cleaned like the API does,
// and what is wrong with it ('' when nothing)
export function readAdminEmail(value: string): { email: string; error: string } {
  const email = value.trim().toLowerCase();
  if (email === '') return { email, error: 'Please enter the email of the account.' };
  if (EMAIL.test(email) === false) return { email, error: 'Please enter a valid email address.' };
  return { email, error: '' };
}

// "Amira Ben Ali", or the email when the account has no name
export function adminName(admin: AcademyAdmin): string {
  const name = `${admin.firstName} ${admin.lastName}`.trim();
  return name === '' ? admin.email : name;
}

// The line under the title: how many academies and admins, and the
// academies nobody manages yet
export function academiesNote(academies: AcademyOverview[]): string {
  const count = academies.length;
  if (count === 0) return 'No academy yet. Create the first one, then add its admin.';
  const total = count === 1 ? '1 academy' : `${count} academies`;
  const without = academies.filter((academy) => academy.admins.length === 0).length;
  if (without === count) {
    return count === 1
      ? '1 academy, without an admin yet: add one so someone can manage it.'
      : `${total}, without admins yet: add one to each so someone can manage them.`;
  }
  const admins = academies.reduce((sum, academy) => sum + academy.admins.length, 0);
  const first = `${total} and ${admins === 1 ? '1 admin' : `${admins} admins`}.`;
  if (without === 0) return first;
  return without === 1
    ? `${first} 1 academy has no admin yet: add one so someone can manage it.`
    : `${first} ${without} academies have no admin yet: add one to each so someone can manage them.`;
}

// "1 course", "3 coupons"
function countOf(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

// Why the academy cannot be deleted ('' when it can). Like the API, only an
// academy without courses, digital products, coupons or admins is deleted:
// its coupons would work for every academy, its admins would have none.
export function deleteBlockers(academy: AcademyOverview): string {
  const counts: [number, string][] = [
    [academy._count.stages, 'course'],
    [academy._count.products, 'digital product'],
    [academy._count.coupons, 'coupon'],
    [academy.admins.length, 'admin'],
  ];
  const parts = counts.filter(([count]) => count > 0).map(([count, name]) => countOf(count, name));
  if (parts.length === 0) return '';
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  return `This academy cannot be deleted while it has ${list}.`;
}

// After adding or removing an admin. The API reads the role on every
// request; the app opens the academy space the next time the admin loads it.
export function addedText(admin: AcademyAdmin, academyName: string): string {
  return `${adminName(admin)} is now an admin of ${academyName}. The app opens the academy space for them the next time they load it.`;
}

export function removedText(admin: AcademyAdmin, academyName: string): string {
  return `${adminName(admin)} is no longer an admin of ${academyName}: the account is a student account again.`;
}
