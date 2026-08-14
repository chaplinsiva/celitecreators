// agent-notes: { ctx: "Admin panel for attribution analytics, channel ROI, campaign ROI, product discovery ranking, and assisted conversions", deps: ["lib/supabaseClient.ts"], state: active, last: "sato@2026-08-14" }
"use client";

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabaseClient';

type ChannelStats = {
  source: string;
  firstTouchOrders: number;
  firstTouchRevenue: number;
  firstTouchShare: number;
  lastTouchOrders: number;
  lastTouchRevenue: number;
  lastTouchShare: number;
};

type CampaignStats = {
  campaign: string;
  source: string;
  medium: string;
  orders: number;
  revenue: number;
};

type ProductStat = {
  product: string;
  orders: number;
  revenue: number;
};

type AssistedJourney = {
  journey: string;
  firstSource: string;
  lastSource: string;
  orders: number;
  revenue: number;
};

type AnalyticsData = {
  kpis: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalUniqueVisitors: number;
    assistedConversionsCount: number;
    assistedConversionRate: number;
    topFirstSource: string;
    topLastSource: string;
  };
  channels: ChannelStats[];
  campaigns: CampaignStats[];
  products: {
    firstViewed: ProductStat[];
    lastViewed: ProductStat[];
  };
  assistedJourneys: AssistedJourney[];
  recentConversions: any[];
};

const SOURCE_COLORS: Record<string, string> = {
  'Instagram Paid': 'bg-pink-500',
  'Instagram Organic': 'bg-rose-400',
  'Facebook Paid': 'bg-blue-600',
  'Facebook Organic': 'bg-sky-400',
  'Google Ads': 'bg-amber-500',
  'Google Organic': 'bg-yellow-400',
  'YouTube': 'bg-red-500',
  'ChatGPT / AI': 'bg-emerald-500',
  'Referral': 'bg-purple-500',
  'Direct': 'bg-zinc-500',
  'Other': 'bg-slate-400',
};

export default function AttributionAnalyticsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [touchMode, setTouchMode] = useState<'first' | 'last'>('first');

  const loadData = async (selectedRange: string) => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Not signed in'); setLoading(false); return; }

      const res = await fetch(`/api/admin/analytics/attribution?range=${selectedRange}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || 'Failed to load attribution analytics');
        setLoading(false);
        return;
      }
      setData(json.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  const exportCSV = () => {
    if (!data) return;

    const headers = ['Channel', 'First Touch Orders', 'First Touch Revenue (INR)', 'Last Touch Orders', 'Last Touch Revenue (INR)'];
    const rows = data.channels.map(c => [
      c.source,
      c.firstTouchOrders,
      c.firstTouchRevenue,
      c.lastTouchOrders,
      c.lastTouchRevenue
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attribution_analytics_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return <div className="text-center py-12 text-zinc-500 font-medium">Loading attribution analytics dashboard…</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500 font-semibold">{error}</div>;
  }

  const kpis = data?.kpis || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalUniqueVisitors: 0,
    assistedConversionsCount: 0,
    assistedConversionRate: 0,
    topFirstSource: 'N/A',
    topLastSource: 'N/A',
  };

  return (
    <div className="space-y-8">
      {/* Header with Range Filter & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <span>🎯 Attribution & Channel ROI Analytics</span>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Track multi-touch marketing ROI, campaign performance, and product discovery paths
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Selector */}
          <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  range === r
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 shadow-sm transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Attributed Revenue</div>
          <div className="text-2xl font-black text-zinc-900 mt-2">₹{kpis.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-green-600 font-semibold mt-1">✓ {kpis.totalOrders} Paid Orders</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Average Order Value</div>
          <div className="text-2xl font-black text-zinc-900 mt-2">₹{kpis.averageOrderValue.toLocaleString('en-IN')}</div>
          <div className="text-xs text-zinc-500 font-medium mt-1">Per paying customer</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Top Discovery Channel</div>
          <div className="text-lg font-extrabold text-pink-600 truncate mt-2">{kpis.topFirstSource}</div>
          <div className="text-xs text-zinc-500 font-medium mt-1">First-Touch Leader</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Top Conversion Channel</div>
          <div className="text-lg font-extrabold text-sky-600 truncate mt-2">{kpis.topLastSource}</div>
          <div className="text-xs text-zinc-500 font-medium mt-1">Last-Touch Closer</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Assisted Conversions</div>
          <div className="text-2xl font-black text-purple-600 mt-2">{kpis.assistedConversionRate}%</div>
          <div className="text-xs text-purple-700 font-semibold mt-1">{kpis.assistedConversionsCount} multi-touch sales</div>
        </div>
      </div>

      {/* Attribution Model Switcher & Channel Breakdown */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Marketing Channel Performance</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Compare revenue attribution between First-Touch (Original Discovery) vs Last-Touch (Final Conversion)
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
            <button
              onClick={() => setTouchMode('first')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                touchMode === 'first' ? 'bg-sky-600 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              First-Touch (Discovery)
            </button>
            <button
              onClick={() => setTouchMode('last')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                touchMode === 'last' ? 'bg-sky-600 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Last-Touch (Conversion)
            </button>
          </div>
        </div>

        {/* Channel Bars */}
        <div className="space-y-4">
          {data?.channels.map((ch) => {
            const revenue = touchMode === 'first' ? ch.firstTouchRevenue : ch.lastTouchRevenue;
            const orders = touchMode === 'first' ? ch.firstTouchOrders : ch.lastTouchOrders;
            const share = touchMode === 'first' ? ch.firstTouchShare : ch.lastTouchShare;
            const barColor = SOURCE_COLORS[ch.source] || 'bg-zinc-400';

            return (
              <div key={ch.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${barColor}`}></span>
                    <span className="text-zinc-900 font-bold">{ch.source}</span>
                    <span className="text-zinc-400 font-normal">({orders} {orders === 1 ? 'order' : 'orders'})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">{share.toFixed(1)}%</span>
                    <span className="text-zinc-900 font-extrabold w-24 text-right">₹{revenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.max(share, 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Campaigns & Assisted Journeys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UTM Campaign Performance Table */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900">Top UTM Campaigns</h3>
            <span className="text-xs text-zinc-400">{data?.campaigns.length || 0} active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Source / Med</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {data?.campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">No UTM campaigns recorded in this timeframe</td>
                  </tr>
                ) : (
                  data?.campaigns.slice(0, 8).map((cmp, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-900 max-w-[160px] truncate" title={cmp.campaign}>
                        {cmp.campaign}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500 truncate max-w-[120px]">
                        {cmp.source} / {cmp.medium}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">{cmp.orders}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-zinc-900">₹{cmp.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Touch Assisted Conversion Journeys */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900">Multi-Touch Assisted Paths</h3>
            <span className="text-xs text-purple-600 font-bold">{data?.assistedJourneys.length || 0} paths</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Discovery ➔ Conversion</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {data?.assistedJourneys.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-zinc-400">No multi-touch assisted journeys yet</td>
                  </tr>
                ) : (
                  data?.assistedJourneys.map((aj, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-zinc-900 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 text-[10px] font-bold">{aj.firstSource}</span>
                        <span className="text-zinc-400 font-bold">➔</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">{aj.lastSource}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">{aj.orders}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-zinc-900">₹{aj.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Discovery vs Conversion Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Product Viewed (Discovery Driver) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Top Discovery Products</h3>
              <p className="text-[11px] text-zinc-500">First product landing page visited by customers</p>
            </div>
            <span className="text-xs text-pink-600 font-bold">🎯 First Touch</span>
          </div>

          <div className="space-y-2">
            {data?.products.firstViewed.length === 0 ? (
              <div className="py-6 text-center text-zinc-400 text-xs">No product discovery data recorded</div>
            ) : (
              data?.products.firstViewed.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs">
                  <span className="font-semibold text-zinc-900 truncate max-w-[280px]" title={p.product}>
                    {idx + 1}. {p.product}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">{p.orders} orders</span>
                    <span className="font-bold text-zinc-900">₹{p.revenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Last Product Viewed (Direct Conversion Driver) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Top Conversion Products</h3>
              <p className="text-[11px] text-zinc-500">Product page visited immediately before purchase</p>
            </div>
            <span className="text-xs text-sky-600 font-bold">🛒 Last Touch</span>
          </div>

          <div className="space-y-2">
            {data?.products.lastViewed.length === 0 ? (
              <div className="py-6 text-center text-zinc-400 text-xs">No conversion product data recorded</div>
            ) : (
              data?.products.lastViewed.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs">
                  <span className="font-semibold text-zinc-900 truncate max-w-[280px]" title={p.product}>
                    {idx + 1}. {p.product}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">{p.orders} orders</span>
                    <span className="font-bold text-zinc-900">₹{p.revenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
