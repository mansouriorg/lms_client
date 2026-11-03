'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import FieldError from '@/components/account/FieldError';
import { apiErrorMessage } from '@/lib/api-error';
import {
  type AdminProduct,
  type ProductErrors,
  type ProductValues,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_LINK_MAX,
  PRODUCT_TITLE_MAX,
  canDelete,
  emptyProductForm,
  orderCount,
  orderCountLabel,
  productFormFrom,
  readProductForm,
} from '@/lib/digital-products';
import { formatPrice } from '@/lib/format';
import { safeDownloadUrl } from '@/lib/purchases';
import { digitalProductsService } from '@/services/digital-products.service';

type Notice = { tone: 'success' | 'error'; text: string };
// The form: a new product, or the product being edited
type Editing = { id: string | null; title: string };

const FIELD =
  'block w-full px-3 py-2.5 bg-slate-800/50 border rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none';
const PLAIN_BUTTON =
  'inline-flex items-center gap-1.5 py-2 px-3 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50';

// Digital products: the files the academy sells (guides, templates, source
// code). Add, edit, hide or show them; delete one that nobody ordered.
export default function CenterProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [values, setValues] = useState<ProductValues>(emptyProductForm());
  const [visible, setVisible] = useState(true);
  const [errors, setErrors] = useState<ProductErrors>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    digitalProductsService.list().then(
      (list) => {
        if (active) {
          setProducts(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load your products. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const change = (field: keyof ProductValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const openForm = (product: AdminProduct | null) => {
    setEditing(product ? { id: product.id, title: product.title } : { id: null, title: '' });
    setValues(product ? productFormFrom(product) : emptyProductForm());
    setVisible(true);
    setErrors({});
    setNotice(null);
    setConfirmingId(null);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing === null) return;
    const { errors: found, payload } = readProductForm(values);
    setErrors(found);
    if (payload === null) return;
    setSaving(true);
    setNotice(null);
    try {
      if (editing.id === null) {
        await digitalProductsService.create(payload, visible);
        setNotice({
          tone: 'success',
          text: visible ? 'Product added. It is visible in the store.' : 'Product added. It is hidden from the store.',
        });
      } else {
        await digitalProductsService.update(editing.id, payload);
        setNotice({ tone: 'success', text: 'Changes saved.' });
      }
      setEditing(null);
      reload();
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not save the product. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  const setVisibility = async (product: AdminProduct, show: boolean) => {
    setBusyId(product.id);
    setNotice(null);
    try {
      await digitalProductsService.update(product.id, { isActive: show });
      setNotice({
        tone: 'success',
        text: show
          ? `${product.title} is visible in the store again.`
          : `${product.title} is hidden from the store. Its buyers keep their download link.`,
      });
    } catch (error) {
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not change the product. Please try again.') });
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const remove = async (product: AdminProduct) => {
    setBusyId(product.id);
    setNotice(null);
    try {
      await digitalProductsService.remove(product.id);
      setConfirmingId(null);
      setNotice({ tone: 'success', text: `${product.title} is deleted.` });
    } catch (error) {
      setConfirmingId(null);
      setNotice({ tone: 'error', text: apiErrorMessage(error, 'Could not delete the product. Please try again.') });
    } finally {
      setBusyId(null);
      reload();
    }
  };

  const fieldClass = (field: keyof ProductValues) =>
    `${FIELD} ${errors[field] ? 'border-red-500/60' : 'border-slate-700'}`;
  const describedBy = (field: keyof ProductValues, id: string) => (errors[field] ? `${id}-error` : undefined);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Digital products</h1>
          <p className="text-sm text-slate-400 mt-1">
            Files your students buy and download: guides, templates, source code. A buyer gets the link once
            their payment is confirmed.
          </p>
        </div>
        {products !== null && editing === null && (
          <button
            type="button"
            onClick={() => openForm(null)}
            className="inline-flex shrink-0 items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors whitespace-nowrap"
          >
            <Plus aria-hidden="true" className="w-4 h-4" />
            Add a product
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

      {products === null && loadError === '' && (
        <p role="status" className="text-sm text-slate-400 py-8 text-center">
          Loading your products...
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

      {/* Add or edit a product */}
      {editing !== null && (
        <form
          onSubmit={save}
          noValidate
          aria-labelledby="product-form-title"
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5"
        >
          <h2 id="product-form-title" className="text-lg font-semibold text-white break-words">
            {editing.id === null ? 'Add a product' : `Edit ${editing.title}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="product-title" className="text-sm font-medium text-slate-300">
                Title
              </label>
              <input
                id="product-title"
                value={values.title}
                onChange={(e) => change('title', e.target.value)}
                maxLength={PRODUCT_TITLE_MAX}
                placeholder="For example: Node.js cheat sheet (PDF)"
                aria-invalid={errors.title !== undefined}
                aria-describedby={describedBy('title', 'product-title')}
                className={fieldClass('title')}
              />
              <FieldError id="product-title-error" text={errors.title} />
            </div>
            <div className="space-y-2">
              <label htmlFor="product-price" className="text-sm font-medium text-slate-300">
                Price (TND)
              </label>
              <input
                id="product-price"
                inputMode="decimal"
                value={values.price}
                onChange={(e) => change('price', e.target.value)}
                placeholder="25"
                aria-invalid={errors.price !== undefined}
                aria-describedby={describedBy('price', 'product-price')}
                className={fieldClass('price')}
              />
              <FieldError id="product-price-error" text={errors.price} />
            </div>
            <div className="space-y-2 sm:col-span-3">
              <label htmlFor="product-link" className="text-sm font-medium text-slate-300">
                Link to the file
              </label>
              <input
                id="product-link"
                type="url"
                inputMode="url"
                value={values.fileUrl}
                onChange={(e) => change('fileUrl', e.target.value)}
                maxLength={PRODUCT_LINK_MAX}
                placeholder="https://drive.google.com/file/d/..."
                aria-invalid={errors.fileUrl !== undefined}
                aria-describedby={errors.fileUrl ? 'product-link-error' : 'product-link-help'}
                className={fieldClass('fileUrl')}
              />
              <p id="product-link-help" className="text-xs text-slate-500">
                Buyers see this link in their purchases once their payment is confirmed. Use a link that does
                not expire.
              </p>
              <FieldError id="product-link-error" text={errors.fileUrl} />
            </div>
            <div className="space-y-2 sm:col-span-3">
              <label htmlFor="product-description" className="text-sm font-medium text-slate-300">
                Description (optional)
              </label>
              <textarea
                id="product-description"
                rows={3}
                value={values.description}
                onChange={(e) => change('description', e.target.value)}
                maxLength={PRODUCT_DESCRIPTION_MAX}
                placeholder="What is inside, and who it is for"
                aria-invalid={errors.description !== undefined}
                aria-describedby={describedBy('description', 'product-description')}
                className={fieldClass('description')}
              />
              <FieldError id="product-description-error" text={errors.description} />
            </div>
          </div>
          {editing.id === null && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                id="product-visible"
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              Show it in the store now
            </label>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing.id === null ? 'Add the product' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={saving}
              className="py-2.5 px-4 rounded-xl text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {products !== null && products.length === 0 && editing === null && (
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <Package aria-hidden="true" className="w-8 h-8 text-indigo-400 mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No digital products yet</h2>
          <p className="text-sm text-slate-400">
            Add a guide, a set of templates or source code that your students can buy next to your courses.
          </p>
        </div>
      )}

      {products !== null && products.length > 0 && (
        <ul className="space-y-3" aria-label="Your digital products">
          {products.map((product) => {
            const count = orderCount(product);
            const href = safeDownloadUrl(product.fileUrl);
            const busy = busyId === product.id;
            return (
              <li key={product.id} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white break-words">{product.title}</h3>
                    <p className="text-sm text-slate-400">
                      {formatPrice(product.price)} - {orderCountLabel(count)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-lg border ${
                      product.isActive
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                    }`}
                  >
                    {product.isActive ? 'Visible in the store' : 'Hidden'}
                  </span>
                </div>
                {product.description && (
                  <p className="text-sm text-slate-300 break-words line-clamp-2">{product.description}</p>
                )}
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 max-w-full text-sm text-indigo-300 hover:text-indigo-200"
                  >
                    <ExternalLink aria-hidden="true" className="w-4 h-4 shrink-0" />
                    <span className="truncate">{product.fileUrl}</span>
                  </a>
                ) : (
                  <p className="text-sm text-amber-400">The file link is not a web address. Edit the product.</p>
                )}

                {confirmingId === product.id ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                    <span>Delete this product? This cannot be undone.</span>
                    <button
                      type="button"
                      onClick={() => remove(product)}
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
                      onClick={() => openForm(product)}
                      disabled={busyId !== null || saving}
                      className={PLAIN_BUTTON}
                    >
                      <Pencil aria-hidden="true" className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility(product, product.isActive === false)}
                      disabled={busyId !== null}
                      className={PLAIN_BUTTON}
                    >
                      {product.isActive ? (
                        <EyeOff aria-hidden="true" className="w-4 h-4" />
                      ) : (
                        <Eye aria-hidden="true" className="w-4 h-4" />
                      )}
                      {busy ? 'Saving...' : product.isActive ? 'Hide from the store' : 'Show in the store'}
                    </button>
                    {canDelete(product) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingId(product.id);
                          setNotice(null);
                        }}
                        disabled={busyId !== null}
                        className="inline-flex items-center gap-1.5 py-2 px-3 text-sm text-slate-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        <Trash2 aria-hidden="true" className="w-4 h-4" />
                        Delete
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Ordered: it can be hidden, not deleted.</span>
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
