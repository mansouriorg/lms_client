'use client';

import { AlertCircle } from 'lucide-react';
import {
  COURSE_STATUSES,
  type CourseFormErrors,
  type CourseFormValues,
  type CourseStatus,
  PROJECT_BRIEF_MAX,
  isHiddenStatus,
} from '@/lib/course-admin';
import type { Academy } from '@/services/course-admin.service';

const FIELD =
  'block w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none sm:text-sm';

function border(error: string | undefined): string {
  return error ? 'border-red-500/60' : 'border-slate-700';
}

function FieldError({ id, error }: { id: string; error: string | undefined }) {
  if (error === undefined) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle aria-hidden="true" className="w-3.5 h-3.5" />
      {error}
    </p>
  );
}

// The fields of a course, for the "New course" page and the course editor.
// - academies: the academy choice, for a super admin (null: not shown);
// - showStatus: the status choice (the editor only; a new course is a draft);
// - soldCount: paid enrollments, for a note when a sold course is hidden.
export default function CourseDetailsForm({
  values,
  onChange,
  errors,
  academies,
  showStatus,
  soldCount = 0,
}: {
  values: CourseFormValues;
  onChange: (values: CourseFormValues) => void;
  errors: CourseFormErrors;
  academies: Academy[] | null;
  showStatus: boolean;
  soldCount?: number;
}) {
  const update = <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) =>
    onChange({ ...values, [field]: value });
  const statusHelp = COURSE_STATUSES.find((option) => option.value === values.status)?.help;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="course-title" className="text-sm font-medium text-slate-300">
          Title
        </label>
        <input
          id="course-title"
          type="text"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? 'course-title-error' : undefined}
          className={`${FIELD} ${border(errors.title)}`}
          placeholder="For example: React from zero"
        />
        <FieldError id="course-title-error" error={errors.title} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="course-description" className="text-sm font-medium text-slate-300">
          Description
        </label>
        <textarea
          id="course-description"
          rows={5}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className={`${FIELD} border-slate-700 resize-y`}
          placeholder="What students will learn, who the course is for, what they need to start."
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="course-project" className="text-sm font-medium text-slate-300">
          Final project <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <textarea
          id="course-project"
          rows={4}
          value={values.projectBrief}
          onChange={(e) => update('projectBrief', e.target.value)}
          aria-invalid={errors.projectBrief ? true : undefined}
          aria-describedby={errors.projectBrief ? 'course-project-help course-project-error' : 'course-project-help'}
          className={`${FIELD} ${border(errors.projectBrief)} resize-y`}
          placeholder="For example: build a todo app with React (add, check and delete tasks), put the code on GitHub and send the link."
        />
        <p id="course-project-help" className="flex flex-wrap justify-between gap-x-4 text-xs text-slate-400">
          <span>
            What the students build and send as a link to their code. They see it in Assignments; leave it empty
            if the course has no project.
          </span>
          <span className={values.projectBrief.trim().length > PROJECT_BRIEF_MAX ? 'text-red-400' : ''}>
            {values.projectBrief.trim().length} / {PROJECT_BRIEF_MAX}
          </span>
        </p>
        <FieldError id="course-project-error" error={errors.projectBrief} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="course-price" className="text-sm font-medium text-slate-300">
            Price (TND)
          </label>
          <input
            id="course-price"
            type="text"
            inputMode="decimal"
            value={values.price}
            onChange={(e) => update('price', e.target.value)}
            aria-invalid={errors.price ? true : undefined}
            aria-describedby={errors.price ? 'course-price-error' : undefined}
            className={`${FIELD} ${border(errors.price)}`}
            placeholder="120"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="course-category" className="text-sm font-medium text-slate-300">
            Category
          </label>
          <input
            id="course-category"
            type="text"
            value={values.category}
            onChange={(e) => update('category', e.target.value)}
            className={`${FIELD} border-slate-700`}
            placeholder="Web"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="course-level" className="text-sm font-medium text-slate-300">
            Level
          </label>
          <input
            id="course-level"
            type="text"
            value={values.level}
            onChange={(e) => update('level', e.target.value)}
            className={`${FIELD} border-slate-700`}
            placeholder="Beginner"
          />
        </div>
      </div>
      <FieldError id="course-price-error" error={errors.price} />

      {academies && (
        <div className="space-y-1.5">
          <label htmlFor="course-academy" className="text-sm font-medium text-slate-300">
            Academy
          </label>
          <select
            id="course-academy"
            value={values.centerId}
            onChange={(e) => update('centerId', e.target.value)}
            aria-invalid={errors.centerId ? true : undefined}
            aria-describedby={errors.centerId ? 'course-academy-error' : undefined}
            className={`${FIELD} ${border(errors.centerId)}`}
          >
            <option value="">Choose an academy</option>
            {academies.map((academy) => (
              <option key={academy.id} value={academy.id}>
                {academy.name}
              </option>
            ))}
          </select>
          <FieldError id="course-academy-error" error={errors.centerId} />
        </div>
      )}

      {showStatus && (
        <div className="space-y-1.5">
          <label htmlFor="course-status" className="text-sm font-medium text-slate-300">
            Status
          </label>
          <select
            id="course-status"
            value={values.status}
            onChange={(e) => update('status', e.target.value as CourseStatus)}
            aria-describedby="course-status-help"
            className={`${FIELD} border-slate-700`}
          >
            {COURSE_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id="course-status-help" className="text-xs text-slate-400">
            {statusHelp}
          </p>
          {isHiddenStatus(values.status) && soldCount > 0 && (
            <p role="status" className="flex items-start gap-1.5 text-xs text-amber-300">
              <AlertCircle aria-hidden="true" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {soldCount === 1 ? '1 student bought' : `${soldCount} students bought`} this course: they
              keep access, but new students will not find it in the catalog.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
