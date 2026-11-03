import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quizzes',
};

// The quizzes are in the course player (/student/courses/[id]): under the
// lessons of each module that has one, and after its last lesson.
export default function StudentQuizzesPage() {
  return (
    <section className="max-w-xl p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
        <HelpCircle aria-hidden="true" className="w-6 h-6 text-indigo-400" />
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">Quizzes</h1>
      <p className="text-sm text-slate-300 leading-relaxed">
        Each module of a course can end with a quiz: one question at a time, the right answer with an explanation,
        and your score at the end. Your score is saved each time you finish a quiz, and the course shows your best
        one, so you can try again as often as you like.
      </p>
      <p className="text-sm text-slate-300 leading-relaxed">
        Open a course: the quiz of a module is listed under its lessons, with your best score, and offered after
        its last lesson.
      </p>
      <Link
        href="/student/lessons"
        className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
      >
        <BookOpen aria-hidden="true" className="w-4 h-4" />
        My courses
      </Link>
    </section>
  );
}
