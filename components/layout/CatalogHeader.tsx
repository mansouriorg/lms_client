'use client';

import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { homePathFor } from '@/lib/auth';
import { useSession } from '@/lib/use-session';

// The top bar of the course catalog and the course pages: the logo (home),
// the catalog, the academies, and "Sign in" / "Create account", or "My space"
// when signed in.
export default function CatalogHeader() {
  const { known, user } = useSession();
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Home">
          <Logo size="sm" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2 text-sm">
          <Link href="/products" className="px-3 py-2 text-slate-300 hover:text-white transition-colors">
            Courses
          </Link>
          {/* Hidden on the narrowest phones, where the bar has no room for them */}
          <Link href="/store" className="hidden sm:inline-block px-3 py-2 text-slate-300 hover:text-white transition-colors">
            Store
          </Link>
          <Link href="/centers" className="hidden sm:inline-block px-3 py-2 text-slate-300 hover:text-white transition-colors">
            Academies
          </Link>
          {known && user && (
            <Link
              href={homePathFor(user.role)}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
            >
              My space
            </Link>
          )}
          {known && user === null && (
            <>
              <Link href="/auth/login" className="px-3 py-2 text-slate-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="hidden sm:inline-flex px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
