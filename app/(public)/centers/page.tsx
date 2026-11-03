import type { Metadata } from 'next';
import AcademyDirectory from '@/components/academies/AcademyDirectory';

export const metadata: Metadata = {
  title: 'Academies',
};

// The list of academies; the page itself loads them in the browser.
export default function CentersPage() {
  return <AcademyDirectory />;
}
