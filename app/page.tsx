import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileCheck,
  Lock,
  MessageSquare,
  PlayCircle,
  Tag,
  TrendingUp,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { brand } from '@/lib/brand';

// Every feature listed here exists in the API (server/src): courses with
// modules and lessons, progress, lesson Q&A, project reviews, bookings,
// digital products and coupons.
const features = [
  {
    icon: BookOpen,
    title: 'Structured courses',
    text: 'Every course is organized in modules and ordered video lessons, so students always know what comes next.',
  },
  {
    icon: TrendingUp,
    title: 'Progress tracking',
    text: 'Students mark lessons as done and see how much of each course they have completed.',
  },
  {
    icon: MessageSquare,
    title: 'Questions under each lesson',
    text: 'Stuck on a lesson? Ask right there. Instructors and classmates reply, and the best answer is marked.',
  },
  {
    icon: FileCheck,
    title: 'Reviewed assignments',
    text: 'Students submit their project links and get an approval or clear feedback on what to improve.',
  },
  {
    icon: CalendarCheck,
    title: 'Live sessions',
    text: 'Book one-to-one mentoring or join a webinar with an instructor.',
  },
  {
    icon: Tag,
    title: 'Course store and coupons',
    text: 'Sell courses and downloadable resources, with discount codes for your campaigns.',
  },
];

const steps = [
  {
    title: 'Create a free account',
    text: 'Sign up in a minute. Creating an account costs nothing.',
  },
  {
    title: 'Choose your course',
    text: 'Browse the catalog and pay only for the courses you pick.',
  },
  {
    title: 'Learn and get feedback',
    text: 'Follow the lessons, ask questions, submit your projects and book live sessions.',
  },
];

const instructorTools = [
  'Build courses with modules and lessons',
  'Review student projects and leave feedback',
  'Accept live session requests and share the meeting link',
  'Create coupon codes and follow your orders',
];

// Decorative preview of the student space (not real data).
const previewModules = [
  { title: 'Module 1: Getting started', state: 'done' },
  { title: 'Module 2: Core concepts', state: 'done' },
  { title: 'Module 3: Your first project', state: 'current' },
  { title: 'Module 4: Going further', state: 'locked' },
];

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-500';
const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-300 selection:bg-indigo-500 selection:text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label={`${brand.name} home`}>
            <Logo size="sm" />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#features" className="text-slate-300 transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="text-slate-300 transition-colors hover:text-white">How it works</a>
            <a href="#instructors" className="text-slate-300 transition-colors hover:text-white">For instructors</a>
            <Link href="/products" className="text-slate-300 transition-colors hover:text-white">Courses</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/auth/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[80%] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Learning management system
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Learn with structured courses and{' '}
                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">real instructors</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                {brand.name} brings your courses, lessons, progress, questions, assignments and live sessions together in one place.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/products" className={primaryButton}>
                  Browse courses
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link href="/auth/register" className={secondaryButton}>
                  Create a free account
                </Link>
              </div>
            </div>

            {/* Decorative preview of the student space */}
            <div aria-hidden="true" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-indigo-950/40 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Course progress</p>
                  <p className="mt-1 text-lg font-semibold text-white">Web development basics</p>
                </div>
                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">60%</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-800">
                <div className="h-2 w-3/5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              </div>
              <ul className="mt-6 space-y-3">
                {previewModules.map((module) => (
                  <li
                    key={module.title}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                      module.state === 'current'
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/30 text-slate-300'
                    }`}
                  >
                    {module.state === 'done' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                    {module.state === 'current' && <PlayCircle className="h-4 w-4 shrink-0 text-indigo-300" />}
                    {module.state === 'locked' && <Lock className="h-4 w-4 shrink-0 text-slate-500" />}
                    {module.title}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                <div>
                  <p className="text-sm font-medium text-white">Your instructor replied to your question</p>
                  <p className="mt-1 text-xs text-slate-400">Lesson 3.2: Fetching data from an API</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-title" className="border-t border-slate-800 bg-slate-950/30 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 id="features-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything a course needs, in one place
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                From the first lesson to the final project review, students and instructors work in the same space.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                      <Icon aria-hidden="true" className="h-5 w-5 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" aria-labelledby="how-title" className="border-t border-slate-800 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="how-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How it works</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* For instructors and academies */}
        <section id="instructors" aria-labelledby="instructors-title" className="border-t border-slate-800 bg-slate-950/30 py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <h2 id="instructors-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Run your academy with {brand.name}
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Instructors and academy admins get their own space to publish courses and follow their students.
              </p>
              <Link href="/auth/login" className={`${secondaryButton} mt-8`}>
                Open the instructor space
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-4">
              {instructorTools.map((tool) => (
                <li key={tool} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <span className="text-slate-200">{tool}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final call to action */}
        <section aria-labelledby="cta-title" className="border-t border-slate-800 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 id="cta-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to start learning?</h2>
            <p className="mt-4 text-lg text-slate-300">Create your free account and pick your first course.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/auth/register" className={primaryButton}>
                Create a free account
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href="/products" className={secondaryButton}>
                Browse courses
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
          <div className="max-w-sm">
            <Logo size="sm" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{brand.tagline}.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
            <Link href="/products" className="text-slate-300 hover:text-white">Courses</Link>
            <Link href="/centers" className="text-slate-300 hover:text-white">Academies</Link>
            <Link href="/auth/login" className="text-slate-300 hover:text-white">Sign in</Link>
            <Link href="/auth/register" className="text-slate-300 hover:text-white">Create an account</Link>
            <Link href="/terms" className="text-slate-300 hover:text-white">Terms of Service</Link>
            <Link href="/privacy" className="text-slate-300 hover:text-white">Privacy Policy</Link>
          </nav>
        </div>
        <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-400">
          &copy; {brand.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
