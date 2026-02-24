'use client';

import { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCode2,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Calendar,
  Code
} from 'lucide-react';

export default function ProjectSubmissionsPage() {
  const [isDragging, setIsDragging] = useState(false);

  // Mock data for upcoming assignments
  const upcomingAssignments = [
    { id: 1, course: 'Advanced React Native', title: 'Build a Cross-Platform UI Clone', dueDate: 'Tomorrow, 11:59 PM', status: 'pending', type: 'code' },
    { id: 2, course: 'Backend Engineering', title: 'NestJS REST API Implementation', dueDate: 'Oct 28, 2026', status: 'pending', type: 'archive' },
  ];

  // Mock data for past submissions
  const pastSubmissions = [
    { id: 'SUB-092', course: 'Next.js Foundations', title: 'App Router & Layouts Project', submittedOn: 'Oct 15, 2026', status: 'graded', grade: '95/100', file: 'nextjs-layouts-mansouri.zip' },
    { id: 'SUB-091', course: 'System Architecture', title: 'Database Schema Design', submittedOn: 'Oct 10, 2026', status: 'under_review', grade: 'Pending', file: 'schema-design-v2.pdf' },
    { id: 'SUB-088', course: 'Frontend Basics', title: 'Tailwind CSS Portfolio', submittedOn: 'Sep 28, 2026', status: 'graded', grade: '88/100', file: 'portfolio-final.zip' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here in the future
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Graded</span>;
      case 'under_review':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Under Review</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertCircle className="w-3.5 h-3.5" /> Action Required</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assignments & Projects</h1>
          <p className="text-sm text-slate-400 mt-1">Submit your coursework and track your instructor feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload Area & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Drag & Drop Upload Zone */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4">New Submission</h2>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative w-full p-10 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 text-center
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/30'
                }
              `}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-indigo-400'}`}>
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Upload your project files</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-sm">
                Drag and drop your ZIP files, PDFs, or code repositories here, or click to browse your macOS file system.
              </p>
              
              <div className="flex items-center gap-3">
                <button className="py-2.5 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
                  Select Files
                </button>
                <button className="py-2.5 px-6 rounded-xl text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
                  Link GitHub Repo
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-6 mt-auto">
                Supported formats: .zip, .rar, .pdf, .tsx, .ts (Max 50MB)
              </p>
            </div>
          </div>

          {/* Past Submissions Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Submission History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/30">
                    <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Project</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pastSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 group-hover:border-indigo-500/30 transition-colors">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{sub.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{sub.course}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-slate-300">{sub.submittedOn}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{sub.file}</p>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`text-sm font-bold ${sub.status === 'graded' ? 'text-white' : 'text-slate-500'}`}>
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Upcoming Deadlines
            </h2>
            
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {assignment.type === 'code' ? <Code className="w-3.5 h-3.5" /> : <FileCode2 className="w-3.5 h-3.5" />}
                      {assignment.course}
                    </div>
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-sm font-medium text-white mb-3 leading-snug">
                    {assignment.title}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <span className="text-xs font-medium text-red-400 flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" />
                      {assignment.dueDate}
                    </span>
                    <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                      Submit Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors">
              View Calendar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}