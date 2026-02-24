'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function InstructorOrdersPage() {
  // Mock data for instructor sales/orders
  const [orders] = useState([
    { id: 'ORD-7092', student: 'Sarah Connor', course: 'Mastering Next.js & NestJS', date: 'Oct 24, 2026', time: '14:30', amount: '$89.99', status: 'completed' },
    { id: 'ORD-7091', student: 'John Doe', course: 'Backend Engineering', date: 'Oct 24, 2026', time: '11:15', amount: '$49.99', status: 'completed' },
    { id: 'ORD-7090', student: 'Ali Ben Salah', course: 'Mastering Next.js & NestJS', date: 'Oct 23, 2026', time: '09:00', amount: '$89.99', status: 'pending' },
    { id: 'ORD-7089', student: 'Fatima Zahra', course: 'React Native Crash Course', date: 'Oct 22, 2026', time: '16:45', amount: '$29.99', status: 'refunded' },
    { id: 'ORD-7088', student: 'Mehdi Hassan', course: 'System Architecture', date: 'Oct 20, 2026', time: '10:20', amount: '$59.99', status: 'completed' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'refunded':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><ArrowDownRight className="w-3.5 h-3.5" /> Refunded</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Revenue & Orders</h1>
          <p className="text-sm text-slate-400 mt-1">Track your course sales, manage transactions, and export financial reports.</p>
        </div>
        <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm">
          <Download className="w-4 h-4 mr-2 text-slate-400" />
          Export Report
        </button>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Net Revenue</p>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">$12,450.00</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +15% from last month
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Total Sales</p>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">342</p>
          <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24 new this week
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Avg. Order Value</p>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">$68.50</p>
          <p className="text-xs text-slate-500 mt-1">Across all courses</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <ArrowDownRight className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Refunds</p>
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">$149.97</p>
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            3 orders refunded
          </p>
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
            placeholder="Search by Order ID or Student Name..."
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-900/50 border border-slate-800 text-sm text-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none backdrop-blur-sm appearance-none min-w-[140px]">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm shrink-0">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            More Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student & Course</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-indigo-400">{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-white">{order.student}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{order.course}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-300">{order.date}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{order.time}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-white">{order.amount}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(order.status)}
                  </td>
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
            Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">5</span> of <span className="font-medium text-white">342</span> orders
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