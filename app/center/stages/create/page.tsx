'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import CourseDetailsForm from '@/components/center/CourseDetailsForm';
import { apiErrorMessage } from '@/lib/api-error';
import { type CourseFormErrors, emptyCourseForm, readCourseForm } from '@/lib/course-admin';
import { useSession } from '@/lib/use-session';
import { type Academy, courseAdminService } from '@/services/course-admin.service';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useSession();
  // A platform admin chooses the academy; an academy admin creates for theirs.
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [values, setValues] = useState(emptyCourseForm);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [academies, setAcademies] = useState<Academy[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isSuperAdmin === false) return;
    let active = true;
    courseAdminService.academies().then(
      (list) => {
        if (active) setAcademies(list);
      },
      (error: unknown) => {
        if (active) setSaveError(apiErrorMessage(error, 'Could not load the academies.'));
      },
    );
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { errors: found, payload } = readCourseForm(values, {
      forCreate: true,
      needsAcademy: isSuperAdmin,
    });
    setErrors(found);
    setSaveError('');
    if (payload === null) return;
    setSaving(true);
    try {
      const { stage } = await courseAdminService.create(payload);
      // The editor of the new course (still a draft); the button stays busy
      router.push(`/center/stages/${encodeURIComponent(stage.id)}`);
    } catch (error) {
      setSaveError(apiErrorMessage(error, 'Could not create the course. Please try again.'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl" noValidate>
      <div>
        <Link
          href="/center/stages"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-2"
        >
          <ArrowLeft aria-hidden="true" className="w-4 h-4 mr-1.5" />
          Courses
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">New course</h1>
        <p className="text-sm text-slate-400 mt-1">
          The course is created as a draft: students do not see it. You add its program and
          publish it from the next page.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
        <CourseDetailsForm
          values={values}
          onChange={setValues}
          errors={errors}
          academies={isSuperAdmin ? (academies ?? []) : null}
          showStatus={false}
        />
      </div>

      {saveError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
          <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
          {saveError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save aria-hidden="true" className="w-4 h-4" />
          {saving ? 'Creating...' : 'Create the course'}
        </button>
        <Link
          href="/center/stages"
          className="py-2.5 px-5 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
