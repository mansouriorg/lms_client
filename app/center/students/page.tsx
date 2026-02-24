'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Mail, 
  User, 
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function StudentsManagementPage() {
  // Mock data for enrolled students
  const [students] = useState([
    { id: 'STU-001', name: 'Sarah Connor', email: 'sarah.c@example.com', course: 'Mastering Next.js & NestJS', progress: 85, lastActive: '2 hours ago', status: 'active' },
    { id: 'STU-002', name: 'John Doe', email: 'john.dev@example.com', course: 'Backend Engineering', progress: 12, lastActive: 'Yesterday', status: 'active' },
    { id: 'STU-003', name: 'Ali Ben Salah', email: 'ali.b@example.com', course: 'React Native Crash Course', progress: 100, lastActive: 'Oct 15, 2026', status: 'completed' },
    { id: 'STU-004', name: 'Fatima Zahra', email: 'fatima.z@example.com', course: 'Mastering Next.js & NestJS', progress: 45, lastActive: '3 days ago', status: 'inactive' },
    { id: 'STU-005', name: 'Mehdi Hassan', email: 'mehdi.h@example.com', course: 'System Architecture', progress: 0, lastActive: 'Never', status: 'new' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'completed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'inactive': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'new': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Students & Enrollments</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor learner progress and engagement across your courses.</p>
        </div>
        <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm outline-none backdrop-blur-sm"
            placeholder="Search by student name or email..."
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-900/50 border border-slate-800 text-sm text-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none backdrop-blur-sm appearance-none min-w-[160px]">
            <option value="">All Courses</option>
            <option value="nextjs">Mastering Next.js</option>
            <option value="backend">Backend Engineering</option>
          </select>
          <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm shrink-0">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            Filters
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Enrolled Course</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider w-48">Progress</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Active</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Student Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium shrink-0 border border-slate-700 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-colors">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{student.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Course Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                      {student.course}
                    </div>
                  </td>

                  {/* Progress Bar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${student.progress === 100 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-400 w-8 text-right">
                        {student.progress}%
                      </span>
                    </div>
                  </td>

                  {/* Status / Last Active */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                      <span className="text-xs text-slate-400">{student.lastActive}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50" title="Message Student">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-slate-500/50" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/30">
          <p className="text-sm text-slate-400">
            Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">5</span> of <span className="font-medium text-white">1,248</span> students
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}