'use client';

import { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Camera, 
  Save, 
  Mail, 
  ShieldAlert,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your profile information, security, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'profile' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Profile Details
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'security' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Lock className={`w-5 h-5 ${activeTab === 'security' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Security & Password
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'notifications' 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)]' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-indigo-400' : 'text-slate-500'}`} />
            Notifications
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm shadow-2xl">
            
            {/* ---------------- PROFILE TAB ---------------- */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-slate-900 overflow-hidden">
                      M
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Profile Picture</h3>
                    <p className="text-sm text-slate-400 mb-3">PNG, JPG under 5MB</p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                        Upload New
                      </button>
                      <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-800 border border-slate-700 hover:text-white transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/50 pt-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">First Name</label>
                      <input
                        type="text"
                        defaultValue="Mahmoud"
                        className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Last Name</label>
                      <input
                        type="text"
                        defaultValue="Mansouri"
                        className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="email"
                        defaultValue="m.mansouri@example.com"
                        className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Bio (Optional)</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us a little about yourself and your learning goals..."
                      className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none sm:text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- SECURITY TAB ---------------- */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Change Password</h2>
                  <p className="text-sm text-slate-400 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                  
                  <div className="space-y-5 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/50 pt-8">
                  <h2 className="text-lg font-medium text-red-400 mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Danger Zone
                  </h2>
                  <p className="text-sm text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- NOTIFICATIONS TAB ---------------- */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Email Notifications</h2>
                  <p className="text-sm text-slate-400 mb-6">Choose what updates you want to receive in your inbox.</p>
                  
                  <div className="space-y-4">
                    {/* Toggle Item */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <div>
                        <p className="text-sm font-medium text-white">Course Updates & Announcements</p>
                        <p className="text-xs text-slate-500 mt-0.5">Get notified when an instructor posts a new lecture or announcement.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 border border-slate-600"></div>
                      </label>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <div>
                        <p className="text-sm font-medium text-white">Assignment Grades</p>
                        <p className="text-xs text-slate-500 mt-0.5">Receive an email when your project submission has been graded.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 border border-slate-600"></div>
                      </label>
                    </div>

                    {/* Toggle Item */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <div>
                        <p className="text-sm font-medium text-white">Marketing & Promotions</p>
                        <p className="text-xs text-slate-500 mt-0.5">Receive discounts, coupons, and offers for new courses.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 border border-slate-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Save Button */}
            <div className="border-t border-slate-800/50 mt-8 pt-6 flex justify-end">
              <button className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/20">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}