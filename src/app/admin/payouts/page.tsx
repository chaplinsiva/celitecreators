/* agent-notes: { ctx: "Admin Payout Request Processing page with bank details and reference recording", deps: [src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { IndianRupee, CheckCircle2, Building2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([
    {
      id: 'p1',
      creatorShop: 'Apex Motion Studio',
      amount: 4200,
      upiId: 'apexmotion@upi',
      bankAcc: '91823471092',
      ifsc: 'HDFC0001234',
      accountName: 'Apex Motion Labs Pvt Ltd',
      status: 'pending',
      requestedAt: '1 day ago',
    },
    {
      id: 'p2',
      creatorShop: 'VFX Lab Pro',
      amount: 1800,
      upiId: 'vfxlab@okaxis',
      bankAcc: '77239102931',
      ifsc: 'UTIB0005678',
      accountName: 'Rahul Sharma',
      status: 'pending',
      requestedAt: '3 hours ago',
    },
  ]);

  const [activeProcessingId, setActiveProcessingId] = useState<string | null>(null);
  const [bankRef, setBankRef] = useState('');

  const handleConfirmPayout = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'processed' } : p))
    );
    setActiveProcessingId(null);
    setBankRef('');
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" /> Financial Operations
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Creator Payout Processing</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review pending earnings withdrawal requests, process bank/UPI transfers, and enter transaction references.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Creator Shop</th>
                <th className="py-3.5 px-4 font-semibold">Requested Amount</th>
                <th className="py-3.5 px-4 font-semibold">Bank / UPI Transfer Details</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-4 font-bold text-white">{payout.creatorShop}</td>
                  <td className="py-4 px-4 font-extrabold text-emerald-400 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5" /> {payout.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-slate-300">
                    <div className="font-semibold text-white">{payout.accountName}</div>
                    <div>A/C: {payout.bankAcc} ({payout.ifsc})</div>
                    <div className="text-sky-400">UPI: {payout.upiId}</div>
                  </td>
                  <td className="py-4 px-4">
                    {payout.status === 'processed' ? (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Processed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending Transfer
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {payout.status === 'pending' && (
                      activeProcessingId === payout.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="text"
                            placeholder="Bank Ref / UTR #"
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                            className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleConfirmPayout(payout.id)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveProcessingId(payout.id)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
                        >
                          Mark Processed
                        </button>
                      )
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
