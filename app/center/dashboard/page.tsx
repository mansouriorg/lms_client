'use client';

import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Star, 
  TrendingUp, 
  MoreHorizontal,
  GraduationCap,
  PlayCircle
} from 'lucide-react';

export default function AcademyDashboard() {
  // Mock data for the e-learning dashboard stats
  const stats = [
    { name: 'Total Students', value: '1,248', change: '+12%', isPositive: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Active Enrollments', value: '342', change: '+18%', isPositive: true, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Monthly Revenue', value: '$12,450', change: '+5%', isPositive: true, icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Average Rating', value: '4.8/5', change: '+0.2', isPositive: true, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  // Mock data for recent course enrollments
  const recentEnrollments = [
    { id: 1, student: 'Sarah Connor', course: 'Full-Stack Next.js Architecture', date: 'Today, 14:00', progress: 0, amount: '$99' },
    { id: 2, student: 'John Doe', course: 'Backend Engineering with NestJS', date: 'Today, 11:30', progress: 12, amount: '$89' },
    { id: 3, student: 'Ali Ben Salah', course: 'React Native Crash Course', date: 'Yesterday', progress: 45, amount: '$49' },
    { id: 4, student: 'Fatima Zahra', course: 'Full-Stack Next.js Architecture', date: 'Yesterday', progress: 100, amount: '$99' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Instructor Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back. Here is how your courses are performing today.</p>
        </div>
        <button className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20">
          + Create New Course
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold text-white mt-1 tracking-tight">{stat.value}</p>
              
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area (Placeholder for Sales Chart) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue & Enrollments</h2>
            <select className="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none">
              <option>Last 7 days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px] w-full rounded-xl border border-slate-700/50 border-dashed flex flex-col items-center justify-center text-slate-500 bg-slate-800/20">
            <TrendingUp className="w-8 h-8 mb-3 opacity-50 text-indigo-400" />
            <p className="text-sm font-medium text-slate-400">Chart integration goes here</p>
            <p className="text-xs mt-1">Recommend using Recharts or Chart.js</p>
          </div>
        </div>

        {/* Recent Enrollments List */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Sales</h2>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 space-y-4">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 group">
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium shrink-0 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                    {enrollment.student.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium text-white truncate">{enrollment.student}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" />
                      {enrollment.course}
                    </p>
                    
                    {/* Mini Progress Bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${enrollment.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">{enrollment.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{enrollment.amount}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{enrollment.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors border border-transparent hover:border-indigo-500/20">
            View All Transactions
          </button>
        </div>
      </div>

    </div>
  );
}