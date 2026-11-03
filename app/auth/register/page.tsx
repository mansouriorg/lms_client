'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { apiErrorMessage } from '@/lib/api-error';
import { afterSignInPath } from '@/lib/auth';
import { brand } from '@/lib/brand';
import { LEGAL_MIN_AGE, LEGAL_UPDATED } from '@/lib/legal';
import { authService } from '@/services/auth.service';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // The terms checkbox: sent to the API, which records the acceptance
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let created = false;
    try {
      // 1. Create the account. The API checks the email, the names and the
      //    password length, and answers with a readable message.
      await authService.register({
        firstName,
        lastName,
        email,
        password,
        acceptTerms: accepted,
        termsVersion: LEGAL_UPDATED,
      });
      created = true;

      // 2. The API does not sign in on sign-up: sign in with the same details,
      //    then go back to the page they came from (?next=..., for example a
      //    checkout) or to their dashboard. The button stays busy until then.
      const data = await authService.login({ email, password });
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(afterSignInPath(data.user.role, next));
    } catch (err) {
      setError(
        created
          ? 'Your account was created, but signing in failed. Please sign in.'
          : apiErrorMessage(err, 'Could not create your account. Please try again.'),
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f172a] font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column - Form Area */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          
          {/* Header */}
          <div>
            <Logo className="mb-6" />
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Join today and start learning with real instructors.
            </p>
          </div>

          {/* Error from the API (email already used, password too short...) */}
          {error && (
            <div
              role="alert"
              className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl text-center"
            >
              {error}
            </div>
          )}

          {/* Email and password only: there is no sign-in with Google or GitHub yet */}
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields (the API stores the first and last name separately) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-slate-300">
                  First name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                    placeholder="Amira"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-sm font-medium text-slate-300">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="Ben Ali"
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
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="you@example.com"
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
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
                  placeholder="At least 8 characters"
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
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-slate-900 transition-colors cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                  I am {LEGAL_MIN_AGE} or older and I agree to the{' '}
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
            <Link href="/auth/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
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
            Start learning with {brand.name}.
          </h3>
          <ul className="space-y-4 mb-8">
            {['Courses organized in modules and lessons', 'Live mentoring sessions with instructors', 'Assignments reviewed by instructors'].map((item, i) => (
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
          
          <p className="pt-6 border-t border-white/10 text-sm text-slate-400">
            Creating an account is free. You only pay for the courses you choose.
          </p>
        </div>
      </div>
    </div>
  );
}