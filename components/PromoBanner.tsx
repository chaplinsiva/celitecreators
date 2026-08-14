// agent-notes: { ctx: "Deep black glassmorphic promo banner with light blue ambient blur glow pointing to celite.in", deps: ["lucide-react"], state: active, last: "sato@2026-08-14" }
"use client";

import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export default function PromoBanner() {
  return (
    <aside
      aria-label="Special Offer Announcement"
      className="relative z-30 w-full overflow-hidden border-b border-sky-500/20 bg-black text-white shadow-2xl shadow-black/80"
    >
      {/* Light Blue Ambient Glowing Core */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Central Electric Light Blue Glow */}
        <div className="w-[600px] sm:w-[900px] h-28 bg-sky-500/25 blur-[90px] rounded-full transform -translate-y-2 pointer-events-none" />
        {/* Subtle cyan secondary flare */}
        <div className="absolute top-0 right-1/4 w-72 h-20 bg-cyan-400/20 blur-[70px] rounded-full pointer-events-none" />
        {/* Ambient Top & Bottom Glass Lines */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-sky-950/20 to-black opacity-80" />
      </div>

      <div className="relative max-w-[1440px] mx-auto py-2.5 sm:py-3 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left / Center Content Details */}
        <div className="flex items-center flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 text-center">
          
          {/* Shimmering 3rd Anniversary Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="tracking-wide">3rd Anniversary Special</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* Pricing Highlight */}
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span className="text-slate-400">All-Access Pass:</span>
            <span className="text-white font-black bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-sky-500/30 shadow-sm text-sky-300 font-mono">
              ₹499 <span className="text-[10px] font-medium text-slate-400 font-sans">/ month</span>
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* Perks */}
          <div className="inline-flex items-center gap-1.5 font-extrabold text-sky-400">
            <Zap className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
            <span className="tracking-tight text-sky-300">Unlimited Downloads on Celite.in</span>
          </div>
        </div>

        {/* CTA Button with Electric Blue Accent */}
        <a
          href="https://celite.in"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-black text-xs transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:scale-[1.03] active:scale-95 shrink-0"
        >
          <span>Get Unlimited Access</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </aside>
  );
}
