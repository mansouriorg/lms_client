'use client';

import { 
  Plus, Edit, Trash2, Calendar, MapPin, Users, 
  Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, TrendingUp 
} from "lucide-react";

export default function ManageStagesPage() {
  const stages = [
    {
      id: "TR-101",
      title: "Stage de Sensibilisation - Weekend",
      date: "Feb 24 - Feb 25, 2026",
      location: "Main Training Center",
      price: "€250",
      capacity: 20,
      enrolled: 15,
      status: "Active",
    },
    {
      id: "TR-102",
      title: "Récupération de Points Standard",
      date: "Feb 28 - Mar 01, 2026",
      location: "North Branch",
      price: "€250",
      capacity: 20,
      enrolled: 20,
      status: "Full",
    },
    {
      id: "TR-103",
      title: "Stage de Sensibilisation - Weekday",
      date: "Mar 05 - Mar 06, 2026",
      location: "Main Training Center",
      price: "€200",
      capacity: 25,
      enrolled: 2,
      status: "Draft",
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans p-4 sm:p-8 selection:bg-indigo-500 selection:text-white relative overflow-hidden flex flex-col items-center">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[50%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
              Manage Stages
            </h1>
            <p className="text-sm text-slate-400 mt-2">Create, update, and monitor your driving course sessions.</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            Create New Stage
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Active Stages", value: "12", trend: "+2 this week", color: "indigo" },
            { label: "Students Enrolled", value: "148", trend: "+15% vs last month", color: "violet" },
            { label: "Available Seats", value: "32", trend: "Filling up fast", color: "emerald" }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md relative overflow-hidden group hover:bg-slate-800/50 transition-colors">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-colors`}></div>
              <p className="text-sm font-medium text-slate-400 mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
                <div className={`flex items-center text-xs font-medium text-${stat.color}-400 bg-${stat.color}-500/10 px-2 py-1 rounded-lg border border-${stat.color}-500/20`}>
                  {stat.trend.includes('+') && <TrendingUp className="w-3 h-3 mr-1" />}
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Table Container */}
        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md overflow-hidden shadow-2xl">
          
          {/* Table Toolbar */}
          <div className="p-5 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-800/20">
            <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 w-full sm:w-96 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by ID, title, or location..." 
                className="bg-transparent border-none outline-none text-sm text-white ml-3 w-full placeholder-slate-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors text-sm font-medium w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" />
              Filter Status
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/40">
                  <th className="px-6 py-5 font-semibold">Course Details</th>
                  <th className="px-6 py-5 font-semibold">Date & Location</th>
                  <th className="px-6 py-5 font-semibold">Enrollment</th>
                  <th className="px-6 py-5 font-semibold">Status</th>
                  <th className="px-6 py-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stages.map((stage) => (
                  <tr key={stage.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">{stage.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400 border border-slate-700">{stage.id}</span>
                        <span className="text-xs text-emerald-400 font-semibold">{stage.price}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-300 mb-2 font-medium">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        {stage.date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {stage.location}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-between max-w-[140px] mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className={`text-sm font-bold ${stage.enrolled >= stage.capacity ? 'text-rose-400' : 'text-slate-200'}`}>
                            {stage.enrolled} <span className="text-slate-500 font-normal">/ {stage.capacity}</span>
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{Math.round((stage.enrolled / stage.capacity) * 100)}%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-2 max-w-[140px] overflow-hidden border border-slate-700/50">
                        <div 
                          className={`h-full rounded-full relative ${stage.enrolled >= stage.capacity ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} 
                          style={{ width: `${(stage.enrolled / stage.capacity) * 100}%` }}
                        >
                          {/* Shimmer effect on bar */}
                          <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-100%]"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm
                        ${stage.status === 'Active' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                          stage.status === 'Full' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                          'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        
                        {/* Status Indicator Dot */}
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          stage.status === 'Active' ? 'bg-indigo-400 animate-pulse' : 
                          stage.status === 'Full' ? 'bg-rose-400' : 
                          'bg-slate-500'
                        }`}></span>
                        
                        {stage.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit Stage">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete Stage">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all" title="More Options">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination / Footer */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-900/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>Showing <span className="text-white font-medium">1</span> to <span className="text-white font-medium">3</span> of <span className="text-white font-medium">12</span> results</p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-medium flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded-lg border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center">2</button>
              <button className="w-8 h-8 rounded-lg border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center">3</button>
              <button className="p-2 rounded-lg border border-slate-700/50 hover:bg-slate-800 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}