'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, X, Zap } from 'lucide-react';

export default function SubscriptionBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-[120] bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white px-4 py-2.5 border-b border-sky-400/20 shadow-xl overflow-hidden group">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-12 left-1/4 w-96 h-24 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 right-1/4 w-96 h-24 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm relative z-10">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 border border-sky-400/40 backdrop-blur-md shrink-0 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-sky-300" />
          </span>
          <span className="text-zinc-200">
            <strong className="font-extrabold text-white">Need unlimited assets?</strong> Get unlimited downloads on Celite.in for just{' '}
            <span className="inline-block font-black text-sky-300 underline decoration-sky-400 underline-offset-2 px-1">₹499/month</span>.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://celite.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-zinc-950 font-black hover:from-sky-300 hover:to-blue-400 transition-all shadow-lg shadow-sky-500/20 text-xs group/btn active:scale-95"
          >
            <Zap className="w-3 h-3 fill-zinc-950" />
            Explore Celite <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-white/10 text-sky-200 hover:text-white transition"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
