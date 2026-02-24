'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Github } from 'lucide-react';
// Make sure this path points to where you created the auth.service.ts file!
import { authService } from '@/services/auth.service'; 

export default function PremiumLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear any previous errors

    try {
      // 1. Send credentials to NestJS backend
      const data = await authService.login({ email, password });
      const userRole = data.user.role;

      // 2. The "Smart Traffic Cop" Routing Logic
      if (userRole === 'ADMIN') {
        router.push('/admin-dashboard');
      } else if (userRole === 'CENTER') {
        router.push('/center-dashboard');
      } else {
        router.push('/dashboard'); // Default student dashboard
      }

    } catch (err: any) {
      // Safely extract the error message from the NestJS response
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column - Form Area */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 relative z-10">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div>
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Welcome back! Please enter your details to continue.
            </p>
          </div>

          {/* Dynamic Error Message Display */}
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl mb-4 text-center animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

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
              Or continue with email
            </span>
            <div className="flex-grow border-t border-slate-700/50"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="m.mansouri@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link href="/forgot" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-200 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Visual/Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900 items-center justify-center">
        {/* Abstract Gradient Background Objects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px]" />
        
        {/* Glassmorphism Branding Card */}
        <div className="relative z-10 w-full max-w-lg p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="flex gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-6 leading-tight">
            Build incredible digital experiences.
          </h3>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Access your dashboard to manage deployments, monitor real-time traffic, and scale your infrastructure seamlessly.
          </p>
          
          {/* Mockup User Profile/Testimonial */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              M
            </div>
            <div>
              <p className="text-white font-medium">Mahmoud Mansouri</p>
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