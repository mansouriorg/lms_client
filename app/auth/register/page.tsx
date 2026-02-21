'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add your registration logic here
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column - Form Area */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          
          {/* Header */}
          <div>
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Join us today and start building incredible digital experiences.
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200 text-slate-300 text-sm font-medium">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200 text-slate-300 text-sm font-medium">
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-700/50"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider font-medium">
              Or register with email
            </span>
            <div className="flex-grow border-t border-slate-700/50"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-slate-300">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="Mahmoud Mansouri"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="m.mansouri@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-slate-900 transition-colors cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                  I agree to the{' '}
                  <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 overflow-hidden mt-6"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 pt-4">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Visual/Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900 items-center justify-center">
        {/* Abstract Gradient Background Objects */}
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
        
        {/* Glassmorphism Branding Card - Alternate Design for Register */}
        <div className="relative z-10 w-full max-w-lg p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500/50 blur-sm"></div>
            </div>
            <div className="h-24 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-violet-500/50 blur-sm"></div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-6 leading-tight">
            Deploy faster, scale effortlessly.
          </h3>
          <ul className="space-y-4 mb-8">
            {['Enterprise-grade security', 'Global edge network', 'Real-time analytics'].map((item, i) => (
              <li key={i} className="flex items-center text-slate-300">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3 border border-indigo-500/30">
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
          
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              M
            </div>
            <div>
              <p className="text-white font-medium">Mahmoud</p>
              <p className="text-slate-400 text-sm">Software Engineer</p>
            </div>
          </div>
        </div>

        {/* Optional: Code Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      </div>
    </div>
  );
}