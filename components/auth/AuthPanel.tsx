import type { ReactNode } from 'react';
import Logo from '@/components/ui/Logo';

// The frame of the small sign-in pages (forgotten password): the logo, a
// title, a short text and the content, centered on the dark background.
export default function AuthPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 py-16 font-sans">
      <section className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10">
        <Logo />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          <p className="text-sm leading-relaxed text-slate-400">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
