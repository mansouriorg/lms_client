'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, RotateCcw, Save } from 'lucide-react';
import CourseDetailsForm from '@/components/center/CourseDetailsForm';
import ProgramEditor from '@/components/center/ProgramEditor';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type CourseFormErrors,
  type CourseFormValues,
  type EditableCourse,
  courseFormFrom,
  courseStatusName,
  isHiddenStatus,
  paidEnrollments,
  readCourseForm,
} from '@/lib/course-admin';
import { useSession } from '@/lib/use-session';
import { type Academy, courseAdminService } from '@/services/course-admin.service';

type Notice = { tone: 'success' | 'error'; text: string };

export default function CourseEditorPage() {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const { user } = useSession();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [course, setCourse] = useState<EditableCourse | null>(null);
  const [values, setValues] = useState<CourseFormValues | null>(null);
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [academies, setAcademies] = useState<Academy[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // The course with its program; 403 when it belongs to another academy.
  useEffect(() => {
    if (courseId === '') return;
    let active = true;
    courseAdminService.get(courseId).then(
      (loaded) => {
        if (active) {
          setCourse(loaded);
          setValues(courseFormFrom(loaded));
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load this course. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [courseId, reloadKey]);

  useEffect(() => {
    if (isSuperAdmin === false) return;
    let active = true;
    courseAdminService.academies().then(
      (list) => {
        if (active) setAcademies(list);
      },
      () => {
        // Without the list, the academy simply cannot be changed here
      },
    );
    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (course === null || values === null) return;
    const { errors: found, payload } = readCourseForm(values, {
      forCreate: false,
      needsAcademy: isSuperAdmin,
    });
    setErrors(found);
    setNotice(null);
    if (payload === null) return;
    setSaving(true);
    try {
      const { stage } = await courseAdminService.update(course.id, payload);
      setCourse({ ...course, ...stage, center: course.center, modules: course.modules, _count: course._count });
      setNotice({ tone: 'success', text: 'Changes saved.' });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not save the changes. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div role="alert" className="max-w-xl flex flex-col gap-4 p-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl">
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
          <Link href="/center/stages" className="py-2 px-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
            Courses
          </Link>
        </div>
      </div>
    );
  }

  if (course === null || values === null) {
    return (
      <p role="status" className="text-sm text-slate-400 py-8">
        Loading the course...
      </p>
    );
  }

  const lessonCount = course.modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/center/stages"
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft aria-hidden="true" className="w-4 h-4 mr-1.5" />
            Courses
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight truncate">{course.title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {courseStatusName(course.status)} - {course.center?.name ?? 'Academy'} -{' '}
            {paidEnrollments(course)} {paidEnrollments(course) === 1 ? 'student' : 'students'}
          </p>
        </div>
        {isHiddenStatus(course.status) === false && (
          <Link
            href={`/products/${encodeURIComponent(course.id)}`}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <ExternalLink aria-hidden="true" className="w-4 h-4" />
            View in the catalog
          </Link>
        )}
      </div>

      {course.status === 'DRAFT' && (
        <p className="p-3 text-sm text-slate-300 bg-slate-800/50 border border-slate-700 rounded-xl">
          This course is a draft: students do not see it. When its program is ready, set its
          status to Published and save.
        </p>
      )}

      {/* Details and status */}
      <form onSubmit={save} noValidate className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-5">
        <h2 className="text-lg font-semibold text-white">Details</h2>
        <CourseDetailsForm
          values={values}
          onChange={setValues}
          errors={errors}
          academies={isSuperAdmin ? academies : null}
          showStatus
          soldCount={paidEnrollments(course)}
        />
        {values.status === 'ACTIVE' && lessonCount === 0 && (
          <p className="text-xs text-amber-300">
            This course has no lessons yet: students who buy it will find an empty program.
          </p>
        )}
        {notice && (
          <p
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2 text-sm ${notice.tone === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
          >
            {notice.tone === 'error' ? (
              <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            {notice.text}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save aria-hidden="true" className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {/* Program: modules and lessons (components/center/ProgramEditor.tsx) */}
      <ProgramEditor
        courseId={course.id}
        modules={course.modules}
        soldCount={paidEnrollments(course)}
        onChange={(modules) => setCourse((current) => (current === null ? current : { ...current, modules }))}
      />
    </div>
  );
}
