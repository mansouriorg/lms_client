'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  MoreVertical,
  TrendingUp,
  MapPin,
  Car
} from 'lucide-react';

// Dummy data representing upcoming driving training sessions
const upcomingSessions = [
  { id: 'TR-101', date: 'Feb 24, 2026', type: 'Stage de Sensibilisation', enrolled: 12, capacity: 20, status: 'Active', price: '€250' },
  { id: 'TR-102', date: 'Feb 28, 2026', type: 'Récupération de Points', enrolled: 20, capacity: 20, status: 'Full', price: '€250' },
  { id: 'TR-103', date: 'Mar 05, 2026', type: 'Stage de Sensibilisation', enrolled: 5, capacity: 20, status: 'Upcoming', price: '€250' },
  { id: 'TR-104', date: 'Mar 12, 2026', type: 'Récupération de Points', enrolled: 0, capacity: 15, status: 'Draft', price: '€280' },
];

export default function CenterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans flex overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 backdrop-blur-xl hidden md:flex flex-col justify-between">
        <div>
          {/* Brand Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">CenterPro</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-4">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'overview' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Overview
            </button>
            <button onClick={() => setActiveTab('sessions')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'sessions' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <Calendar className="w-5 h-5 mr-3" /> Training Sessions
            </button>
            <button onClick={() => setActiveTab('students')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'students' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <Users className="w-5 h-5 mr-3" /> Registered Students
            </button>
            <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'payments' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <CreditCard className="w-5 h-5 mr-3" /> Payments & Stripe
            </button>
          </nav>
        </div>

        {/* User Profile Mini */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              EC
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">École Centrale</p>
              <p className="text-xs text-slate-500 truncate">Center Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Ambient Background Glow */}
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[30%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-800/60 bg-slate-900/20 backdrop-blur-md z-10">
          <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search sessions, students, or IDs..." 
              className="bg-transparent border-none outline-none text-sm text-white ml-3 w-full placeholder-slate-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0f172a]"></span>
            </button>
            <button className="flex items-center py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Page Title */}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
              <p className="text-sm text-slate-400 mt-1">Monitor your training center's performance and upcoming classes.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Metric Card 1 */}
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-medium text-sm">Active Sessions</h3>
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-white">12</span>
                  <span className="flex items-center text-xs font-medium text-emerald-400 mb-1.5">
                    <TrendingUp className="w-3 h-3 mr-1" /> +2 this month
                  </span>
                </div>
              </div>

              {/* Metric Card 2 */}
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-medium text-sm">Total Bookings</h3>
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-white">148</span>
                  <span className="flex items-center text-xs font-medium text-emerald-400 mb-1.5">
                    <TrendingUp className="w-3 h-3 mr-1" /> +15% vs last month
                  </span>
                </div>
              </div>

              {/* Metric Card 3 */}
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-medium text-sm">Estimated Revenue</h3>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-white">€8,450</span>
                  <span className="text-xs text-slate-500 mb-1.5">via Stripe</span>
                </div>
              </div>
            </div>

            {/* Main Table Area */}
            <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Upcoming Training Sessions</h2>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-500 bg-slate-900/20">
                      <th className="px-6 py-4 font-medium">Session ID & Type</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Students</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {upcomingSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 group-hover:border-indigo-500/30 transition-colors">
                              <MapPin className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{session.type}</p>
                              <p className="text-xs text-slate-500">{session.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{session.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-800 rounded-full h-1.5 max-w-[60px]">
                              <div 
                                className={`h-1.5 rounded-full ${session.enrolled === session.capacity ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                style={{ width: `${(session.enrolled / session.capacity) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-400">{session.enrolled}/{session.capacity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 font-medium">{session.price}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                            ${session.status === 'Active' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                              session.status === 'Full' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              session.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-slate-800 text-slate-400 border-slate-700'}
                          `}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}