'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MonitorPlay,
  ChevronRight,
  TrendingUp,
  Code2
} from 'lucide-react';

export default function CourseCatalogPage() {
  // Mock data for the course catalog
  const [courses] = useState([
    {
      id: '1',
      title: 'Mastering Next.js & NestJS: The Full-Stack Guide',
      instructor: 'Mahmoud Mansouri',
      rating: 4.8,
      reviews: 842,
      duration: '24.5 hours',
      level: 'Intermediate',
      price: 89.99,
      originalPrice: 149.99,
      category: 'Web Development',
      badge: 'Bestseller',
      thumbnailText: 'N'
    },
    {
      id: '2',
      title: 'Backend Engineering with PostgreSQL & Prisma',
      instructor: 'Sarah Connor',
      rating: 4.9,
      reviews: 320,
      duration: '18 hours',
      level: 'Advanced',
      price: 69.99,
      originalPrice: 99.99,
      category: 'Backend',
      badge: 'Highest Rated',
      thumbnailText: 'B'
    },
    {
      id: '3',
      title: 'React Native for Cross-Platform Mobile Apps',
      instructor: 'Ali Ben Salah',
      rating: 4.6,
      reviews: 156,
      duration: '32 hours',
      level: 'Beginner',
      price: 49.99,
      originalPrice: 89.99,
      category: 'Mobile Dev',
      badge: null,
      thumbnailText: 'R'
    },
    {
      id: '4',
      title: 'System Design & Scalable Architecture',
      instructor: 'John Doe',
      rating: 4.7,
      reviews: 512,
      duration: '12 hours',
      level: 'Advanced',
      price: 119.99,
      originalPrice: 199.99,
      category: 'Architecture',
      badge: 'New',
      thumbnailText: 'S'
    },
    {
      id: '5',
      title: 'TypeScript Fundamentals for React Developers',
      instructor: 'Mahmoud Mansouri',
      rating: 4.8,
      reviews: 945,
      duration: '8.5 hours',
      level: 'Beginner',
      price: 39.99,
      originalPrice: 59.99,
      category: 'Web Development',
      badge: null,
      thumbnailText: 'TS'
    },
    {
      id: '6',
      title: 'DevOps Crash Course: Docker & GitHub Actions',
      instructor: 'Fatima Zahra',
      rating: 4.5,
      reviews: 88,
      duration: '10 hours',
      level: 'Intermediate',
      price: 54.99,
      originalPrice: 79.99,
      category: 'DevOps',
      badge: null,
      thumbnailText: 'D'
    }
  ]);

  const categories = [
    'All Courses', 'Web Development', 'Backend', 'Mobile Dev', 'Architecture', 'DevOps'
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24 relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 border border-indigo-500/20">
          <Code2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Explore our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Course Catalog.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Level up your tech skills with high-quality, on-demand courses taught by industry experts.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="p-2 sm:p-3 rounded-2xl sm:rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-3 shadow-2xl">
          
          <div className="relative w-full sm:flex-1 flex items-center bg-slate-800/50 rounded-xl sm:rounded-full px-4 py-2 sm:py-0 h-12 border border-transparent focus-within:border-indigo-500/50 focus-within:bg-slate-800 transition-all">
            <Search className="w-5 h-5 text-slate-500 shrink-0" />
            <input 
              type="text" 
              placeholder="Search for courses, skills, or instructors..." 
              className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:outline-none focus:ring-0 px-3 text-sm"
            />
          </div>

          <button className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-xl sm:rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25 shrink-0">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map((cat, index) => (
            <button 
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                index === 0 
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                  : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400 text-sm">Showing <span className="text-white font-semibold">{courses.length}</span> courses</p>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            Sort by: 
            <select className="bg-transparent text-white font-medium focus:outline-none cursor-pointer outline-none">
              <option className="bg-slate-900">Most Popular</option>
              <option className="bg-slate-900">Highest Rated</option>
              <option className="bg-slate-900">Newest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="group flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden flex-1">
              
              {/* Course Thumbnail Image Area */}
              <div className="h-48 bg-slate-800 relative flex items-center justify-center overflow-hidden border-b border-slate-700/50">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="w-16 h-16 rounded-2xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white font-bold text-2xl shadow-xl relative z-10 border border-white/10 group-hover:bg-indigo-600 transition-colors">
                  {course.thumbnailText}
                </div>
                
                {/* Badges */}
                {course.badge && (
                  <div className="absolute top-4 left-4 z-10 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {course.badge}
                  </div>
                )}
              </div>

              {/* Course Details */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                    {course.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-sm text-slate-400 mb-4 flex-1">
                  By {course.instructor}
                </p>

                {/* Rating & Stats */}
                <div className="flex items-center gap-4 mb-5 text-sm">
                  <div className="flex items-center gap-1.5 font-medium text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {course.rating} <span className="text-slate-500">({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {course.duration}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-800">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">${course.price}</span>
                    <span className="text-sm text-slate-500 line-through mb-1">${course.originalPrice}</span>
                  </div>
                  <Link 
                    href={`/products/${course.id}`}
                    className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Pagination/Load More */}
        <div className="mt-16 text-center">
          <button className="inline-flex items-center justify-center py-3 px-8 rounded-xl font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-200 shadow-lg">
            Load More Courses
          </button>
        </div>
      </div>
    </div>
  );
}