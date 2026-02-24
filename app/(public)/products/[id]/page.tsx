'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Star, 
  Clock, 
  Monitor, 
  Award, 
  PlayCircle, 
  Check, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Infinity
} from 'lucide-react';

export default function CourseProductPage() {
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

  const toggleModule = (id: number) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Mock data for the course
  const course = {
    title: 'Mastering Next.js & NestJS: The Full-Stack Guide',
    subtitle: 'Build enterprise-grade, scalable applications from front to back using React, Next.js App Router, NestJS, and Prisma.',
    instructor: {
      name: 'Mahmoud Mansouri',
      role: 'Senior Software Engineer',
      rating: 4.9,
      students: 12450,
      avatar: 'M'
    },
    rating: 4.8,
    reviews: 842,
    students: 3102,
    price: 89.99,
    originalPrice: 149.99,
    updatedAt: 'October 2026',
    duration: '24.5 hours',
    lessons: 142,
    level: 'Intermediate to Advanced',
    whatYouWillLearn: [
      'Architect robust backend APIs with NestJS, TypeScript, and Prisma.',
      'Master the Next.js App Router, Server Components, and Server Actions.',
      'Implement secure JWT authentication and role-based access control.',
      'Deploy full-stack monorepo applications to production.'
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Next.js App Router Fundamentals',
        lessons: 12,
        duration: '2h 15m'
      },
      {
        id: 2,
        title: 'Module 2: NestJS Architecture & Controllers',
        lessons: 15,
        duration: '3h 40m'
      },
      {
        id: 3,
        title: 'Module 3: Database Modeling with Prisma',
        lessons: 10,
        duration: '2h 00m'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24">
      
      {/* Dark Hero Section */}
      <div className="bg-slate-950 border-b border-slate-800 relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-400 mb-6">
              <Link href="/products" className="hover:text-indigo-300 transition-colors">Development</Link>
              <span className="text-slate-600">›</span>
              <Link href="/products" className="hover:text-indigo-300 transition-colors">Web Development</Link>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
              {course.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm mb-8">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                <Star className="w-4 h-4 fill-amber-400" />
                {course.rating}
                <span className="text-amber-400/60 font-normal underline cursor-pointer">({course.reviews} ratings)</span>
              </div>
              <div className="text-slate-300">
                {course.students.toLocaleString()} students enrolled
              </div>
              <div className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Last updated {course.updatedAt}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                {course.instructor.avatar}
              </div>
              <div>
                <p className="text-sm text-slate-400">Created by</p>
                <Link href="#" className="text-base font-medium text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
                  {course.instructor.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12 relative">
        
        {/* Left Column (Details) */}
        <div className="flex-1 space-y-12">
          
          {/* What you'll learn */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">What you'll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
              <span>{course.curriculum.length} modules</span>
              <span>•</span>
              <span>{course.lessons} lessons</span>
              <span>•</span>
              <span>{course.duration} total length</span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30">
              {course.curriculum.map((module) => {
                const isExpanded = expandedModules.includes(module.id);
                return (
                  <div key={module.id} className="border-b border-slate-800 last:border-0">
                    <button 
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
                        <span className="font-medium text-white">{module.title}</span>
                      </div>
                      <span className="text-sm text-slate-500 shrink-0 hidden sm:block">
                        {module.lessons} lessons • {module.duration}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="bg-slate-950/50 p-5 border-t border-slate-800/50 space-y-3">
                        {/* Fake lesson items for visual effect */}
                        {[1, 2, 3].map((_, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-slate-400">
                              <PlayCircle className="w-4 h-4" />
                              <span>Lesson {idx + 1} overview and introduction</span>
                            </div>
                            <span className="text-slate-500">12:30</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (Sticky Checkout Card) */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-700 shadow-2xl backdrop-blur-xl">
            {/* Video Preview Thumbnail */}
            <div className="w-full aspect-video rounded-xl bg-slate-800 mb-6 relative overflow-hidden group cursor-pointer border border-slate-700">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 group-hover:scale-105 transition-transform duration-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white shadow-lg group-hover:bg-indigo-600 transition-colors">
                  <PlayCircle className="w-8 h-8 ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 to-transparent text-center font-medium text-white text-sm">
                Preview this course
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-extrabold text-white">${course.price}</span>
                <span className="text-lg text-slate-500 line-through mb-1">${course.originalPrice}</span>
              </div>
              <p className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                40% off for the next 2 days!
              </p>
            </div>

            <button className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 mb-3">
              Enroll Now
            </button>
            <p className="text-xs text-center text-slate-500 mb-6">30-Day Money-Back Guarantee</p>

            <div className="space-y-4">
              <h3 className="font-semibold text-white text-sm">This course includes:</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3"><Monitor className="w-4 h-4 text-slate-400" /> {course.duration} on-demand video</li>
                <li className="flex items-center gap-3"><PlayCircle className="w-4 h-4 text-slate-400" /> {course.lessons} coding exercises</li>
                <li className="flex items-center gap-3"><Infinity className="w-4 h-4 text-slate-400" /> Full lifetime access</li>
                <li className="flex items-center gap-3"><Award className="w-4 h-4 text-slate-400" /> Certificate of completion</li>
              </ul>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}