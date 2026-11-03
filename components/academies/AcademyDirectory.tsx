'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Building2, ChevronRight, MapPin, RotateCcw, Search } from 'lucide-react';
import CatalogHeader from '@/components/layout/CatalogHeader';
import { type Academy, courseCountLabel, filterAcademies } from '@/lib/academies';
import { apiErrorMessage } from '@/lib/api-error';
import { brand } from '@/lib/brand';
import { courseInitials } from '@/lib/catalog';
import { academyService } from '@/services/academy.service';

// The list of academies (/centers): GET /centers, open to everyone.
export default function AcademyDirectory() {
  // null while the first load is running
  const [academies, setAcademies] = useState<Academy[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    academyService.list().then(
      (list) => {
        if (active) {
          setAcademies(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load the academies. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visible = useMemo(() => filterAcademies(academies ?? [], query), [academies, query]);

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      <CatalogHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Academies</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          The schools that teach on {brand.name}. Open one to see its courses and how to contact it.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="relative">
          <label htmlFor="academy-search" className="sr-only">
            Search academies
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search aria-hidden="true" className="w-5 h-5 text-slate-500" />
          </div>
          <input
            id="academy-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city"
            className="block w-full h-12 pl-12 pr-4 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm"
          />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {loadError && (
          <div
            role="alert"
            className="max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
          >
            <span className="flex items-start gap-2">
              <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              {loadError}
            </span>
            <button
              type="button"
              onClick={() => {
                setLoadError('');
                setReloadKey((key) => key + 1);
              }}
              className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
            >
              <RotateCcw aria-hidden="true" className="w-4 h-4" />
              Try again
            </button>
          </div>
        )}

        {academies === null && loadError === '' && (
          <p role="status" className="text-center text-sm text-slate-400 py-12">
            Loading the academies...
          </p>
        )}

        {academies && visible.length === 0 && (
          <div className="text-center py-16">
            <Building2 aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">
              {academies.length === 0 ? 'No academies yet.' : 'No academy matches your search.'}
            </p>
          </div>
        )}

        {academies && visible.length > 0 && (
          <>
            <p className="text-slate-400 text-sm mb-6">
              {visible.length === 1 ? '1 academy' : `${visible.length} academies`}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visible.map((academy) => (
                <li key={academy.id}>
                  <Link
                    href={`/centers/${encodeURIComponent(academy.id)}`}
                    className="group h-full flex items-center gap-5 p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-colors"
                  >
                    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {courseInitials(academy.name)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-lg font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">
                        {academy.name}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                        <MapPin aria-hidden="true" className="w-4 h-4 shrink-0" />
                        {academy.location}
                      </span>
                      <span className="mt-1 block text-sm text-indigo-300">
                        {courseCountLabel(academy._count?.stages ?? 0)}
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" className="w-5 h-5 text-slate-500 group-hover:text-white shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
