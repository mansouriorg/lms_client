'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MoreVertical, 
  User, 
  CheckCircle2, 
  XCircle,
  Plus,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

export default function StudentBookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Mock data for student bookings
  const bookings = {
    upcoming: [
      {
        id: 'BK-092',
        title: '1-on-1 Code Review: Next.js Architecture',
        instructor: 'Mahmoud Mansouri',
        date: 'Tomorrow',
        time: '10:00 AM - 11:00 AM',
        type: 'Mentorship',
        status: 'confirmed',
        meetingLink: 'https://zoom.us/j/123456789'
      },
      {
        id: 'BK-093',
        title: 'Live Q&A: Backend Engineering with NestJS',
        instructor: 'Sarah Connor',
        date: 'Oct 28, 2026',
        time: '15:00 PM - 16:30 PM',
        type: 'Live Webinar',
        status: 'confirmed',
        meetingLink: null // Link not generated yet
      }
    ],
    past: [
      {
        id: 'BK-085',
        title: 'Career Consultation & Resume Review',
        instructor: 'Ali Ben Salah',
        date: 'Oct 15, 2026',
        time: '14:00 PM - 14:30 PM',
        type: 'Mentorship',
        status: 'completed',
        meetingLink: null
      },
      {
        id: 'BK-081',
        title: 'Debugging Session: React Native Maps',
        instructor: 'Mahmoud Mansouri',
        date: 'Oct 10, 2026',
        time: '09:00 AM - 10:00 AM',
        type: 'Code Help',
        status: 'cancelled',
        meetingLink: null
      }
    ]
  };

  const currentList = activeTab === 'upcoming' ? bookings.upcoming : bookings.past;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Sessions</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your 1-on-1 mentorship calls and live webinars.</p>
        </div>
        <button className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4 mr-2" />
          Book New Session
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-6 border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'upcoming' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Upcoming Sessions
          {activeTab === 'upcoming' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'past' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Past Sessions
          {activeTab === 'past' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No {activeTab} sessions</h3>
            <p className="text-slate-400 text-sm">You don't have any {activeTab} bookings at the moment.</p>
          </div>
        ) : (
          currentList.map((booking) => (
            <div key={booking.id} className="p-5 sm:p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors flex flex-col md:flex-row gap-6 md:items-center">
              
              {/* Date/Time Block */}
              <div className="flex flex-row md:flex-col gap-4 md:gap-1 items-center md:items-start md:w-48 shrink-0 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{booking.time}</span>
                </div>
              </div>

              {/* Details Block */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 uppercase tracking-wider">
                    {booking.type}
                  </span>
                  {booking.status === 'completed' && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>}
                  {booking.status === 'cancelled' && <span className="text-xs text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{booking.title}</h3>
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  With <span className="text-slate-300 font-medium">{booking.instructor}</span>
                </p>
              </div>

              {/* Actions Block */}
              <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                {activeTab === 'upcoming' ? (
                  <>
                    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-700 outline-none" title="Message Instructor">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {booking.meetingLink ? (
                      <a 
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 group"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                        <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <button disabled className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl text-sm font-medium text-slate-500 bg-slate-800/50 border border-slate-700 cursor-not-allowed">
                        Link Pending
                      </button>
                    )}
                  </>
                ) : (
                  <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>

    </div>
  );
}