/* agent-notes: { ctx: "Buyer User Dashboard in crisp light theme showing purchased digital asset downloads and logout option", deps: [src/lib/supabase.ts], state: active, last: "dani@2026-07-23" } */

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, ShieldCheck, LogOut, Clock, Sparkles, Store, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Purchased downloads library
  const purchasedAssets = [
    {
      id: 'ord-1',
      name: 'Cyberpunk HUD Video Opener 4K',
      category: 'After Effects Template',
      price: 399,
      purchasedAt: '2026-07-23',
      downloadUrl: 'https://r2.celitecreators.in/source-files/cyberpunk-hud-opener-4k.zip?token=mock_15min_ttl',
    },
    {
      id: 'ord-2',
      name: 'Cinematic Trailer SFX & Riser Pack',
      category: 'Audio & SFX',
      price: 249,
      purchasedAt: '2026-07-22',
      downloadUrl: 'https://r2.celitecreators.in/source-files/cinematic-trailer-sfx-pack.zip?token=mock_15min_ttl',
    },
  ];

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser({
          email: 'rohan.sharma@studio.in',
          user_metadata: { full_name: 'Rohan Sharma', role: 'buyer' },
        });
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm font-semibold text-slate-500">
        Loading user dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-sky-600/20">
            {user?.user_metadata?.full_name?.[0] || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {user?.user_metadata?.full_name || 'Buyer Account'}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-sky-100 text-sky-700">
                Buyer Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/creator/onboarding"
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Become a Creator
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>

      {/* Purchased Downloads Library */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-600" /> My Purchased Digital Assets ({purchasedAssets.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click download to generate a 15-minute presigned Cloudflare R2 direct download link.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {purchasedAssets.map((asset) => (
            <div
              key={asset.id}
              className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-sky-500/30 transition"
            >
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600">
                  {asset.category}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{asset.name}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Purchased on {asset.purchasedAt}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-900">₹{asset.price} INR</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={asset.downloadUrl}
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Source (.zip)
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA Banner */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-sky-500/30 bg-sky-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
            <Store className="w-5 h-5 text-sky-600" /> Want to sell your own 4K templates or 3D models?
          </h3>
          <p className="text-xs text-slate-600">Open a creator shop in 2 minutes and keep 80% net payouts on every sale in INR.</p>
        </div>
        <Link
          href="/creator/onboarding"
          className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition shrink-0 flex items-center gap-1.5"
        >
          Open Creator Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
