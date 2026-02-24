'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Layout, 
  Image as ImageIcon, 
  DollarSign,
  Settings,
  Plus,
  GripVertical,
  Trash2,
  Video
} from 'lucide-react';

export default function CreateCoursePage() {
  // State for the interactive curriculum builder
  const [modules, setModules] = useState([
    { id: 1, title: 'Introduction & Setup', lessons: [{ id: 101, title: 'Environment Setup' }] }
  ]);

  const addModule = () => {
    const newId = modules.length ? Math.max(...modules.map(m => m.id)) + 1 : 1;
    setModules([...modules, { id: newId, title: '', lessons: [] }]);
  };

  const addLesson = (moduleId: number) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        const newLessonId = mod.lessons.length ? Math.max(...mod.lessons.map(l => l.id)) + 1 : (moduleId * 100) + 1;
        return { ...mod, lessons: [...mod.lessons, { id: newLessonId, title: '' }] };
      }
      return mod;
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl py-4 border-b border-slate-800/50">
        <div>
          <Link href="/center/dashboard" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Course</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors backdrop-blur-sm">
            Save Draft
          </button>
          <button className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20">
            <Save className="w-4 h-4 mr-2" />
            Publish Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column - Details & Curriculum */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Information */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Layout className="w-5 h-5 text-indigo-400" />
              Basic Information
            </h2>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Course Title</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm"
                  placeholder="e.g., The Complete Next.js Bootcamp"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Course Subtitle</label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm"
                  placeholder="A brief summary of what students will achieve..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Detailed Description</label>
                <textarea
                  rows={6}
                  className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm resize-none"
                  placeholder="Explain the curriculum, requirements, and target audience..."
                />
              </div>
            </div>
          </div>

          {/* Curriculum Builder */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                Curriculum Builder
              </h2>
              <button 
                onClick={addModule}
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add Module
              </button>
            </div>

            <div className="space-y-4">
              {modules.map((module, modIndex) => (
                <div key={module.id} className="border border-slate-700 rounded-2xl bg-slate-800/30 overflow-hidden">
                  
                  {/* Module Header */}
                  <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-slate-500 cursor-move" />
                    <span className="text-sm font-bold text-slate-400">Section {modIndex + 1}:</span>
                    <input 
                      type="text" 
                      placeholder="Enter module title..."
                      defaultValue={module.title}
                      className="flex-1 bg-transparent border-none text-white font-medium focus:outline-none focus:ring-0 px-2"
                    />
                    <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lessons List */}
                  <div className="p-4 space-y-3">
                    {module.lessons.map((lesson, lesIndex) => (
                      <div key={lesson.id} className="flex items-center gap-3 pl-8 group">
                        <GripVertical className="w-4 h-4 text-slate-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center text-xs font-medium text-slate-400 shrink-0 border border-slate-600">
                          {lesIndex + 1}
                        </div>
                        <div className="flex-1 flex items-center bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-500/50 transition-colors">
                          <Video className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                          <input 
                            type="text" 
                            placeholder="Lesson title..."
                            defaultValue={lesson.title}
                            className="w-full bg-transparent border-none text-sm text-slate-300 focus:outline-none focus:ring-0"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="pl-14 pt-2">
                      <button 
                        onClick={() => addLesson(module.id)}
                        className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-700/50 border border-transparent hover:border-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Lesson
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column - Settings & Media */}
        <div className="space-y-8">
          
          {/* Course Media */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <ImageIcon className="w-5 h-5 text-violet-400" />
              Course Thumbnail
            </h2>

            <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-800/30 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors text-slate-500 border border-slate-700">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">Upload Image</p>
              <p className="text-xs text-slate-500 mt-1">1920x1080px (macOS friendly formats: JPG, PNG)</p>
            </div>
          </div>

          {/* Pricing & Settings */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Settings className="w-5 h-5 text-amber-400" />
              Settings
            </h2>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Course Price ($)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 outline-none sm:text-sm"
                  placeholder="89.99"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <select className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm appearance-none">
                <option value="web-dev">Web Development</option>
                <option value="mobile-dev">Mobile Development</option>
                <option value="backend">Backend Engineering</option>
                <option value="devops">DevOps & Deployment</option>
              </select>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Difficulty Level</label>
              <select className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm appearance-none">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all-levels">All Levels</option>
              </select>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}