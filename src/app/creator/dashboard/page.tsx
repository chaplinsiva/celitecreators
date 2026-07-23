/* agent-notes: { ctx: "Creator Dashboard with gross sales, net earnings, payout request trigger, and asset table", deps: [src/lib/payout.ts, src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { IndianRupee, ArrowUpRight, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { isEligibleForPayout } from '@/lib/payout';

export default function CreatorDashboardPage() {
  const [payoutRequested, setPayoutRequested] = useState(false);

  // Mock creator dashboard metrics
  const stats = {
    grossSales: 12450,
    platformFee: 2490, // 20%
    netEarnings: 9960,  // 80%
    payoutBalance: 4200,
    totalSalesCount: 38,
  };

  const assets = [
    { id: '1', name: 'Cyberpunk HUD Video Opener 4K', category: 'After Effects', price: 399, sales: 22, status: 'approved' },
    { id: '2', name: 'Futuristic 3D Sci-Fi Helmet Asset Pack', category: 'Blender 3D', price: 699, sales: 16, status: 'approved' },
    { id: '3', name: 'Cinematic Trailer SFX & Riser Pack', category: 'Audio & SFX', price: 249, sales: 0, status: 'pending' },
  ];

  const eligibleForPayout = isEligibleForPayout(stats.payoutBalance, 1000);

  const handleRequestPayout = () => {
    setPayoutRequested(true);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Creator Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Creator Earnings & Sales</h1>
        </div>
        <a
          href="/creator/upload"
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-sky-600/25 shrink-0 text-center"
        >
          + Upload New Asset
        </a>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400">Total Gross Sales</p>
          <p className="text-2xl font-black text-white mt-2 flex items-center">
            <IndianRupee className="w-5 h-5 text-sky-400 mr-1" /> {stats.grossSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">{stats.totalSalesCount} digital asset sales</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400">Platform Split (20%)</p>
          <p className="text-2xl font-black text-slate-400 mt-2 flex items-center">
            <IndianRupee className="w-5 h-5 text-slate-500 mr-1" /> {stats.platformFee.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Platform maintenance fee</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-400">Creator Net Revenue (80%)</p>
          <p className="text-2xl font-black text-emerald-400 mt-2 flex items-center">
            <IndianRupee className="w-5 h-5 text-emerald-400 mr-1" /> {stats.netEarnings.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">80% direct earnings split</span>
        </div>

        <div className="glass-panel-glow p-6 rounded-2xl border border-sky-500/30">
          <p className="text-xs font-semibold text-sky-300">Available Payout Balance</p>
          <p className="text-2xl font-black text-white mt-2 flex items-center">
            <IndianRupee className="w-5 h-5 text-sky-400 mr-1" /> {stats.payoutBalance.toLocaleString()}
          </p>
          <div className="mt-3">
            {payoutRequested ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Payout Request Submitted
              </span>
            ) : (
              <button
                onClick={handleRequestPayout}
                disabled={!eligibleForPayout}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition"
              >
                Request Payout (Min ₹1,000)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Status Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">
          Your Uploaded Digital Assets
        </h2>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Asset Title</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Sales</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-4 font-bold text-white">{asset.name}</td>
                  <td className="py-4 px-4 text-slate-400 text-xs">{asset.category}</td>
                  <td className="py-4 px-4 font-semibold text-slate-200">₹{asset.price}</td>
                  <td className="py-4 px-4 font-semibold text-sky-400">{asset.sales}</td>
                  <td className="py-4 px-4">
                    {asset.status === 'approved' ? (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Approved & Live
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
