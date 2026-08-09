"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Star, Check, ArrowRight, Zap, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full pt-4 md:pt-6 pb-4 md:pb-6 px-4 sm:px-6 bg-black overflow-hidden">
      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Main Dark Studio Banner */}
        <div className="w-full relative bg-[#0D111A] rounded-3xl border border-zinc-800/80 p-6 sm:p-10 md:p-14 overflow-hidden shadow-xl flex flex-col justify-between min-h-[320px] md:min-h-[380px] group">
          
          {/* Right Side Floating Image Preview */}
          <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full opacity-25 lg:opacity-100 pointer-events-none lg:pointer-events-auto overflow-hidden rounded-r-3xl">
            <div className="relative w-full h-full flex items-center justify-end">
              <img
                src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80"
                alt="Celite Market Creative Asset Studio Workstation"
                className="w-full h-full object-cover object-center rounded-r-3xl transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Gradient Overlay for seamless text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D111A] via-[#0D111A]/90 to-transparent" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold w-fit shadow-sm">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Celite Digital Asset Marketplace</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-sky-400 leading-[0.95]"
            >
              CELITE MARKET
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-3"
            >
              <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-200 leading-snug">
                Buy &amp; sell individual After Effects templates, sound effects, stock music, and 3D models.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400 text-xs font-medium">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-sky-400" /> Pay per product</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-sky-400" /> Instant direct downloads</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Verified creators</span>
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/templates"
                className="px-7 py-3.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-500/25 text-sm flex items-center gap-2.5 transition active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" /> Browse Marketplace
              </Link>
              <Link
                href="/start-selling"
                className="px-7 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold rounded-xl border border-zinc-700/80 text-sm flex items-center gap-2.5 transition"
              >
                Sell on Celite Market
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
