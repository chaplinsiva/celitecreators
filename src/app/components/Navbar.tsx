/* agent-notes: { ctx: "Global Studio Showcase Navbar navigation with role switcher and search trigger", deps: [], state: active, last: "dani@2026-07-23" } */

'use client';

import Link from 'next/link';
import { Sparkles, Search, ShieldCheck, User, PlusCircle, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#090D16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-sky-600/30 group-hover:scale-105 transition">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-white tracking-tight leading-none group-hover:text-sky-400 transition">
              Celite<span className="text-sky-400">Creators</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Pay-Per-Product Marketplace
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <Link href="/browse" className="hover:text-sky-400 transition">
            Browse Catalog
          </Link>
          <Link href="/creator/register" className="hover:text-sky-400 transition flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Become a Creator
          </Link>
          <Link href="/admin" className="hover:text-sky-400 transition flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Admin
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/browse"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white md:hidden"
          >
            <Search className="w-4 h-4" />
          </Link>

          <Link
            href="/creator/upload"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-sky-600/25 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Upload Asset
          </Link>

          <Link
            href="/creator/dashboard"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-sky-500/40 transition"
            title="Creator Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 text-sky-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
