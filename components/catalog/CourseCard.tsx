import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { courseInitials, courseStatusLabel } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';

type CourseCardProps = {
  course: {
    id: string;
    title: string;
    price: number;
    status: string;
    category: string | null;
    level: string | null;
    _count?: { modules: number };
  };
  // Shown under the title in the catalog; left out on an academy's own page
  academyName?: string;
};

// One course of the catalog (/products) or of an academy page (/centers/[id]):
// it opens the course page.
export default function CourseCard({ course, academyName }: CourseCardProps) {
  const status = courseStatusLabel(course.status);
  const modules = course._count
    ? `${course._count.modules} ${course._count.modules === 1 ? 'module' : 'modules'}`
    : '';
  const details = [academyName ?? '', modules].filter((part) => part !== '').join(' - ');
  return (
    <Link
      href={`/products/${encodeURIComponent(course.id)}`}
      className="group h-full flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="h-40 relative flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-b border-slate-800">
        <span className="w-16 h-16 rounded-2xl bg-slate-900/80 flex items-center justify-center text-white font-bold text-2xl border border-white/10 group-hover:bg-indigo-600 transition-colors">
          {courseInitials(course.title)}
        </span>
        {status && (
          <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-lg bg-amber-500 text-slate-950">
            {status}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        {(course.category || course.level) && (
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
            {[course.category, course.level].filter(Boolean).join(' - ')}
          </p>
        )}
        <h2 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {course.title}
        </h2>
        <p className="text-sm text-slate-400 mb-4 flex-1">{details}</p>
        <div className="flex items-center justify-between pt-5 border-t border-slate-800">
          <span className="text-2xl font-bold text-white">
            {course.price === 0 ? 'Free' : formatPrice(course.price)}
          </span>
          <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
            <ChevronRight aria-hidden="true" className="w-5 h-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
