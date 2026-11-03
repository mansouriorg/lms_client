'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, BookOpen, ChevronLeft, Mail, MapPin, Phone, RotateCcw } from 'lucide-react';
import CourseCard from '@/components/catalog/CourseCard';
import CatalogHeader from '@/components/layout/CatalogHeader';
import { type AcademyPage, courseCountLabel, mailHref, phoneHref } from '@/lib/academies';
import { apiErrorMessage } from '@/lib/api-error';
import { courseInitials } from '@/lib/catalog';
import { useSession } from '@/lib/use-session';
import { academyService } from '@/services/academy.service';

// One academy (/centers/[id]): who they are, how to contact them, and their
// courses (GET /centers/:id, open to everyone).
export default function AcademyProfilePage() {
  const { id: academyId = '' } = useParams<{ id: string }>();
  const { known, user } = useSession();
  // Load again when the viewer changes (sign-in or sign-out): an academy's
  // own admins also get its draft courses.
  const viewerKey = known ? (user?.id ?? 'visitor') : null;

  const [academy, setAcademy] = useState<AcademyPage | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (viewerKey === null || academyId === '') return;
    let active = true;
    academyService.get(academyId).then(
      (loaded) => {
        if (active) {
          setAcademy(loaded);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load this academy. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [academyId, viewerKey, reloadKey]);

  let content: React.ReactNode;
  if (loadError) {
    content = (
      <div
        role="alert"
        className="max-w-xl mx-auto flex flex-col gap-4 p-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl"
      >
        <span className="flex items-start gap-2">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {loadError}
        </span>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setLoadError('');
              setReloadKey((key) => key + 1);
            }}
            className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/centers"
            className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            All academies
          </Link>
        </div>
      </div>
    );
  } else if (academy === null) {
    content = (
      <p role="status" className="text-center text-sm text-slate-400 py-12">
        Loading the academy...
      </p>
    );
  } else {
    const email = mailHref(academy.contactEmail);
    const phone = phoneHref(academy.contactPhone);
    content = (
      <div className="space-y-12">
        {/* Who they are and how to contact them */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
          <span className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl shrink-0">
            {courseInitials(academy.name)}
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {academy.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-slate-400">
              <MapPin aria-hidden="true" className="w-4 h-4 shrink-0" />
              {academy.location}
            </p>
          </div>
          <ul aria-label="Contact" className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-300">
              <Mail aria-hidden="true" className="w-4 h-4 text-indigo-400 shrink-0" />
              {email ? (
                <a href={email} className="hover:text-white underline-offset-4 hover:underline">
                  {academy.contactEmail}
                </a>
              ) : (
                academy.contactEmail
              )}
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Phone aria-hidden="true" className="w-4 h-4 text-indigo-400 shrink-0" />
              {phone ? (
                <a href={phone} className="hover:text-white underline-offset-4 hover:underline">
                  {academy.contactPhone}
                </a>
              ) : (
                academy.contactPhone
              )}
            </li>
          </ul>
        </div>

        {/* Their courses */}
        <section aria-labelledby="academy-courses" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="academy-courses" className="text-2xl font-bold text-white">
              Courses
            </h2>
            <p className="text-sm text-slate-400">{courseCountLabel(academy.stages.length)}</p>
          </div>
          {academy.stages.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-dashed border-slate-800">
              <BookOpen aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 font-medium">This academy has not published a course yet.</p>
              <Link href="/products" className="inline-block mt-3 text-sm text-indigo-400 hover:text-indigo-300">
                Browse every course
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {academy.stages.map((course) => (
                <li key={course.id}>
                  <CourseCard course={course} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      <CatalogHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/centers"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-8"
        >
          <ChevronLeft aria-hidden="true" className="w-5 h-5 mr-1" />
          All academies
        </Link>
        {content}
      </main>
    </div>
  );
}
