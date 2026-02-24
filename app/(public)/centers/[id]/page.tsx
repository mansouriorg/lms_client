'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Star, 
  Users, 
  BookOpen, 
  PlayCircle, 
  Github, 
  Twitter, 
  Linkedin,
  Globe,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function InstructorProfilePage() {
  // Mock data for the instructor profile
  const instructor = {
    id: '1',
    name: 'Mahmoud Mansouri',
    headline: 'Senior Full-Stack Engineer & System Architect',
    bio: "Hi, I'm Mahmoud. I'm a passionate software engineer with over a decade of experience building scalable, enterprise-grade applications. I specialize in the React ecosystem (Next.js, React Native) and robust backend architectures using NestJS and PostgreSQL. My goal is to bridge the gap between complex theory and practical, real-world development.",
    stats: {
      students: 24500,
      reviews: 4890,
      rating: 4.8,
      courses: 6
    },
    socials: {
      website: '#',
      github: '#',
      twitter: '#',
      linkedin: '#'
    },
    avatar: 'M',
    bannerGradient: 'from-indigo-600 to-violet-600'
  };

  // Mock data for the instructor's courses
  const [courses] = useState([
    {
      id: '1',
      title: 'Mastering Next.js & NestJS: The Full-Stack Guide',
      rating: 4.8,
      reviews: 842,
      price: 89.99,
      originalPrice: 149.99,
      category: 'Web Development',
      badge: 'Bestseller',
      thumbnailText: 'N'
    },
    {
      id: '5',
      title: 'TypeScript Fundamentals for React Developers',
      rating: 4.9,
      reviews: 945,
      price: 39.99,
      originalPrice: 59.99,
      category: 'Web Development',
      badge: null,
      thumbnailText: 'TS'
    },
    {
      id: '2',
      title: 'Backend Engineering with PostgreSQL & Prisma',
      rating: 4.9,
      reviews: 320,
      price: 69.99,
      originalPrice: 99.99,
      category: 'Backend',
      badge: 'Highest Rated',
      thumbnailText: 'B'
    }
  ]);

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white pb-24 relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Banner Area */}
      <div className={`h-48 md:h-64 w-full bg-gradient-to-r ${instructor.bannerGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-slate-900/40 mix-blend-overlay"></div>
        {/* Subtle grid pattern over banner */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Profile Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20 md:-mt-24 mb-16">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
          
          {/* Avatar */}
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-slate-900 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-white font-bold text-6xl relative overflow-hidden shrink-0 group">
            <div className={`absolute inset-0 bg-gradient-to-tr ${instructor.bannerGradient} opacity-90`}></div>
            <span className="relative z-10">{instructor.avatar}</span>
          </div>

          {/* Name & Quick Stats */}
          <div className="flex-1 text-center md:text-left mb-2 md:mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {instructor.name}
                </h1>
                <p className="text-lg text-indigo-400 font-medium flex items-center justify-center md:justify-start gap-2">
                  {instructor.headline}
                  <Award className="w-5 h-5 text-amber-400" />
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-end gap-3">
                <Link href={instructor.socials.website} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href={instructor.socials.github} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href={instructor.socials.twitter} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href={instructor.socials.linkedin} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Left Column: About & Stats */}
        <div className="w-full lg:w-1/3 space-y-8">
          
          {/* Stats Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Instructor Metrics</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{instructor.stats.students.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total Students</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white flex items-end gap-2">
                    {instructor.stats.rating} <span className="text-sm font-normal text-slate-500 mb-1">({instructor.stats.reviews.toLocaleString()} reviews)</span>
                  </p>
                  <p className="text-sm text-slate-400">Average Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{instructor.stats.courses}</p>
                  <p className="text-sm text-slate-400">Published Courses</p>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {instructor.bio}
            </p>
          </div>
        </div>

        {/* Right Column: Courses Grid */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Courses by {instructor.name.split(' ')[0]}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="group flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden">
                
                {/* Course Thumbnail Image Area */}
                <div className="h-40 bg-slate-800 relative flex items-center justify-center overflow-hidden border-b border-slate-700/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-xl relative z-10 border border-white/10 group-hover:bg-indigo-600 transition-colors">
                    {course.thumbnailText}
                  </div>
                  
                  {/* Badges */}
                  {course.badge && (
                    <div className="absolute top-3 left-3 z-10 bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {course.badge}
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                      {course.category}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-white leading-snug mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2 flex-1">
                    {course.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 font-medium text-amber-400 text-sm mb-4">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {course.rating} <span className="text-slate-500 font-normal">({course.reviews})</span>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-bold text-white">${course.price}</span>
                      <span className="text-xs text-slate-500 line-through mb-1">${course.originalPrice}</span>
                    </div>
                    <Link 
                      href={`/products/${course.id}`}
                      className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors shadow-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}