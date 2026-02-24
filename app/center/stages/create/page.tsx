'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Map, 
  FileText, 
  Clock, 
  CreditCard,
  Settings
} from 'lucide-react';

export default function CreateStagePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/center/stages" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Stages
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Training Stage</h1>
          <p className="text-sm text-slate-400 mt-1">Design a new learning phase or lesson package for your students.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/center/stages" className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 transition-colors backdrop-blur-sm">
            Cancel
          </Link>
          <button className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20">
            <Save className="w-4 h-4 mr-2" />
            Save Stage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Form - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Map className="w-5 h-5 text-indigo-400" />
              General Information
            </h2>

            <div className="space-y-4">
              {/* Stage Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">Stage Name</label>
                <input
                  type="text"
                  id="name"
                  className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm"
                  placeholder="e.g., Highway Driving Mastery"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-sm font-medium text-slate-300">Description</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-500" />
                  </div>
                  <textarea
                    id="description"
                    rows={4}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm resize-none"
                    placeholder="Describe what the student will learn in this stage..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Settings className="w-5 h-5 text-violet-400" />
              Configuration
            </h2>

            {/* Type Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="type" className="text-sm font-medium text-slate-300">Stage Type</label>
              <select
                id="type"
                className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm appearance-none"
              >
                <option value="practical">Practical Driving</option>
                <option value="theory">Theory Prep</option>
                <option value="exam">Official Exam</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label htmlFor="duration" className="text-sm font-medium text-slate-300">Duration (Hours)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="number"
                  id="duration"
                  min="1"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 outline-none sm:text-sm"
                  placeholder="2"
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-sm font-medium text-slate-300">Price (TND)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CreditCard className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 outline-none sm:text-sm"
                  placeholder="60.00"
                />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Active Status</p>
                <p className="text-xs text-slate-500 mt-0.5">Make available to students</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 border border-slate-600"></div>
              </label>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}