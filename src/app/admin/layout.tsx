/* agent-notes: { ctx: "Admin Portal navigation layout with Sky Blue theme tokens", deps: [], state: active, last: "dani@2026-07-23" } */

import Link from 'next/link';
import { ShieldCheck, PackageCheck, Users, Banknote, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
            <span className="font-extrabold text-lg text-white tracking-tight">Celite Admin</span>
          </div>

          <nav className="space-y-1.5 text-sm font-semibold text-slate-400">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" /> Dashboard Overview
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
            >
              <PackageCheck className="w-4 h-4 text-sky-400" /> Asset Moderation
            </Link>
            <Link
              href="/admin/creators"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
            >
              <Users className="w-4 h-4 text-sky-400" /> Creator Shops
            </Link>
            <Link
              href="/admin/payouts"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
            >
              <Banknote className="w-4 h-4 text-sky-400" /> Payout Requests
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
          Admin Portal • CeliteCreators v0.1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
