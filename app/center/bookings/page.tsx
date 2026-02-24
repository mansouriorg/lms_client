'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CenterBookingsPage() {
  // Mock data for the table
  const [bookings] = useState([
    { id: 'BKG-001', student: 'Sarah Connor', phone: '+216 55 123 456', stage: 'Practical Driving', date: 'Oct 24, 2024', time: '14:00 - 16:00', status: 'pending', amount: '60 TND' },
    { id: 'BKG-002', student: 'John Doe', phone: '+216 22 987 654', stage: 'Theory Test Prep', date: 'Oct 24, 2024', time: '16:30 - 18:30', status: 'confirmed', amount: '40 TND' },
    { id: 'BKG-003', student: 'Ali Ben Salah', phone: '+216 98 111 222', stage: 'Practical Driving', date: 'Oct 25, 2024', time: '09:00 - 11:00', status: 'confirmed', amount: '60 TND' },
    { id: 'BKG-004', student: 'Fatima Zahra', phone: '+216 50 333 444', stage: 'Highway Driving', date: 'Oct 25, 2024', time: '11:00 - 13:00', status: 'cancelled', amount: '80 TND' },
    { id: 'BKG-005', student: 'Mehdi Hassan', phone: '+216 29 555 666', stage: 'Night Driving', date: 'Oct 26, 2024', time: '20:00 - 22:00', status: 'pending', amount: '90 TND' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmed</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bookings Management</h1>
          <p className="text-sm text-slate-400 mt-1">View and manage all student lesson bookings.</p>
        </div>
        <button className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Create Booking
        </button>
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
            placeholder="Search by student name, ID, or phone..."
          />
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            Date Range
          </button>
          <button className="inline-flex items-center justify-center py-2.5 px-4 border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-colors backdrop-blur-sm">
            <Filter className="w-4 h-4 mr-2 text-slate-400" />
            Filters
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Booking ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stage / Lesson</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-indigo-400">{booking.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium shrink-0 border border-slate-700">
                        {booking.student.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{booking.student}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{booking.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-300">{booking.stage}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{booking.amount}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-white">{booking.date}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{booking.time}</p>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-indigo-500/50">
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
            Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">5</span> of <span className="font-medium text-white">42</span> results
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