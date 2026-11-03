'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, FileDown, RotateCcw, Search } from 'lucide-react';
import CatalogHeader from '@/components/layout/CatalogHeader';
import { apiErrorMessage } from '@/lib/api-error';
import { formatPrice } from '@/lib/format';
import { type StoreProduct, type StoreSort, filterStoreProducts, sellerName, shortText } from '@/lib/store';
import { storeService } from '@/services/store.service';

// The store of digital products: guides, templates and source code sold by
// the academies. Open to everyone; buying needs a student account.
export default function StorePage() {
  // null while the first load is running
  const [products, setProducts] = useState<StoreProduct[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<StoreSort>('newest');

  useEffect(() => {
    let active = true;
    storeService.list().then(
      (list) => {
        if (active) {
          setProducts(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) setLoadError(apiErrorMessage(error, 'Could not load the store. Please try again.'));
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visible = useMemo(() => filterStoreProducts(products ?? [], query, sort), [products, query, sort]);

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      <CatalogHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Digital products</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Guides, templates and source code from our academies. Buy once, then download from your
          purchases.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="store-search" className="sr-only">
              Search the store
            </label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search aria-hidden="true" className="w-5 h-5 text-slate-500" />
            </div>
            <input
              id="store-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, topic or academy"
              className="block w-full h-12 pl-12 pr-4 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <label htmlFor="store-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="store-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as StoreSort)}
            className="h-12 px-4 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {products === null && loadError === '' && (
          <p role="status" className="text-center text-sm text-slate-400 py-12">
            Loading the store...
          </p>
        )}

        {products && visible.length === 0 && (
          <div className="text-center py-16">
            <FileDown aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">
              {products.length === 0 ? 'No digital products yet.' : 'No product matches your search.'}
            </p>
            {products.length === 0 && (
              <p className="text-sm text-slate-500 mt-1">
                They appear here as soon as an academy adds one.{' '}
                <Link href="/products" className="text-indigo-300 hover:text-indigo-200">
                  Browse the courses
                </Link>
              </p>
            )}
          </div>
        )}

        {products && visible.length > 0 && (
          <>
            <p className="text-slate-400 text-sm mb-6">
              {visible.length === 1 ? '1 product' : `${visible.length} products`}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/store/${encodeURIComponent(product.id)}`}
                    className="flex flex-col h-full p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                      <FileDown aria-hidden="true" className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white leading-snug break-words">{product.title}</h2>
                    <p className="text-sm text-slate-400 mt-1">{sellerName(product)}</p>
                    {product.description && (
                      <p className="text-sm text-slate-300 mt-3 break-words">{shortText(product.description)}</p>
                    )}
                    <p className="mt-auto pt-4 text-xl font-bold text-white">{formatPrice(product.price)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
