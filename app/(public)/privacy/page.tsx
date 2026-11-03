import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { brand } from '@/lib/brand';
import { DATA_HOSTING, LEGAL_CONTACT_EMAIL, LEGAL_UPDATED, privacyDoc, updatedLabel } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `The personal data ${brand.name} keeps, who can see it, and your rights under Tunisian law.`,
};

// The Privacy Policy; the text is in lib/legal.ts
export default function PrivacyPage() {
  const doc = privacyDoc({ brand: brand.name, contactEmail: LEGAL_CONTACT_EMAIL, hosting: DATA_HOSTING });
  return <LegalPage doc={doc} updated={updatedLabel(LEGAL_UPDATED)} current="privacy" />;
}
