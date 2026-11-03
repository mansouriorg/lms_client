// The academy pages (/centers and /centers/[id]): the shape of what
// GET /centers and GET /centers/:id send, and small helpers.
// The file has no imports, so `pnpm test` can run it with Node directly.

// GET /centers: one academy. Anyone can read the list; the course count only
// counts the published courses.
export type Academy = {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  _count?: { stages: number };
};

// One course of an academy page (the same fields as the catalog, without the
// academy name).
export type AcademyCourse = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  category: string | null;
  level: string | null;
  _count?: { modules: number };
};

// GET /centers/:id: the academy and its courses, newest first. Visitors and
// students get the published ones; the academy's admins also get its drafts.
export type AcademyPage = Academy & { stages: AcademyCourse[] };

// Search in the name and the location, in any letter case (every word typed
// must match). The API sends the academies sorted by name.
export function filterAcademies(academies: Academy[], query: string): Academy[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word !== '');
  return academies.filter((academy) => {
    const searchable = `${academy.name} ${academy.location}`.toLowerCase();
    return words.every((word) => searchable.includes(word));
  });
}

// 0 -> "No courses yet", 1 -> "1 course", 4 -> "4 courses".
export function courseCountLabel(count: number): string {
  if (count <= 0) return 'No courses yet';
  return count === 1 ? '1 course' : `${count} courses`;
}

// A link that opens the mail app, or null when the address does not look
// like one.
export function mailHref(email: string): string | null {
  const address = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? `mailto:${address}` : null;
}

// A link that calls the number from a phone: "+216 71 000 000" ->
// "tel:+21671000000". null when it has fewer than 6 digits.
export function phoneHref(phone: string): string | null {
  const number = phone.trim();
  const digits = number.replace(/[^0-9]/g, '');
  if (digits.length < 6) return null;
  return `tel:${number.startsWith('+') ? '+' : ''}${digits}`;
}
