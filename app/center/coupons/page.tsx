'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Tag, 
  Copy, 
  Percent, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CenterCouponsPage() {
  // Mock data for the instructor's discount codes
  const [coupons] = useState([
    { id: 'CPN-01', code: 'LAUNCH2026', discount: '20%', course: 'All Courses', uses: 45, limit: 100, expires: 'Dec 31, 2026', status: 'active' },
    { id: 'CPN-02', code: 'NEXTJS-PRO', discount: '50%', course: 'Mastering Next.js & NestJS', uses: 10, limit: 10, expires: 'Nov 15, 2026', status: 'depleted' },
    { id: 'CPN-03', code: 'EARLYBIRD', discount: '15%', course: 'Backend Engineering', uses: 12, limit: 50, expires: 'Oct 01, 2026', status: 'expired' },
    { id: 'CPN-04', code: 'STUDENT50', discount: '50%', course: 'All Courses', uses: 128, limit: '∞', expires: 'Never', status: 'active' },
    { id: 'CPN-05', code: 'FLASHBACK', discount: '$20 OFF', course: 'React Native Crash Course', uses: 5, limit: 20, expires: 'Oct 30, 2026', status: 'active' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>;
      case 'depleted':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><AlertCircle className="w-3.5 h-3.5" /> Limit Reached</span>;
      case 'expired':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Expired</span>;
      default:
        return null;
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // In a real app, you'd show a toast notification here
    alert(`Copied ${code} to clipboard!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Promotions & Coupons</h1>
          <p className="text-sm text-slate-400 mt-1">Create discount codes to boost your course enrollments.</p>
        </div>
        <button className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </button>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Tag className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Active Campaigns</p>
            <p className="text-xl font-bold text-white tracking-tight">3</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Redemptions</p>
            <p className="text-xl font-bold text-white tracking-tight">200</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
            <Percent className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Avg. Discount</p>
            <p className="text-xl font-bold text-white tracking-tight">27%</p>
          </div>
        </div>
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
            placeholder="Search by promo code or course name..."
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-900/50 border border-slate-800 text-sm text-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none backdrop-blur-sm appearance-none min-w-[140px]">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="depleted">Depleted</option>
          </select>
          <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm shrink-0">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            Filters
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Promo Code</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Discount</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Applicable Course</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Usage</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Expires</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Code */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-400 tracking-wide bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                        {coupon.code}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700"
                        title="Copy Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Discount Amount */}
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-emerald-400">{coupon.discount}</span>
                  </td>

                  {/* Course Details */}
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-300 line-clamp-1">{coupon.course}</p>
                  </td>

                  {/* Usage Stats */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{coupon.uses} used</span>
                        <span>{coupon.limit} limit</span>
                      </div>
                      {typeof coupon.limit === 'number' && (
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${coupon.uses >= coupon.limit ? 'bg-amber-500' : 'bg-indigo-500'}`}
                            style={{ width: `${(coupon.uses / coupon.limit) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Expiry Date */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {coupon.expires}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {getStatusBadge(coupon.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-slate-500/50">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/30">
          <p className="text-sm text-slate-400">
            Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">5</span> of <span className="font-medium text-white">12</span> coupons
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}