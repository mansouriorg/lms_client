'use client';

import { useState } from 'react';
import { 
  Receipt, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  Calendar,
  Search,
  ArrowDownToLine,
  ExternalLink
} from 'lucide-react';

export default function StudentOrdersPage() {
  // Mock data for student purchase history
  const [orders] = useState([
    { 
      id: 'INV-2026-892', 
      course: 'Mastering Next.js & NestJS: The Full-Stack Guide', 
      date: 'Oct 24, 2026', 
      amount: '$89.99', 
      method: '•••• 4242', 
      status: 'paid' 
    },
    { 
      id: 'INV-2026-441', 
      course: 'Backend Engineering with PostgreSQL', 
      date: 'Sep 12, 2026', 
      amount: '$49.99', 
      method: 'PayPal', 
      status: 'paid' 
    },
    { 
      id: 'INV-2026-102', 
      course: 'Advanced React Native UI/UX', 
      date: 'Aug 05, 2026', 
      amount: '$69.99', 
      method: '•••• 4242', 
      status: 'refunded' 
    },
    { 
      id: 'INV-2025-998', 
      course: 'TypeScript Fundamentals', 
      date: 'Dec 18, 2025', 
      amount: '$29.99', 
      method: '•••• 5555', 
      status: 'paid' 
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>;
      case 'refunded':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"><ArrowDownToLine className="w-3.5 h-3.5" /> Refunded</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Purchase History</h1>
          <p className="text-sm text-slate-400 mt-1">View your past orders, manage subscriptions, and download invoices.</p>
        </div>
        <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm">
          <Download className="w-4 h-4 mr-2 text-slate-400" />
          Export All (CSV)
        </button>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Receipt className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Orders</p>
            <p className="text-xl font-bold text-white tracking-tight">4</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CreditCard className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Lifetime Spent</p>
            <p className="text-xl font-bold text-white tracking-tight">$169.97</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm outline-none backdrop-blur-sm"
          placeholder="Search by invoice number or course..."
        />
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Course Detail</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Invoice ID */}
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1">
                      {order.id}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </td>

                  {/* Course Details */}
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-white line-clamp-1">{order.course}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Paid via {order.method}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {order.date}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-white">{order.amount}</span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <button className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50" title="Download PDF">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State Fallback (Hidden in this mock, but good to have mentally mapped out) */}
        {orders.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No orders yet</h3>
            <p className="text-slate-400 text-sm">When you purchase a course, your receipts will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}