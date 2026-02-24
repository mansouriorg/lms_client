'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  FileText, 
  MessageSquare, 
  Download,
  ChevronDown,
  ChevronUp,
  MonitorPlay,
  ArrowLeft
} from 'lucide-react';

export default function CoursePlayerPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'qa'>('overview');
  const [expandedModules, setExpandedModules] = useState<number[]>([1]); // Module 1 open by default

  const toggleModule = (id: number) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Mock data for the course curriculum
  const course = {
    title: 'Full-Stack Next.js & NestJS Architecture',
    instructor: 'Alex Developer',
    progress: 35,
    modules: [
      {
        id: 1,
        title: 'Module 1: Next.js App Router Foundations',
        duration: '45m',
        lessons: [
          { id: 101, title: 'Introduction to Server Components', duration: '12:30', status: 'completed' },
          { id: 102, title: 'Routing and Layouts', duration: '18:45', status: 'completed' },
          { id: 103, title: 'Data Fetching Strategies', duration: '14:20', status: 'playing' },
        ]
      },
      {
        id: 2,
        title: 'Module 2: Building the NestJS Backend',
        duration: '1h 20m',
        lessons: [
          { id: 201, title: 'Controllers and Providers', duration: '22:15', status: 'locked' },
          { id: 202, title: 'Database Integration with Prisma', duration: '35:00', status: 'locked' },
          { id: 203, title: 'Authentication & JWT Guards', duration: '23:45', status: 'locked' },
        ]
      },
      {
        id: 3,
        title: 'Module 3: Connecting the Stack',
        duration: '55m',
        lessons: [
          { id: 301, title: 'Setting up Axios Interceptors', duration: '15:20', status: 'locked' },
          { id: 302, title: 'Handling CORS & Cookies', duration: '19:40', status: 'locked' },
          { id: 303, title: 'Deploying the Monorepo', duration: '20:00', status: 'locked' },
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      
      {/* Left Column: Video Player & Details (Takes up 2/3 width on desktop) */}
      <div className="flex-1 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <Link href="/student/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Link>

        {/* Video Player Placeholder */}
        <div className="w-full aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative group shadow-2xl">
          {/* Abstract glowing background inside player */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900 z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[80px] z-0 pointer-events-none"></div>
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center hover:bg-indigo-500 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.4)] backdrop-blur-sm group-hover:shadow-[0_0_50px_rgba(99,102,241,0.6)]">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-2" fill="currentColor" />
            </button>
            <p className="mt-6 text-slate-300 font-medium tracking-wide">Data Fetching Strategies</p>
          </div>

          {/* Fake Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden cursor-pointer">
              <div className="w-1/3 h-full bg-indigo-500 rounded-full relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>04:12 / 14:20</span>
              <div className="flex items-center gap-4">
                <span>1080p</span>
                <span>1x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Info & Tabs */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-slate-400 text-sm mb-6 flex items-center gap-2">
            By <span className="font-semibold text-indigo-400">{course.instructor}</span>
          </p>

          {/* Tabs Navigation */}
          <div className="flex gap-6 border-b border-slate-800 mb-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Overview
              {activeTab === 'overview' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('resources')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'resources' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Resources
              {activeTab === 'resources' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('qa')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'qa' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Q&A
              {activeTab === 'qa' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px] text-slate-300 text-sm leading-relaxed">
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p>In this lesson, we dive deep into the differences between Server Components and Client Components, and how to securely fetch data directly from your database without needing intermediate API routes.</p>
                <h3 className="text-white font-semibold mt-4 mb-2">What you'll learn:</h3>
                <ul className="space-y-2 list-disc list-inside text-slate-400">
                  <li>Using the `fetch` API extended by Next.js</li>
                  <li>Caching and revalidating data</li>
                  <li>Passing server data to client components safely</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'resources' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <span className="font-medium text-white group-hover:text-indigo-300 transition-colors">Lesson Slides (PDF)</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <MonitorPlay className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium text-white group-hover:text-emerald-300 transition-colors">Source Code Repository</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </a>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-white font-medium mb-1">Got a question?</h3>
                <p className="text-slate-400 mb-4">Join the discussion with other students and the instructor.</p>
                <button className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-colors">
                  Ask a Question
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Right Column: Curriculum Sidebar (Takes up 1/3 width on desktop) */}
      <div className="w-full lg:w-96 shrink-0">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden sticky top-6 max-h-[calc(100vh-3rem)] flex flex-col">
          
          {/* Course Progress Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/80">
            <h2 className="text-lg font-semibold text-white mb-3">Course Content</h2>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">{course.progress}% Completed</span>
              <span className="text-indigo-400 font-medium">4/12 Lessons</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto">
            {course.modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);

              return (
                <div key={module.id} className="border-b border-slate-800/50 last:border-0">
                  {/* Module Header */}
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-900/30 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight mb-1">{module.title}</h3>
                      <p className="text-xs text-slate-500">{module.lessons.length} lessons • {module.duration}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {/* Lessons List */}
                  {isExpanded && (
                    <div className="bg-slate-900/10 py-2">
                      {module.lessons.map((lesson) => {
                        let icon;
                        let textStyle = "text-slate-400";
                        let bgStyle = "hover:bg-slate-800/40 border-l-2 border-transparent";

                        if (lesson.status === 'completed') {
                          icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                        } else if (lesson.status === 'playing') {
                          icon = <Play className="w-4 h-4 text-white" fill="currentColor" />;
                          textStyle = "text-white font-medium";
                          bgStyle = "bg-indigo-500/10 border-l-2 border-indigo-500";
                        } else {
                          icon = <Lock className="w-4 h-4 text-slate-600" />;
                          textStyle = "text-slate-500";
                        }

                        return (
                          <button 
                            key={lesson.id} 
                            disabled={lesson.status === 'locked'}
                            className={`w-full flex items-center gap-3 py-3 px-4 transition-colors text-left ${bgStyle} ${lesson.status === 'locked' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${textStyle}`}>{lesson.title}</p>
                            </div>
                            <span className="text-xs text-slate-600 shrink-0">{lesson.duration}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}