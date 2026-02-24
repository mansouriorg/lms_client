'use client';

import { 
  Car, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Clock, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  // Mock data for the student's progress
  const progressStats = [
    { name: 'Practical Hours', value: '12 / 30', icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Theory Score', value: '85%', icon: Trophy, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { name: 'Stages Passed', value: '2 / 4', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  // Mock data for the next upcoming lesson
  const nextLesson = {
    title: 'City Driving Practice',
    date: 'Tomorrow, Oct 24',
    time: '10:00 AM - 12:00 PM',
    instructor: 'Ahmed Ben Ali',
    location: 'Main Center',
    status: 'Confirmed'
  };

  // Mock data for recent theory test attempts
  const recentTests = [
    { id: 1, name: 'Rules of the Road - Quiz 4', score: 88, passed: true, date: '2 days ago' },
    { id: 2, name: 'Traffic Signs - Quiz 2', score: 92, passed: true, date: '1 week ago' },
    { id: 3, name: 'Highway Driving - Quiz 1', score: 65, passed: false, date: '2 weeks ago' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Learning Journey</h1>
          <p className="text-sm text-slate-400 mt-1">Keep up the good work! Here is your current progress.</p>
        </div>
        <Link 
          href="/student/stages/1/book" 
          className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Next Lesson
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Next Lesson & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Highlighted Next Lesson Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Car className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Up Next</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{nextLesson.title}</h2>
            <p className="text-slate-300 flex items-center gap-2 text-sm mb-6">
              <Clock className="w-4 h-4 text-indigo-400" /> {nextLesson.date} • {nextLesson.time}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Instructor</p>
                <p className="text-sm font-medium text-white">{nextLesson.instructor}</p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Location</p>
                <p className="text-sm font-medium text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {nextLesson.location}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {progressStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col items-center text-center hover:bg-slate-800/50 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{stat.name}</h3>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Theory Practice & Progress */}
        <div className="space-y-6">
          
          {/* Theory Practice Call to Action */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Theory Practice</h2>
            <p className="text-sm text-slate-400 mb-6 flex-1">
              Your official theory test is approaching. Complete 3 more practice quizzes to unlock the final mock exam.
            </p>
            <Link 
              href="/student/questions"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-colors"
            >
              Start Practice Quiz <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Recent Quiz Scores */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-slate-400" />
              Recent Quiz Scores
            </h2>
            <div className="space-y-3">
              {recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-white truncate">{test.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{test.date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-white">{test.score}%</span>
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}