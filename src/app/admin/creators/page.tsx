/* agent-notes: { ctx: "Admin Creator Shop Management and direct upload permission toggle component", deps: [src/types/marketplace.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, Building2, CheckCircle2 } from 'lucide-react';

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState([
    {
      id: '1',
      name: 'Apex Motion Studio',
      slug: 'apex-motion-studio',
      upiId: 'apexmotion@upi',
      bankAcc: '••••••••4812',
      ifsc: 'HDFC0001234',
      directUploadEnabled: true,
      salesCount: 1420,
    },
    {
      id: '2',
      name: 'VFX Lab Pro',
      slug: 'vfx-lab-pro',
      upiId: 'vfxlab@okaxis',
      bankAcc: '••••••••9012',
      ifsc: 'UTIB0005678',
      directUploadEnabled: false,
      salesCount: 380,
    },
  ]);

  const toggleDirectUpload = (id: string) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, directUploadEnabled: !c.directUploadEnabled } : c))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Creator KYC & Governance
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Creator Shops Directory</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage creator shops and configure direct upload permissions (`direct_upload_enabled`).
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Shop Name</th>
                <th className="py-3.5 px-4 font-semibold">Bank / UPI KYC</th>
                <th className="py-3.5 px-4 font-semibold">Sales Count</th>
                <th className="py-3.5 px-4 font-semibold">Direct Upload Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                    {creator.name} <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-slate-400">
                    <div>UPI: {creator.upiId}</div>
                    <div>IFSC: {creator.ifsc}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-sky-400">{creator.salesCount}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleDirectUpload(creator.id)}
                      className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition"
                    >
                      {creator.directUploadEnabled ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-400" /> Direct Upload Allowed
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-slate-500" /> Moderation Required
                        </>
                      )}
                    </button>
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
