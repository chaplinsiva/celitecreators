// agent-notes: { ctx: "Sidebar component for Admin Dashboard navigation", deps: [], state: active, last: "antigravity@2026-08-13" }
"use client";

type TabKey =
  | 'overview'
  | 'analytics'
  | 'payouts'
  | 'products'
  | 'vendorApproval'
  | 'checkoutLogs'
  | 'categories'
  | 'users'
  | 'settings';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '📊 Overview & Sales' },
  { key: 'analytics', label: '📈 Analytics & Revenue' },
  { key: 'payouts', label: '💰 Payout Requests' },
  { key: 'products', label: '🛒 Marketplace Products' },
  { key: 'vendorApproval', label: '✅ Product & Sub Approvals' },
  { key: 'checkoutLogs', label: '📋 Checkout Logs' },
  { key: 'categories', label: '📂 Categories' },
  { key: 'users', label: '👥 Creator Shops & Users' },
  { key: 'settings', label: '⚙️ Settings' },
];

export default function AdminSidebar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <aside className="border-r border-zinc-200 bg-white p-4 h-full">
      <h2 className="px-3 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 mt-2">
        Marketplace Admin
      </h2>
      <nav className="flex flex-col gap-1 text-sm font-medium">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`text-left rounded-xl px-3.5 py-2.5 transition-all outline-none font-semibold ${
              active === tab.key
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
