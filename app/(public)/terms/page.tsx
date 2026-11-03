import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { brand } from '@/lib/brand';
import { DATA_HOSTING, LEGAL_CONTACT_EMAIL, LEGAL_UPDATED, termsDoc, updatedLabel } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms of use of ${brand.name}: accounts, orders paid to the academies, and the use of the courses.`,
};

// The Terms of Service; the text is in lib/legal.ts
export default function TermsPage() {
  const doc = termsDoc({ brand: brand.name, contactEmail: LEGAL_CONTACT_EMAIL, hosting: DATA_HOSTING });
  return <LegalPage doc={doc} updated={updatedLabel(LEGAL_UPDATED)} current="terms" />;
}
