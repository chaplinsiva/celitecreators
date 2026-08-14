"use client";

import Link from 'next/link';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../lib/supabaseClient';
import LoadingSpinner from '../../components/ui/loading-spinner';

function ForgotPasswordContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        setError(error.message);
        setIsSubmitting(false);
      } else {
        setSuccess(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to send reset link. Please try again.');
      setIsSubmitting(false);
    }
  };

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
            <h2 className="text-2xl font-bold mb-4 text-white">Check your email</h2>
            <p className="text-slate-300 mb-4 text-sm sm:text-base">
              We've sent a password reset link to <span className="font-semibold text-white">{email}</span>
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-lg shadow-sky-950/50"
            >
              Back to Login
            </Link>
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
        <h2 className="text-2xl font-bold mb-3 text-center text-white">Reset Password</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#0F172A]/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none transition-all text-sm sm:text-base"
            autoComplete="email"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg shadow-sky-950/50 transition disabled:cursor-not-allowed disabled:opacity-70 text-sm sm:text-base"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

