'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Pause, Play, Plus, RotateCcw, Tag, Trash2 } from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type AdminCoupon,
  type CouponErrors,
  type CouponKind,
  type CouponState,
  type CouponValues,
  canDeleteCoupon,
  couponState,
  couponStateLabel,
  discountLabel,
  emptyCouponForm,
  endLabel,
  readCouponForm,
  usesLabel,
} from '@/lib/coupons';
import { formatPrice } from '@/lib/format';
import { todayIn } from '@/lib/sessions';
import { couponsService } from '@/services/coupons.service';

type Notice = { tone: 'success' | 'error'; text: string };

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const PLAIN_BUTTON =
  'inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50';

const STATE_STYLE: Record<CouponState, string> = {
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  paused: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  expired: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  'used-up': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

// Coupons: the discount codes of the academy. Students type a code at
// checkout; an academy coupon only lowers the price of the academy's own
// courses and products. Create, pause or resume a code; delete one that no
// order used.
export default function CenterCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[] | null>(null);
  // When the list was loaded (states like "Ended" depend on it), and that day
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<CouponValues>(emptyCouponForm());
  const [startActive, setStartActive] = useState(true);
  const [errors, setErrors] = useState<CouponErrors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    couponsService.list().then(
      (list) => {
        if (active) {
          setCoupons(list);
          setLoadedAt(new Date());
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load your coupons. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const today = loadedAt ? todayIn(loadedAt) : '';

  const change = (field: keyof CouponValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    const key = field === 'kind' ? 'value' : field;
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const openForm = () => {
    setValues(emptyCouponForm());
    setStartActive(true);
    setErrors({});
    setNotice(null);
    setConfirmingId(null);
    setFormOpen(true);
  };

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { errors: found, payload } = readCouponForm(values, today);
    setErrors(found);
    if (payload === null) return;
    setSaving(true);
    setNotice(null);
    try {
      await couponsService.create(payload, startActive);
      setFormOpen(false);
      setNotice({
        tone: 'success',
        text: startActive
          ? `${payload.code} is ready: students can use it at checkout.`
          : `${payload.code} is created and paused. Resume it when you want students to use it.`,
      });
      reload();
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not create the coupon. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (coupon: AdminCoupon) => {
    setBusyId(coupon.id);
    setNotice(null);
    try {
      await couponsService.toggle(coupon.id);
      setNotice({
        tone: 'success',
        text: coupon.isActive
          ? `${coupon.code} is paused: students cannot use it until you resume it.`
          : `${coupon.code} works again.`,
      });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not change the coupon. Please try again.') });
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const remove = async (coupon: AdminCoupon) => {
    setBusyId(coupon.id);
    setNotice(null);
    try {
      await couponsService.remove(coupon.id);
      setNotice({ tone: 'success', text: `${coupon.code} is deleted.` });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not delete the coupon. Please try again.') });
    } finally {
      setConfirmingId(null);
      setBusyId(null);
      reload();
    }
  };

  // Copies the code to share it (some browsers only allow it on https)
  const copy = (coupon: AdminCoupon) => {
    const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
    if (clipboard === undefined) return;
    clipboard.writeText(coupon.code).then(
      () => setCopiedId(coupon.id),
      () => setCopiedId(null),
    );
  };

  const fieldClass = (field: keyof CouponErrors) =>
    `${FIELD} ${errors[field] ? 'border-red-500/60' : 'border-slate-700'}`;
  const describedBy = (field: keyof CouponErrors, id: string) => (errors[field] ? `${id}-error` : undefined);
  const kind: CouponKind = values.kind;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Coupons</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discount codes for your courses and digital products. Students type the code at checkout; a
            coupon of your academy only lowers the price of your academy&apos;s items.
          </p>
        </div>
        {coupons !== null && formOpen === false && (
          <button
            type="button"
            onClick={openForm}
            className="inline-flex shrink-0 items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors whitespace-nowrap"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            Create a coupon
          </button>
        )}
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
              reload();
            }}
            className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-400/30 text-red-300 font-medium hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw aria-hidden="true" className="w-4 h-4" />
            Try again
          </button>
        </div>
      )}

      {coupons === null && loadError === '' && (
        <p role="status" className="text-sm text-slate-400 py-8 text-center">
          Loading your coupons...
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

      {/* Create a coupon */}
      {formOpen && (
        <form
          onSubmit={create}
          noValidate
          aria-labelledby="coupon-form-title"
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5"
        >
          <h2 id="coupon-form-title" className="text-lg font-semibold text-white">
            Create a coupon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="coupon-code" className="text-sm font-medium text-slate-300">
                Code
              </label>
              <input
                id="coupon-code"
                value={values.code}
                onChange={(e) => change('code', e.target.value)}
                maxLength={30}
                autoComplete="off"
                placeholder="For example WELCOME10"
                aria-invalid={errors.code !== undefined}
                aria-describedby={describedBy('code', 'coupon-code')}
                className={`${fieldClass('code')} font-mono uppercase placeholder:normal-case placeholder:font-sans`}
              />
              <FieldError id="coupon-code-error" text={errors.code} />
            </div>
            <div className="space-y-2">
              <label htmlFor="coupon-kind" className="text-sm font-medium text-slate-300">
                Kind of discount
              </label>
              <select
                id="coupon-kind"
                value={kind}
                onChange={(e) => change('kind', e.target.value)}
                className={`${FIELD} border-slate-700`}
              >
                <option value="percent">A percentage (%)</option>
                <option value="amount">A fixed amount (TND)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="coupon-value" className="text-sm font-medium text-slate-300">
                {kind === 'percent' ? 'Percentage off' : 'Amount off (TND)'}
              </label>
              <input
                id="coupon-value"
                inputMode="decimal"
                value={values.value}
                onChange={(e) => change('value', e.target.value)}
                placeholder={kind === 'percent' ? '20' : '15'}
                aria-invalid={errors.value !== undefined}
                aria-describedby={describedBy('value', 'coupon-value')}
                className={fieldClass('value')}
              />
              <FieldError id="coupon-value-error" text={errors.value} />
            </div>
            <div className="space-y-2">
              <label htmlFor="coupon-uses" className="text-sm font-medium text-slate-300">
                Limit of uses (optional)
              </label>
              <input
                id="coupon-uses"
                inputMode="numeric"
                value={values.maxUses}
                onChange={(e) => change('maxUses', e.target.value)}
                placeholder="No limit"
                aria-invalid={errors.maxUses !== undefined}
                aria-describedby={errors.maxUses ? 'coupon-uses-error' : 'coupon-uses-help'}
                className={fieldClass('maxUses')}
              />
              <p id="coupon-uses-help" className="text-xs text-slate-500">
                A use counts when the order is paid.
              </p>
              <FieldError id="coupon-uses-error" text={errors.maxUses} />
            </div>
            <div className="space-y-2">
              <label htmlFor="coupon-last-day" className="text-sm font-medium text-slate-300">
                Last day (optional)
              </label>
              <input
                id="coupon-last-day"
                type="date"
                min={today}
                value={values.lastDay}
                onChange={(e) => change('lastDay', e.target.value)}
                aria-invalid={errors.lastDay !== undefined}
                aria-describedby={errors.lastDay ? 'coupon-last-day-error' : 'coupon-last-day-help'}
                className={fieldClass('lastDay')}
              />
              <p id="coupon-last-day-help" className="text-xs text-slate-500">
                The code works until the end of that day. Empty: no end.
              </p>
              <FieldError id="coupon-last-day-error" text={errors.lastDay} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              id="coupon-active"
              type="checkbox"
              checked={startActive}
              onChange={(e) => setStartActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            Students can use it now
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create the coupon'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="py-2.5 px-4 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {coupons !== null && coupons.length === 0 && formOpen === false && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <Tag aria-hidden="true" className="w-8 h-8 text-indigo-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No coupons yet</h2>
          <p className="text-sm text-slate-400">
            Create a code like WELCOME10 to give new students a discount, or a limited one for an event.
          </p>
        </div>
      )}

      {coupons !== null && loadedAt !== null && coupons.length > 0 && (
        <ul className="space-y-3" aria-label="Your coupons">
          {coupons.map((coupon) => {
            const state = couponState(coupon, loadedAt);
            const busy = busyId === coupon.id;
            return (
              <li key={coupon.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-mono break-all">{coupon.code}</h3>
                      <button
                        type="button"
                        onClick={() => copy(coupon)}
                        aria-label={`Copy ${coupon.code}`}
                        className="inline-flex items-center gap-1 py-1 px-2 rounded-lg text-xs text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Copy aria-hidden="true" className="w-3.5 h-3.5" />
                        {copiedId === coupon.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-slate-300">
                      {discountLabel(coupon, formatPrice)} - {usesLabel(coupon)} - {endLabel(coupon)}
                    </p>
                    {coupon.centerId === null && (
                      <p className="text-xs text-indigo-300">Platform-wide: works for every academy.</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${STATE_STYLE[state]}`}>
                    {couponStateLabel(state)}
                  </span>
                </div>

                {confirmingId === coupon.id ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                    <span>Delete {coupon.code}? This cannot be undone.</span>
                    <button
                      type="button"
                      onClick={() => remove(coupon)}
                      disabled={busy}
                      className="py-2 px-3 rounded-xl text-sm font-medium text-red-300 border border-red-400/30 hover:bg-red-400/10 disabled:opacity-50"
                    >
                      {busy ? 'Deleting...' : 'Yes, delete it'}
                    </button>
                    <button type="button" onClick={() => setConfirmingId(null)} disabled={busy} className={PLAIN_BUTTON}>
                      Keep it
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggle(coupon)}
                      disabled={busyId !== null}
                      className={PLAIN_BUTTON}
                    >
                      {coupon.isActive ? (
                        <Pause aria-hidden="true" className="w-4 h-4" />
                      ) : (
                        <Play aria-hidden="true" className="w-4 h-4" />
                      )}
                      {busy ? 'Saving...' : coupon.isActive ? 'Pause' : 'Resume'}
                    </button>
                    {canDeleteCoupon(coupon) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingId(coupon.id);
                          setNotice(null);
                        }}
                        disabled={busyId !== null}
                        className="inline-flex items-center gap-1.5 py-2 px-3 text-sm text-slate-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        <Trash2 aria-hidden="true" className="w-4 h-4" />
                        Delete
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Used in an order: it can be paused, not deleted.</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
