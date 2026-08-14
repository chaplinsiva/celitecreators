"use client";

import Link from 'next/link';
import { Suspense, useState, useEffect, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../lib/supabaseClient';
import LoadingSpinner from '../../components/ui/loading-spinner';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Check if we have a hash fragment with recovery token
    const hash = window.location.hash;
    const hasRecoveryToken = hash && hash.includes('type=recovery');
    
    // Set up auth state listener to handle when Supabase processes the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && hasRecoveryToken)) {
        // Valid recovery session
        setIsValidToken(true);
        // Clear the hash from URL after processing
        if (hasRecoveryToken) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else if (event === 'SIGNED_IN' && session) {
        // User might already have a session
        setIsValidToken(true);
      } else if (event === 'SIGNED_OUT' && !hasRecoveryToken) {
        // No session and no recovery token
        setIsValidToken(false);
      }
    });

    // Also check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (hasRecoveryToken) {
        // If we have recovery token, wait for auth state change
        // The session might not be created yet
        return;
      }
      
      if (session && session.user) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message || 'Failed to reset password. The link may have expired.');
        setIsSubmitting(false);
      } else {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to reset password. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0F17] py-12 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="w-full max-w-md bg-[#090D16]/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-800 relative z-10">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0F17] py-12 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="w-full max-w-md bg-[#090D16]/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-800 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Invalid Reset Link</h2>
            <p className="text-slate-300 mb-6 text-sm">
              This password reset link is invalid or has expired.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-sky-950/50"
              >
                Request New Reset Link
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-[#0F172A]/60 hover:bg-[#0F172A] px-6 py-3 text-sm font-semibold text-slate-200 transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0F17] py-12 px-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="w-full max-w-md bg-[#090D16]/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-800 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Password Reset Successful</h2>
            <p className="text-slate-300 mb-6 text-sm">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0F17] py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md bg-[#090D16]/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-800 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 mb-6 justify-center w-full group focus:outline-none">
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
        <h2 className="text-2xl font-bold mb-3 text-center text-white">Set New Password</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">
          Enter your new password below.
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#0F172A]/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all text-sm sm:text-base"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#0F172A]/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all text-sm sm:text-base"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-950/50 transition disabled:cursor-not-allowed disabled:opacity-70 text-sm sm:text-base"
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
        <p className="mt-6 text-center text-slate-400 text-sm">
          Remember your password?{' '}
          <Link href="/login" className="text-sky-400 hover:text-sky-300 transition-colors font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

