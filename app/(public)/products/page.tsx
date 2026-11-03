'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, BookOpen, RotateCcw, Search } from 'lucide-react';
import CourseCard from '@/components/catalog/CourseCard';
import CatalogHeader from '@/components/layout/CatalogHeader';
import { apiErrorMessage } from '@/lib/api-error';
import { type CatalogCourse, type CatalogSort, categoriesOf, filterCourses } from '@/lib/catalog';
import { coursesService } from '@/services/courses.service';

export default function CourseCatalogPage() {
  // null while the first load is running
  const [courses, setCourses] = useState<CatalogCourse[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<CatalogSort>('newest');

  // Anyone can open the catalog: GET /stages works with or without sign-in.
  useEffect(() => {
    let active = true;
    coursesService.getAll().then(
      (list) => {
        if (active) {
          setCourses(list);
          setLoadError('');
        }
      },
      (error: unknown) => {
        if (active) {
          setLoadError(apiErrorMessage(error, 'Could not load the courses. Please try again.'));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const categories = useMemo(() => categoriesOf(courses ?? []), [courses]);
  const visible = useMemo(
    () => filterCourses(courses ?? [], query, category, sort),
    [courses, query, category, sort],
  );

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      <CatalogHeader />

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Course catalog
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Courses from our academies, with real instructors. Open a course to see its program
          and price.
        </p>
        <p className="text-sm text-slate-500 mt-3">
          Looking for guides, templates or source code?{' '}
          <Link href="/store" className="font-medium text-indigo-300 hover:text-indigo-200">
            See the digital products
          </Link>
        </p>
      </div>

      {/* Search, categories and sorting */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="course-search" className="sr-only">
              Search courses
            </label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search aria-hidden="true" className="w-5 h-5 text-slate-500" />
            </div>
            <input
              id="course-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, topic, level or academy"
              className="block w-full h-12 pl-12 pr-4 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <label htmlFor="course-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="course-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as CatalogSort)}
            className="h-12 px-4 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Category">
            {['', ...categories].map((name) => (
              <button
                key={name === '' ? 'all' : name}
                type="button"
                aria-pressed={category === name}
                onClick={() => setCategory(name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  category === name
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {name === '' ? 'All courses' : name}
              </button>
            ))}
          </div>
        )}
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

        {courses === null && loadError === '' && (
          <p role="status" className="text-center text-sm text-slate-400 py-12">
            Loading the courses...
          </p>
        )}

        {courses && visible.length === 0 && (
          <div className="text-center py-16">
            <BookOpen aria-hidden="true" className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">
              {courses.length === 0 ? 'No courses yet.' : 'No course matches your search.'}
            </p>
            {courses.length === 0 && (
              <p className="text-sm text-slate-500 mt-1">
                Courses appear here as soon as an academy publishes them.
              </p>
            )}
          </div>
        )}

        {courses && visible.length > 0 && (
          <>
            <p className="text-slate-400 text-sm mb-6">
              {visible.length === 1 ? '1 course' : `${visible.length} courses`}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((course) => (
                <li key={course.id}>
                  <CourseCard course={course} academyName={course.center?.name ?? 'Academy'} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
