'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Trash2,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { courseCountLabel, mailHref, phoneHref } from '@/lib/academies';
import {
  type AcademyAdmin,
  type AcademyOverview,
  type NewAcademyErrors,
  type NewAcademyValues,
  academiesNote,
  academyValues,
  addedText,
  adminName,
  deleteBlockers,
  emptyAcademyForm,
  readAcademyForm,
  readAdminEmail,
  removedText,
} from '@/lib/academy-admins';
import { apiErrorMessage } from '@/lib/api-error';
import { useSession } from '@/lib/use-session';
import { academyService } from '@/services/academy.service';

// A message after an action: at the top (academyId null) or in the card of
// that academy
type Notice = { tone: 'success' | 'error'; text: string; academyId: string | null };

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const MAIN_BUTTON =
  'inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors whitespace-nowrap disabled:opacity-50';
const PLAIN_BUTTON =
  'inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors whitespace-nowrap disabled:opacity-50';

const FORM_FIELDS: { field: keyof NewAcademyValues; label: string; placeholder: string; type: string }[] = [
  { field: 'name', label: 'Name', placeholder: 'For example Code Academy', type: 'text' },
  { field: 'location', label: 'City', placeholder: 'For example Tunis', type: 'text' },
  { field: 'contactEmail', label: 'Contact email', placeholder: 'contact@academy.tn', type: 'email' },
  { field: 'contactPhone', label: 'Contact phone', placeholder: '+216 71 000 000', type: 'tel' },
];

// Academies (platform admins): every academy and the accounts that manage
// it. Create an academy, edit its details or delete an empty one, add an
// admin by the email of their account (they sign up first), remove an admin
// (the account is a student account again).
export default function AcademiesPage() {
  const { known, user } = useSession();
  const role = user?.role ?? null;
  const [academies, setAcademies] = useState<AcademyOverview[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  // The form of a new academy
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<NewAcademyValues>(emptyAcademyForm());
  const [errors, setErrors] = useState<NewAcademyErrors>({});
  // The academy whose Edit form is open, that form, and its Delete question
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<NewAcademyValues>(emptyAcademyForm());
  const [editErrors, setEditErrors] = useState<NewAcademyErrors>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // The academy whose Add an admin form is open, and that form
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  // The admin whose removal waits for a confirmation
  const [confirming, setConfirming] = useState<{ academyId: string; adminId: string } | null>(null);
  // One action at a time: 'create', 'save', 'delete', 'add' or 'remove'
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'SUPER_ADMIN') return;
    let active = true;
    academyService.overview().then(
      (list) => {
        if (active) {
          setAcademies(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the academies. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey, role]);

  const reload = () => setReloadKey((key) => key + 1);

  const change = (field: keyof NewAcademyValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const openForm = () => {
    setValues(emptyAcademyForm());
    setErrors({});
    setNotice(null);
    setAddingTo(null);
    setConfirming(null);
    setEditing(null);
    setFormOpen(true);
  };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { errors: found, payload } = readAcademyForm(values);
    setErrors(found);
    if (payload === null) return;
    setBusy('create');
    setNotice(null);
    try {
      const made = await academyService.create(payload);
      setFormOpen(false);
      // The new academy's card opens with its Add an admin form
      setNotice({
        tone: 'success',
        text: `${made.center.name} is created. Now add its admin: the person signs up first, then you enter the email of their account.`,
        academyId: made.center.id,
      });
      setAddingTo(made.center.id);
      setEmail('');
      setEmailError('');
      reload();
    } catch (error) {
      setNotice({
        tone: 'error',
        text: apiErrorMessage(error, 'Could not create the academy. Please try again.'),
        academyId: null,
      });
    } finally {
      setBusy(null);
    }
  };

  const openEdit = (academy: AcademyOverview) => {
    setEditing(academy.id);
    setEditValues(academyValues(academy));
    setEditErrors({});
    setConfirmingDelete(false);
    setNotice(null);
    setAddingTo(null);
    setConfirming(null);
    setFormOpen(false);
  };

  const changeEdit = (field: keyof NewAcademyValues, value: string) => {
    setEditValues((current) => ({ ...current, [field]: value }));
    setEditErrors((current) => ({ ...current, [field]: undefined }));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>, academy: AcademyOverview) => {
    event.preventDefault();
    const { errors: found, payload } = readAcademyForm(editValues);
    setEditErrors(found);
    if (payload === null) return;
    setBusy('save');
    setNotice(null);
    try {
      const saved = await academyService.update(academy.id, payload);
      setEditing(null);
      setNotice({ tone: 'success', text: `The details of ${saved.center.name} are saved.`, academyId: academy.id });
      reload();
    } catch (error) {
      setNotice({
        tone: 'error',
        text: apiErrorMessage(error, 'Could not save the details. Please try again.'),
        academyId: academy.id,
      });
    } finally {
      setBusy(null);
    }
  };

  const deleteAcademy = async (academy: AcademyOverview) => {
    setBusy('delete');
    setNotice(null);
    try {
      await academyService.remove(academy.id);
      setEditing(null);
      setNotice({ tone: 'success', text: `${academy.name} is deleted.`, academyId: null });
    } catch (error) {
      // For example a course created since the page was loaded
      setNotice({
        tone: 'error',
        text: apiErrorMessage(error, 'Could not delete the academy. Please try again.'),
        academyId: academy.id,
      });
    } finally {
      setConfirmingDelete(false);
      setBusy(null);
      reload();
    }
  };

  const openAdd = (academy: AcademyOverview) => {
    setAddingTo(academy.id);
    setEmail('');
    setEmailError('');
    setNotice(null);
    setConfirming(null);
    setEditing(null);
  };

  const add = async (event: React.FormEvent<HTMLFormElement>, academy: AcademyOverview) => {
    event.preventDefault();
    const read = readAdminEmail(email);
    setEmailError(read.error);
    if (read.error !== '') return;
    setBusy('add');
    setNotice(null);
    try {
      const added = await academyService.addAdmin(academy.id, read.email);
      setAddingTo(null);
      setEmail('');
      setNotice({ tone: 'success', text: addedText(added.admin, academy.name), academyId: academy.id });
      reload();
    } catch (error) {
      // No account, a platform admin, an admin already: said under the field
      setEmailError(apiErrorMessage(error, 'Could not add the admin. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (academy: AcademyOverview, admin: AcademyAdmin) => {
    setBusy('remove');
    setNotice(null);
    try {
      await academyService.removeAdmin(academy.id, admin.id);
      setNotice({ tone: 'success', text: removedText(admin, academy.name), academyId: academy.id });
    } catch (error) {
      setNotice({
        tone: 'error',
        text: apiErrorMessage(error, 'Could not remove the admin. Please try again.'),
        academyId: academy.id,
      });
    } finally {
      setConfirming(null);
      setBusy(null);
      reload();
    }
  };

  if (known && role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-xl p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
        <h1 className="text-xl font-bold text-white">Academies</h1>
        <p className="text-sm text-slate-400">
          Only platform admins create academies and choose their admins. If someone else should manage your academy
          with you, ask a platform admin.
        </p>
      </div>
    );
  }

  // The four fields of the academy forms (prefix: 'academy' for a new one,
  // 'edit' for the Edit form); the first one has the focus when it opens
  const fieldsGrid = (
    prefix: string,
    current: NewAcademyValues,
    found: NewAcademyErrors,
    onChange: (field: keyof NewAcademyValues, value: string) => void,
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {FORM_FIELDS.map(({ field, label, placeholder, type }, index) => (
        <div key={field} className="space-y-2">
          <label htmlFor={`${prefix}-${field}`} className="text-sm font-medium text-slate-300">
            {label}
          </label>
          <input
            id={`${prefix}-${field}`}
            type={type}
            autoFocus={index === 0}
            value={current[field]}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
            aria-invalid={found[field] !== undefined}
            aria-describedby={found[field] ? `${prefix}-${field}-error` : undefined}
            className={`${FIELD} ${found[field] ? 'border-red-500/60' : 'border-slate-700'}`}
          />
          <FieldError id={`${prefix}-${field}-error`} text={found[field]} />
        </div>
      ))}
    </div>
  );

  const noticeFor = (academyId: string | null) =>
    notice !== null && notice.academyId === academyId ? (
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
    ) : null;

  const adminRow = (academy: AcademyOverview, admin: AcademyAdmin) => {
    const name = adminName(admin);
    const asking = confirming !== null && confirming.academyId === academy.id && confirming.adminId === admin.id;
    return (
      <li
        key={admin.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-white break-words">{name}</p>
          <p className="text-xs text-slate-400 break-all">{admin.email}</p>
        </div>
        {asking ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <span>Remove {name} as an admin? The account becomes a student account.</span>
            <button
              type="button"
              onClick={() => remove(academy, admin)}
              disabled={busy !== null}
              className="py-2 px-3 rounded-xl text-sm font-medium text-red-300 border border-red-400/30 hover:bg-red-400/10 disabled:opacity-50"
            >
              {busy === 'remove' ? 'Removing...' : 'Yes, remove'}
            </button>
            <button type="button" onClick={() => setConfirming(null)} disabled={busy !== null} className={PLAIN_BUTTON}>
              Keep
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirming({ academyId: academy.id, adminId: admin.id });
              setNotice(null);
              setAddingTo(null);
              setEditing(null);
            }}
            disabled={busy !== null}
            aria-label={`Remove ${name} as an admin of ${academy.name}`}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto py-2 px-3 text-sm text-slate-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            <UserMinus aria-hidden="true" className="w-4 h-4" />
            Remove
          </button>
        )}
      </li>
    );
  };

  const addForm = (academy: AcademyOverview) => (
    <form
      noValidate
      onSubmit={(event) => add(event, academy)}
      aria-label={`Add an admin to ${academy.name}`}
      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3"
    >
      <p className="text-sm text-slate-400">
        The email of an existing account: the person signs up first. A platform admin, or the admin of another
        academy, cannot be added.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-1.5">
          <label htmlFor={`admin-email-${academy.id}`} className="sr-only">
            Email of the account
          </label>
          <input
            id={`admin-email-${academy.id}`}
            type="email"
            autoFocus
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            placeholder="Email of the account"
            aria-invalid={emailError !== ''}
            aria-describedby={emailError ? `admin-email-${academy.id}-error` : undefined}
            className={`${FIELD} ${emailError ? 'border-red-500/60' : 'border-slate-700'}`}
          />
          <FieldError id={`admin-email-${academy.id}-error`} text={emailError || undefined} />
        </div>
        <div className="flex gap-2 self-start">
          <button type="submit" disabled={busy !== null} className={MAIN_BUTTON}>
            <UserPlus aria-hidden="true" className="w-4 h-4" />
            {busy === 'add' ? 'Adding...' : 'Add as admin'}
          </button>
          <button type="button" onClick={() => setAddingTo(null)} disabled={busy !== null} className={PLAIN_BUTTON}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );

  // The Edit form of an academy, with Delete at the bottom (only for an
  // academy without courses, digital products, coupons or admins)
  const editForm = (academy: AcademyOverview) => {
    const blockers = deleteBlockers(academy);
    return (
      <form
        noValidate
        onSubmit={(event) => save(event, academy)}
        aria-label={`Edit ${academy.name}`}
        className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4"
      >
        {fieldsGrid('edit', editValues, editErrors, changeEdit)}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy !== null} className={MAIN_BUTTON}>
            {busy === 'save' ? 'Saving...' : 'Save the details'}
          </button>
          <button type="button" onClick={() => setEditing(null)} disabled={busy !== null} className={PLAIN_BUTTON}>
            Cancel
          </button>
        </div>
        <div className="pt-4 border-t border-slate-800">
          {blockers !== '' ? (
            <p className="text-xs text-slate-500">{blockers}</p>
          ) : confirmingDelete ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span>Delete {academy.name}? This cannot be undone.</span>
              <button
                type="button"
                onClick={() => deleteAcademy(academy)}
                disabled={busy !== null}
                className="py-2 px-3 rounded-xl text-sm font-medium text-red-300 border border-red-400/30 hover:bg-red-400/10 disabled:opacity-50"
              >
                {busy === 'delete' ? 'Deleting...' : 'Yes, delete it'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={busy !== null}
                className={PLAIN_BUTTON}
              >
                Keep it
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 py-2 px-3 text-sm text-slate-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <Trash2 aria-hidden="true" className="w-4 h-4" />
              Delete the academy
            </button>
          )}
        </div>
      </form>
    );
  };

  const card = (academy: AcademyOverview) => {
    const mail = mailHref(academy.contactEmail);
    const call = phoneHref(academy.contactPhone);
    return (
      <li key={academy.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-lg font-bold text-white break-words">{academy.name}</h2>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" />
                {academy.location}
              </span>
              <span>{courseCountLabel(academy._count.stages)}</span>
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
              {mail ? (
                <a href={mail} className="inline-flex items-center gap-1.5 hover:text-indigo-300 break-all">
                  <Mail aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" />
                  {academy.contactEmail}
                </a>
              ) : (
                <span className="break-all">{academy.contactEmail}</span>
              )}
              {call ? (
                <a href={call} className="inline-flex items-center gap-1.5 hover:text-indigo-300">
                  <Phone aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-500" />
                  {academy.contactPhone}
                </a>
              ) : (
                <span>{academy.contactPhone}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-start">
            {editing !== academy.id && (
              <button
                type="button"
                onClick={() => openEdit(academy)}
                disabled={busy !== null}
                aria-label={`Edit ${academy.name}`}
                className={PLAIN_BUTTON}
              >
                <Pencil aria-hidden="true" className="w-4 h-4" />
                Edit
              </button>
            )}
            <Link href={`/centers/${academy.id}`} className={PLAIN_BUTTON}>
              <ExternalLink aria-hidden="true" className="w-4 h-4" />
              Public page
            </Link>
          </div>
        </div>

        {noticeFor(academy.id)}

        {editing === academy.id && editForm(academy)}

        <section aria-label={`Admins of ${academy.name}`} className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300">Admins</h3>
          {academy.admins.length === 0 ? (
            <p className="text-sm text-amber-300">No admin yet: nobody can manage this academy.</p>
          ) : (
            <ul className="space-y-2">{academy.admins.map((admin) => adminRow(academy, admin))}</ul>
          )}
          {addingTo === academy.id ? (
            addForm(academy)
          ) : (
            <button type="button" onClick={() => openAdd(academy)} disabled={busy !== null} className={PLAIN_BUTTON}>
              <UserPlus aria-hidden="true" className="w-4 h-4" />
              Add an admin
            </button>
          )}
        </section>
      </li>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Academies</h1>
          <p className="text-sm text-slate-400 mt-1">
            Every academy of the platform and the accounts that manage it. An academy admin manages the courses,
            students and orders of one academy.
          </p>
          {academies !== null && academies.length > 0 && (
            <p className="text-sm text-slate-300 mt-2">{academiesNote(academies)}</p>
          )}
        </div>
        {academies !== null && formOpen === false && (
          <button type="button" onClick={openForm} className={`${MAIN_BUTTON} shrink-0`}>
            <Plus aria-hidden="true" className="w-4 h-4" />
            Create an academy
          </button>
        )}
      </div>

      {noticeFor(null)}

      {formOpen && (
        <form
          onSubmit={create}
          noValidate
          aria-labelledby="academy-form-title"
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5"
        >
          <div className="space-y-1">
            <h2 id="academy-form-title" className="text-lg font-semibold text-white">
              Create an academy
            </h2>
            <p className="text-sm text-slate-400">Visitors see these details on the academy page.</p>
          </div>
          {fieldsGrid('academy', values, errors, change)}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy !== null} className={MAIN_BUTTON}>
              {busy === 'create' ? 'Creating...' : 'Create the academy'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} disabled={busy !== null} className={PLAIN_BUTTON}>
              Cancel
            </button>
          </div>
        </form>
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
              reload();
            }}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {academies === null && loadError === '' && (
        <p role="status" className="py-8 text-center text-sm text-slate-400">
          Loading the academies...
        </p>
      )}

      {academies !== null && academies.length === 0 && formOpen === false && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <Building2 aria-hidden="true" className="w-8 h-8 text-indigo-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No academy yet</h2>
          <p className="text-sm text-slate-400">
            Create the first academy, then add its admin: the person who manages its courses, students and orders.
          </p>
        </div>
      )}

      {academies !== null && academies.length > 0 && (
        <ul className="space-y-4" aria-label="Academies">
          {academies.map(card)}
        </ul>
      )}
    </div>
  );
}
