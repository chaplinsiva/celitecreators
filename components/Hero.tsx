"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Star, Check, ArrowRight, Zap, ShoppingBag } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full py-4 md:py-6 px-4 sm:px-6 bg-[#fdf8f3]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">

          {/* Main Dark Banner */}
          <div className="flex-[3] relative bg-[#1a1a1a] rounded-[1.5rem] overflow-hidden flex flex-col md:flex-row min-h-[280px] md:min-h-[340px]">
            {/* Background Image Effect */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-y-0 right-0 w-full md:w-1/2 h-full">
                <img
                  src="/hero-simple.png"
                  alt="Celite Market Creative Assets"
                  className="w-full h-full object-cover opacity-80 md:opacity-100"
                />
                {/* Gradient Fade to Black */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent"></div>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center p-6 md:p-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-extrabold w-fit">
                <ShoppingBag className="w-3.5 h-3.5" /> Celite Digital Asset Marketplace
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl md:text-6xl font-[900] tracking-tighter text-sky-400 leading-[0.95]"
              >
                CELITE MARKET
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-lg space-y-2"
              >
                <p className="text-base sm:text-lg md:text-xl font-bold text-white leading-snug">
                  Buy &amp; sell individual After Effects templates, sound effects, stock music, and 3D models.
                </p>
                <p className="text-white/70 text-xs">
                  Pay per product • Instant direct downloads • Verified independent creators • No subscription required
                </p>
              </motion.div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/templates"
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/30 text-sm flex items-center gap-2 transition"
                >
                  <Zap className="w-4 h-4 fill-white" /> Browse Marketplace
                </Link>
                <Link
                  href="/start-selling"
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold rounded-xl border border-zinc-700 text-sm flex items-center gap-2 transition"
                >
                  Sell on Celite Market
                </Link>
              </div>
            </div>
          </div>

          {/* Pay Per Product Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 min-w-[280px]"
          >
            <div className="h-full bg-white rounded-[1.5rem] p-6 md:p-8 shadow-xl border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
              {/* Premium top accent gradient line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600" />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Single Purchase
                  </span>
                  <span className="text-zinc-400 text-xs font-semibold">Pay-Per-Product</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-black text-zinc-900">
                    ₹299 – ₹499
                  </span>
                  <span className="text-zinc-500 font-semibold text-xs">/ product</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium">Buy only what you need. Keep source files forever.</p>
              </div>

              <ul className="space-y-3 my-4">
                {[
                  { icon: Download, text: 'Single product purchase' },
                  { icon: Star, text: 'Full source package included' },
                  { icon: Check, text: 'Commercial license' },
                  { icon: ArrowRight, text: 'Instant R2 direct download' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-700 font-semibold text-xs sm:text-sm">
                    <item.icon className="w-4 h-4 flex-shrink-0 text-sky-600" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/templates"
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold rounded-xl text-center text-xs transition shadow-md block"
              >
                Browse Marketplace Products →
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
