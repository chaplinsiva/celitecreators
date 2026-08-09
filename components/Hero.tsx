"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ShoppingBag, ShieldCheck, Sparkles, Star, Download, Play, Layers } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 bg-[#0B0F17] overflow-hidden">
      {/* Background Ambient Mesh Light FX */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-r from-sky-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-l from-blue-600/15 via-sky-500/10 to-transparent blur-[130px] pointer-events-none rounded-full" />

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Headline, Value Proposition & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Category Tag Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-bold shadow-md shadow-sky-500/10">
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>India's Pay-Per-Product Creative Marketplace</span>
            </div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95]">
                Elevate Your Edits With <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                  CELITE MARKET
                </span>
              </h1>
            </motion.div>

            {/* Subtitle & Value Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <p className="text-base sm:text-lg md:text-xl font-medium text-slate-300 max-w-2xl leading-relaxed">
                Buy &amp; sell individual After Effects templates, sound effects, stock music, 3D models, and web templates. Pay only for what you download — no forced monthly subscriptions.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-slate-400 text-xs sm:text-sm font-semibold pt-1">
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Zap className="w-3.5 h-3.5 fill-sky-400" />
                  </div>
                  Pay-Per-Product
                </span>
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  Commercial License Included
                </span>
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  Instant R2 Download
                </span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/templates"
                className="px-8 py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-sky-500/25 text-base flex items-center gap-3 transition-all duration-300 active:scale-95 group"
              >
                <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                <span>Explore 10,000+ Assets</span>
              </Link>
              <Link
                href="/start-selling"
                className="px-7 py-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-2xl border border-slate-700/80 text-sm flex items-center gap-2.5 transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                <span>Sell on Celite Market</span>
              </Link>
            </motion.div>

          </div>

          {/* Right Column: Interactive 3D Glass Studio Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl bg-[#0F172A]/90 backdrop-blur-2xl border border-slate-800/80 p-3 sm:p-4 shadow-2xl group hover:border-slate-700/80 transition-all duration-500">
              
              {/* Media Preview Container */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-inner group">
                <img
                  src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80"
                  alt="Celite Market Creative Editing Studio Workstation"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Shading */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-80" />

                {/* Top Badge: Rating */}
                <div className="absolute top-4 right-4 bg-[#0F172A]/90 backdrop-blur-xl border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>4.9 / 5 Rating</span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#0B0F17]/85 backdrop-blur-md border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">4K After Effects &amp; 3D Packs</p>
                      <p className="text-[11px] text-slate-400 font-medium">Ready-to-use source project files</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-sky-500/20 text-sky-400 text-[11px] font-extrabold border border-sky-500/30">
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Integrated Bottom Metric Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/60"
        >
          {[
            { metric: '50,000+', label: 'Asset Downloads' },
            { metric: '1,200+', label: 'Independent Creators' },
            { metric: '100%', label: 'Pay-Per-Product' },
            { metric: '< 1 Sec', label: 'Cloudflare R2 Speed' },
          ].map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#0F172A]/60 border border-slate-800/60 text-center hover:border-slate-700/80 transition-colors">
              <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-400">
                {stat.metric}
              </p>
              <p className="text-xs font-medium text-slate-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
