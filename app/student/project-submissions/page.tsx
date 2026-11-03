'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, FileCode2, RotateCcw } from 'lucide-react';
import ProjectCard from '@/components/student/ProjectCard';
import { apiErrorMessage } from '@/lib/api-error';
import { type MyProject, type Submission, projectCounts, sortProjects, withSubmission } from '@/lib/assignments';
import { announceWorkChanged } from '@/lib/work-counts';
import { assignmentsService } from '@/services/assignments.service';

// Assignments: the final projects of the courses the student bought
// (GET /project-submissions/mine). Each project shows what to build; the
// student sends the link to their code, the academy approves it or asks for
// changes.
export default function ProjectSubmissionsPage() {
  const [projects, setProjects] = useState<MyProject[] | null>(null);
  // The order is decided once per load, so a card does not jump after sending
  const [order, setOrder] = useState<string[]>([]);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    assignmentsService.mine().then(
      (list) => {
        if (active) {
          setProjects(list);
          setOrder(sortProjects(list).map((project) => project.course.id));
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load your assignments. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const sent = (submission: Submission) => {
    setProjects((current) => (current === null ? current : withSubmission(current, submission)));
    // The number next to Assignments in the menu counts again
    announceWorkChanged();
  };

  const shown = order
    .map((id) => (projects ?? []).find((project) => project.course.id === id))
    .filter((project): project is MyProject => project !== undefined);
  const counts = projectCounts(projects ?? []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Assignments</h1>
        <p className="text-sm text-slate-400 mt-1">
          The final projects of your courses: build them, then send the link to your code. Your academy reviews them.
        </p>
      </div>

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

      {projects === null && loadError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading your assignments...
        </p>
      )}

      {projects !== null && projects.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <FileCode2 aria-hidden="true" className="w-8 h-8 mx-auto text-slate-500" />
          <p className="text-sm text-slate-300">None of your courses has a final project for now.</p>
          <p className="text-sm text-slate-400">
            When an academy adds one to a course you bought, it appears here.{' '}
            <Link href="/student/lessons" className="font-medium text-indigo-400 hover:text-indigo-300">
              Go to my courses
            </Link>
          </p>
        </div>
      )}

      {projects !== null && projects.length > 0 && (
        <>
          <p className="text-sm text-slate-400">
            {[
              counts['needs-work'] > 0 ? `${counts['needs-work']} to change` : '',
              counts['to-send'] > 0 ? `${counts['to-send']} to send` : '',
              counts.waiting > 0 ? `${counts.waiting} waiting for review` : '',
              counts.approved > 0 ? `${counts.approved} approved` : '',
            ]
              .filter((part) => part !== '')
              .join(' - ')}
          </p>
          <ul className="space-y-4">
            {shown.map((project) => (
              <ProjectCard key={project.course.id} project={project} onSent={sent} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
