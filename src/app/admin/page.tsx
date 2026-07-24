/* agent-notes: { ctx: "Admin Overview Dashboard in crisp white light theme", deps: [src/types/database.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { ShieldCheck, IndianRupee, Users, Package, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const stats = {
    grossVolume: 184500,
    platformRevenue: 36900,
    activeCreators: 42,
    pendingProducts: 5,
    pendingPayouts: 3,
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Governance Center</h1>
          <p className="text-slate-500 text-sm mt-1">Platform metrics, asset moderation queue, and creator payout processing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" /> Moderation Queue ({stats.pendingProducts})
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            Gross Volume <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">₹{stats.grossVolume.toLocaleString('en-IN')}</span>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% from last month
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            Platform Cut (20%) <ShieldCheck className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-3xl font-black text-sky-600 block">₹{stats.platformRevenue.toLocaleString('en-IN')}</span>
          <span className="text-xs text-slate-500">20% commission split</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            Active Creator Shops <Users className="w-4 h-4 text-slate-600" />
          </div>
          <span className="text-3xl font-black text-slate-900 block">{stats.activeCreators}</span>
          <span className="text-xs text-slate-500">Verified Indian Creators</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            Pending Moderation <Package className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-3xl font-black text-amber-600 block">{stats.pendingProducts}</span>
          <span className="text-xs text-slate-500">Awaiting asset review</span>
        </div>
      </div>

      {/* Quick Action Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white hover:border-sky-500/40 transition space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
              Asset Moderation Queue
            </span>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
              {stats.pendingProducts} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review submitted After Effects templates, Blender 3D models, and SFX packages before public marketplace listing.
          </p>
        </Link>

        <Link
          href="/admin/payouts"
          className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white hover:border-sky-500/40 transition space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
              Payout Requests
            </span>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-sky-100 text-sky-800">
              {stats.pendingPayouts} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Process creator earnings withdrawal requests (Min ₹1,000 threshold) with bank UTR reference numbers.
          </p>
        </Link>

        <Link
          href="/admin/creators"
          className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white hover:border-sky-500/40 transition space-y-3 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
              Creator KYC & Permissions
            </span>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
              {stats.activeCreators} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage creator shop accounts, verify bank account / UPI details, and toggle direct asset upload permissions.
          </p>
        </Link>
      </div>
    </div>
  );
}
