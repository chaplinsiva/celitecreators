/* agent-notes: { ctx: "Global Studio Showcase Footer component with INR badges and R2 security seals", deps: [], state: active, last: "dani@2026-07-23" } */

import Link from 'next/link';
import { ShieldCheck, Lock, IndianRupee, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-slate-800 bg-[#090D16] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-sm">
              C
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">
              Celite<span className="text-sky-400">Creators</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            India's pay-per-product marketplace for video editors, 3D artists, sound engineers, and designers.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <ShieldCheck className="w-4 h-4" /> Presigned R2 Storage Enabled
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Categories</h3>
          <ul className="space-y-2 text-xs">
            <li><Link href="/browse?cat=video-templates" className="hover:text-white transition">Video Templates (After Effects)</Link></li>
            <li><Link href="/browse?cat=3d-models" className="hover:text-white transition">3D Models & Assets (Blender)</Link></li>
            <li><Link href="/browse?cat=audio-sfx" className="hover:text-white transition">Audio & Cinematic SFX</Link></li>
            <li><Link href="/browse?cat=graphics-ui" className="hover:text-white transition">Figma UI Kits & Graphics</Link></li>
          </ul>
        </div>

        {/* Creator Portal */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Creators</h3>
          <ul className="space-y-2 text-xs">
            <li><Link href="/creator/register" className="hover:text-white transition">Open a Creator Shop</Link></li>
            <li><Link href="/creator/upload" className="hover:text-white transition">Upload Digital Asset</Link></li>
            <li><Link href="/creator/dashboard" className="hover:text-white transition">Sales Analytics & Payouts</Link></li>
          </ul>
        </div>

        {/* Security & Payments */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Secured Payments</h3>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
              <IndianRupee className="w-4 h-4 text-emerald-400" /> INR Payments via Razorpay
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
              <Lock className="w-4 h-4 text-sky-400" /> HMAC Signature Verified Downloads
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <span>© 2026 CeliteCreators.in • All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="hover:text-slate-400 transition">Admin Portal</Link>
          <Link href="/browse" className="hover:text-slate-400 transition">Catalog Search</Link>
        </div>
      </div>
    </footer>
  );
}
