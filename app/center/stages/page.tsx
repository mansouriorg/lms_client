'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Users, 
  Star, 
  Clock, 
  Edit, 
  Trash2,
  Video,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CenterStagesPage() {
  // Mock data for the instructor's created courses (stages)
  const [courses] = useState([
    {
      id: 'CRS-01',
      title: 'Mastering Next.js & NestJS: The Full-Stack Guide',
      category: 'Web Development',
      price: '$89.99',
      students: 1245,
      rating: 4.9,
      status: 'published',
      lastUpdated: 'Oct 20, 2026',
      thumbnail: 'N'
    },
    {
      id: 'CRS-02',
      title: 'Backend Engineering with Prisma & PostgreSQL',
      category: 'Backend',
      price: '$69.99',
      students: 842,
      rating: 4.8,
      status: 'published',
      lastUpdated: 'Sep 15, 2026',
      thumbnail: 'B'
    },
    {
      id: 'CRS-03',
      title: 'React Native Cross-Platform Apps',
      category: 'Mobile',
      price: '$99.99',
      students: 0,
      rating: 0,
      status: 'draft',
      lastUpdated: 'Just now',
      thumbnail: 'R'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Eye className="w-3.5 h-3.5" /> Published</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"><EyeOff className="w-3.5 h-3.5" /> Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Course Management</h1>
          <p className="text-sm text-slate-400 mt-1">Create, edit, and manage your e-learning catalog.</p>
        </div>
        <Link 
          href="/center/stages/create"
          className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Link>
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
            placeholder="Search courses by title..."
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-900/50 border border-slate-800 text-sm text-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none backdrop-blur-sm appearance-none min-w-[140px]">
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm shrink-0">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            Category
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="group flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 backdrop-blur-sm transition-all duration-300 overflow-hidden shadow-xl hover:shadow-indigo-500/10">
            
            {/* Card Header / Fake Thumbnail */}
            <div className="h-32 bg-slate-800 relative flex items-center justify-center border-b border-slate-700/50">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 group-hover:scale-105 transition-transform duration-500"></div>
              <div className="w-12 h-12 rounded-xl bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg relative z-10">
                {course.thumbnail}
              </div>
              <div className="absolute top-3 right-3 z-10">
                {getStatusBadge(course.status)}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-base font-bold text-white leading-snug line-clamp-2 flex-1">
                  {course.title}
                </h3>
                <button className="text-slate-500 hover:text-white transition-colors shrink-0 outline-none">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                  {course.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {course.lastUpdated}
                </span>
              </div>

              {/* Stats Footer */}
              <div className="mt-auto pt-4 border-t border-slate-800/50 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Price</p>
                  <p className="text-sm font-semibold text-white">{course.price}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Students
                  </p>
                  <p className="text-sm font-semibold text-white">{course.students.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400/20 text-amber-400" /> Rating
                  </p>
                  <p className="text-sm font-semibold text-white">{course.rating > 0 ? course.rating : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Hover Reveal */}
            <div className="bg-slate-800/50 px-5 py-3 flex items-center gap-2 border-t border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Link href={`/center/stages/${course.id}/edit`} className="flex-1 inline-flex items-center justify-center py-2 rounded-lg text-sm font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button className="inline-flex items-center justify-center p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}