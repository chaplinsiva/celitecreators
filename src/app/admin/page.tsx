/* agent-notes: { ctx: "Admin Dashboard overview page with platform GMV, commission split, and quick action cards", deps: [], state: active, last: "dani@2026-07-23" } */

'use client';

import { IndianRupee, ShoppingBag, Users, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const metrics = {
    grossMarketplaceVolume: 184500,
    platformCommissionRevenue: 36900, // 20%
    activeCreatorShops: 42,
    pendingAssetApprovals: 5,
    pendingPayoutRequests: 3,
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Platform Governance
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Admin Control Center</h1>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400">Total GMV (Gross Sales)</p>
          <p className="text-2xl font-black text-white mt-2 flex items-center">
            <IndianRupee className="w-5 h-5 text-sky-400 mr-1" /> {metrics.grossMarketplaceVolume.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Pay-Per-Product transactions</span>
        </div>

        <div className="glass-panel-glow p-6 rounded-2xl border border-sky-500/30">
          <p className="text-xs font-semibold text-sky-300">Platform Revenue (20%)</p>
          <p className="text-2xl font-black text-white mt-2 flex items-center">
            <IndianRupee className="w-5 h-5 text-sky-400 mr-1" /> {metrics.platformCommissionRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-sky-400/80 mt-1 block">Net platform commission</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400">Active Creator Shops</p>
          <p className="text-2xl font-black text-white mt-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" /> {metrics.activeCreatorShops}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified creator shops</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-amber-500/30">
          <p className="text-xs font-semibold text-amber-300">Pending Moderation</p>
          <p className="text-2xl font-black text-amber-400 mt-2 flex items-center gap-2">
            <Clock className="w-5 h-5" /> {metrics.pendingAssetApprovals}
          </p>
          <span className="text-[11px] text-amber-500/80 mt-1 block">Assets awaiting review</span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/admin/products"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition group"
        >
          <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition flex items-center justify-between">
            <span>Asset Moderation Portal</span>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition" />
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Review uploaded source files, verify preview videos, and approve or reject creator products.
          </p>
        </a>

        <a
          href="/admin/payouts"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition group"
        >
          <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition flex items-center justify-between">
            <span>Creator Payout Processing</span>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition" />
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Process creator earnings withdrawal requests, inspect bank/UPI details, and record reference numbers.
          </p>
        </a>
      </div>
    </div>
  );
}
