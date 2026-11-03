'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  PlayCircle,
  Users,
  CalendarCheck,
  HelpCircle,
  Tag,
  CreditCard,
  FileCheck,
  KeyRound,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Settings,
  X,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import SessionLoading from '@/components/ui/SessionLoading';
import WorkBadge, { MenuDot } from '@/components/ui/WorkBadge';
import TermsNotice from '@/components/account/TermsNotice';
import { displayName, initials, roleLabel } from '@/lib/auth';
import { inboxCounts } from '@/lib/qa';
import { groupHostedSessions, todayIn } from '@/lib/sessions';
import { useAreaSession } from '@/lib/use-session';
import { useWorkCount } from '@/lib/use-work-count';
import { type WorkKind, totalOf } from '@/lib/work-counts';
import { academySessionsService } from '@/services/academy-sessions.service';
import { projectReviewsService } from '@/services/project-reviews.service';
import { qaService } from '@/services/qa.service';

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: { count: number | null; kind: WorkKind };
};

// The numbers of the menu: what waits for the academy, counted like the
// Dashboard. Student questions with no answer from the academy
// (GET /questions/inbox), live session requests to answer
// (GET /bookings/instructor/my-sessions) and projects waiting for a review
// (GET /project-submissions/admin/pending).
const countQuestions = () => qaService.inbox().then((list) => inboxCounts(list).waiting);
const countSessionRequests = () =>
  academySessionsService.hosted().then((list) => groupHostedSessions(list, todayIn(new Date())).requests.length);
const countProjectsToReview = () => projectReviewsService.pending().then((list) => list.length);

export default function CenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, signOut } = useAreaSession('center');
  const questionsWaiting = useWorkCount(user === null ? null : countQuestions, pathname);
  const sessionRequests = useWorkCount(user === null ? null : countSessionRequests, pathname);
  const projectsToReview = useWorkCount(user === null ? null : countProjectsToReview, pathname);

  // Instructor and academy admin space. Courses are called "stages" in the API.
  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/center/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/center/stages', icon: BookOpen },
    { name: 'Digital products', href: '/center/products', icon: Package },
    { name: 'Lessons', href: '/center/lessons', icon: PlayCircle },
    { name: 'Students', href: '/center/students', icon: Users },
    {
      name: 'Student questions',
      href: '/center/qa',
      icon: MessageCircle,
      badge: { count: questionsWaiting, kind: 'questions' },
    },
    {
      name: 'Live sessions',
      href: '/center/bookings',
      icon: CalendarCheck,
      badge: { count: sessionRequests, kind: 'requests' },
    },
    { name: 'Quizzes', href: '/center/questions', icon: HelpCircle },
    {
      name: 'Projects',
      href: '/center/projects',
      icon: FileCheck,
      badge: { count: projectsToReview, kind: 'to-review' },
    },
    { name: 'Coupons', href: '/center/coupons', icon: Tag },
    { name: 'Orders', href: '/center/orders', icon: CreditCard },
    // Only platform admins manage the academies and reset forgotten passwords
    ...(user !== null && user.role === 'SUPER_ADMIN'
      ? [
          { name: 'Academies', href: '/center/academies', icon: Building2 },
          { name: 'Password resets', href: '/center/password-resets', icon: KeyRound },
        ]
      : []),
    { name: 'Settings', href: '/center/settings', icon: Settings },
  ];

  // Nothing of this space is shown until the sign-in is confirmed. Signed-out
  // visitors are sent to the sign-in page (lib/use-session.ts).
  if (user === null) return <SessionLoading />;

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white flex">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Logo subtitle="Instructor space" />
          <button
            type="button"
            aria-label="Close menu"
            className="ml-auto lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Instructor navigation" className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile after clicking
              >
                <Icon aria-hidden="true" className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
                {item.badge !== undefined && <WorkBadge count={item.badge.count} kind={item.badge.kind} />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
              {initials(user)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName(user)}</p>
              <p className="text-xs text-slate-400 truncate">{roleLabel(user.role)}</p>
            </div>
            <button
              type="button"
              aria-label="Log out"
              title="Log out"
              onClick={signOut}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 lg:hidden flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800">
          <Logo size="sm" />
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isSidebarOpen}
            className="relative p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg border border-slate-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <MenuDot count={totalOf([questionsWaiting, sessionRequests, projectsToReview])} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle Background Elements to match the login page */}
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <TermsNotice />
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
