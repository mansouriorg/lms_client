'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, RotateCcw, Search } from 'lucide-react';
import ProjectReviewCard from '@/components/center/ProjectReviewCard';
import { apiErrorMessage } from '@/lib/api-error';
import { type ReviewItem, afterReview, filterReviews, reviewStatusLabel, studentName } from '@/lib/project-reviews';
import { announceWorkChanged } from '@/lib/work-counts';
import { projectReviewsService } from '@/services/project-reviews.service';

type Lists = { pending: ReviewItem[]; reviewed: ReviewItem[] };

// Projects: what the students sent for the final projects of the academy's
// courses (every academy for a platform admin). The ones to review come first,
// the oldest first; a review approves the project or asks for changes with
// feedback, which the student reads in Assignments.
export default function ProjectsPage() {
  const [lists, setLists] = useState<Lists | null>(null);
  // When the lists were loaded ("3 h ago" depends on it)
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([projectReviewsService.pending(), projectReviewsService.reviewed()]).then(
      ([pending, reviewed]) => {
        if (active) {
          setLists({ pending, reviewed });
          setLoadedAt(new Date());
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the projects. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reviewed = (item: ReviewItem) => {
    setLists((current) => (current === null ? current : afterReview(current, item)));
    setSaved(`Review saved: ${reviewStatusLabel(item.status)} for ${studentName(item.user)} (${item.stage.title}).`);
    // The number next to Projects in the menu counts again
    announceWorkChanged();
  };

  const pending = filterReviews(lists?.pending ?? [], query);
  const done = filterReviews(lists?.reviewed ?? [], query);
  const total = (lists?.pending.length ?? 0) + (lists?.reviewed.length ?? 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
        <p className="text-sm text-slate-400 mt-1">
          Students send a link to their code for the courses that have a final project (write it in the{' '}
          <Link href="/center/stages" className="font-medium text-indigo-400 hover:text-indigo-300">
            course editor
          </Link>
          ). Approve it, or ask for changes with feedback: the student reads it in Assignments.
        </p>
      </div>

      {saved && (
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 aria-hidden="true" className="w-4 h-4 shrink-0" />
          {saved}
        </p>
      )}

      {loadError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl"
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

      {lists === null && loadError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading the projects...
        </p>
      )}

      {lists !== null && total > 0 && (
        <div className="relative max-w-md">
          <label htmlFor="project-search" className="sr-only">
            Search by student or course
          </label>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student or course"
            className="block w-full pl-9 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
          />
        </div>
      )}

      {lists !== null && (
        <section aria-labelledby="to-review" className="space-y-3">
          <h2 id="to-review" className="text-lg font-semibold text-white">
            To review ({lists.pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
              {lists.pending.length === 0 ? 'No project is waiting for a review.' : 'No project to review matches your search.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {pending.map((item) => (
                <ProjectReviewCard key={item.id} item={item} now={loadedAt} onReviewed={reviewed} />
              ))}
            </ul>
          )}
        </section>
      )}

      {lists !== null && (
        <section aria-labelledby="reviewed" className="space-y-3">
          <h2 id="reviewed" className="text-lg font-semibold text-white">
            Reviewed recently
          </h2>
          {done.length === 0 ? (
            <p className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-sm text-slate-400">
              {lists.reviewed.length === 0 ? 'No project reviewed yet.' : 'No reviewed project matches your search.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {done.map((item) => (
                <ProjectReviewCard key={item.id} item={item} now={loadedAt} onReviewed={reviewed} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
