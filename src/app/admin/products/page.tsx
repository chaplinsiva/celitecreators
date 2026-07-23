/* agent-notes: { ctx: "Admin Asset Moderation page for approving/rejecting creator asset uploads", deps: [src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Eye, Clock, ShieldCheck } from 'lucide-react';

export default function AdminProductModerationPage() {
  const [pendingItems, setPendingItems] = useState([
    {
      id: '1',
      title: 'Cinematic Trailer SFX & Riser Pack',
      creator: 'Apex Motion Studio',
      price: 249,
      category: 'Audio & SFX',
      sourcePath: 'source-files/apex-motion-studio/cinematic-trailer-sfx.zip',
      submittedAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Cyberpunk HUD Video Opener 4K',
      creator: 'VFX Lab Pro',
      price: 399,
      category: 'Video Templates',
      sourcePath: 'source-files/vfx-lab-pro/cyberpunk-hud.zip',
      submittedAt: '5 hours ago',
    },
  ]);

  const handleApprove = (id: string) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Moderation Queue
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Asset Moderation Portal</h1>
        <p className="text-slate-400 text-sm mt-1">Review pending creator asset uploads before making them public.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        {pendingItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-white text-lg">Queue Clear!</p>
            <p className="text-sm mt-1">No pending creator asset uploads awaiting moderation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Asset Title</th>
                  <th className="py-3.5 px-4 font-semibold">Creator Shop</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pendingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-4 font-bold text-white">{item.title}</td>
                    <td className="py-4 px-4 text-sky-400 font-medium">{item.creator}</td>
                    <td className="py-4 px-4 text-slate-400 text-xs">{item.category}</td>
                    <td className="py-4 px-4 font-semibold text-slate-200">₹{item.price}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{item.submittedAt}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-3.5 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
