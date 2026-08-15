// agent-notes: { ctx: "Cinematic Dark Studio Hero with clean looping animation video from Cloudflare CDN", deps: ["framer-motion", "lucide-react"], state: active, last: "sato@2026-08-15" }
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ShoppingBag, ShieldCheck, Sparkles, Download, ArrowRight, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full pt-6 pb-6 md:pt-8 md:pb-8 px-4 sm:px-6 bg-black text-white overflow-hidden">
      {/* Background Ambient Mesh Light FX (Blue, Indigo & Subtle Rose Glow) */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-sky-600/15 via-indigo-600/10 to-rose-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-l from-blue-600/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Headline, Value Proposition & Actions */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Dual Badge: Marketplace + Sell Your Templates */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>India's Pay-Per-Product Creative Marketplace</span>
              </div>
              <Link
                href="/start-selling"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm group"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Sell Templates &amp; Earn 80%</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight text-white leading-[1.05]">
                Elevate Your Edits With <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-rose-400">
                  CELITE MARKET
                </span>
              </h1>
            </motion.div>

            {/* Direct Message & Copy */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-4"
            >
              <p className="text-sm sm:text-base font-medium text-zinc-300 max-w-xl leading-relaxed">
                Buy &amp; sell individual After Effects templates, sound effects, stock music, 3D models, and web templates. Pay only for what you download — no forced monthly subscriptions.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-zinc-400 text-xs font-semibold">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                  <Zap className="w-3 h-3 text-sky-400 fill-sky-400" />
                  Pay-Per-Product
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Commercial License
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  Instant High-Res Download
                </span>
              </div>
            </motion.div>

            {/* High-Impact Dual Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Link
                href="/video-templates"
                className="px-6 py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-500/25 text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 active:scale-95 group"
              >
                <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>Explore 10,000+ Assets</span>
              </Link>
              
              <Link
                href="/start-selling"
                className="px-5 py-3 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 hover:text-white font-bold rounded-xl border border-zinc-700/80 hover:border-emerald-500/50 text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 shadow-md group"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Sell Your Templates Here &rarr;</span>
              </Link>
            </motion.div>

          </div>

          {/* Right Column: Clean Looping Animation Video Showcase from Cloudflare */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl bg-[#04060A]/90 backdrop-blur-2xl border border-zinc-800/90 p-2 sm:p-2.5 shadow-2xl group hover:border-sky-500/40 hover:shadow-sky-500/10 transition-all duration-500">
              <div className="relative aspect-video sm:aspect-[16/10] w-full rounded-xl overflow-hidden bg-black shadow-inner">
                <video
                  src="https://preview.celite.in/previews/hero/ANIMATION.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                >
                  <source src="https://preview.celite.in/previews/hero/ANIMATION.mp4" type="video/mp4" />
                  <source src="https://cdn.celite.in/previews/hero/ANIMATION.mp4" type="video/mp4" />
                  <source src="/previews/ANIMATION.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Integrated Bottom Metric Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-5 border-t border-zinc-900"
        >
          {[
            { metric: '50,000+', label: 'Verified Asset Downloads' },
            { metric: '80% Payout', label: 'Direct to Creator Bank / UPI' },
            { metric: '100%', label: 'Pay-Per-Product & Lifetime Access' },
            { metric: '< 1 Sec', label: 'Cloudflare Global Edge Speed' },
          ].map((stat, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-[#04060A] border border-zinc-850 text-center hover:border-zinc-700 transition-colors shadow-lg shadow-black/60">
              <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-sky-400">
                {stat.metric}
              </p>
              <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
