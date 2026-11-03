import { redirect } from 'next/navigation';

// The old "stages" catalog from the previous template is replaced by the
// course catalog. Old links to /stages land there.
export default function StagesPage() {
  redirect('/products');
}
