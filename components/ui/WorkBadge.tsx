import { type WorkKind, badgeHint, badgeText } from '@/lib/work-counts';

// The number next to a menu item (what waits for the academy or the student).
// Nothing is shown when there is none, or while the number is unknown. Screen
// readers hear the whole sentence instead of the number.
export default function WorkBadge({ count, kind }: { count: number | null; kind: WorkKind }) {
  const text = badgeText(count);
  if (count === null || text === '') return null;
  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-[11px] font-semibold leading-none text-amber-300 bg-amber-500/15 border border-amber-500/30">
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">({badgeHint(count, kind)})</span>
    </span>
  );
}

// The dot on the menu button of phones, when the menu has a number to show
export function MenuDot({ count }: { count: number | null }) {
  if (badgeText(count) === '') return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900"
    />
  );
}
