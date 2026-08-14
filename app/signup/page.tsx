"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, type FormEvent } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getSupabaseBrowserClient } from '../../lib/supabaseClient';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/loading-spinner';

// Google Icon Component
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, user } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const returnParam = searchParams.get('return');
    if (returnParam) {
      setReturnUrl(decodeURIComponent(returnParam));
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsSubmitting(false);
        return;
      }

      // Auth state will be automatically updated by Supabase listener
      router.push(returnUrl || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ''}`;
      
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setIsSubmitting(false);
      }
      // If successful, user will be redirected to Google OAuth page
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  if (user) {
    router.push('/dashboard');
    return <LoadingSpinner message="Redirecting..." />;
  }

  return (
    <main className="bg-[#0B0F17] min-h-screen flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group focus:outline-none">
            <div className="w-11 h-11 rounded-xl bg-slate-900/90 border border-slate-700/80 overflow-hidden flex items-center justify-center shadow-lg shadow-sky-500/10 group-hover:border-sky-500/50 group-hover:scale-105 transition-all">
              <img 
                src="/logo/logo.png" 
                alt="Celite Market Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Celite<span className="text-sky-400">Market</span>
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Join thousands of creators using Celite Market
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-[#090D16]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A]/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all text-sm sm:text-base"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A]/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A]/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A]/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-950/50 hover:shadow-sky-900/50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-xs font-medium text-slate-500">OR</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 border border-slate-800 bg-[#0F172A]/60 hover:bg-[#0F172A] text-slate-200 py-3.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>

        {/* Additional Info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline text-slate-400 hover:text-slate-300">Terms</Link> and{' '}
          <Link href="/privacy-policy" className="underline text-slate-400 hover:text-slate-300">Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <SignupContent />
    </Suspense>
  );
}
